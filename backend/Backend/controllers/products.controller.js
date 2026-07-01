const Product = require("../models/product.model.js");
const asyncHandler = require("../utils/asyncHandler");

const getProducts = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 20,
    search,
    category,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    order = "desc",
    featured,
  } = req.query;

  const filter = {};

  const excludedFields = [
    "page",
    "limit",
    "search",
    "category",
    "minPrice",
    "maxPrice",
    "sortBy",
    "order",
    "featured",
  ];

  Object.keys(req.query).forEach((key) => {
    if (!excludedFields.includes(key)) {
      const value = req.query[key];

      if (value.includes(",")) {
        filter[`attributes.${key}`] = {
          $in: value.split(","),
        };
      } else {
        filter[`attributes.${key}`] = value;
      }
    }
  });

  page = Number(page);
  limit = Math.min(Number(limit), 20);

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) filter.category = category;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (featured === "true") filter.isFeatured = true;

  const sort = {
    [sortBy]: order === "asc" ? 1 : -1,
  };

  filter.isActive = true;

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category", "_id name")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true })
    .limit(8)
    .populate("category", "_id name");

  res.json({
    success: true,
    data: products,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "_id name",
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
  }).limit(3);

  res.json({
    success: true,
    data: {
      ...product.toObject(),
      relatedProducts,
    },
  });
});

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
};
