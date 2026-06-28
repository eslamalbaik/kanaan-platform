import React from "react";
import { Plus, Pencil, X, Upload, Check } from "lucide-react";

export default function ProductForm({
  isEditing,formData,handleInputChange,errors,
  availableCategories,currentSelectedCategoryData,
  productAttributes,setProductAttributes,
  setErrors,arrayInputs,setArrayInputs,
  handleAddToArrayAttribute, handleRemoveFromArrayAttribute,
  handleDynamicAttributeChange,imagePreview,
  handleImageChange,handleRemoveImage,
  handleSubmit,resetForm, 
}) {
  return (
    <section className="add-product-card">
      <div className="card-header-with-icon">
        {isEditing ? <Pencil size={16} /> : <Plus size={16} />}
        <h2>{isEditing ? "تعديل المنتج الحالي" : "إضافة منتج جديد للمنصة"}</h2>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        {/* حقل اسم المنتج */}
        <div className="form-group">
          <label>اسم المنتج الفني <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="مثال: ثوب فلسطيني مطرز..."
            autoComplete="off" 
            className={errors.name ? "border-red-500 bg-red-50/30 focus:border-red-500 text-right outline-none transition-all" : ""}
          />
          {errors.name && <span className="text-[11px] text-red-500 font-medium block mt-1">يرجى إدخال اسم منتج صحيح ومناسب</span>}
        </div>

        {/* رابط المنتج */}
        <div className="form-group">
          <label>رابط المنتج (Slug) <span style={{color: '#999', fontWeight: 'normal'}}>(اختياري بالإنجليزية)</span></label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="مثال: traditional-palestinian-thobe"
            autoComplete="off" 
          />
        </div>

        <div className="form-row">
          {/* حقل السعر */}
          <div className="form-group">
            <label>السعر بالمنصة (شيكل) <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="price"
              min="0" 
              step="any"
              value={formData.price}
              onChange={(e) => {
                if(e.target.value >= 0 || e.target.value === "") handleInputChange(e);
              }}
              placeholder="350"
              className={errors.price ? "border-red-500 bg-red-50/30 focus:border-red-500 outline-none transition-all" : ""}
            />
            {errors.price && <span className="text-[11px] text-red-500 font-medium block mt-1">يرجى تحديد سعر المنتج الصحيح</span>}
          </div>

          {/* حقل المخزون */}
          <div className="form-group">
            <label>الكمية المتاحة بالمخزن <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="stockQuantity"
              min="0" 
              value={formData.stockQuantity}
              onChange={(e) => {
                if(e.target.value >= 0 || e.target.value === "") handleInputChange(e);
              }}
              placeholder="5"
              className={errors.stockQuantity ? "border-red-500 bg-red-50/30 focus:border-red-500 outline-none transition-all" : ""}
            />
            {errors.stockQuantity && <span className="text-[11px] text-red-500 font-medium block mt-1">يرجى تحديد كمية صالحة للمخزن</span>}
          </div>
        </div>

        {/* التصنيف الأساسي */}
        <div className="form-group">
          <label>التصنيف الأساسي</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            className="product-select-input"
          >
            {availableCategories.length > 0 ? (
              availableCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))
            ) : (
              <option value="">لا توجد فئات مضافة، يرجى إضافتها أولاً</option>
            )}
          </select>
        </div>

        {/* بناء الحقول الديناميكية للأقسام */}
        {currentSelectedCategoryData?.attributes && currentSelectedCategoryData.attributes.length > 0 && (
          <div className="mt-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
              خصائص ومميزات قسم ({currentSelectedCategoryData.name}):
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
              {currentSelectedCategoryData.attributes.map((attr) => {
                const attributeErrorMessage = errors.dynamicFields?.[attr.name];
                const isAttrFieldInvalid = !!attributeErrorMessage;
                const wrapperClass = attr.type === 'array' ? 'form-group mb-0 col-span-full' : 'form-group mb-0';

                return (
                  <div key={attr.name} className={wrapperClass}>
                    <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      {attr.name} 
                      {attr.required && <span className="text-red-500 font-bold">*</span>}
                      <span className="text-[10px] text-gray-400 font-normal">
                        ({attr.type === 'array' ? 'قائمة خيارات' : attr.type === 'number' ? 'رقم' : 'نص'})
                      </span>
                    </label>

                    {attr.type === 'array' ? (
                      <div className="space-y-1.5 w-full">
                        <label className="text-[11px] text-gray-500 block font-medium mb-1">
                          الخيارات المتوفرة لهذا المنتج (اضغطي لتحديد المتاح):
                        </label>
                        
                        {attr.options && attr.options.length > 0 ? (
                          <div className={`flex flex-wrap items-center gap-2 p-3 bg-white border rounded-xl w-full transition-all ${
                            isAttrFieldInvalid ? "border-red-500 bg-red-50/20" : "border-slate-200"
                          }`}>
                            {attr.options.map((option) => {
                              const currentProductValues = productAttributes[attr.name] || [];
                              const isSelected = currentProductValues.includes(option);
                              
                              return (
                                <button
                                  type="button"
                                  key={option}
                                  onClick={() => {
                                    let updatedValues = [];
                                    if (isSelected) {
                                      updatedValues = currentProductValues.filter(v => v !== option);
                                    } else {
                                      updatedValues = [...currentProductValues, option];
                                    }
                                    setProductAttributes(prev => ({ ...prev, [attr.name]: updatedValues }));
                                    if (updatedValues.length > 0) {
                                      setErrors(prev => ({
                                        ...prev,
                                        dynamicFields: { ...prev.dynamicFields, [attr.name]: "" }
                                      }));
                                    }
                                  }}
                                  className={`text-xs px-3.5 py-2 rounded-lg border font-medium transition-all duration-200 whitespace-nowrap ${
                                    isSelected 
                                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm scale-105' 
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  {option}
                                  {isSelected && <span className="mr-1 text-[10px]">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex gap-1.5">
                            <input 
                              type="text" 
                              placeholder={`اكتب واضغط إضافة لـ ${attr.name}...`} 
                              value={arrayInputs[attr.name] || ""}
                              className={`w-full text-xs p-2 border rounded-lg bg-white outline-none ${
                                isAttrFieldInvalid ? "border-red-500 bg-red-50/30" : "border-gray-300"
                              }`}
                              onChange={(e) => setArrayInputs(prev => ({ ...prev, [attr.name]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddToArrayAttribute(attr.name);
                                }
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => handleAddToArrayAttribute(attr.name)}
                              className="bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                            >
                              إضافة
                            </button>
                          </div>
                        )}

                        {isAttrFieldInvalid && <span className="text-[10px] text-red-500 block font-medium">{attributeErrorMessage}</span>}

                        {(!attr.options || attr.options.length === 0) && productAttributes[attr.name] && productAttributes[attr.name].length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {productAttributes[attr.name].map((item, index) => (
                              <span key={index} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-[11px] px-2 py-0.5 rounded-md">
                                {item}
                                <button type="button" onClick={() => handleRemoveFromArrayAttribute(attr.name, index)} className="text-gray-400 hover:text-red-500 font-bold text-xs">×</button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : attr.type === 'number' ? (
                      <div className="w-full">
                        <input 
                          type="number" 
                          min="0" 
                          placeholder={`أدخل قيمة ${attr.name}...`}
                          value={productAttributes[attr.name] || ""}
                          onChange={(e) => {
                            if(e.target.value >= 0 || e.target.value === "") handleDynamicAttributeChange(attr.name, e.target.value, 'number');
                          }}
                          className={`w-full text-xs p-2 border rounded-lg bg-white outline-none ${
                            isAttrFieldInvalid ? "border-red-500 bg-red-50/30 focus:border-red-500" : "border-gray-300"
                          }`}
                        />
                        {isAttrFieldInvalid && <span className="text-[10px] text-red-500 block font-medium">{attributeErrorMessage}</span>}
                      </div>
                    ) : (
                      <div className="w-full">
                        <input 
                          type="text" 
                          placeholder={`اكتب ${attr.name}...`}
                          value={productAttributes[attr.name] || ""}
                          onChange={(e) => handleDynamicAttributeChange(attr.name, e.target.value, 'string')}
                          className={`w-full text-xs p-2 border rounded-lg bg-white outline-none ${
                            isAttrFieldInvalid ? "border-red-500 bg-red-50/30 focus:border-red-500" : "border-gray-300"
                          }`}
                        />
                        {isAttrFieldInvalid && <span className="text-[10px] text-red-500 block font-medium">{attributeErrorMessage}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* حقل وصف المنتج */}
        <div className="form-group mt-3">
          <label>وصف وتفاصيل المنتج التراثي <span className="text-red-500">*</span></label>
          <textarea
            name="description"
            className={`product-textarea-input ${errors.description ? "border-red-500 bg-red-50/30 focus:border-red-500" : ""}`}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="اكتب تفاصيل مطرزات المنتج، جودته، أو قصة صناعته..."
            rows="3"
          />
          {errors.description && <span className="text-[11px] text-red-500 font-medium block mt-1">يرجى كتابة وصف وتفاصيل المنتج</span>}
        </div>

        {/* تخصيص بالذكاء الاصطناعي */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
          <input
            type="checkbox"
            id="isCustomizable"
            name="isCustomizable"
            checked={formData.isCustomizable || false}
            onChange={e => handleInputChange({ target: { name: 'isCustomizable', value: e.target.checked } })}
            className="w-4 h-4 accent-[#2a6c2d] cursor-pointer"
          />
          <label htmlFor="isCustomizable" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
            يدعم التخصيص بالذكاء الاصطناعي
          </label>
        </div>

        {/* رفع الصورة */}
        <div className="image-upload-box">
          {imagePreview ? (
            <div className="preview-container">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="remove-image-btn"
                title="حذف الصورة"
              >
                <X size={14} />
              </button>
              <img src={imagePreview} alt="Preview" />
              <span className="upload-success-text">تم تحميل الصورة بنجاح ✓</span>
            </div>
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                id="product-image-input"
                onChange={handleImageChange}
                className="hidden-file-input"
              />
              <div className="upload-placeholder-content">
                <Upload size={22} />
                <p className="image-upload-text">اضغط هنا أو اسحب الصورة لاختيار ملف المنتج</p>
              </div>
            </>
          )}
        </div>

        {/* أزرار الحفظ والإلغاء */}
        <div className="form-actions-buttons flex flex-col gap-2 mt-4">
         <button type="submit" className="submit-product-btn">
          {isEditing ? <Check size={14} /> : <Plus size={14} />}
          <span>{isEditing ? "تحديث وتثبيت التعديلات" : "تأكيد إضافة المنتج"}</span>
        </button>
        
        {isEditing && (
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={resetForm} 
          >
            <span>إلغاء وضع التعديل</span>
          </button>
        )}
        </div>
  
      </form>
    </section>
  );
}