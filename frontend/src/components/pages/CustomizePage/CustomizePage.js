import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, ShoppingCart, ArrowRight, Wand2, Info, CheckCircle } from 'lucide-react';
import API from '../../../api/api';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import './CustomizePage.css';

// خريطة الألوان العربية/الإنجليزية → hex
const COLOR_MAP = {
  'أحمر': '#c0392b', 'احمر': '#c0392b', 'red': '#c0392b',
  'أزرق': '#2980b9', 'ازرق': '#2980b9', 'blue': '#2980b9',
  'أخضر': '#27ae60', 'اخضر': '#27ae60', 'green': '#27ae60',
  'أصفر': '#f39c12', 'اصفر': '#f39c12', 'yellow': '#f1c40f',
  'أبيض': '#ecf0f1', 'ابيض': '#ecf0f1', 'white': '#ecf0f1',
  'أسود': '#2c3e50', 'اسود': '#2c3e50', 'black': '#2c3e50',
  'بنفسجي': '#8e44ad', 'purple': '#8e44ad',
  'وردي': '#e91e8c', 'pink': '#e91e8c',
  'برتقالي': '#e67e22', 'orange': '#e67e22',
  'بني': '#795548', 'brown': '#795548',
  'رمادي': '#95a5a6', 'grey': '#95a5a6', 'gray': '#95a5a6',
  'ذهبي': '#f0b429', 'gold': '#f0b429',
  'فضي': '#bdc3c7', 'silver': '#bdc3c7',
  'زيتوني': '#558b2f', 'olive': '#558b2f',
};

const getColorHex = (attrs) => {
  if (!attrs) return null;
  for (const [k, v] of Object.entries(attrs)) {
    if (['اللون', 'لون', 'color', 'colour'].includes(k.toLowerCase())) {
      const lower = (v || '').toLowerCase();
      return COLOR_MAP[v] || COLOR_MAP[lower] || null;
    }
  }
  return null;
};

// توليد صورة مخصصة بالـ Canvas
const generateCanvasPreview = (imageSrc, attributes, description) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const draw = () => {
      const W = img.naturalWidth || 600;
      const H = img.naturalHeight || 600;
      canvas.width = W;
      canvas.height = H;

      // 1. رسم الصورة الأصلية
      ctx.drawImage(img, 0, 0, W, H);

      // 2. تطبيق فلتر اللون إذا وجد
      const colorHex = getColorHex(attributes);
      if (colorHex) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = colorHex;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // 3. طبقة تحسين بصري خفيفة (vignette)
      const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      // 4. شريط الخصائص في الأسفل
      const barH = Math.round(H * 0.13);
      ctx.save();
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, H - barH, W, barH);
      ctx.restore();

      // 5. نص الخصائص
      const attrEntries = Object.entries(attributes || {});
      const attrText = attrEntries.map(([k, v]) => `${k}: ${v}`).join('  |  ');
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(H * 0.028)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(attrText, W / 2, H - barH * 0.65);
      ctx.restore();

      // 6. نص الوصف إذا وجد
      if (description && description.trim()) {
        ctx.save();
        ctx.fillStyle = '#a3e4a8';
        ctx.font = `${Math.round(H * 0.022)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`"${description}"`, W / 2, H - barH * 0.22);
        ctx.restore();
      }

      // 7. شارة "مخصص - كنعان"
      const badgeW = Math.round(W * 0.28);
      const badgeH = Math.round(H * 0.045);
      const badgeX = Math.round(W * 0.03);
      const badgeY = Math.round(H * 0.03);
      ctx.save();
      ctx.fillStyle = '#2a6c2d';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(H * 0.022)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦ تصميم مخصص', badgeX + badgeW / 2, badgeY + badgeH / 2);
      ctx.restore();

      resolve(canvas.toDataURL('image/png'));
    };

    img.onload = draw;
    img.onerror = () => {
      // إذا فشل تحميل الصورة، أنشئ placeholder مخصصاً
      canvas.width = 600;
      canvas.height = 600;
      const colorHex = getColorHex(attributes);
      const grad = ctx.createLinearGradient(0, 0, 600, 600);
      grad.addColorStop(0, colorHex || '#2a6c2d');
      grad.addColorStop(1, '#1a3a1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 600);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 600; i += 40) {
        ctx.fillRect(i, 0, 1, 600);
        ctx.fillRect(0, i, 600, 1);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('تصميم مخصص', 300, 270);
      ctx.font = '18px Arial';
      ctx.fillStyle = '#a3e4a8';
      const attrText = Object.entries(attributes || {}).map(([k, v]) => `${k}: ${v}`).join(' | ');
      ctx.fillText(attrText, 300, 320);
      resolve(canvas.toDataURL('image/png'));
    };

    img.src = imageSrc;
  });
};

export default function CustomizePage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState('');

  const [description, setDescription] = useState('');
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [customization, setCustomization] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // canvas-generated image

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    API.get(`/products/${productId}`)
      .then(res => {
        const p = res.data.data;
        setProduct(p);
        if (p?.attributes) {
          const init = {};
          Object.entries(p.attributes).forEach(([key, val]) => {
            if (Array.isArray(val) && val.length > 0) init[key] = val[0];
          });
          setSelectedAttrs(init);
        }
      })
      .catch(() => setError('تعذّر تحميل بيانات المنتج'))
      .finally(() => setLoading(false));
  }, [productId, user, navigate]);

  const buildPreview = async (attrs, desc) => {
    const src = product?.images?.[0] || product?.image || '';
    const canvas = await generateCanvasPreview(src, attrs, desc);
    setPreviewImage(canvas);
  };

  const handleGenerate = async () => {
    setError('');
    setGenerating(true);
    try {
        // 1. توليد المعاينة بالـ Canvas فوراً
      await buildPreview(selectedAttrs, description.trim());

      // 2. حفظ التخصيص في الباك اند
      const res = await API.post('/customizations/generate', {
        productId,
        description: description.trim() || undefined,
        attributes: selectedAttrs,
      });
      const saved = res.data.data;
      setCustomization(saved);
      // 3. إذا رجع Tensor بصورة حقيقية (URL خارجي) استخدمها
      if (saved?.previewImageUrl &&
          saved.previewImageUrl.startsWith('http') &&
          !saved.previewImageUrl.includes('placeholder')) {
        setPreviewImage(saved.previewImageUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'فشل توليد التخصيص، حاول مجدداً');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!customization?._id) return;
    setError('');
    setRegenerating(true);
    try {
      // 1. Canvas فوراً
      await buildPreview(selectedAttrs, description.trim());

      // 2. تحديث الباك اند
      const regenRes = await API.post(`/customizations/${customization._id}/regenerate`, {
        description: description.trim() || undefined,
        attributes: selectedAttrs,
      });
      const newPreview = regenRes.data.data?.previewImageUrl;
      setCustomization(prev => ({ ...prev, attributes: selectedAttrs, description }));
      if (newPreview && newPreview.startsWith('http')) {
        setPreviewImage(newPreview);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إعادة التوليد');
    } finally {
      setRegenerating(false);
    }
  };

  const handleAddToCart = async () => {
    if (!customization?._id) return;
    setAddingToCart(true);
    try {
      await addToCart({
        _id: productId,
        name: product.name,
        quantity: 1,
        selectedAttributes: customization.attributes || selectedAttrs,
        customizationId: customization._id,
      });
      navigate('/cart');
    } catch {
      setError('فشل إضافة المنتج للسلة');
    } finally {
      setAddingToCart(false);
    }
  };

  const displayImg = previewImage || product?.images?.[0] || product?.image || '/assets/h-st-tray.png';

  if (loading) return (
    <div className="customize-loading">
      <div className="loading-spinner" />
      <p>جاري تحميل المنتج...</p>
    </div>
  );

  if (!product) return (
    <div className="customize-error-state">
      <p>{error || 'المنتج غير موجود'}</p>
      <button onClick={() => navigate('/products')}>العودة للمنتجات</button>
    </div>
  );

  return (
    <div className="customize-page" dir="rtl">
      <div className="customize-header">
        <button className="back-btn" onClick={() => navigate(`/product/${productId}`)}>
          <ArrowRight size={18} /> العودة للمنتج
        </button>
        <div className="customize-header-title">
          <Sparkles size={20} className="text-[#2a6c2d]" />
          <h1>تخصيص المنتج بالذكاء الاصطناعي</h1>
        </div>
      </div>

      <div className="customize-grid">
        {/* العمود الأيسر: المعاينة */}
        <div className="customize-preview-col">
          <div className="preview-card">
            <p className="preview-label">
              {previewImage ? 'معاينة التصميم المخصص' : 'معاينة المنتج'}
            </p>
            <div className="preview-image-wrapper">
              <img
                src={displayImg}
                alt={product.name}
                className="preview-img"
                style={{ transition: 'opacity 0.3s' }}
              />
              {generating && (
                <div className="preview-generating-overlay">
                  <Wand2 size={32} className="animate-bounce" style={{ color: 'white' }} />
                  <p>جاري توليد التصميم...</p>
                </div>
              )}
            </div>
            <h3 className="preview-product-name">{product.name}</h3>
            <p className="preview-product-price">{(product.price / 100).toFixed(2)} ₪</p>

            {!previewImage && (
              <div className="ai-notice">
                <Info size={13} />
                <p>اختر الخصائص واضغط "توليد التصميم" لرؤية معاينة مخصصة للمنتج</p>
              </div>
            )}
          </div>

          {customization && (
            <div className="customization-result-card">
              <div className="result-header">
                <CheckCircle size={14} className="text-[#2a6c2d]" />
                <span>تم توليد التخصيص بنجاح</span>
              </div>
              <div className="result-attrs">
                {Object.entries(customization.attributes || {}).map(([k, v]) => (
                  <div key={k} className="result-attr-row">
                    <span className="result-attr-key">{k}</span>
                    <span className="result-attr-val">{v}</span>
                  </div>
                ))}
                {customization.description && (
                  <div className="result-attr-row">
                    <span className="result-attr-key">الوصف</span>
                    <span className="result-attr-val">{customization.description}</span>
                  </div>
                )}
              </div>
              <div className="result-actions">
                <button className="regenerate-btn" onClick={handleRegenerate} disabled={regenerating}>
                  <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
                  {regenerating ? 'جاري التحديث...' : 'تحديث التصميم'}
                </button>
                <button className="add-customized-btn" onClick={handleAddToCart} disabled={addingToCart}>
                  <ShoppingCart size={14} />
                  {addingToCart ? 'جاري الإضافة...' : 'أضف للسلة'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* العمود الأيمن: الخيارات */}
        <div className="customize-options-col">
          <div className="options-card">
            <h2 className="options-title">
              <Wand2 size={16} /> خيارات التخصيص
            </h2>

            <div className="option-group">
              <label>صف تخصيصك (اختياري)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="مثال: أريد اللون الأحمر مع طراز تقليدي وخياطة ذهبية..."
                rows={3}
                className="description-textarea"
              />
            </div>

            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="attributes-section">
                <p className="attrs-section-title">اختر الخصائص:</p>
                {Object.entries(product.attributes).map(([key, values]) => {
                  const opts = Array.isArray(values) ? values : [values];
                  if (!opts.length) return null;
                  return (
                    <div key={key} className="option-group">
                      <label>{key}</label>
                      <div className="attrs-chips">
                        {opts.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSelectedAttrs(prev => ({ ...prev, [key]: opt }))}
                            className={`attr-chip ${selectedAttrs[key] === opt ? 'selected' : ''}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {error && <p className="customize-error-msg">{error}</p>}

            <button
              className="generate-btn"
              onClick={customization ? handleRegenerate : handleGenerate}
              disabled={generating || regenerating}
            >
              {generating || regenerating ? (
                <><RefreshCw size={16} className="animate-spin" /> جاري التوليد...</>
              ) : (
                <><Sparkles size={16} /> {customization ? 'تحديث التصميم' : 'توليد التصميم'}</>
              )}
            </button>

            {customization && (
              <button className="add-customized-btn-full" onClick={handleAddToCart} disabled={addingToCart}>
                <ShoppingCart size={16} />
                {addingToCart ? 'جاري الإضافة...' : 'أضف التصميم للسلة'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
