const Category = require("../models/category.model.js");
const Product = require("../models/product.model.js");
const CategoryAttributes = require("../models/categoryAttribute.model.js");
const asyncHandler = require("../utils/asyncHandler.js");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  // جلب جميع الـ attributes دفعة واحدة
  const attrDocs = await CategoryAttributes.find({
    categoryId: { $in: categories.map(c => c._id) }
  });
  const attrMap = {};
  attrDocs.forEach(doc => { attrMap[doc.categoryId.toString()] = doc.attributes || []; });

  const data = await Promise.all(
    categories.map(async (cat) => {
      const productCount = await Product.countDocuments({
        category: cat._id,
      });

      return {
        ...cat.toObject(),
        attributes: attrMap[cat._id.toString()] || [],
        productCount,
      };
    }),
  );

  res.json({
    success: true,
    data,
  });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  const productCount = await Product.countDocuments({
    category: category._id,
  });

  res.json({
    success: true,
    data: {
      ...category.toObject(),
      productCount,
    },
  });
});

const getCategoryFilters = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const products = await Product.find({
    category: categoryId,
  });

  const filters = {};

  products.forEach((product) => {
    Object.entries(product.attributes || {}).forEach(([key, value]) => {
      if (!filters[key]) {
        filters[key] = new Set();
      }

      if (Array.isArray(value)) {
        value.forEach((v) => filters[key].add(v));
      } else {
        filters[key].add(value);
      }
    });
  });

  const result = {};
  Object.keys(filters).forEach((key) => {
    result[key] = [...filters[key]];
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = { getCategories, getCategoryById, getCategoryFilters };
