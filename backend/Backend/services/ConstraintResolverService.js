// Hard cap — فوق هذا يصبح generation
const STRENGTH_HARD_CAP = 0.65;

const CHANGE_PROFILES = {
  color: { strength: 0.60, cfg_scale: 10, label: "color only" },
  embroidery_color: { strength: 0.45, cfg_scale: 10, label: "embroidery color" },
  material: { strength: 0.40, cfg_scale: 9, label: "material texture" },
  simple: { strength: 0.50, cfg_scale: 9, label: "simple edit" },
};

const DESTRUCTIVE_KEYWORDS = [
  "غير كل", "منتج جديد", "تصميم جديد", "غير الشكل", "بدل",
  "redesign", "completely different", "new product", "change style",
  "change shape", "different garment",
];

const COLOR_MAP = {
  "احمر": "red", "أحمر": "red",
  "ازرق": "blue", "أزرق": "blue",
  "اخضر": "green", "أخضر": "green",
  "اصفر": "yellow", "أصفر": "yellow",
  "ابيض": "white", "أبيض": "white",
  "اسود": "black", "أسود": "black",
  "بني": "brown", "بيج": "beige",
  "رمادي": "gray", "وردي": "pink",
  "بنفسجي": "purple", "برتقالي": "orange",
  "ذهبي": "golden", "فضي": "silver",
  "زيتي": "olive green", "كحلي": "navy blue",
  "تركواز": "turquoise",
  "red": "red", "blue": "blue", "green": "green",
  "white": "white", "black": "black", "yellow": "yellow",
  "pink": "pink", "gray": "gray", "brown": "brown",
};

const EMBROIDERY_KEYWORDS = ["تطريز", "طرز", "embroidery", "نقشة", "زخرفة"];

class ConstraintResolverService {
  resolve(userRequest = "", productMetadata = {}) {
    const req = userRequest.toLowerCase();

    // رفض التعديلات المدمرة — fallback لتغيير لون آمن
    const isDestructive = DESTRUCTIVE_KEYWORDS.some(k => req.includes(k.toLowerCase()));
    if (isDestructive) {
      return {
        mode: "SAFE_COLOR_ONLY",
        allowed: true,
        changeType: "color",
        extractedColor: null,
        strength: CHANGE_PROFILES.color.strength,
        cfg_scale: CHANGE_PROFILES.color.cfg_scale,
        label: "color only (destructive request overridden)",
        lockedFeatures: ["shape", "embroidery", "background", "silhouette", "structure"],
      };
    }

    // كشف: هل التعديل على التطريز أم على القماش
    const isEmbroideryEdit = EMBROIDERY_KEYWORDS.some(k => req.includes(k));

    // استخراج اللون
    let extractedColor = null;
    for (const [ar, en] of Object.entries(COLOR_MAP)) {
      if (req.includes(ar.toLowerCase())) {
        extractedColor = en;
        break;
      }
    }

    // اختيار profile
    let profile;
    let changeType;
    if (isEmbroideryEdit) {
      profile = CHANGE_PROFILES.embroidery_color;
      changeType = "embroidery_color";
    } else if (extractedColor) {
      profile = CHANGE_PROFILES.color;
      changeType = "color";
    } else {
      profile = CHANGE_PROFILES.simple;
      changeType = "simple";
    }

    // Hard cap
    const strength = Math.min(profile.strength, STRENGTH_HARD_CAP);

    return {
      mode: "EDIT_MODE",
      allowed: true,
      changeType,
      extractedColor,
      isEmbroideryEdit,
      strength,
      cfg_scale: profile.cfg_scale,
      label: profile.label,
      lockedFeatures: ["shape", "embroidery", "background", "silhouette", "structure"],
    };
  }
}

module.exports = new ConstraintResolverService();
