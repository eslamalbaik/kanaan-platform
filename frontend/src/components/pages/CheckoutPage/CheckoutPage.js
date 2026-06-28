import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/api';
import { Lock, CreditCard, MapPin, Banknote, Smartphone } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    phone: '',
    city: '',
    street: '',
    notes: '',
  });

  const [card, setCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  const handleShipping = (e) => setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCard = (e) => setCard(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const formatCardNumber = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    return v.length >= 3 ? v.slice(0, 2) + '/' + v.slice(2) : v;
  };

  const total = cartItems.reduce((acc, item) => acc + (item.product?.price || item.price || 0) * (item.quantity || 1), 0) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (cartItems.length === 0) { navigate('/cart'); return; }

    setError('');
    setLoading(true);

    try {
      const rawPhone = shipping.phone.trim();
      const formattedPhone = rawPhone.startsWith('+970')
        ? rawPhone
        : '+970' + rawPhone.replace(/^0/, '');

      await API.post('/orders', {
        shippingAddress: {
          fullName: shipping.fullName,
          phone: formattedPhone,
          city: shipping.city,
          street: shipping.street,
        },
        paymentMethod,
        notes: shipping.notes,
      });

      setSuccess(true);
      if (clearCart) clearCart();
    } catch (err) {
      if (err.message && !err.response) {
        setError(err.message);
        setLoading(false);
        return;
      }
      if (err.response?.status === 401) {
        localStorage.removeItem('kanaan_token');
        localStorage.removeItem('kanaan_refresh_token');
        localStorage.removeItem('kanaan_admin_token');
        localStorage.removeItem('kanaan_admin_refresh_token');
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || 'حدث خطأ، حاول مجدداً');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">تم استلام طلبك بنجاح!</h2>
          <p className="text-gray-500 text-sm mb-2">سيقوم فريقنا بتأكيد الطلب ومعالجته في أقرب وقت.</p>
          {paymentMethod === 'cod' && (
            <p className="text-[#2a6c2d] text-sm font-bold mb-4">طريقة الدفع: عند الاستلام</p>
          )}
          <button onClick={() => navigate('/')}
            className="bg-[#2a6c2d] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1f4d1f] transition-colors">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[130px] pb-12 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* بيانات التوصيل */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-3">
              <MapPin size={16} className="text-[#2a6c2d]" /> بيانات التوصيل
            </h2>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">الاسم الكامل</label>
              <input name="fullName" value={shipping.fullName} onChange={handleShipping} required
                className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#2a6c2d]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">رقم الهاتف</label>
              <input name="phone" value={shipping.phone} onChange={handleShipping} required placeholder="059xxxxxxx"
                className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#2a6c2d]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">المدينة / المنطقة</label>
              <input name="city" value={shipping.city} onChange={handleShipping} required
                className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#2a6c2d]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">الشارع / العنوان التفصيلي</label>
              <input name="street" value={shipping.street} onChange={handleShipping} required
                className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#2a6c2d]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">ملاحظات (اختياري)</label>
              <textarea name="notes" value={shipping.notes} onChange={handleShipping} rows={2}
                className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#2a6c2d] resize-none" />
            </div>
          </div>

          <div className="space-y-6">

            {/* اختيار طريقة الدفع */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
              <h2 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-3">
                <CreditCard size={16} className="text-[#2a6c2d]" /> طريقة الدفع
              </h2>

              <label
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#2a6c2d] bg-[#f0fdf4]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'cod' ? 'border-[#2a6c2d]' : 'border-gray-400'
                }`}>
                  {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-[#2a6c2d]" />}
                </div>
                <Banknote size={18} className={paymentMethod === 'cod' ? 'text-[#2a6c2d]' : 'text-gray-400'} />
                <div>
                  <p className="font-bold text-sm text-gray-800">الدفع عند الاستلام</p>
                  <p className="text-xs text-gray-500">ادفع نقداً عند استلام طلبك</p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('online')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-[#2a6c2d] bg-[#f0fdf4]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'online' ? 'border-[#2a6c2d]' : 'border-gray-400'
                }`}>
                  {paymentMethod === 'online' && <div className="w-2 h-2 rounded-full bg-[#2a6c2d]" />}
                </div>
                <Smartphone size={18} className={paymentMethod === 'online' ? 'text-[#2a6c2d]' : 'text-gray-400'} />
                <div>
                  <p className="font-bold text-sm text-gray-800">الدفع الإلكتروني</p>
                  <p className="text-xs text-gray-500">ادفع ببطاقتك الائتمانية أو الخصم المباشر</p>
                </div>
              </label>
            </div>

            {/* بيانات البطاقة — تظهر فقط عند اختيار الدفع الإلكتروني */}
            {paymentMethod === 'online' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h2 className="font-bold text-gray-700 flex items-center gap-2 border-b pb-3">
                  <CreditCard size={16} className="text-[#2a6c2d]" /> بيانات البطاقة
                </h2>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">رقم البطاقة</label>
                  <input name="number" value={card.number}
                    onChange={e => setCard(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                    required placeholder="0000 0000 0000 0000" maxLength={19} dir="ltr"
                    className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#2a6c2d] tracking-widest" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-600">اسم حامل البطاقة</label>
                  <input name="name" value={card.name} onChange={handleCard} required
                    className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#2a6c2d]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600">تاريخ الانتهاء</label>
                    <input name="expiry" value={card.expiry}
                      onChange={e => setCard(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                      required placeholder="MM/YY" maxLength={5} dir="ltr"
                      className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#2a6c2d]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-600">CVV</label>
                    <input name="cvv" value={card.cvv}
                      onChange={e => setCard(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      required placeholder="000" maxLength={4} dir="ltr"
                      className="border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#2a6c2d]" />
                  </div>
                </div>
              </div>
            )}

            {/* ملخص الطلب */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3 text-sm">
              <h3 className="font-bold text-gray-700 border-b pb-2">ملخص الطلب</h3>
              {cartItems.map(item => {
                const p = item.product || item;
                return (
                  <div key={item.cartItemId || item._id} className="flex justify-between text-gray-600 gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span>{p.name} × {item.quantity || 1}</span>
                      {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.selectedAttributes).map(([key, val]) => (
                            <span key={key} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f0f7f0] text-[#2a6c2d] border border-[#c8e6c9]">
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="flex-shrink-0">{(p.price * (item.quantity || 1) / 100).toFixed(2)} ₪</span>
                  </div>
                );
              })}
              <div className="flex justify-between font-bold text-gray-800 border-t pt-2">
                <span>المجموع</span>
                <span>{total.toFixed(2)} ₪</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-[#2a6c2d] hover:bg-[#1f4d1f] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm">
              <Lock size={16} />
              {loading
                ? 'جاري تأكيد الطلب...'
                : paymentMethod === 'cod'
                  ? 'تأكيد الطلب — الدفع عند الاستلام'
                  : 'تأكيد الطلب والدفع الإلكتروني'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
