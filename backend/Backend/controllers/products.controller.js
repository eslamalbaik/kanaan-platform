const Product = require("../models/product.model.js");
const asyncHandler = require("../utils/asyncHandler");

const getProducts = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  console.log(`\n⏱️ بدء جلب المنتجات في ${new Date().toISOString()}`);

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

      if (typeof value === 'string' && value.includes(",")) {
        filter[`attributes.${key}`] = {
          $in: value.split(","),
        };
      } else {
        filter[`attributes.${key}`] = value;
      }
    }
  });

  page = Number(page) || 1;
  limit = Math.min(Number(limit) || 20, 100);

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
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

  console.log('🔍 الفلتر:', JSON.stringify(filter));

  const countTime = Date.now();
  const total = await Product.countDocuments(filter);
  console.log(`📊 عد المنتجات (${Date.now() - countTime}ms): ${total}`);

  const queryTime = Date.now();
  const products = await Product.find(filter)
    .select("_id name price category isFeatured averageRating reviewCount stockQuantity")
    .populate("category", "_id name")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .exec();

  // أضف image placeholder بدلاً من الصور الحقيقية (100 بايت فقط)
  const processedProducts = products.map(product => ({
    ...product,
    images: ["/assets/placeholder.png"], // صورة placeholder فقط
  }));

  console.log(`✅ جلب البيانات (${Date.now() - queryTime}ms): ${products.length} منتج`);
  console.log(`⏱️ الوقت الإجمالي: ${Date.now() - startTime}ms\n`);

  res.json({
    success: true,
    data: {
      products: processedProducts,
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
  const startTime = Date.now();
  console.log(`⏱️ بدء جلب المنتجات المميزة`);

  const products = await Product.find({ isFeatured: true, isActive: true })
    .select("_id name price category isFeatured averageRating reviewCount stockQuantity")
    .limit(8)
    .populate("category", "_id name")
    .lean()
    .exec();

  // placeholder فقط
  const processedProducts = products.map(product => ({
    ...product,
    images: ["/assets/placeholder.png"],
  }));

  console.log(`✅ المنتجات المميزة: ${processedProducts.length} منتج (${Date.now() - startTime}ms)`);

  res.json({
    success: true,
    data: processedProducts,
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const product = await Product.findById(req.params.id)
    .populate("category", "_id name")
    .lean()
    .exec();

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "المنتج غير موجود",
    });
  }

  const relatedProducts = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    isActive: true,
  })
    .select("_id name price images category isFeatured averageRating reviewCount")
    .limit(3)
    .lean()
    .exec();

  // أزل الـ images الإضافية من المنتجات المرتبطة
  const processedRelated = relatedProducts.map(prod => ({
    ...prod,
    images: prod.images ? prod.images.slice(0, 1) : [],
  }));

  console.log(`✅ تفاصيل المنتج: ${Date.now() - startTime}ms`);

  res.json({
    success: true,
    data: {
      ...product,
      relatedProducts: processedRelated,
    },
  });
});

const getProductImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).select("_id images").lean();

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "المنتج غير موجود",
    });
  }

  res.json({
    success: true,
    data: {
      images: product.images || [],
    },
  });
});

const getProductsDebug = asyncHandler(async (req, res) => {
  const total = await Product.countDocuments();
  const active = await Product.countDocuments({ isActive: true });
  const products = await Product.find({ isActive: true }).limit(3).select("_id name");

  res.json({
    success: true,
    debug: {
      totalProducts: total,
      activeProducts: active,
      sampleProducts: products,
    },
  });
});

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getProductImages,
  getProductsDebug,
};
