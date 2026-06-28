const Favorite = require("../models/favorite.model");
const Product = require("../models/product.model");
const asyncHandler = require("../utils/asyncHandler");

const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const favorites = await Favorite.find({
    user: userId,
  }).populate("product");

  const products = favorites.map((item) => item.product);

  res.status(200).json({
    success: true,
    data: products,
  });
});

const addToFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const productExists = await Product.findById(productId);

  if (!productExists) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const existingFavorite = await Favorite.findOne({
    user: userId,
    product: productId,
  });

  if (existingFavorite) {
    return res.status(200).json({
      success: true,
      message: "Added to favorites",
    });
  }

  const favorite = new Favorite({
    user: userId,
    product: productId,
  });

  await favorite.save();

  res.status(200).json({
    success: true,
    message: "Added to favorites",
  });
});

const removeFromFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const deleted = await Favorite.findOneAndDelete({
    user: userId,
    product: id,
  });

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: "Favorite not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Removed from favorites",
  });
});

module.exports = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
};
