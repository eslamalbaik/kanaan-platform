import React, { useState } from 'react';
import { validateSignup } from '../../../validations/authValidation';
import AuthLayout from '../../layouts/AuthLayout/AuthLayout';
import SocialIcons from '../../molecules/SocialIcons/SocialIcons';
import Button from '../../atoms/Button/Button';
import AuthInput from '../../molecules/AuthInput/AuthInput';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/api';
import './SignupForm.css';

export default function SignupForm() {
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', 
    phone: '',
    address: '',
    password: '',
    email: '',
    confirmPassword: '',
  });

const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateSignup(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const phone = formData.phone.startsWith('+970')
          ? formData.phone
          : '+970' + formData.phone.replace(/^0/, '');

        const res = await API.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          phone,
          password: formData.password,
          address: formData.address,
        });

        const { userId, name, role, token, refreshToken } = res.data.data;

        localStorage.setItem('kanaan_token', token);
        localStorage.setItem('kanaan_refresh_token', refreshToken);

        login({ id: userId, name, email: formData.email, role, token });
        navigate('/');
      } catch (err) {
        const msg = err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب';
        setErrors({ server: msg });
      }
    }
  };

  return (
    <AuthLayout title="تسجيل حساب">
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <AuthInput name="name" placeholder="اسم المستخدم" value={formData.name} onChange={handleChange} error={errors.name} />
          <AuthInput name="phone" placeholder="رقم الهاتف" value={formData.phone} onChange={handleChange} error={errors.phone} />
          <AuthInput name="address" placeholder="العنوان" value={formData.address} onChange={handleChange} error={errors.address} />
          <AuthInput type="password" name="password" placeholder="كلمة السر" value={formData.password} onChange={handleChange} error={errors.password} />
          <AuthInput type="email" name="email" placeholder="البريد الالكتروني" value={formData.email} onChange={handleChange} error={errors.email} />
          <AuthInput type="password" name="confirmPassword" placeholder="تأكيد كلمة المرور" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
        </div>

        {errors.server && <p style={{ color: 'red', fontSize: '13px', textAlign: 'right' }}>{errors.server}</p>}
        <div className="signup-btn-wrapper">
          <Button type="submit" variant="primary" className="signup-btn">تسجيل حساب</Button>
        </div>

        <div className="social-login-wrapper">
          <p className="social-login-text">تسجيل الدخول باستخدام</p>
          <SocialIcons onlyAuth={true} />
        </div>
      </form>
    </AuthLayout>
  );
}