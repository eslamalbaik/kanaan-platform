module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID",
    });
  }

  if (err?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate key error",
    });
  }

  if (err?.name === "ValidationError") {
    return res.status(422).json({
      success: false,
      message: err.message,
    });
  }

  if (err?.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err?.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  const status = Number(err?.statusCode || err?.status) || 500;
  res.status(status).json({
    success: false,
    message: err?.message || "Server error",
  });
};
