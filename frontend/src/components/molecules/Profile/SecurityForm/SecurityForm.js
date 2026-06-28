import React, { useState } from 'react';
import AuthInput from '../../../molecules/AuthInput/AuthInput';
import Button from '../../../atoms/Button/Button';

export default function SecurityForm() {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("كلمة المرور الجديدة وغير متطابقتين!");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      alert("تمت تحديث كلمة المرور بنجاح!");
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div>
      <h3 className="text-base font-bold text-[#1a3a1a] mb-6 pb-2 border-b border-[#eae6dc]/60">الأمان وكلمة المرور</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <AuthInput type="password" name="currentPassword" placeholder="كلمة المرور الحالية" value={passwords.currentPassword} onChange={handleChange} />
        <AuthInput type="password" name="newPassword" placeholder="كلمة المرور الجديدة" value={passwords.newPassword} onChange={handleChange} />
        <AuthInput type="password" name="confirmPassword" placeholder="تأكيد كلمة المرور الجديدة" value={passwords.confirmPassword} onChange={handleChange} />

        <div className="pt-2">
          <Button type="submit" variant="primary" className="!w-[180px] !h-[45px] !text-xs !bg-[#1a3a1a] !text-white hover:!bg-emerald-800 rounded-xl">
            {isSubmitting ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
          </Button>
        </div>
      </form>
    </div>
  );
}