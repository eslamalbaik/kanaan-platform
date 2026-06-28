class PromptBuilderService {
  build(productDescription, constraints) {
    const { changeType, extractedColor, isEmbroideryEdit } = constraints;

    const color = extractedColor || "white";

    // الألوان المعاكسة في الـ negative (اللون الأصلي)
    const oppositeColors = {
      white: "black, dark, darkcolor",
      black: "white, bright, lightcolor",
      red: "blue, green, other colors",
      blue: "red, green, other colors",
    };
    const sourceColorNeg = oppositeColors[color] || "wrong color, different color";

    let positivePrompt, negativePrompt;

    if (isEmbroideryEdit) {
      positivePrompt = `(${color} embroidery:1.4), same traditional Palestinian dress, same fabric color, same background, same composition, same silhouette, professional product photo, high fidelity`;
      negativePrompt = `${sourceColorNeg} embroidery, shape change, background change, distortion, redesign, blurry, low quality, watermark, human, mannequin`;
    } else {
      // تغيير لون القماش — الأسلوب الفعال في SD
      positivePrompt = `(${color} dress:1.5), (${color} fabric:1.4), same traditional Palestinian Majdalawi embroidered thobe, same embroidery pattern, same background, same wooden hanger, same composition, same silhouette, professional product photo, high fidelity, photorealistic`;
      negativePrompt = `(black:1.4), (dark fabric:1.3), ${sourceColorNeg}, shape change, background change, different embroidery, distortion, redesign, blurry, low quality, watermark, human, mannequin, different style`;
    }

    return { positivePrompt, negativePrompt };
  }
}

module.exports = new PromptBuilderService();
