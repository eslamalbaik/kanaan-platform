from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn
import cv2
import numpy as np
from PIL import Image
import io
import hashlib
import os

app = FastAPI(title="Kanaan Image Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache: product_id → mask (numpy array)
_mask_cache: dict[str, np.ndarray] = {}
CACHE_DIR = "mask_cache"
os.makedirs(CACHE_DIR, exist_ok=True)


# ──────────────────────────────────────────
# Mask Extraction
# ──────────────────────────────────────────

def extract_mask(img_bgr: np.ndarray) -> np.ndarray:
    """
    White background → binary mask of the garment.
    Returns uint8 mask: 255 = garment, 0 = background.
    """
    # Convert to grayscale
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # Threshold: white background (>240) → 0, garment → 255
    _, binary = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

    # Fill internal holes (buttons, embroidery gaps)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    closed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=3)

    # Remove tiny noise outside garment
    opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel, iterations=1)

    # Keep only the largest connected component (the garment itself)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(opened, connectivity=8)
    if num_labels > 1:
        largest = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        mask = np.where(labels == largest, 255, 0).astype(np.uint8)
    else:
        mask = opened

    # Soft edge: slight blur for anti-aliasing at boundary
    mask_soft = cv2.GaussianBlur(mask, (5, 5), 0)

    return mask_soft


def get_or_create_mask(product_id: str, img_bgr: np.ndarray) -> np.ndarray:
    """Return cached mask or compute and cache it."""
    if product_id in _mask_cache:
        return _mask_cache[product_id]

    cache_path = os.path.join(CACHE_DIR, f"{product_id}.png")
    if os.path.exists(cache_path):
        mask = cv2.imread(cache_path, cv2.IMREAD_GRAYSCALE)
        _mask_cache[product_id] = mask
        return mask

    mask = extract_mask(img_bgr)
    cv2.imwrite(cache_path, mask)
    _mask_cache[product_id] = mask
    return mask


# ──────────────────────────────────────────
# Color Change Engine (LAB space)
# ──────────────────────────────────────────

def hex_to_bgr(hex_color: str) -> tuple[int, int, int]:
    hex_color = hex_color.lstrip("#")
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    return (b, g, r)


def apply_color_lab(img_bgr: np.ndarray, mask: np.ndarray, target_hex: str) -> np.ndarray:
    """
    Change garment color using LAB space.
    Preserves L channel (shadows, folds, stitching) — only shifts A and B (color).
    """
    # Target color in LAB
    target_bgr = np.uint8([[[ *hex_to_bgr(target_hex) ]]])
    target_lab = cv2.cvtColor(target_bgr, cv2.COLOR_BGR2LAB)[0, 0]
    target_a, target_b = float(target_lab[1]), float(target_lab[2])

    # Convert original image to LAB
    img_lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)

    # Normalize mask to 0.0–1.0
    alpha = mask.astype(np.float32) / 255.0

    # Compute per-pixel blend factor based on how "colorful" the original pixel is
    # (dark areas get less color shift to preserve shadow depth)
    L = img_lab[:, :, 0]
    shadow_factor = np.clip(L / 100.0, 0.2, 1.0)  # 0.2 = minimum shift even in deep shadow

    blend = alpha * shadow_factor

    # Shift A and B channels toward target (not hard replace — blend for realism)
    img_lab[:, :, 1] = img_lab[:, :, 1] * (1 - blend) + target_a * blend
    img_lab[:, :, 2] = img_lab[:, :, 2] * (1 - blend) + target_b * blend

    # Clip and convert back
    img_lab = np.clip(img_lab, 0, 255).astype(np.uint8)
    result_bgr = cv2.cvtColor(img_lab, cv2.COLOR_LAB2BGR)

    return result_bgr


# ──────────────────────────────────────────
# Texture Overlay Engine (Phase 2)
# ──────────────────────────────────────────

def apply_texture_overlay(img_bgr: np.ndarray, mask: np.ndarray, texture_bgr: np.ndarray, opacity: float = 0.6) -> np.ndarray:
    """
    Overlay a texture on the garment using Multiply blend mode.
    Multiply preserves shadows: result = (garment * texture) / 255
    """
    h, w = img_bgr.shape[:2]

    # Resize texture to match image
    texture_resized = cv2.resize(texture_bgr, (w, h))

    # Multiply blend (preserves luminance/shadows)
    img_f = img_bgr.astype(np.float32)
    tex_f = texture_resized.astype(np.float32)
    multiplied = np.clip((img_f * tex_f) / 255.0, 0, 255).astype(np.uint8)

    # Blend with opacity
    blended = cv2.addWeighted(img_bgr, 1 - opacity, multiplied, opacity, 0)

    # Apply only within mask
    alpha = mask.astype(np.float32)[:, :, np.newaxis] / 255.0
    result = (blended.astype(np.float32) * alpha + img_bgr.astype(np.float32) * (1 - alpha))

    return np.clip(result, 0, 255).astype(np.uint8)


# ──────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────

def decode_image(data: bytes) -> np.ndarray:
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image")
    return img


def encode_image(img_bgr: np.ndarray, fmt: str = ".png") -> bytes:
    _, buf = cv2.imencode(fmt, img_bgr)
    return buf.tobytes()


def image_hash(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()[:16]


# ──────────────────────────────────────────
# API Endpoints
# ──────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "engine": "Kanaan Image Engine v1"}


@app.post("/mask")
async def compute_mask(
    image: UploadFile = File(...),
    product_id: str = None,
):
    """
    Pre-compute and cache the garment mask.
    Call once per product, then reuse for fast color changes.
    """
    data = await image.read()
    pid = product_id or image_hash(data)
    img = decode_image(data)
    mask = get_or_create_mask(pid, img)

    return {
        "product_id": pid,
        "mask_pixels": int(np.sum(mask > 128)),
        "total_pixels": int(mask.size),
        "garment_coverage": round(float(np.sum(mask > 128)) / mask.size * 100, 1),
    }


@app.post("/preview/color")
async def preview_color(
    image: UploadFile = File(...),
    color: str = "#000000",
    product_id: str = None,
):
    """
    Fast color change preview.
    - color: hex color e.g. #1a3a1a
    - product_id: if provided, uses cached mask (much faster)
    Returns the modified image as PNG.
    """
    if not color.startswith("#") or len(color) not in (4, 7):
        raise HTTPException(status_code=400, detail="color must be hex like #ff0000")

    data = await image.read()
    pid = product_id or image_hash(data)
    img = decode_image(data)

    mask = get_or_create_mask(pid, img)
    result = apply_color_lab(img, mask, color)

    return Response(content=encode_image(result), media_type="image/png")


@app.post("/preview/texture")
async def preview_texture(
    image: UploadFile = File(...),
    texture: UploadFile = File(...),
    opacity: float = 0.6,
    product_id: str = None,
):
    """
    Texture overlay preview (Phase 2).
    Uses Multiply blend mode to preserve garment shadows.
    """
    img_data = await image.read()
    tex_data = await texture.read()

    pid = product_id or image_hash(img_data)
    img = decode_image(img_data)
    tex = decode_image(tex_data)

    mask = get_or_create_mask(pid, img)
    result = apply_texture_overlay(img, mask, tex, opacity=opacity)

    return Response(content=encode_image(result), media_type="image/png")


@app.delete("/mask/{product_id}")
def clear_mask_cache(product_id: str):
    """Clear cached mask for a product (e.g., when original image changes)."""
    _mask_cache.pop(product_id, None)
    cache_path = os.path.join(CACHE_DIR, f"{product_id}.png")
    if os.path.exists(cache_path):
        os.remove(cache_path)
        return {"cleared": True}
    return {"cleared": False}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5050, reload=True)
