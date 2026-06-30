import React, { useState } from 'react';
import AuthInput from '../../molecules/AuthInput/AuthInput';
import { validateLogin } from '../../../validations/authValidation';
import Button from '../../atoms/Button/Button';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/api';
import './LoginForm.css'

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateLogin(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const res = await API.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        const { userId, name, role, token, refreshToken } = res.data.data;

        localStorage.setItem('kanaan_token', token);
        localStorage.setItem('kanaan_refresh_token', refreshToken);

        login({ id: userId, name, email: formData.email, role, token });

        navigate(from, { replace: true });
      } catch (err) {
        const msg = err.response?.data?.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        setErrors({ server: msg });
      }
    }
  };

  return (
    <form className="login-form-inner" onSubmit={handleSubmit} noValidate>
      <div className="inputs-group">
      <AuthInput 
          type="email" 
          name="email"
          placeholder="البريد الإلكتروني" 
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        <AuthInput 
          type="password" 
          name="password"
          placeholder="كلمة المرور" 
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
      </div>

      <div className="login-extras">
       <Link to="/forgot-password" className="forgot-link">
  هل نسيت كلمة المرور؟
    </Link>
      
      </div>
      {errors.server && <p className="server-error-message">{errors.server}</p>}

      <Button type="submit" className="login-submit-btn">
        تسجيل دخول
      </Button>

      <p className="go-to-signup">
        ليس لديك حساب مسبقاً؟ <a href="/signup">إنشاء حساب</a>
      </p>
    </form>
  );
};

export default LoginForm;