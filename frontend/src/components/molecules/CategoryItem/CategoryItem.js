import React from "react";
import CategoryCircle from "../../atoms/CategoryCircle/CategoryCircle";
import "./CategoryItem.css";

export default function CategoryItem({ category, visible, index }) {
  return (
    <a
      href="#products"
      className={`category-item ${visible ? "visible" : ""}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <CategoryCircle image={category.image} label={category.label} />

      <span className="category-item__label">
        {category.label}
      </span>
    </a>
  );
}