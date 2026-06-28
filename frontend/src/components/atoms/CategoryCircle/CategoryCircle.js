import React from "react";
import "./CategoryCircle.css";

export default function CategoryCircle({ image, label="تصنيف كنعان" }) {
  return (
    <div className="category-circle">
      <img src={image} alt={label} className="category-circle__image" />
    </div>
  );
}