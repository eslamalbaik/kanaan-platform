import React, { useState } from 'react';
import AuthInput from '../../molecules/AuthInput/AuthInput';
import Button from '../../atoms/Button/Button';
import { useNavigate } from "react-router-dom"; 
import { LuKeyRound } from "react-icons/lu"; 
import { validateForgotPassword } from '../../../validations/authValidation';
import './ForgotPasswordForm.css';


const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(''); 
  const navigate = useNavigate(); 

 const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForgotPassword({ email });
    
    if (validationErrors.email) {
      setError(validationErrors.email);
    } else {
      setError('');
      console.log('Sending reset link to:', email);
      navigate("/otp");
    }
  }; 

  return (
    <form className="forgot-password-inner" onSubmit={handleSubmit} noValidate>
      <div className="icon-wrapper">
        <LuKeyRound size={60} className="key-icon" />
      </div>
      
      <p className="forgot-description">
        أدخل بريدك الإلكتروني المسجل وسنرسل لك كود لإعادة تعيين كلمة مرورك.
      </p>

      <div className="input-group">
       <AuthInput 
          type="email" 
          name="email"
          placeholder="البريد الإلكتروني" 
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if(error) setError(''); 
          }}
          error={error} 
        />
      </div>

      <Button type="submit" className="reset-submit-btn" onClick={handleSubmit}>
        إرسال الكود
      </Button>

      <p className="back-to-login">
        هل تذكرت كلمة مرورك؟ <button type="button" onClick={() => navigate("/login")} className="link-style">العودة لتسجيل الدخول</button>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;