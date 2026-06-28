import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import './CartSidebar.css';

export default function CartSidebar() {
  const { cartItems, isCartOpen, closeCart, updateQuantity, removeItem } = useCart();

  const total = cartItems.reduce(
    (acc, item) => acc + ((item.product?.price || 0) * (item.quantity || 1)),
    0
  ) / 100;

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-sidebar-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <aside className={`cart-sidebar ${isCartOpen ? 'open' : ''}`} dir="rtl">
        {/* Header */}
        <div className="cart-sidebar-header">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#2a6c2d]" />
            <h2>سلة المشتريات</h2>
            {cartItems.length > 0 && (
              <span className="cart-sidebar-count">
                {cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="cart-sidebar-close">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="cart-sidebar-items">
          {cartItems.length === 0 ? (
            <div className="cart-sidebar-empty">
              <ShoppingBag size={48} className="opacity-20 mb-3" />
              <p className="font-bold text-gray-500 text-sm">السلة فارغة</p>
              <p className="text-xs text-gray-400 mt-1">أضف منتجات للبدء</p>
            </div>
          ) : (
            cartItems.map(item => {
              const product = item.product || item;
              const itemId = item.cartItemId || item._id;
              const qty = item.quantity || 1;
              const img = product.image || (Array.isArray(product.images) ? product.images[0] : product.images);

              return (
                <div key={itemId} className="cart-sidebar-item">
                  <div className="cart-sidebar-item-img">
                    {img
                      ? <img src={img} alt={product.name} />
                      : <ShoppingBag size={20} className="text-gray-400" />
                    }
                  </div>
                  <div className="cart-sidebar-item-info">
                    <p className="cart-sidebar-item-name">{product.name}</p>
                    {/* الخيارات المحددة */}
                    {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5 mb-1">
                        {Object.entries(item.selectedAttributes).map(([key, val]) => (
                          <span key={key} style={{
                            fontSize: '9px', fontWeight: 700, padding: '1px 6px',
                            borderRadius: '4px', background: '#f0f7f0',
                            color: '#2a6c2d', border: '1px solid #c8e6c9',
                          }}>
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="cart-sidebar-item-price">{(product.price / 100).toFixed(2)} ₪</p>
                    <div className="cart-sidebar-item-controls">
                      <button
                        onClick={() => updateQuantity(itemId, -1, qty)}
                        disabled={qty <= 1}
                        className="qty-btn"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-value">{qty}</span>
                      <button
                        onClick={() => updateQuantity(itemId, 1, qty)}
                        className="qty-btn"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-sidebar-item-right">
                    <button
                      onClick={() => removeItem(itemId)}
                      className="remove-btn"
                    >
                      <Trash2 size={14} />
                    </button>
                    <span className="item-total">
                      {((product.price * qty) / 100).toFixed(2)} ₪
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-sidebar-footer">
            <div className="cart-sidebar-total">
              <span>المجموع</span>
              <span className="total-amount">{total.toFixed(2)} ₪</span>
            </div>
            <Link to="/cart" onClick={closeCart} className="cart-sidebar-view-btn">
              <ArrowLeft size={16} />
              عرض السلة الكاملة
            </Link>
            <Link to="/checkout" onClick={closeCart} className="cart-sidebar-checkout-btn">
              إتمام الطلب
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
