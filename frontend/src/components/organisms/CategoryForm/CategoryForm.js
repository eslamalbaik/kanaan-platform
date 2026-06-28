import React, { useState, useEffect } from 'react';
import { LuPlus, LuFolderPlus, LuCheck, LuX, LuPencil, LuTrash2 } from 'react-icons/lu';
import { availableIcons, getIconComponent } from '../../../utils/iconHelper';
import toast from 'react-hot-toast';

export default function CategoryForm({ onSubmit, isEditingId, onCancelEdit, initialData }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Package');

  // قائمة الخصائص المحفوظة للفئة
  const [attributes, setAttributes] = useState([]);

  // حقول منشئ الخصائص
  const [editingAttrIndex, setEditingAttrIndex] = useState(null); // null = إضافة، رقم = تعديل
  const [attrName, setAttrName] = useState('');
  const [attrType, setAttrType] = useState('string');
  const [attrRequired, setAttrRequired] = useState(false);
  const [attrIsSelectable, setAttrIsSelectable] = useState(false);
  const [optionInput, setOptionInput] = useState('');
  const [currentAttrOptions, setCurrentAttrOptions] = useState([]);

  const [formErrors, setFormErrors] = useState({ name: false });
  const [attrNameError, setAttrNameError] = useState(false);
  const [optionInputError, setOptionInputError] = useState(false);

  const ICONS_PER_PAGE = 10;
  const [iconPage, setIconPage] = useState(0);

  // تحميل بيانات الفئة عند التعديل
  useEffect(() => {
    if (isEditingId && initialData) {
      setName(initialData.name || '');
      setDesc(initialData.description || '');
      setSlug(initialData.slug || '');
      const targetIcon = initialData.icon || 'Package';
      setSelectedIcon(targetIcon);
      // الـ attributes تأتي الآن من الـ API مع الفئة
      setAttributes(Array.isArray(initialData.attributes) ? initialData.attributes : []);
      const iconIndex = availableIcons.findIndex(([n]) => n === targetIcon);
      setIconPage(iconIndex !== -1 ? Math.floor(iconIndex / ICONS_PER_PAGE) : 0);
    } else {
      resetForm();
    }
  }, [isEditingId, initialData]);

  const resetForm = () => {
    setName(''); setDesc(''); setSlug(''); setSelectedIcon('Package');
    setAttributes([]); setIconPage(0);
    setFormErrors({ name: false });
    resetAttrInputs();
  };

  const resetAttrInputs = () => {
    setAttrName(''); setAttrType('string'); setAttrRequired(false);
    setAttrIsSelectable(false); setOptionInput(''); setCurrentAttrOptions([]);
    setAttrNameError(false); setOptionInputError(false);
    setEditingAttrIndex(null);
  };

  // ضغط تعديل خاصية موجودة → تعبئة الـ inputs
  const handleEditAttr = (index) => {
    const attr = attributes[index];
    setEditingAttrIndex(index);
    setAttrName(attr.name || '');
    setAttrType(attr.type || 'string');
    setAttrRequired(attr.required || false);
    setAttrIsSelectable(attr.isSelectable || false);
    setCurrentAttrOptions(Array.isArray(attr.options) ? attr.options : []);
    setOptionInput('');
    setAttrNameError(false);
    setOptionInputError(false);
  };

  // حذف خاصية من القائمة
  const handleDeleteAttr = (index) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
    if (editingAttrIndex === index) resetAttrInputs();
  };

  const handleAddOption = () => {
    const trimmed = optionInput.trim();
    if (!trimmed) { setOptionInputError(true); toast.error('اكتب اسم الخيار أولاً'); return; }
    if (currentAttrOptions.includes(trimmed)) { toast.error('هذا الخيار مضاف بالفعل'); return; }
    setCurrentAttrOptions(prev => [...prev, trimmed]);
    setOptionInput('');
    setOptionInputError(false);
  };

  const handleSaveAttr = () => {
    if (!attrName.trim()) { setAttrNameError(true); toast.error('أدخل اسم الخاصية'); return; }
    if (attrType === 'array' && currentAttrOptions.length === 0) {
      setOptionInputError(true); toast.error('أضف خياراً واحداً على الأقل'); return;
    }

    const newAttr = {
      name: attrName.trim(),
      type: attrType,
      required: attrRequired,
      isSelectable: attrIsSelectable,
      options: attrType === 'array' ? currentAttrOptions : [],
    };

    if (editingAttrIndex !== null) {
      // تعديل خاصية موجودة
      setAttributes(prev => prev.map((a, i) => i === editingAttrIndex ? newAttr : a));
      toast.success('تم تحديث الخاصية');
    } else {
      // إضافة خاصية جديدة
      setAttributes(prev => [...prev, newAttr]);
      toast.success('تمت إضافة الخاصية');
    }
    resetAttrInputs();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setFormErrors({ name: true }); toast.error('اسم التصنيف مطلوب'); return; }
    onSubmit({ name, desc, slug, selectedIcon, attributes });
    if (!isEditingId) resetForm();
  };

  const totalPages = Math.ceil(availableIcons.length / ICONS_PER_PAGE);
  const visibleIcons = availableIcons.slice(iconPage * ICONS_PER_PAGE, (iconPage + 1) * ICONS_PER_PAGE);

  return (
    <section className="add-category-card">
      <div className="card-header-with-icon">
        <LuFolderPlus size={20} className="text-[#2a6c2a]" />
        <h2>{isEditingId ? 'تعديل التصنيف الحالي' : 'إضافة تصنيف جديد'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="category-form" noValidate>
        <div className="form-group">

          {/* حقول الفئة الأساسية */}
          <label>اسم التصنيف <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="مثال: تحف خشبية، منتجات عناية"
            value={name}
            className={formErrors.name ? "border-red-500 bg-red-50/30" : ""}
            onChange={e => { setName(e.target.value); if (e.target.value.trim()) setFormErrors({ name: false }); }}
          />
          {formErrors.name && <span className="text-[11px] text-red-500">يرجى كتابة اسم التصنيف</span>}

          <label className="mt-2">رابط القسم (Slug)</label>
          <input type="text" placeholder="اتركه فارغاً للتوليد التلقائي" value={slug} onChange={e => setSlug(e.target.value)} />

          <label className="mt-2">وصف التصنيف</label>
          <textarea placeholder="وصف مختصر..." value={desc} onChange={e => setDesc(e.target.value)} rows="3" className="category-textarea-input" />

          {/* ── منشئ الخصائص ── */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="font-bold text-[#2a6c2a] text-sm block mb-3">
              منشئ الخصائص الديناميكية
              {editingAttrIndex !== null && (
                <span className="mr-2 text-xs font-normal text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  وضع التعديل — الخاصية #{editingAttrIndex + 1}
                </span>
              )}
            </label>

            {/* قائمة الخصائص الموجودة */}
            {attributes.length > 0 && (
              <div className="mb-3 flex flex-col gap-1.5">
                {attributes.map((attr, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                      editingAttrIndex === index
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-bold text-[#1a3a1a]">
                        {attr.name}
                        {attr.required && <span className="text-red-500 mr-0.5">*</span>}
                        <span className="text-gray-400 font-normal mr-1">({attr.type})</span>
                      </span>
                      {attr.isSelectable && <span className="text-[10px] text-blue-600 font-semibold">🔹 قابل للفلترة</span>}
                      {attr.type === 'array' && attr.options?.length > 0 && (
                        <span className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">
                          [{attr.options.join(', ')}]
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditAttr(index)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 border border-blue-100 transition-colors"
                        title="تعديل الخاصية"
                      >
                        <LuPencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAttr(index)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 border border-red-100 transition-colors"
                        title="حذف الخاصية"
                      >
                        <LuTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* فورم إضافة/تعديل خاصية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 mb-3 text-right">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">اسم الخاصية</label>
                <input
                  type="text"
                  value={attrName}
                  placeholder="مثال: اللون، الحجم"
                  className={`w-full text-xs p-2 border rounded-lg bg-white outline-none ${attrNameError ? "border-red-500" : "border-gray-300"}`}
                  onChange={e => { setAttrName(e.target.value); if (e.target.value.trim()) setAttrNameError(false); }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">نوع البيانات</label>
                <select
                  value={attrType}
                  onChange={e => { setAttrType(e.target.value); if (e.target.value !== 'array') setCurrentAttrOptions([]); }}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="string">نص</option>
                  <option value="number">رقم</option>
                  <option value="array">قائمة خيارات</option>
                </select>
              </div>

              {attrType === 'array' && (
                <div className="md:col-span-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={optionInput}
                      placeholder="اكتب خياراً ثم اضغط إضافة"
                      className={`w-full text-xs p-2 border rounded-lg ${optionInputError ? "border-red-500" : "border-gray-300"}`}
                      onChange={e => { setOptionInput(e.target.value); if (e.target.value.trim()) setOptionInputError(false); }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(); } }}
                    />
                    <button type="button" onClick={handleAddOption} className="bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap">
                      إضافة
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentAttrOptions.map((opt, oIdx) => (
                      <span key={oIdx} className="bg-white border border-emerald-200 text-emerald-800 text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1">
                        {opt}
                        <button type="button" onClick={() => setCurrentAttrOptions(currentAttrOptions.filter((_, idx) => idx !== oIdx))} className="text-red-400 mr-1">
                          <LuX size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="md:col-span-2 flex flex-col gap-3 bg-white p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={attrRequired} onChange={e => setAttrRequired(e.target.checked)} className="accent-[#2a6c2a]" />
                    حقل إجباري
                  </label>
                  <label className={`flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer ${attrType !== 'array' ? 'opacity-40' : ''}`}>
                    <input type="checkbox" checked={attrIsSelectable} disabled={attrType !== 'array'} onChange={e => setAttrIsSelectable(e.target.checked)} className="accent-[#2a6c2a]" />
                    قابل للفلترة
                  </label>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {editingAttrIndex !== null && (
                    <button type="button" onClick={resetAttrInputs} className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg">
                      إلغاء التعديل
                    </button>
                  )}
                  <button type="button" onClick={handleSaveAttr} className="bg-[#2a6c2a] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    {editingAttrIndex !== null ? <><LuCheck size={14} /> حفظ التعديل</> : <><LuPlus size={14} /> إضافة الخاصية</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* أيقونات التصنيف */}
          <label className="mt-4 block">أيقونة التصنيف</label>
          <div className="selected-icon-preview">
            {React.createElement(getIconComponent(selectedIcon), { size: 22, className: "text-[#2a6c2a]" })}
            <span>{selectedIcon}</span>
          </div>
          <div className="icons-grid">
            {visibleIcons.map(([iconName]) => {
              const Icon = getIconComponent(iconName);
              return (
                <button key={iconName} type="button" className={`icon-option ${selectedIcon === iconName ? 'active' : ''}`} onClick={() => setSelectedIcon(iconName)}>
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
          <div className="icons-pagination">
            <button type="button" disabled={iconPage === 0} onClick={() => setIconPage(p => p - 1)}>◀</button>
            <span className="text-xs font-semibold text-gray-500">{iconPage + 1} / {totalPages}</span>
            <button type="button" disabled={iconPage === totalPages - 1} onClick={() => setIconPage(p => p + 1)}>▶</button>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <button type="submit" className="submit-category-btn">
            {isEditingId ? <LuCheck size={18} /> : <LuPlus size={18} />}
            {isEditingId ? 'تحديث وتثبيت التعديلات' : 'حفظ وتثبيت التصنيف'}
          </button>
          {isEditingId && (
            <button type="button" onClick={() => { resetForm(); onCancelEdit(); }} className="text-xs text-gray-500 hover:text-rose-600 underline text-center py-1 cursor-pointer">
              إلغاء وضع التعديل
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
