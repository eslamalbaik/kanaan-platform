import React from 'react';
import { ShoppingCart } from "lucide-react";
import './CartIcon.css';

export default function CartIcon({ count = 0, onClick }) {
  return (
    <button className="cart-icon-btn" onClick={onClick}>
      <ShoppingCart size={19} color="#1f4d1f" />
      {count > 0 && (
        <span className="cart-badge-molecule">
          {count}
        </span>
      )}
    </button>
  );
}