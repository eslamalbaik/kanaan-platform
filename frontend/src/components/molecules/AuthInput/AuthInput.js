import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './AuthInput.css';

export default function AuthInput({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error, 
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';

  return (
    <div className="auth-input-wrapper">
      <input
        type={
          isPasswordField
            ? showPassword
              ? 'text'
              : 'password'
            : type
        }
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`auth-input ${error ? 'input-error' : ''}`}
      />

      {isPasswordField && (
        <button
          type="button"
          className="eye-btn"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEye  /> :  <FaEyeSlash />}
        </button>
      )}

      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

