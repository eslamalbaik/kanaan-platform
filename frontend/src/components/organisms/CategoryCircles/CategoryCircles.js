import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIconComponent } from "../../../utils/iconHelper";
import "./CategoryCircles.css";

export default function CategoryCircles() {
  const [visible, setVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://31.97.196.73/v1'}/categories`)
      .then(r => r.json())
      .then(data => {
        const list = data?.data;
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => setCategories([]));
  }, []);

  const handleClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <section className="category-section">
      <div className="category-section__glow" />
      <div className="category-section__container">
        <div className={`category-section__header ${visible ? "visible" : ""}`}>
          <h2>اكتشف أجود المنتجات المصنوعة بأيدي غزية</h2>
        </div>

        <div className="category-section__grid">
          {categories.map((cat, index) => {
            const IconComponent = getIconComponent(cat.icon || 'Package');
            return (
              <button
                key={cat._id}
                className={`category-item ${visible ? "visible" : ""}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
                onClick={() => handleClick(cat._id)}
              >
                <div className="category-icon-circle">
                  <IconComponent size={32} className="category-icon-svg" />
                </div>
                <span className="category-item__label">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
