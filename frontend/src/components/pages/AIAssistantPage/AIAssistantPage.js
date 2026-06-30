import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, ArrowRight } from 'lucide-react';
import API from '../../../api/api';
import ColorCustomizer from '../../molecules/ColorCustomizer/ColorCustomizer';
import { useCart } from '../../../context/CartContext';

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    console.log('🔄 جاري تحميل المنتجات للمساعد الذكي (أول 10 فقط)...');
    API.get('/products', { params: { limit: 10, page: 1 } })
      .then(res => {
        console.log('✅ تم تحميل المنتجات:', res.data);
        const data = res.data?.data;
        const list = Array.isArray(data) ? data : (data?.products || []);
        console.log('📦 المنتجات المحملة:', list.length);
        setProducts(list);
        setFiltered(list);
      })
      .catch(err => {
        console.error('❌ خطأ في تحميل المنتجات:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(products); return; }
    const q = search.trim().toLowerCase();
    setFiltered(products.filter(p => p.name?.toLowerCase().includes(q)));
  }, [search, products]);

  const handleApprove = async (previewSrc, color) => {
    if (!selectedProduct) return;
    await addToCart({
      _id: selectedProduct._id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      images: selectedProduct.images,
      quantity: 1,
    });
    setSelectedProduct(null);
    navigate('/checkout');
  };

  const getImage = (p) => p.images?.[0] || p.image || '/assets/placeholder.png';
  const getPrice = (p) => ((p.price || 0) / 100).toFixed(2);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', direction: 'rtl' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3a1a, #2a6c2d)',
        padding: '40px 24px 32px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <Sparkles size={28} color="#b8943f" />
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>مساعدك الذكي</h1>
        </div>
        <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>
          اختر منتجاً ثم غيّر لونه بالذكاء الاصطناعي وأكمل الشراء مباشرة
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            style={{
              width: '100%', padding: '12px 42px 12px 16px',
              borderRadius: 14, border: '1.5px solid #e5e7eb',
              fontSize: 14, outline: 'none', background: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>جاري تحميل المنتجات...</div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
              {filtered.length} منتج — اختر منتجاً لتخصيص لونه
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 16,
            }}>
              {filtered.map(p => (
                <div
                  key={p._id}
                  onClick={() => setSelectedProduct(p)}
                  style={{
                    background: '#fff', borderRadius: 16,
                    overflow: 'hidden', cursor: 'pointer',
                    border: '2px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.border = '2px solid #2a6c2d';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(42,108,45,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.border = '2px solid #e5e7eb';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#f5f5f5' }}>
                    <img
                      src={getImage(p)}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px', color: '#1a1a1a', lineHeight: 1.4 }}>
                      {p.name}
                    </p>
                    <p style={{ fontSize: 12, color: '#2a6c2d', fontWeight: 700, margin: 0 }}>
                      {getPrice(p)} ₪
                    </p>
                  </div>
                  <div style={{
                    background: '#2a6c2d', color: '#fff',
                    fontSize: 11, fontWeight: 700, textAlign: 'center',
                    padding: '6px 0',
                  }}>
                    جرّب الألوان ✦
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ColorCustomizer Modal */}
      {selectedProduct && (
        <ColorCustomizer
          productId={selectedProduct._id}
          imageUrl={getImage(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          onApprove={handleApprove}
        />
      )}
    </div>
  );
}
