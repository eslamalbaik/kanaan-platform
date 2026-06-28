const Product = require("../models/product.model");
const CategoryAttribute = require("../models/categoryAttribute.model");
const Customization = require("../models/customizations.model");
const asyncHandler = require("../utils/asyncHandler");

const ConstraintResolver = require("../services/ConstraintResolverService");
const PromptBuilder = require("../services/PromptBuilderService");
const TensorClient = require("../services/TensorApiClient");

// وصف المنتج الأساسي بالإنجليزي للـ prompt
const buildProductDescription = (product) => {
  const name = product.name || "Palestinian traditional dress";
  const attrs = product.attributes || {};
  const attrText = Object.entries(attrs)
    .map(([k, v]) => Array.isArray(v) ? `${k}: ${v.join("/")}` : `${k}: ${v}`)
    .join(", ");
  return `Palestinian traditional Majdalawi embroidered thobe (${name})${attrText ? ", " + attrText : ""}, product photo on plain background`;
};

const getCustomizationOptions = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  if (!product.isCustomizable) {
    return res.status(400).json({ success: false, message: "This product does not support customization" });
  }

  res.json({
    success: true,
    data: {
      productId: product._id,
      isCustomizable: product.isCustomizable,
      baseImage: product.images[0],
      options: {
        ...product.attributes,
        supportsTextOverlay: product.supportsTextOverlay,
        supportsImageUpload: product.supportsImageUpload,
      },
    },
  });
});

const generateCustomization = asyncHandler(async (req, res) => {
  const { productId, attributes, description, product_metadata } = req.body;

  const productExists = await Product.findById(productId);
  if (!productExists) return res.status(404).json({ success: false, message: "Product not found" });
  if (!productExists.isCustomizable) return res.status(400).json({ success: false, message: "Product does not support customization" });

  const categoryAttribute = await CategoryAttribute.findOne({ categoryId: productExists.category });
  const normalizedAttributes = {};

  if (attributes && typeof attributes === "object") {
    Object.keys(attributes).forEach((key) => {
      const val = attributes[key];
      normalizedAttributes[key.toLowerCase()] = typeof val === "string" ? val.toLowerCase() : String(val);
    });
  }

  if (categoryAttribute) {
    const selectableAttributes = categoryAttribute.attributes
      .filter(item => item.isSelectable)
      .map(item => item.name.toLowerCase())
      .sort();

    const attributeKeys = Object.keys(normalizedAttributes).sort();
    const isValid = selectableAttributes.every(key => attributeKeys.includes(key));

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Provided attributes are invalid for this category" });
    }

    for (let key in normalizedAttributes) {
      if (!productExists.attributes[key]) {
        return res.status(400).json({ success: false, message: `Invalid attribute: ${key}` });
      }
    }
  }

  // حل القيود وبناء الـ prompt
  const constraints = ConstraintResolver.resolve(description, product_metadata);
  if (!constraints.allowed) {
    return res.status(400).json({ success: false, message: constraints.reason });
  }

  const productDesc = buildProductDescription(productExists);
  const { positivePrompt, negativePrompt } = PromptBuilder.build(productDesc, constraints);

  console.log("[Customization] Positive:", positivePrompt);
  console.log("[Customization] Negative:", negativePrompt);
  console.log("[Customization] Settings:", { strength: constraints.strength, cfg: constraints.cfg_scale });

  const baseImageUrl = productExists.images?.[0] || null;
  let previewImageUrl = baseImageUrl || "";
  let generationMeta = {};

  try {
    const result = await TensorClient.editProductImage(
      positivePrompt,
      negativePrompt,
      { strength: constraints.strength, cfg_scale: constraints.cfg_scale },
      baseImageUrl
    );
    previewImageUrl = result.imageUrl;
    generationMeta = {
      usedImg2Img: result.usedImg2Img,
      strength: constraints.strength,
      cfg_scale: constraints.cfg_scale,
      changeType: constraints.changeType,
    };
  } catch (e) {
    console.error("[Customization] Generation failed:", e.message);
  }

  const customization = await Customization.create({
    userId: req.user.id,
    productId,
    attributes: Object.keys(normalizedAttributes).length > 0 ? normalizedAttributes : (attributes || {}),
    description,
    previewImageUrl,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    data: customization,
    meta: generationMeta,
  });
});

const regenerateCustomization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { attributes, description, product_metadata } = req.body;

  const customization = await Customization.findById(id).populate("productId");
  if (!customization) return res.status(404).json({ success: false, message: "Not found" });

  if (attributes) {
    const product = customization.productId;
    for (const [key, value] of Object.entries(attributes)) {
      if (!product.attributes[key]) {
        return res.status(400).json({ success: false, message: `Invalid attribute: ${key}` });
      }
      customization.attributes[key] = value;
    }
  }
  if (description) customization.description = description;

  const constraints = ConstraintResolver.resolve(
    description || customization.description,
    product_metadata
  );

  const productDesc = buildProductDescription(customization.productId);
  const { positivePrompt, negativePrompt } = PromptBuilder.build(productDesc, constraints);

  const baseImageUrl = customization.productId.images?.[0] || null;

  try {
    const result = await TensorClient.editProductImage(
      positivePrompt,
      negativePrompt,
      { strength: constraints.strength, cfg_scale: constraints.cfg_scale },
      baseImageUrl
    );
    customization.previewImageUrl = result.imageUrl;
  } catch (e) {
    console.error("[Regenerate] Failed:", e.message);
  }

  customization.markModified("attributes");
  await customization.save();

  res.json({
    success: true,
    data: { previewImageUrl: customization.previewImageUrl },
  });
});

module.exports = {
  getCustomizationOptions,
  generateCustomization,
  regenerateCustomization,
};
