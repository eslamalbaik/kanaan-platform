import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import './CartItemCard.css';

export default function CartItemCard({ item, onQuantityChange, onRemove }) {
  const product = item.product || item;
  const itemId = item.cartItemId || item._id;
  const currentQty = item.quantity || 1;
  const itemTotal = (product.price * currentQty) / 100;

  return (
    <div className="cart-item-card bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all hover:shadow-md">
      {/* اليمين: الصورة والتفاصيل الحية */}
      <div className="flex gap-4 w-full sm:w-auto">
        <img src={product.image || (Array.isArray(product.images) ? product.images[0] : product.images)} alt={product.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-gray-50 flex-shrink-0" />
        <div className="flex flex-col justify-between py-1">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 leading-snug">{product.name}</h3>
            {/* الخيارات المحددة */}
            {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(item.selectedAttributes).map(([key, val]) => (
                  <span key={key} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f0f7f0] text-[#2a6c2d] border border-[#c8e6c9]">
                    {key}: {val}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 font-medium mt-2">
            سعر الوحدة: <span className="text-gray-700">{(product.price / 100).toFixed(2)} ₪</span>
          </p>
        </div>
      </div>

      {/* اليسار: التحكم بالكميات والأسعار والحذف */}
      <div className="flex sm:flex-col justify-between sm:justify-end items-center sm:items-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        <button onClick={() => onRemove(itemId)} className="delete-item-btn text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors order-first sm:order-none">
          <Trash2 size={18} />
        </button>

        <div className="flex items-center gap-6">
          {/* عداد التحكم بالكمية المدمج */}
          <div className="flex flex-col items-center gap-1">
            <div className="quantity-wrapper flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-9">
              <button
                onClick={() => onQuantityChange(itemId, 1, currentQty)}
                disabled={product.stockQuantity && currentQty >= product.stockQuantity}
                className="px-3 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <Plus size={14} />
              </button>
              <span className="px-4 font-semibold text-sm text-gray-800 bg-white h-full flex items-center min-w-[36px] justify-center select-none">
                {currentQty}
              </span>
              <button
                onClick={() => onQuantityChange(itemId, -1, currentQty)}
                disabled={currentQty <= 1}
                className="px-3 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              >
                <Minus size={14} />
              </button>
            </div>
            {product.stockQuantity != null && product.stockQuantity <= 3 && (
              <span className="text-[10px] font-bold text-red-500">
                متبقٍّ {product.stockQuantity} قطع فقط!
              </span>
            )}
          </div>

          {/* سعر الإجمالي */}
          <div className="text-left min-w-[70px]">
            <span className="block text-xs text-gray-400 font-medium">العناصر</span>
            <span className="font-bold text-[#2a6c2d] text-base sm:text-lg">
              {itemTotal.toFixed(2)} <span className="text-xs font-normal">₪</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}