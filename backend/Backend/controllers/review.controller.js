const Review = require("../models/review.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const asyncHandler = require("../utils/asyncHandler");

const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const productExists = await Product.findById(productId);

  if (!productExists) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const total = await Review.countDocuments({
    productId,
  });

  const reviews = await Review.find({
    productId,
  })
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const stats = await Review.aggregate([
    {
      $match: {
        productId: productExists._id,
      },
    },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats.length > 0 ? stats[0].averageRating : 0;
  const reviewCount = stats.length > 0 ? stats[0].reviewCount : 0;

  res.status(200).json({
    success: true,

    data: {
      averageRating,
      reviewCount,
      reviews,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const addReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const { rating, comment } = req.body;

  const productExists = await Product.findById(productId);

  if (!productExists) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const purchased = await Order.findOne({
    userId,
    status: "completed",
    "items.productId": productId,
  });

  if (!purchased) {
    return res.status(403).json({
      success: false,
      message: "You must purchase this product before reviewing it",
      code: 403,
    });
  }

  const existingReview = await Review.findOne({
    userId,
    productId,
  });

  if (existingReview) {
    return res.status(409).json({
      success: false,
      message: "You already reviewed this product",
    });
  }

  const review = new Review({
    userId,
    productId,
    rating,
    comment,
  });

  await review.save();

  const stats = await Review.aggregate([
    {
      $match: {
        productId: productExists._id,
      },
    },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    averageRating: stats[0].averageRating,
    reviewCount: stats[0].reviewCount,
  });

  res.status(201).json({
    success: true,
    message: "Review submitted",
    data: review,
  });
});

const deleteReview = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, reviewId } = req.params;

  const productExists = await Product.findById(productId);

  if (!productExists) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  if (review.userId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  await review.deleteOne();

  const stats = await Review.aggregate([
    {
      $match: {
        productId: productId,
      },
    },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats.length > 0 ? stats[0].averageRating : 0;
  const reviewCount = stats.length > 0 ? stats[0].reviewCount : 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating,
    reviewCount,
  });

  res.status(200).json({
    success: true,
    message: "Review deleted",
  });
});

module.exports = {
  getProductReviews,
  addReview,
  deleteReview,
};
