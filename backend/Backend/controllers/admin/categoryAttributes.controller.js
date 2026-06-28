const CategoryAttributes = require("../../models/categoryAttribute.model.js");
const Category = require("../../models/category.model.js");
const asyncHandler = require("../../utils/asyncHandler");

const createCategoryAttributes = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { attributes } = req.body;

  const category = await Category.findById(categoryId);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  const existing = await CategoryAttributes.findOne({ categoryId });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Attributes already exist for this category",
    });
  }

  const categoryAttributes = new CategoryAttributes({
    categoryId,
    attributes,
  });

  await categoryAttributes.save();

  res.status(201).json({
    success: true,
    message: "Category attributes created successfully",
    data: categoryAttributes,
  });
});

const getCategoryAttributes = asyncHandler(async (req, res) => {
 const category = await Category.findById(req.params.categoryId);
 
   if (!category) {
     return res.status(404).json({
       success: false,
       message: "Category not found",
     });
   }

   const categoryAttribute = await CategoryAttributes.findOne({
     categoryId: category._id,
   });

    res.status(200).json({
      success: true,
      data: categoryAttribute?.attributes || [],
    });

});

const updateCategoryAttributes = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { attributes } = req.body;

  const updated = await CategoryAttributes.findOneAndUpdate(
    { categoryId },
    {
      $push: {
        attributes: attributes,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: "Category attributes not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Category attributes updated successfully",
    data: updated,
  });
});

const deleteCategoryAttributes = asyncHandler(async (req, res) => {
  const { categoryId, attributeId } = req.params;

  const categoryAttribute = await CategoryAttributes.findOne({
    categoryId,
  });

  const attribute = categoryAttribute.attributes.find(
    (item) => item._id.toString() === attributeId,
  );

  if (!attribute) {
    return res.status(404).json({
      success: false,
      message: "Category attributes not found",
    });
  }

  const updated = await CategoryAttributes.findOneAndUpdate(
    { categoryId },

    {
      $pull: {
        attributes: {
          name: attribute.name,
        },
      },
    },

    { returnDocument: "after" },
  );

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: "Category attributes not updated",
    });
  }

  res.status(200).json({
    success: true,
    message: "Category attributes deleted successfully",
  });
});

module.exports = {
  createCategoryAttributes,
  updateCategoryAttributes,
  deleteCategoryAttributes,
  getCategoryAttributes,
};
