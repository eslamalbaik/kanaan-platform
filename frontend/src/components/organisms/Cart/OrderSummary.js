import React from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CouponForm from '../../molecules/Cart/CouponForm';
import './OrderSummary.css';

export default function OrderSummary({ 
  financials, couponCode, setCouponCode, onApplyCoupon, 
  appliedCoupon, couponError, deliveryZone, setDeliveryZone ,isLoading
}) {

      const navigate = useNavigate();

  return (
    <div className="order-summary-sidebar space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-3">ملخص الطلب</h2>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>المجموع الأولي</span>
            <span className="font-semibold text-gray-800">{financials.subtotal.toFixed(2)} ₪</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between items-center text-red-600 font-medium bg-red-50/50 p-2 rounded-lg">
              <span>الخصم ({appliedCoupon.discountPercentage}%)</span>
              <span>- {financials.discount.toFixed(2)} ₪</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span>تكلفة الشحن</span>
            <span className="font-semibold text-gray-800">{financials.shipping.toFixed(2)} ₪</span>
          </div>
          
          <hr className="border-gray-100 my-2" />

          <div className="flex justify-between items-end pt-1">
            <span className="font-bold text-gray-800 text-base">المجموع النهائي</span>
            <div className="text-left">
              <span className="text-2xl font-black text-[#2a6c2d] tracking-tight">{financials.grandTotal.toFixed(2)}</span>
              <span className="text-xs font-bold text-[#2a6c2d] mr-1">₪</span>
            </div>
          </div>
        </div>

        {/* استدعاء جزيء الكوبون */}
        <CouponForm 
          couponCode={couponCode}
          onChange={setCouponCode}
          onSubmit={onApplyCoupon}
          appliedCoupon={appliedCoupon}
          couponError={couponError}
          isLoading={isLoading}
        />

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-500">منطقة التوصيل</label>
          <select 
            value={deliveryZone} 
            onChange={(e) => setDeliveryZone(e.target.value)} 
            className="w-full border border-gray-200 rounded-xl p-2.5 text-sm bg-white font-medium text-gray-700 focus:outline-none focus:border-[#2a6c2d]"
          >
            <option value="gaza_north">غزة والشمال (15 ₪)</option>
            <option value="middle_south">الوسطى والجنوب (20 ₪)</option>
          </select>
        </div>

        <div className="space-y-2 pt-2">
          <button onClick={() => navigate('/checkout')} className="checkout-btn w-full bg-[#2a6c2d] hover:bg-[#205222] text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm">
            <Lock size={16} />
            الذهاب لإتمام الطلب
          </button>
          <button 
            onClick={() => navigate("/products")}
          className="continue-shopping-btn w-full bg-transparent hover:bg-gray-50 text-gray-600 py-2.5 px-4 rounded-xl font-medium border border-gray-200 flex items-center justify-center gap-2 text-sm">
            <ArrowRight size={16} />
            استمرار بالتسوق
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex gap-3 items-start">
          <ShieldCheck className="text-[#2a6c2d] flex-shrink-0 mt-0.5" size={18} />
          <p className="text-xs font-bold text-gray-700">منتجات أصلية 100% ودعم مباشر للأسر الحرفية والمزارعين.</p>
        </div>
      </div>
    </div>
  );
}