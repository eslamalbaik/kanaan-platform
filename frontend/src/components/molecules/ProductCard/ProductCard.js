import React, { useState } from 'react';
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import Button from '../../atoms/Button/Button';
import { useFavorite } from '../../../context/FavoriteContext';
import { useAuth } from '../../../context/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart, onViewProduct }) => {
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

  const handleView = () => {
    navigate(`/product/${productId}`);
    if (onViewProduct) onViewProduct(product);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (!user || user.role === 'admin') {
      navigate('/login');
      return;
    }
    toggleFavorite(product);
  };

  return (
    <article className="product-card" dir="rtl">
      <div className="image-container cursor-pointer" onClick={handleView}>
        <img
          src={(product.images && product.images.length > 0) ? product.images[0] : "assets/h-st-tray.png"}
          alt={product.name}
          loading="lazy"
        />
        {/* زر المفضلة */}
        <button
          className="favorite-btn"
          onClick={handleFavorite}
          title={fav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        >
          <Heart
            size={17}
            className={fav ? "fav-filled" : "fav-empty"}
            fill={fav ? "#e53e3e" : "none"}
          />
        </button>
      </div>

      <div className="card-content">
        <h3 onClick={handleView} className="cursor-pointer hover:text-[#2a6c2d] transition-colors">
          {product.name}
        </h3>

        <div className="card-price-row">
          <span className="price">{((product.price || 0) / 100).toFixed(2)} ₪</span>
        </div>

        <div className="card-footer-buttons">
          <Button
            variant="secondary"
            onClick={handleView}
            className="view-product-btn"
          >
            <Eye size={16} />
            <span>عرض المنتج</span>
          </Button>

          <Button
            variant={added ? 'success' : 'primary'}
            onClick={handleAdd}
            className="add-to-cart-btn"
          >
            <ShoppingCart size={16} />
            <span>{added ? "أُضيف ✓" : "السلة"}</span>
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
