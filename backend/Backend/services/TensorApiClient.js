const axios = require("axios");
const crypto = require("crypto");

const BASE_URL = "https://ap-east-1.tensorart.cloud/v1";
const SD_MODEL = "600423083519508503";

class TensorApiClient {
  constructor() {
    this.token = process.env.TENSOR_API_KEY;
  }

  get authHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  resolveImageUrl(imagePath) {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    // مسار نسبي → بناء URL من السيرفر
    const serverUrl = (process.env.CLIENT_URL || "http://localhost:3000")
      .replace(":3001", ":3000");
    return `${serverUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  }

  async uploadImage(imagePath) {
    const imageUrl = this.resolveImageUrl(imagePath);
    if (!imageUrl) throw new Error("Cannot resolve image URL from: " + imagePath);

    console.log("[TensorApiClient] Uploading image:", imageUrl);

    // الخطوة 1: طلب pre-signed URL
    const initRes = await axios.post(`${BASE_URL}/resource/image`, {}, {
      headers: this.authHeaders,
      timeout: 20000,
    });

    const { resourceId, putUrl } = initRes.data;
    if (!resourceId || !putUrl) {
      throw new Error("Upload init failed: " + JSON.stringify(initRes.data));
    }

    // الخطوة 2: تحميل الصورة
    const imgBuffer = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 25000,
    });

    // الخطوة 3: رفع الصورة مع الـ headers المطلوبة من Tensor.art
    const putHeaders = { "Content-Type": "application/octet-stream" };
    if (initRes.data?.headers?.["X-Oss-Callback"]) {
      putHeaders["X-Oss-Callback"] = initRes.data.headers["X-Oss-Callback"];
    }
    await axios.put(putUrl, imgBuffer.data, {
      headers: putHeaders,
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log("[TensorApiClient] Upload OK, resourceId:", resourceId);
    return resourceId;
  }

  buildJobBody(positivePrompt, negativePrompt, strength, cfgScale, resourceId) {
    // EDIT MODE: دائماً img2img مع strength منخفض
    const inputInitialize = resourceId
      ? { seed: -1, count: 1, image_resource_id: resourceId }
      : { seed: -1, count: 1 };

    const diffusion = {
      width: 512,
      height: 512,
      prompts: [{ text: positivePrompt }],
      negativePrompts: [{ text: negativePrompt }],
      sd_model: SD_MODEL,
      sdVae: "Automatic",
      sampler: "DPM++ 2M Karras",
      steps: 30,
      cfg_scale: cfgScale,
      clip_skip: 2,
      // Hard cap — img2img strength فقط إذا عندنا صورة مرجعية
      ...(resourceId && { denoising_strength: Math.min(strength, 0.65) }),
    };

    return {
      request_id: crypto.createHash("md5").update(Date.now().toString()).digest("hex"),
      stages: [
        { type: "INPUT_INITIALIZE", inputInitialize },
        { type: "DIFFUSION", diffusion },
      ],
    };
  }

  async createJob(positivePrompt, negativePrompt, strength, cfgScale, resourceId) {
    const body = this.buildJobBody(positivePrompt, negativePrompt, strength, cfgScale, resourceId);

    console.log("[TensorApiClient] EDIT MODE:", !!resourceId, "| strength:", Math.min(strength, 0.35), "| cfg:", cfgScale);
    console.log("[TensorApiClient] Prompt:", positivePrompt.substring(0, 100) + "...");

    const res = await axios.post(`${BASE_URL}/jobs`, body, {
      headers: this.authHeaders,
      timeout: 30000,
    });

    const jobId = res.data?.job?.id;
    if (!jobId) throw new Error("No jobId returned: " + JSON.stringify(res.data));
    console.log("[TensorApiClient] Job created:", jobId);
    return jobId;
  }

  async pollJob(jobId, maxRetries = 15, intervalMs = 5000) {
    for (let i = 0; i < maxRetries; i++) {
      await new Promise(r => setTimeout(r, intervalMs));

      const res = await axios.get(`${BASE_URL}/jobs/${jobId}`, {
        headers: this.authHeaders,
        timeout: 15000,
      });

      const job = res.data?.job;
      console.log(`[TensorApiClient] Poll [${i + 1}/${maxRetries}] status:`, job?.status);

      if (job?.status === "SUCCESS") {
        const url = job?.successInfo?.images?.[0]?.url;
        if (!url) throw new Error("No image URL in success response");
        return url;
      }
      if (job?.status === "FAILED") {
        throw new Error("Job FAILED: " + (job?.failedInfo?.reason || "unknown"));
      }
    }
    throw new Error(`Job timed out after ${maxRetries * intervalMs / 1000}s`);
  }

  // النقطة الرئيسية — دائماً EDIT MODE
  async editProductImage(positivePrompt, negativePrompt, constraints, baseImagePath) {
    let resourceId = null;

    // محاولة رفع الصورة الأصلية (EDIT MODE)
    if (baseImagePath) {
      try {
        resourceId = await this.uploadImage(baseImagePath);
      } catch (e) {
        console.error("[TensorApiClient] Image upload failed:", e.message);
        // إذا فشل الرفع، نرفض التوليد ونرجع الصورة الأصلية
        throw new Error("EDIT MODE requires base image. Upload failed: " + e.message);
      }
    } else {
      throw new Error("EDIT MODE requires a base product image");
    }

    const { strength, cfg_scale } = constraints;
    const jobId = await this.createJob(positivePrompt, negativePrompt, strength, cfg_scale, resourceId);
    const imageUrl = await this.pollJob(jobId);

    return {
      imageUrl,
      mode: "EDIT_MODE",
      strength: Math.min(strength, 0.35),
      cfg_scale,
      usedImg2Img: true,
    };
  }
}

module.exports = new TensorApiClient();
