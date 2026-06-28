import React, { useState, useEffect } from 'react';
import { couponService } from '../../../../api/couponService';
import { LuPlus, LuTrash2, LuTag, LuCheck, LuX } from 'react-icons/lu';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmationModal from '../../../molecules/ConfirmationModal/ConfirmationModal';

const EMPTY_FORM = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  minOrderAmount: '',
  expiresAt: '',
  maxUsage: 1,
  isActive: true,
};

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState({ open: false, id: null, code: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await couponService.getAll();
      setCoupons(data);
    } catch {
      toast.error('فشل جلب الكوبونات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = 'الكود مطلوب';
    if (!form.discountValue || Number(form.discountValue) <= 0) e.discountValue = 'قيمة الخصم مطلوبة';
    if (form.discountType === 'percent' && Number(form.discountValue) > 100) e.discountValue = 'النسبة لا تتجاوز 100%';
    if (!form.expiresAt) e.expiresAt = 'تاريخ الانتهاء مطلوب';
    if (!form.maxUsage || Number(form.maxUsage) < 1) e.maxUsage = 'عدد الاستخدامات مطلوب';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      await couponService.create({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        expiresAt: form.expiresAt,
        maxUsage: Number(form.maxUsage),
        isActive: form.isActive,
      });
      toast.success(`تم إنشاء كوبون "${form.code.toUpperCase()}" بنجاح!`);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'حدث خطأ أثناء الإنشاء');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await couponService.deactivate(modal.id);
      toast.success(`تم تعطيل كوبون "${modal.code}"`);
      setModal({ open: false, id: null, code: '' });
      await load();
    } catch {
      toast.error('فشل تعطيل الكوبون');
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm(prev => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    },
  });

  const inputCls = (key) =>
    `w-full border rounded-xl p-2.5 text-sm outline-none transition-all bg-white ${errors[key] ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#2a6c2d]'}`;

  return (
    <div className="space-y-8" dir="rtl">
      <Toaster />

      {/* فورم الإضافة */}
      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
          <LuTag size={18} className="text-[#2a6c2d]" />
          <h2 className="text-base font-bold text-[#1a3a1a]">إنشاء كوبون خصم جديد</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">كود الكوبون <span className="text-red-500">*</span></label>
              <input {...field('code')} placeholder="مثال: SUMMER20" className={inputCls('code')} />
              {errors.code && <span className="text-[11px] text-red-500">{errors.code}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">نوع الخصم <span className="text-red-500">*</span></label>
              <select {...field('discountType')} className={inputCls('discountType')}>
                <option value="percent">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (₪)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">
                قيمة الخصم {form.discountType === 'percent' ? '(%)' : '(₪)'} <span className="text-red-500">*</span>
              </label>
              <input type="number" min="1" max={form.discountType === 'percent' ? 100 : undefined} {...field('discountValue')} placeholder={form.discountType === 'percent' ? '10' : '5000'} className={inputCls('discountValue')} />
              {errors.discountValue && <span className="text-[11px] text-red-500">{errors.discountValue}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">الحد الأدنى للطلب (₪)</label>
              <input type="number" min="0" {...field('minOrderAmount')} placeholder="0 = بدون حد" className={inputCls('minOrderAmount')} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">تاريخ الانتهاء <span className="text-red-500">*</span></label>
              <input type="date" {...field('expiresAt')} min={new Date().toISOString().split('T')[0]} className={inputCls('expiresAt')} />
              {errors.expiresAt && <span className="text-[11px] text-red-500">{errors.expiresAt}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">الحد الأقصى للاستخدام <span className="text-red-500">*</span></label>
              <input type="number" min="1" {...field('maxUsage')} className={inputCls('maxUsage')} />
              {errors.maxUsage && <span className="text-[11px] text-red-500">{errors.maxUsage}</span>}
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={field('isActive').onChange} className="accent-[#2a6c2d] w-4 h-4" />
              تفعيل الكوبون فور الإنشاء
            </label>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#2a6c2d] hover:bg-[#1f4d1f] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-sm">
              {saving ? 'جاري الحفظ...' : <><LuPlus size={16} /> إنشاء الكوبون</>}
            </button>
          </div>
        </form>
      </section>

      {/* جدول الكوبونات */}
      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#1a3a1a]">الكوبونات الحالية</h2>
          <span className="text-xs font-bold text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">{coupons.length} كوبون</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">جاري التحميل...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <LuTag size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-bold">لا توجد كوبونات بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 border-b border-gray-100">
                  <th className="p-3">الكود</th>
                  <th className="p-3">نوع الخصم</th>
                  <th className="p-3">القيمة</th>
                  <th className="p-3">الحد الأدنى</th>
                  <th className="p-3">الاستخدامات</th>
                  <th className="p-3">الانتهاء</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map(c => {
                  const expired = new Date(c.expiresAt) < new Date();
                  const exhausted = c.usageCount >= c.maxUsage;
                  const active = c.isActive && !expired && !exhausted;

                  return (
                    <tr key={c._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#1a3a1a] tracking-wide">{c.code}</td>
                      <td className="p-3 text-gray-600">{c.discountType === 'percent' ? 'نسبة' : 'مبلغ ثابت'}</td>
                      <td className="p-3 font-bold text-[#2a6c2d]">
                        {c.discountType === 'percent' ? `${c.discountValue}%` : `${c.discountValue / 100} ₪`}
                      </td>
                      <td className="p-3 text-gray-500">
                        {c.minOrderAmount > 0 ? `${c.minOrderAmount / 100} ₪` : '—'}
                      </td>
                      <td className="p-3 text-gray-500">{c.usageCount} / {c.maxUsage}</td>
                      <td className="p-3 text-gray-500 text-xs">
                        {new Date(c.expiresAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {expired && <span className="block text-red-400 font-bold text-[10px]">منتهي</span>}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
                        }`}>
                          {active ? <><LuCheck size={11} /> فعّال</> : <><LuX size={11} /> معطّل</>}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {c.isActive && (
                          <button
                            onClick={() => setModal({ open: true, id: c._id, code: c.code })}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors border border-red-100"
                          >
                            <LuTrash2 size={13} /> تعطيل
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmationModal
        isOpen={modal.open}
        type="danger"
        title="تعطيل الكوبون"
        message={`هل أنت متأكد من تعطيل كوبون "${modal.code}"؟ لن يستطيع المستخدمون استخدامه بعد التعطيل.`}
        confirmText="نعم، عطّله"
        onConfirm={handleDeactivate}
        onClose={() => setModal({ open: false, id: null, code: '' })}
      />
    </div>
  );
}
