const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (emailVal) {
          return validator.isEmail(emailVal);
        },
        message: "Email is not valid",
      },
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      match: [
        /^\+9705\d{8}$/,
        "Phone number must be a valid Palestinian number (e.g. +970599123456)",
      ],
      unique: true,
    },

    address: {
      type: String,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    tokens: [
      {
        type: "String",
        required: true,
      },
    ],

    refreshTokens: [
      {
        type: String,
      },
    ],

    otpCode: {
      type: String,
    },

    otpExpires: {
      type: Date,
    },

    resetToken: {
      type: String,
      default: null,
    },

    resetTokenExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 8);
});

userSchema.methods.generateToken = async function () {
  const user = this;
  const token = JWT.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    },
  );
  return token;
};

userSchema.methods.refreshToken = async function () {
  const user = this;
  const refreshToken = JWT.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    },
  );
  const refreshTokenHash = hashToken(refreshToken);
  const maxRefreshTokens = Number(process.env.MAX_REFRESH_TOKENS || 5);
  const nextRefreshTokens = (user.refreshTokens || []).concat(refreshTokenHash);
  user.refreshTokens = nextRefreshTokens.slice(-maxRefreshTokens);
  await user.save();
  return refreshToken;
};

userSchema.methods.revokeRefreshToken = async function (refreshToken) {
  const user = this;
  const refreshTokenHash = hashToken(refreshToken);
  user.refreshTokens = (user.refreshTokens || []).filter(
    (t) => t !== refreshToken && t !== refreshTokenHash,
  );
  await user.save();
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.tokens;
  delete userObj.refreshTokens;
  delete userObj.role;
  delete userObj.resetToken;
  return userObj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
