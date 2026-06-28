const slugify = require("slugify");
const Product = require("../../models/product.model.js");
const Category = require("../../models/category.model.js");
const CategoryAttributes = require("../../models/categoryAttribute.model.js");
const asyncHandler = require("../../utils/asyncHandler");

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, attributes } = req.body;

  const slug = slugify(name, { lower: true, strict: true });

  const existingCategory = await Category.findOne({ $or: [{ name }, { slug }] });
  if (existingCategory) {
    return res.status(409).json({ success: false, message: "Category already exists" });
  }

  const category = await Category.create({ name, description, icon, slug });

  // حفظ الـ attributes في collection منفصلة
  if (attributes && attributes.length > 0) {
    await CategoryAttributes.create({ categoryId: category._id, attributes });
  }

  res.status(201).json({
    success: true,
    data: { ...category.toObject(), attributes: attributes || [] },
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, icon, attributes } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  const updateData = {};

  if (name) {
    const slug = slugify(name, { lower: true, strict: true });
    const existingCategory = await Category.findOne({ _id: { $ne: id }, $or: [{ name }, { slug }] });
    if (existingCategory) {
      return res.status(409).json({ success: false, message: "Category already exists" });
    }
    updateData.name = name;
    updateData.slug = slug;
  }
  if (description !== undefined) updateData.description = description;
  if (icon !== undefined) updateData.icon = icon;

  const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
    returnDocument: "after",
    runValidators: true,
  });

  // تحديث الـ attributes — استبدال كامل
  if (attributes !== undefined) {
    await CategoryAttributes.findOneAndUpdate(
      { categoryId: id },
      { $set: { attributes: attributes || [] } },
      { upsert: true, new: true }
    );
  }

  // جلب الـ attributes للرد
  const attrDoc = await CategoryAttributes.findOne({ categoryId: id });

  res.status(200).json({
    success: true,
    data: { ...updatedCategory.toObject(), attributes: attrDoc?.attributes || [] },
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  const activeProductsCount = await Product.countDocuments({ category: id, isActive: true });
  if (activeProductsCount > 0) {
    return res.status(409).json({
      success: false,
      message: `Cannot delete category with active products (${activeProductsCount} products)`,
      code: 409,
    });
  }

  await CategoryAttributes.findOneAndDelete({ categoryId: id });
  await Category.findByIdAndDelete(id);

  res.status(200).json({ success: true, message: "Category deleted" });
});

module.exports = { createCategory, updateCategory, deleteCategory };
