import React, { useState, useEffect } from 'react';
import './FiltersSidebar.css';

const FiltersSidebar = ({ 
  activeCategory = 'all', 
  maxPrice, 
  setMaxPrice, 
  sortBy, 
  setSortBy, 
  inStockOnly, 
  setInStockOnly, 
  selectedExtraFilters = {}, 
  setSelectedExtraFilters, 
  onApply 
}) => {

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const savedCategories = localStorage.getItem('kanaan_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, [activeCategory]); 

  const currentCategoryData = categories.find(cat => cat._id === activeCategory);

  // دالة التعامل مع تغيير خيارات الفلاتر الديناميكية
  const handleDynamicFilterChange = (attrName, optionValue) => {
    const currentValues = selectedExtraFilters[attrName] || [];
    let updatedValues;

    if (currentValues.includes(optionValue)) {
      updatedValues = currentValues.filter(val => val !== optionValue);
    } else {
      updatedValues = [...currentValues, optionValue];
    }

    setSelectedExtraFilters({
      ...selectedExtraFilters,
      [attrName]: updatedValues
    });
  };

  const renderDynamicFilters = () => {
    if (!currentCategoryData || !currentCategoryData.attributes || currentCategoryData.attributes.length === 0) {
      return null;
    }

    const selectableAttributes = currentCategoryData.attributes.filter(
      (attr) => attr.isSelectable === true
    );

    if (selectableAttributes.length === 0) return null;

    return selectableAttributes.map((attr) => {
      const filterOptions = attr.options || []; 

      if (filterOptions.length === 0) return null;

      return (
        <div key={attr.name} className="border-b border-gray-100 pb-3 last:border-0">
          <h4 className="filter-section-title">{attr.name}</h4>
          <div className="filter-section-content max-h-40 overflow-y-auto space-y-1.5 pr-0.5">
            {filterOptions.map((option) => {
              const isChecked = selectedExtraFilters[attr.name]?.includes(option) || false;
              return (
                <label key={option} className="filter-checkbox-label flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={() => handleDynamicFilterChange(attr.name, option)}
                    className="w-4 h-4 rounded text-[#2a6c2a] focus:ring-[#2a6c2a] border-gray-300 accent-[#2a6c2a] cursor-pointer" 
                  />
                  <span className="text-sm text-gray-700 font-medium">{option}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      
      {/*  قسم الترتيب */}
      <div>
        <h4 className="filter-section-title">ترتيب المنتجات</h4>
        <div className="filter-section-content">
          <select 
            value={sortBy || 'latest'} 
            onChange={(e) => setSortBy?.(e.target.value)} 
            className="w-full text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:border-[#2a6c2d] transition-colors"
          >
            <option value="latest">الأحدث</option>
            <option value="price-low">السعر: من الأقل للأعلى</option>
            <option value="price-high">السعر: من الأعلى للأقل</option>
            <option value="popular">الأكثر شعبية</option>
          </select>
        </div>
      </div>

      {/*  قسم نطاق السعر */}
      <div>
        <h4 className="filter-section-title">نطاق السعر <span className="text-xs font-normal text-gray-400">(₪)</span></h4>
        <div className="filter-section-content">
          <input 
            type="range" 
            min="0" 
            max="1000" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))} 
            className="price-slider" 
          />
          <div className="price-inputs">
            <div className="flex flex-col w-full gap-1">
              <span className="text-[10px] text-gray-400 pr-1">من</span>
              <input type="text" readOnly value="0 ₪" className="price-input-box" />
            </div>
            <div className="flex flex-col w-full gap-1">
              <span className="text-[10px] text-gray-400 pr-1">إلى</span>
              <input type="text" readOnly value={`${maxPrice} ₪`} className="price-input-box font-bold text-[#2a6c2d]" />
            </div>
          </div>
        </div>
      </div>

      {/*  قسم التوفر */}
      <div>
        <h4 className="filter-section-title">التوفر</h4>
        <div className="filter-section-content">
          <label className="filter-checkbox-label flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={inStockOnly || false}
              onChange={(e) => setInStockOnly?.(e.target.checked)}
              className="w-4 h-4 rounded text-[#2a6c2a] focus:ring-[#2a6c2a] border-gray-300 accent-[#2a6c2a] cursor-pointer" 
            />
            <span className="text-sm text-gray-700 font-medium">المتوفر فقط في المخزن</span>
          </label>
        </div>
      </div>

      {/*  الفلاتر الديناميكية المصفاة تظهر هنا تلقائياً */}
      {activeCategory !== 'all' && currentCategoryData?.attributes && (
        <div className="animate-fade-in flex flex-col gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
          {renderDynamicFilters()}
        </div>
      )}

      {/* أزرار العمليات */}
      <div className="flex flex-col gap-2 pt-2">
        <button 
          onClick={onApply} 
          className="apply-filters-btn"
        >
          تطبيق الفلترة
        </button>
        
        <button 
          onClick={() => { 
            setMaxPrice(1000); 
            if(onApply) setTimeout(onApply, 50); 
            setInStockOnly?.(false); 
            setSortBy?.('latest'); 
            setSelectedExtraFilters?.({}); 
          }} 
          className="clear-filters-btn"
        >
          مسح الفلاتر
        </button>
      </div>

    </div>
  );
};

export default FiltersSidebar;