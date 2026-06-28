import React from 'react';
import './ProductsToolbar.css';

const ProductsToolbar = ({ activeCategoryName = "الكل", totalProducts = 0, viewMode, setViewMode }) => {
  return (
    <div className="toolbar-container" dir="rtl">
      <div className="toolbar-info-side">
        <h2 className="toolbar-title">{activeCategoryName}</h2>
        <span className="toolbar-count">({totalProducts} منتج)</span>
      </div>
      <div className="toolbar-actions-side">
        <div className="view-toggle-group">
          <button
            onClick={() => setViewMode('grid')}
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            title="عرض شبكي"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            title="عرض قائمة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductsToolbar;
