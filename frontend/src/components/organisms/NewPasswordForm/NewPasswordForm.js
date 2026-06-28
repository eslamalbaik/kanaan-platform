import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import AuthInput from '../../molecules/AuthInput/AuthInput';
import Button from '../../atoms/Button/Button';
import { validateResetPassword } from '../../../validations/authValidation'; // استدعاء الدالة الجديدة
import './NewPasswordForm.css';
const NewPasswordForm = ({ email = "test@kanaan.ps", resetToken = "mock_otp_token_123" }) => {
  const navigate = useNavigate();
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    if (errors[name] || errors.confirmPassword) {
      setErrors({});
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateResetPassword(passwords);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      const resetPasswordRequestBody = {
        email: email,                       
        resetToken: resetToken,           
        newPassword: passwords.newPassword, 
      };
      
      console.log("إرسال الطلب إلى POST /auth/reset-password بالبيانات:", resetPasswordRequestBody);
      setTimeout(() => {
        setIsLoading(false);
        alert("تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.");
        navigate("/login");
      }, 1500);
    }
  };

  return (
    <form className="new-password-inner" onSubmit={handleSubmit} noValidate>
      <div className="reset-icon-wrapper">
        <img src="/assets/22.png" alt="Reset Password" />
      </div>

      <h2 className="new-password-title">إنشاء كلمة مرور جديدة</h2>
      <p className="new-password-desc">
        أدخل كلمة المرور الجديدة أدناه للحفاظ على أمان حسابك في منصة كنعان.
      </p>

      <div className="inputs-container">
        <AuthInput 
          type="password" 
          name="newPassword" 
          placeholder="كلمة المرور الجديدة" 
          value={passwords.newPassword}
          onChange={handleChange}
          error={errors.newPassword} 
        />
        <AuthInput 
          type="password" 
          name="confirmPassword" 
          placeholder="تأكيد كلمة المرور" 
          value={passwords.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
      </div>

      <Button type="submit" className="update-password-btn" disabled={isLoading}>
        {isLoading ? "جاري التحديث..." : "تحديث كلمة المرور"}
      </Button>

      <button 
        type="button" onClick={() => navigate("/login")}  className="back-to-login-link"
      >
        العودة لتسجيل الدخول
      </button>
    </form>
  );
};

export default NewPasswordForm;