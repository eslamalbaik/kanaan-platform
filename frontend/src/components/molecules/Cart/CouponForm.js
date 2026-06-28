import React from 'react';
import './CouponForm.css';

export default function CouponForm({ couponCode, onChange, onSubmit, appliedCoupon, couponError,isLoading }) {
  return (
    <form onSubmit={onSubmit} className="coupon-form space-y-2 pt-2">
      <label className="block text-xs font-semibold text-gray-500">كوبون الخصم</label>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={couponCode}
          onChange={(e) => onChange(e.target.value)}
          placeholder="رمز الكوبون (GAZA)" 
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center uppercase font-mono focus:outline-none focus:border-[#2a6c2d]"
        />
       <button 
  type="submit" 
  disabled={isLoading}
  className="coupon-submit-btn bg-[#2a6c2d] disabled:bg-gray-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
>
  {isLoading ? 'جاري...' : 'تطبيق'}
</button>
      </div>
      {appliedCoupon && (
        <p className="coupon-success text-xs text-[#2a6c2d] bg-green-50 p-2 rounded-lg font-medium text-center border border-green-100">
          تم تطبيق الكوبون بنجاح 
        </p>
      )}
      {couponError && (
        <p className="coupon-error text-xs text-red-500 font-medium pl-1">{couponError}</p>
      )}
    </form>
  );
}