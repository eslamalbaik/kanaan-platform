import React, { useState, useMemo } from 'react';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { useCart } from '../../../context/CartContext'; 
import CartItemCard from '../../organisms/Cart/CartItemCard';
import OrderSummary from '../../organisms/Cart/OrderSummary';
import ConfirmationModal from '../../molecules/ConfirmationModal/ConfirmationModal';
import { couponService } from '../../../api/couponService';
import toast from 'react-hot-toast';
import './CartPage.css';

const shippingRates = { gaza_north: 1500, middle_south: 2000 };

export default function CartPage() {
  // const { cartItems, updateQuantity, removeItem } = useCart();
const { cartItems, updateQuantity, removeItem, restoreItem, clearCartApi } = useCart();
  const navigate = useNavigate(); 

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('gaza_north');
  const [isLoading, setIsLoading] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {}
  });

  // const handleApplyCoupon = (e) => {

  //   e.preventDefault();
  //   setCouponError('');
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     if (couponCode.trim().toUpperCase() === 'GAZA') {
  //       setAppliedCoupon({ code: 'GAZA', discountPercentage: 10 });
  //       toast.success('تم تطبيق الكوبون بنجاح! 🎉'); 
  //     } else {
  //       setCouponError('الكوبون غير صحيح أو منتهي');
  //       setAppliedCoupon(null);
  //       toast.error('الكوبون غير صحيح!');
  //     }
  //     setIsLoading(false); 
  //   }, 600); 
  // };
const handleApplyCoupon = async (e) => {
  e.preventDefault();
  if (!couponCode.trim()) return;

  setCouponError('');
  setIsLoading(true); 

  try {
    
    const couponData = await couponService.validateCoupon(couponCode);
    setAppliedCoupon({
      code: couponData.code,
      discountType: couponData.discountType,
      discountValue: couponData.discountValue,
      // نسبة مئوية جاهزة للاستخدام في الحسابات
      discountPercentage: couponData.discountType === 'percent' ? couponData.discountValue : null,
      fixedAmount: couponData.discountType === 'fixed' ? couponData.discountValue : null,
    });
    
    toast.success('تم تطبيق الكوبون بنجاح! 🎉');
  } catch (error) {
    setCouponError(error.message || 'الكوبون غير صحيح أو منتهي');
    setAppliedCoupon(null);
    toast.error('الكوبون غير صحيح!');
  } finally {
    setIsLoading(false);
  }
};
  const financials = useMemo(() => {
    const subtotalInCents = cartItems.reduce(
      (acc, item) => acc + ((item.product?.price || item.price || 0) * (item.quantity || 1)),
      0
    );

    const discountInCents = appliedCoupon
      ? appliedCoupon.discountType === 'fixed'
        ? appliedCoupon.fixedAmount // مبلغ ثابت بالأجزاء (cents)
        : Math.round(subtotalInCents * (appliedCoupon.discountPercentage / 100))
      : 0;

    const shippingInCents = shippingRates[deliveryZone] || 0;

    return {
      subtotal: subtotalInCents / 100,
      discount: discountInCents / 100,
      shipping: shippingInCents / 100,
      grandTotal: (subtotalInCents - discountInCents + shippingInCents) / 100
    };
  }, [cartItems, appliedCoupon, deliveryZone]);

  // const handleOpenRemoveConfirmation = (item) => {
  //   setModalConfig({
  //     isOpen: true,
  //     type: 'danger',
  //     title: 'إزالة منتج من السلة',
  //     message: `هل أنتِ متأكدة من رغبتكِ في إزالة منتج "${item.product?.name || item.name || ''}" من سلة المشتريات؟`,
  //     confirmText: 'نعم، قم بالإزالة',
  //     onConfirm: () => {
  //       removeItem(item._id); 
  //       setModalConfig(prev => ({ ...prev, isOpen: false })); 
        
  //       toast.success(`تم إزالة "${item.name}" من السلة بنجاح`, {
  //         duration: 3000,
  //         style: {
  //           fontFamily: 'inherit',
  //           direction: 'rtl',
  //           background: '#fff',
  //           color: '#333',
  //           border: '1px solid #e2e8f0',
  //           borderRadius: '12px'
  //         },
  //         iconTheme: {
  //           primary: '#2a6c2d', 
  //           secondary: '#fff',
  //         },
  //       });
  //     }
  //   });
  // };

const handleOpenRemoveConfirmation = (item) => {
    const savedQuantity = item.quantity || 1;
    const itemId = item.cartItemId || item._id;
    const itemIndex = cartItems.findIndex(cartItem => (cartItem.cartItemId || cartItem._id) === itemId);

    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'إزالة منتج من السلة',
      message: `هل أنتِ متأكدة من رغبتكِ في إزالة منتج "${item.product?.name || item.name || ''}" من سلة المشتريات؟`,
      confirmText: 'نعم، قم بالإزالة',
      onConfirm: () => {
        removeItem(itemId);
        setModalConfig(prev => ({ ...prev, isOpen: false })); 
        
        toast(
          (t) => (
            <span className="flex items-center w-full justify-between gap-3">
              <span className="flex items-center gap-2">
                <Trash2 size={18} className="text-[#dc2626] shrink-0" />
                <span className="text-[#dc2626] font-medium text-sm">
                  تم إزالة "{item.product?.name || item.name || ''}" من السلة.
                </span>
              </span>
              
              <button 
                onClick={() => {
                  // ✨ استدعاء دالة الاستعادة مع تمرير مكانه الأصلي (itemIndex)
                  restoreItem({ ...item, quantity: savedQuantity }, itemIndex);
                  
                  toast.dismiss(t.id);
                  toast.success('تم استعادة المنتج بنجاح', { duration: 1000 });
                }}
                className="text-[#2a6c2d] font-bold underline hover:text-[#1f4d1f] text-xs whitespace-nowrap shrink-0 ml-1"
              >
                تراجع؟
              </button>
            </span>
          ),
          {
            duration: 5000,
            style: {
              fontFamily: 'inherit',
              direction: 'rtl',
              background: '#ffffff',
              border: '1px solid #fee2e2', 
              borderRadius: '12px',
              padding: '12px 16px',
              minWidth: '320px' 
            },
          }
        );
      }
    });
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-gray-50 px-4 mt-[130px]" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full text-center border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">سلتك فارغة حالياً</h2>
          <p className="text-gray-500 mb-8 text-sm">تصفح منتجات كنعان وساهم في تعزيز صمود المنتج المحلي الفلسطيني.</p>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="w-full sm:w-auto px-8 py-3 bg-[#2a6c2d] text-white font-bold rounded-xl hover:bg-[#1f4d1f] transition-all text-sm shadow-sm"
          >
            استمر بالتسوق
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="cart-page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50/50 min-h-screen mt-[130px]" dir="rtl">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="text-[#2a6c2d]" size={26} />
          سلة المشتريات ({cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} عنصر)
        </h1>
        <button
          type="button"
          onClick={() => setModalConfig({
            isOpen: true,
            type: 'danger',
            title: 'إفراغ السلة',
            message: 'هل أنت متأكد من رغبتك في إفراغ سلة المشتريات بالكامل؟ لا يمكن التراجع عن هذا الإجراء.',
            confirmText: 'نعم، افرغ السلة',
            onConfirm: async () => {
              await clearCartApi();
              setModalConfig(prev => ({ ...prev, isOpen: false }));
              toast.success('تم إفراغ السلة بنجاح');
            }
          })}
          className="flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors border border-red-100"
        >
          <Trash2 size={15} />
          إفراغ السلة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <CartItemCard
              key={item.cartItemId || item._id}
              item={item}
              onQuantityChange={updateQuantity}
              onRemove={() => handleOpenRemoveConfirmation(item)} 
            />
          ))}
        </div>

        <div className="lg:sticky lg:top-24">
          <OrderSummary
            financials={financials}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            appliedCoupon={appliedCoupon}
            couponError={couponError}
            deliveryZone={deliveryZone}
            setDeliveryZone={setDeliveryZone}
            isLoading={isLoading}
          />
        </div>
      </div>

      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </main>
  );
}