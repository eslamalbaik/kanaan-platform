import React, { useState, useRef, useCallback } from 'react';
import { Palette, RotateCcw, Download, Loader2, X, ShoppingCart } from 'lucide-react';
import API from '../../../api/api';

const PRESET_COLORS = [
  { label: 'أسود', hex: '#1a1a1a' },
  { label: 'أبيض', hex: '#f5f5f5' },
  { label: 'بيج', hex: '#c8b89a' },
  { label: 'رمادي', hex: '#6b7280' },
  { label: 'أزرق داكن', hex: '#1e3a5f' },
  { label: 'أخضر كنعان', hex: '#2a6c2d' },
  { label: 'بني', hex: '#6b3f1e' },
  { label: 'ذهبي', hex: '#b8943f' },
  { label: 'كحلي', hex: '#2c3e6b' },
  { label: 'أحمر داكن', hex: '#7f1d1d' },
  { label: 'زيتي', hex: '#4a5e3a' },
  { label: 'رصاصي', hex: '#9ca3af' },
];

export default function ColorCustomizer({ productId, imageUrl, onClose, onApprove }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [customColor, setCustomColor] = useState('#1a1a1a');
  const [previewSrc, setPreviewSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const abortRef = useRef(null);

  const applyColor = useCallback(async (hex) => {
    setLoading(true);
    setError('');
    setStatusMsg('جاري رفع الصورة...');

    try {
      setStatusMsg('جاري معالجة اللون بالذكاء الاصطناعي... (30-60 ثانية)');
      const res = await API.post('/color-change', {
        imageUrl,
        color: hex,
        productId,
      });

      if (!res.data?.success) throw new Error(res.data?.message || 'فشل');
      setPreviewSrc(res.data.data.resultUrl);
      setStatusMsg('');
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'حدث خطأ');
      setStatusMsg('');
    } finally {
      setLoading(false);
    }
  }, [imageUrl, productId]);

  const handlePresetClick = (hex) => {
    setSelectedColor(hex);
    applyColor(hex);
  };

  const handleCustomApply = () => {
    setSelectedColor(customColor);
    applyColor(customColor);
  };

  const handleReset = () => {
    setPreviewSrc(null);
    setSelectedColor(null);
    setError('');
    setStatusMsg('');
  };

  const handleDownload = () => {
    if (!previewSrc) return;
    const a = document.createElement('a');
    a.href = previewSrc;
    a.download = `kanaan-product-${selectedColor?.replace('#', '')}.png`;
    a.target = '_blank';
    a.click();
  };

  const displaySrc = previewSrc || imageUrl;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} dir="rtl">
      <div style={{
        background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 720, maxHeight: '90vh',
        overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={18} color="#2a6c2d" />
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>تغيير لون المنتج</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

          {/* Preview Panel */}
          <div style={{ padding: 20, borderLeft: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              position: 'relative', width: '100%', aspectRatio: '1',
              background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img
                src={displaySrc}
                alt="معاينة المنتج"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
              {loading && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(255,255,255,0.85)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 10, padding: 16, textAlign: 'center',
                }}>
                  <Loader2 size={32} color="#2a6c2d" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 12, color: '#2a6c2d', fontWeight: 700 }}>{statusMsg}</span>
                  <span style={{ fontSize: 11, color: '#888' }}>الذكاء الاصطناعي يعالج الصورة مع الحفاظ على التطريز والطيات</span>
                </div>
              )}
            </div>

            {selectedColor && !loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: selectedColor, border: '1px solid #ddd' }} />
                <span>{selectedColor}</span>
              </div>
            )}

            {error && (
              <p style={{ fontSize: 12, color: '#dc2626', textAlign: 'center', margin: 0 }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button onClick={handleReset} disabled={!previewSrc || loading}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: '8px 0', borderRadius: 10, border: '1.5px solid #e5e7eb',
                  background: '#fff', cursor: 'pointer', fontSize: 12, color: '#555',
                  opacity: (previewSrc && !loading) ? 1 : 0.4,
                }}>
                <RotateCcw size={13} /> إعادة
              </button>
              <button onClick={handleDownload} disabled={!previewSrc || loading}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: '8px 0', borderRadius: 10,
                  border: '1.5px solid #6b7280',
                  background: '#fff',
                  cursor: (previewSrc && !loading) ? 'pointer' : 'default',
                  fontSize: 12, color: (previewSrc && !loading) ? '#555' : '#999',
                  opacity: (previewSrc && !loading) ? 1 : 0.4,
                }}>
                <Download size={13} /> تحميل
              </button>
            </div>

            {/* زر اعتمد التصميم */}
            {onApprove && previewSrc && !loading && (
              <button
                onClick={() => onApprove(previewSrc, selectedColor)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 0', borderRadius: 12,
                  background: 'linear-gradient(135deg, #b8943f, #d4a843)',
                  border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 800, color: '#fff',
                  boxShadow: '0 4px 15px rgba(184,148,63,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                <ShoppingCart size={16} />
                اعتمد التصميم وأكمل الشراء
              </button>
            )}
          </div>

          {/* Color Picker Panel */}
          <div style={{ padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 10 }}>ألوان مقترحة</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
              {PRESET_COLORS.map(({ label, hex }) => (
                <button
                  key={hex}
                  onClick={() => !loading && handlePresetClick(hex)}
                  title={label}
                  disabled={loading}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 10,
                    background: hex,
                    border: selectedColor === hex ? '3px solid #2a6c2d' : '2px solid #e5e7eb',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: selectedColor === hex ? '0 0 0 2px #fff, 0 0 0 4px #2a6c2d' : 'none',
                    transition: 'all 0.15s',
                    opacity: loading ? 0.6 : 1,
                    position: 'relative',
                  }}
                >
                  {selectedColor === hex && !loading && (
                    <span style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: ['#f5f5f5', '#c8b89a', '#b8943f'].includes(hex) ? '#333' : '#fff',
                      fontSize: 14, fontWeight: 900,
                    }}>✓</span>
                  )}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 8 }}>لون مخصص</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
              <input
                type="color"
                value={customColor}
                onChange={e => setCustomColor(e.target.value)}
                disabled={loading}
                style={{ width: 44, height: 44, borderRadius: 10, border: '2px solid #e5e7eb', cursor: 'pointer', padding: 2 }}
              />
              <input
                type="text"
                value={customColor}
                onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setCustomColor(e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, fontFamily: 'monospace', outline: 'none' }}
                placeholder="#000000"
                dir="ltr"
              />
              <button
                onClick={handleCustomApply}
                disabled={loading || customColor.length !== 7}
                style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: '#2a6c2d', color: '#fff', border: 'none',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  opacity: (loading || customColor.length !== 7) ? 0.5 : 1,
                }}>
                تطبيق
              </button>
            </div>

            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 12, fontSize: 11, color: '#2a6c2d', lineHeight: 1.8 }}>
              <strong>🤖 كيف يعمل؟</strong><br />
              الذكاء الاصطناعي يغيّر لون القماش مع الحفاظ الكامل على التطريز والطيات والخياطة والأزرار. قد يستغرق 30-60 ثانية.
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
