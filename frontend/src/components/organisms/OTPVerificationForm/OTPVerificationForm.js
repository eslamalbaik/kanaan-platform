import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Button from '../../atoms/Button/Button';
import { MdOutlineMailOutline } from "react-icons/md";
import './OTPVerificationForm.css';

const OTPVerificationForm = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(58);
  const [error, setError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false); 
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (error) setError("");

    if (element.value !== "" && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(data)) return; 

    const pasteData = data.split("");
    setOtp(pasteData);

    const inputs = document.querySelectorAll('.otp-input-field');
    inputs[5].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length < 6) {
      setError("يرجى إدخال الكود كاملاً (6 أرقام)");
      return;
    }

    setIsLoading(true);
    console.log("إرسال الكود للباك اند:", fullOtp);

    setTimeout(() => {
      setIsLoading(false);
      navigate("/reset-password");
    }, 1500);
  };

  return (
    <form className="otp-form-inner" onSubmit={handleSubmit} noValidate>
      <div className="otp-icon-wrapper">
        <MdOutlineMailOutline size={60} className="mail-otp-icon" />
      </div>

      <p className="otp-status-text">تم إرسال كود التحقق إلى بريدك الإلكتروني</p>

      <div className="otp-inputs-container">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            className={`otp-input-field ${error ? 'input-error' : ''}`}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>

      {error && <p className="otp-error-msg">{error}</p>}

      <div className="resend-timer-section">
        {timer > 0 ? (
          <p>لم يصلك الكود؟ إعادة إرسال الكود بعد <span className="timer-count">
            00:{timer < 10 ? `0${timer}` : timer}
          </span></p>
        ) : (
          <button type="button" className="resend-active-btn" onClick={() => setTimer(58)}>
            إعادة إرسال الكود
          </button>
        )}
      </div>

      <Button type="submit" className="verify-code-btn" disabled={isLoading}>
        {isLoading ? "جاري التحقق..." : "تحقق من الكود"}
      </Button>

      <button type="button" onClick={() => navigate("/login")} className="back-login-otp">
        هل تذكرت كلمة مرورك؟ العودة لتسجيل الدخول
      </button>
    </form>
  );
};

export default OTPVerificationForm;