import React, { useState } from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFavorite } from '../../../context/FavoriteContext';
import { useAuth } from '../../../context/AuthContext';

const ProductListItem = ({ product, onAddToCart }) => {
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorite();
  const { user } = useAuth();
  const productId = product._id || product.id;
  const fav = isFavorite(productId);

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (!user || user.role === 'admin') { navigate('/login'); return; }
    toggleFavorite(product);
  };

  return (
    <article
      dir="rtl"
      className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all p-4"
    >
      {/* صورة المنتج */}
      <div
        className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 cursor-pointer"
        onClick={() => navigate(`/product/${productId}`)}
      >
        <img
          src={product.images?.[0] || '/assets/h-st-tray.png'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* المعلومات */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <h3
          className="text-base font-bold text-gray-800 cursor-pointer hover:text-[#2a6c2d] transition-colors line-clamp-2"
          onClick={() => navigate(`/product/${productId}`)}
        >
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {product.category?.name && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#2a6c2d] border border-[#c8e6c9]">
              {product.category.name}
            </span>
          )}
          {product.stockQuantity > 0
            ? <span className="text-[11px] text-green-600 font-bold">متوفر</span>
            : <span className="text-[11px] text-red-500 font-bold">غير متوفر</span>
          }
        </div>
      </div>

      {/* السعر والأزرار */}
      <div className="flex flex-col items-end gap-3 flex-shrink-0">
        <span className="text-lg font-bold text-[#2a6c2d]">
          {((product.price || 0) / 100).toFixed(2)} ₪
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFavorite}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-red-50 transition-colors"
            title={fav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          >
            <Heart size={16} fill={fav ? "#e53e3e" : "none"} className={fav ? "text-red-500" : "text-gray-400"} />
          </button>

          <button
            onClick={() => navigate(`/product/${productId}`)}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="عرض المنتج"
          >
            <Eye size={16} className="text-gray-500" />
          </button>

          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold transition-all ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-[#2a6c2d] text-white hover:bg-[#1f4d1f]'
            }`}
          >
            <ShoppingCart size={14} />
            {added ? 'أُضيف ✓' : 'السلة'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductListItem;
