import React from 'react';
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import './AuthLayout.css';

export default function AuthLayout({ children, title }) {
  const navigate = useNavigate();

  return (
    <section className="auth-layout-container">
      <div className="auth-card-overlay">
        <button 
          onClick={() => navigate("/")} 
          className="close-auth-btn"
        >
          <IoMdClose size={30} />
        </button>

        {title && <h1 className="auth-layout-title">{title}</h1>}

        <div className="auth-content">
          {children}
        </div>
      </div>
    </section>
  );
}