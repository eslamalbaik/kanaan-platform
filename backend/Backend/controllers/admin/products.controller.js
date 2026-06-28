const Product = require("../../models/product.model.js");
const Category = require("../../models/category.model.js");
const CategoryAttributes = require("../../models/categoryAttribute.model.js");
const asyncHandler = require("../../utils/asyncHandler");

const getAdminProducts = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 20,
    search,
    category,
    includeInactive = false,
  } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (includeInactive !== "true") {
    filter.isActive = true;
  }

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("category")
    .skip((page - 1) * limit)
    .limit(Number(limit));

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

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    images,
    category,
    stockQuantity,
    attributes,
    isCustomizable,
    isFeatured,
    isAvailable,
  } = req.body;

  const categoryExists = await Category.findById(category);

  if (!categoryExists) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  const categoryAttributes = await CategoryAttributes.findOne({
    categoryId: categoryExists._id,
  });

  if (!categoryAttributes) {
    return res.status(404).json({
      success: false,
      message: "No attributes defined for this category",
    });
  }

  const normalizedAttributes = normalizeAttributes(attributes || {});
  const attributeKeys = Object.keys(normalizedAttributes);

  for (let item of categoryAttributes.attributes) {
    if (item.required) {
      if (!attributeKeys.includes(item.name.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Missing required attribute: ${item.name}`,
        });
      }
    }
  }

  const allowedAttributes = categoryAttributes.attributes.map((a) =>
    a.name.toLowerCase(),
  );

  for (let key of attributeKeys) {
    if (!allowedAttributes.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Invalid attribute: ${key}`,
      });
    }
  }

  const product = new Product({
    name,
    description,
    price,
    images,
    category,
    stockQuantity,
    attributes: normalizedAttributes,
    isCustomizable: isCustomizable || false,
    isFeatured: isFeatured || false,
    isAvailable: isAvailable ?? true,
  });

  await product.save();

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

const normalizeAttributes = (attributes) => {
  const normalized = {};

  Object.keys(attributes).forEach((key) => {
    const lowerKey = key.toLowerCase();
    const value = attributes[key];

    if (Array.isArray(value)) {
      normalized[lowerKey] = value.map((item) =>
        typeof item === "string" ? item.toLowerCase() : item,
      );
    } else if (typeof value === "string") {
      normalized[lowerKey] = value.toLowerCase();
    } else {
      normalized[lowerKey] = value;
    }
  });

  return normalized;
};

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }

  if (req.body.attributes) {
    product.attributes = {
      ...product.attributes,
      ...req.body.attributes,
    };
  }

  Object.keys(req.body).forEach((key) => {
    if (key !== "attributes") {
      product[key] = req.body[key];
    }
  });

  await product.save();

  res.json({
    success: true,
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { returnDocument: "after" },
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  res.json({
    success: true,
    message: "Product deactivated",
  });
});

module.exports = {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
