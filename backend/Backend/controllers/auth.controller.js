const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const register = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    const exists = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (exists) {
      const field = exists.email === email ? "البريد الإلكتروني" : "رقم الهاتف";
      return res.status(409).json({
        success: false,
        message: `حساب بهذا ${field} موجود بالفعل`,
        code: 409,
      });
    }

    const user = new User({
      name,
      email,
      phone,
      address,
      password,
    });
    await user.save();

    const token = await user.generateToken();
    const refreshToken = await user.refreshToken();

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        userId: user._id,
        name: user.name,
        role: user.role,
        token,
        refreshToken,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
      },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      if (err.errors.password) {
        return res.status(422).json({
          success: false,
          message: err.errors.password.message,
        });
      }
      if (err.errors.phone) {
        return res.status(422).json({
          success: false,
          message: err.errors.phone.message,
        });
      }
      if (err.errors.email) {
        return res.status(422).json({
          success: false,
          message: err.errors.email.message,
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (err.code === 11000) {
      const field = err.keyPattern.email ? "البريد الإلكتروني" : "رقم الهاتف";
      return res.status(409).json({
        success: false,
        message: `حساب بهذا ${field} موجود بالفعل`,
      });
    }

    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "حدث خطأ في إنشاء الحساب",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      });
    }

    const token = await user.generateToken();
    const refreshToken = await user.refreshToken();

    res.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        role: user.role,
        token,
        refreshToken,
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    if (refreshToken) {
      await user.revokeRefreshToken(refreshToken);
    } else {
      user.refreshTokens = [];
      await user.save();
    }

    res.json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ في الخادم",
    });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const user = await User.findOne({
      $or: [
        {
          email,
        },
        {
          phone,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();
    await sendOtpMail(user.email, user.otpCode);

    res.status(200).json({
      success: true,
      message: "Verification code sent",
      expiresIn: user.otpExpires,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const sendOtpMail = async (email, otpCode) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `Kanaan Support Team <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Kanaan Verification Code",
      text: otpTemplate(otpCode),
    });
  } catch (err) {
    throw err;
  }
};

const otpTemplate = (otpCode) => {
  return `  
    Hello,

    We received a request to verify your identity or reset your password for your Kanaan account.
    
    Your verification code is:

    ${otpCode}

    This code is valid for 5 minutes only.

    For your security:

    - Do not share this code with anyone.
    - Kanaan support team will never ask you for your verification code.
    - If you did not request this code, please ignore this email.

    Best regards,
    Kanaan Support Team
  `;
};

const verifyOtp = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    const user = await User.findOne({
      $or: [
        {
          email,
        },
        {
          phone,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(410).json({
        success: false,
        message: "OTP expired",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = hashToken(resetToken);
    user.resetTokenExpires = Date.now() + 10 * 60 * 1000;

    user.otpCode = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({
      success: true,
      resetToken,
      expiresIn: user.resetTokenExpires,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await User.findOne({
      resetToken: hashToken(resetToken),
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = newPassword;

    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const refreshTokenHash = hashToken(refreshToken);
    const refreshTokenExists =
      (user.refreshTokens || []).includes(refreshToken) ||
      (user.refreshTokens || []).includes(refreshTokenHash);

    if (!refreshTokenExists) {
      user.refreshTokens = [];
      await user.save();
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    user.refreshTokens = (user.refreshTokens || []).filter(
      (t) => t !== refreshToken && t !== refreshTokenHash,
    );

    const newRefreshToken = await user.refreshToken();
    const newAccessToken = await user.generateToken();

    res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
      refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  sendOtp,
  verifyOtp,
  resetPassword,
  refreshToken,
};
