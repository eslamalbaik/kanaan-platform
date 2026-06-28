import React from "react";
import { Package, Search, Pencil, Trash2 } from "lucide-react";

export default function ProductList({
  filteredProducts,
  productsCount,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  availableCategories,
  handleEditClick,
  handleOpenDeleteModal,
}) {
  return (
    <section className="products-list-section min-w-0">
      <div className="section-title-wrapper">
        <div className="title-flex">
          <Package size={18} />
          <h2>قائمة المعروضات الحالية</h2>
        </div>
        <span className="count-badge">{filteredProducts.length} من {productsCount} منتجات</span>
      </div>

      <div className="table-toolbar">
        <div className="search-wrapper">
          <Search size={16} />
          <input
            className="search-input"
            placeholder="البحث السريع بالاسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)} 
        >
          <option value="all">كل الأقسام</option>
          {availableCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="table-responsive-wrapper">
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>الصورة</th>
                <th>المنتج والخصائص</th>
                <th>السعر</th>
                <th>المخزون</th>
                <th style={{ textAlign: 'center' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img
                        src={product.images ? product.images[0] : "assets/h-st-tray.png"}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = "https://raw.githubusercontent.com/tailwindlabs/tailwindcss/master/.github/logo-light.svg"; 
                        }} 
                      />
                    </td>
                    <td>
                      <div className="product-name">{product.name}</div>
                      <div className="product-category mb-1">
                        {product.category?.name || "تصنيف عام"}
                      </div>
                      {product.attributes && Object.keys(product.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {Object.entries(product.attributes).map(([key, val]) => (
                            <span key={key} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/50">
                              {key}: {Array.isArray(val) ? val.join('، ') : val}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="product-price-cell">{(product.price / 100).toFixed(2)} ₪</td>
                    <td>
                      <span className="stock-tag">
                        {product.stockQuantity > 10 ? "متوفر" : product.stockQuantity > 0 ? "قليل" : "منتهي"} ({product.stockQuantity})
                      </span>
                    </td>
                    <td>
                      <div className="actions-flex">
                        <button className="action-btn edit" onClick={() => handleEditClick(product)} title="تعديل">
                          <Pencil size={14} />
                        </button>
                        <button className="action-btn delete" onClick={() => handleOpenDeleteModal(product._id)} title="حذف">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#a1a1aa" }}>
                    لا توجد منتجات تطابق البحث الحالي.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}