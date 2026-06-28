import React, { useState, useEffect } from 'react';
import AuthInput from '../../../molecules/AuthInput/AuthInput'; 
import Button from '../../../atoms/Button/Button';

export default function PersonalInfoForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: 'هبة منير سليم',
      phone: '0599123456',
      address: 'غزة، الرمال - بالقرب من ساحة الكتيبة',
      email: 'heba.munir@example.com'
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { alert("تم حفظ التعديلات بنجاح!"); setIsLoading(false); }, 800);
  };

  return (
    <div>
      <h3 className="text-base font-bold text-[#1a3a1a] mb-6 pb-2 border-b border-[#eae6dc]/60">معلوماتي الشخصية</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AuthInput name="name" placeholder="اسم المستخدم" value={formData.name} onChange={handleChange} />
          <AuthInput name="phone" placeholder="رقم الهاتف" value={formData.phone} onChange={handleChange} />
        </div>
        
        <AuthInput type="email" name="email" placeholder="البريد الالكتروني" value={formData.email} disabled={true} />
        <AuthInput name="address" placeholder="العنوان الافتراضي للشحن" value={formData.address} onChange={handleChange} />

        <div className="pt-4 flex justify-start">
          <Button type="submit" variant="primary" className="!w-[180px] !h-[45px] !text-xs !bg-[#1a3a1a] !text-white hover:!bg-emerald-800 rounded-xl">
            {isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </Button>
        </div>
      </form>
    </div>
  );
}