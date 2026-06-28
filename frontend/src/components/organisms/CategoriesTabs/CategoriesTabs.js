import React, { useState, useEffect } from 'react';
import { LayoutGrid } from "lucide-react";
import { getIconComponent } from '../../../utils/iconHelper';
import API from '../../../api/api';
import './CategoriesTabs.css';

const CategoriesTabs = ({ activeCategory, setActiveCategory }) => {
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    API.get('/categories')
      .then(res => {
        const data = res.data?.data;
        setCategoriesList(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategoriesList([]));
  }, []);

  const tabs = [
    { id: "all", name: "الكل", icon: <LayoutGrid className="w-7 h-7" /> },
    ...categoriesList.map(cat => {
      const IconComponent = getIconComponent(cat.icon || 'Package');
      return {
        id: cat._id,
        name: cat.name,
        icon: <IconComponent className="w-7 h-7" />
      };
    })
  ];

  return (
    <div className="categories-container" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="categories-flex-row">
          {tabs.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="category-circle-btn"
              >
                <div className={isActive ? 'circle-design-active' : 'circle-design-inactive'}>
                  {category.icon}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-sm font-semibold transition-colors duration-300 whitespace-nowrap ${isActive ? "text-[#2a6c2d] font-bold" : "text-[#6B7280] category-text-inactive"}`}>
                    {category.name}
                  </span>
                  {isActive && <div className="w-8 h-0.5 bg-[#2a6c2d] rounded-full transition-all duration-300" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesTabs;
