const express = require("express");
const router = express.Router();
const tensorClient = require("../services/TensorApiClient");

const COLOR_NAMES_AR = {
  '#1a1a1a': 'أسود', '#f5f5f5': 'أبيض', '#c8b89a': 'بيج', '#6b7280': 'رمادي',
  '#1e3a5f': 'أزرق داكن', '#2a6c2d': 'أخضر', '#6b3f1e': 'بني', '#b8943f': 'ذهبي',
  '#2c3e6b': 'كحلي', '#7f1d1d': 'أحمر داكن', '#4a5e3a': 'زيتي', '#9ca3af': 'رصاصي',
};

function hexToColorName(hex) {
  return COLOR_NAMES_AR[hex.toLowerCase()] || hex;
}

// POST /v1/color-change
// body: { imageUrl, color (hex), productId }
router.post("/", async (req, res) => {
  const { imageUrl, color, productId } = req.body;

  if (!imageUrl || !color) {
    return res.status(400).json({ success: false, message: "imageUrl و color مطلوبان" });
  }

  const colorName = hexToColorName(color);

  const positive = `product photo of a traditional Palestinian embroidered thobe (ثوب مطرز فلسطيني), fabric color changed to solid ${colorName} (${color}), keep exact same garment shape, same embroidery patterns, same folds, same stitching, same buttons, same composition, same lighting, same background, professional product photography, high quality`;

  const negative = `different garment, new design, shape change, remove embroidery, blur, low quality, watermark, person, mannequin, different background, distortion, deformation`;

  try {
    let resourceId = null;
    try {
      resourceId = await tensorClient.uploadImage(imageUrl);
    } catch (e) {
      return res.status(500).json({ success: false, message: "فشل رفع الصورة: " + e.message });
    }

    const jobId = await tensorClient.createJob(positive, negative, 0.35, 7, resourceId);
    const resultUrl = await tensorClient.pollJob(jobId, 20, 4000);

    res.json({ success: true, data: { resultUrl, color, colorName } });
  } catch (e) {
    console.error("[ColorChange]", e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
