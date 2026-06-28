const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");

const BASE_URL = "https://ap-east-1.tensorart.cloud/v1";
const SD_MODEL = "600423083519508503";

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${process.env.TENSOR_API_KEY}`,
    "Content-Type": "application/json",
  };
}

const COLOR_NAMES_AR = {
  '#1a1a1a': 'black', '#f5f5f5': 'white', '#c8b89a': 'beige', '#6b7280': 'gray',
  '#1e3a5f': 'dark blue', '#2a6c2d': 'green', '#6b3f1e': 'brown', '#b8943f': 'gold',
  '#2c3e6b': 'navy', '#7f1d1d': 'dark red', '#4a5e3a': 'olive', '#9ca3af': 'silver',
};

async function uploadBase64ToTensor(base64Data) {
  // استخراج البيانات من base64
  const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  let buffer, contentType;
  if (matches) {
    contentType = matches[1];
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    // ليس data URL — حاول كـ URL عادي
    const imgRes = await axios.get(base64Data, { responseType: 'arraybuffer', timeout: 20000 });
    buffer = Buffer.from(imgRes.data);
    contentType = 'image/jpeg';
  }

  // الخطوة 1: طلب pre-signed URL من Tensor
  const initRes = await axios.post(`${BASE_URL}/resource/image`, {}, {
    headers: getAuthHeaders(),
    timeout: 20000,
  });

  const { resourceId, putUrl } = initRes.data;
  if (!resourceId || !putUrl) throw new Error("Upload init failed");

  // الخطوة 2: رفع الصورة
  await axios.put(putUrl, buffer, {
    headers: { "Content-Type": "application/octet-stream" },
    timeout: 30000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return resourceId;
}

async function createColorJob(resourceId, colorHex, colorName) {
  const positive = `product photo, same garment, same embroidery patterns, same stitching, same folds, same composition, same background, change fabric color to ${colorName} (${colorHex}), professional product photography`;
  const negative = `different garment, shape change, new design, blur, low quality, watermark, person, mannequin, distortion`;

  const body = {
    request_id: crypto.randomUUID(),
    stages: [
      {
        type: "INPUT_INITIALIZE",
        inputInitialize: { seed: -1, count: 1, image_resource_id: resourceId },
      },
      {
        type: "DIFFUSION",
        diffusion: {
          width: 512, height: 512,
          prompts: [{ text: positive }],
          negativePrompts: [{ text: negative }],
          sd_model: SD_MODEL,
          sdVae: "Automatic",
          sampler: "DPM++ 2M Karras",
          steps: 30,
          cfg_scale: 7,
          clip_skip: 2,
          denoising_strength: 0.35,
        },
      },
    ],
  };

  const res = await axios.post(`${BASE_URL}/jobs`, body, {
    headers: getAuthHeaders(),
    timeout: 30000,
  });

  const jobId = res.data?.job?.id;
  if (!jobId) throw new Error("No jobId returned");
  return jobId;
}

async function pollJob(jobId, maxRetries = 20, intervalMs = 4000) {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    const res = await axios.get(`${BASE_URL}/jobs/${jobId}`, {
      headers: getAuthHeaders(),
      timeout: 15000,
    });
    const job = res.data?.job;
    if (job?.status === "SUCCESS") {
      const url = job?.successInfo?.images?.[0]?.url;
      if (!url) throw new Error("No image URL in response");
      return url;
    }
    if (job?.status === "FAILED") throw new Error("Job FAILED: " + (job?.failedInfo?.reason || "unknown"));
  }
  throw new Error("Job timed out");
}

// POST /v1/color-change
router.post("/", async (req, res) => {
  const { imageUrl, color } = req.body;

  if (!imageUrl || !color) {
    return res.status(400).json({ success: false, message: "imageUrl و color مطلوبان" });
  }

  const colorName = COLOR_NAMES_AR[color.toLowerCase()] || color;

  try {
    const resourceId = await uploadBase64ToTensor(imageUrl);
    const jobId = await createColorJob(resourceId, color, colorName);
    const resultUrl = await pollJob(jobId);
    res.json({ success: true, data: { resultUrl, color, colorName } });
  } catch (e) {
    console.error("[ColorChange]", e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
