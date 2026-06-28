import React, { useState, useEffect } from 'react';
import './CategoryManagement.css';
import ConfirmationModal from '../../../molecules/ConfirmationModal/ConfirmationModal';
import { categoryService } from '../../../../api/categoryService';
import CategoryForm from '../../../organisms/CategoryForm/CategoryForm'
import CategoryList from '../../../organisms/CategoryList/CategoryList';
import toast, { Toaster } from 'react-hot-toast';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [isEditingId, setIsEditingId] = useState(null); 
  const [editingCategory, setEditingCategory] = useState(null);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // جلب البيانات من الـ Service عند تحميل الصفحة
  useEffect(() => {
    const loadCategories = async () => {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  const reloadCategories = async () => {
    const data = await categoryService.getAllCategories();
    setCategories(data);
  };

  const translateAndGenerateSlug = (text) => {
    const cleanText = text.trim().toLowerCase();
    const dictionary = {
      'ملابس': 'clothes', 'أثواب': 'thobes', 'ثوب': 'thobe',
      'منتجات غذائية': 'food-products', 'زيت': 'olive-oil', 'مطرزات': 'embroidery'
    };
    return dictionary[cleanText] || cleanText.replace(/[\s_]+/g, '-').replace(/[^\w\u0621-\u064A-]/g, '');
  };

  const handleFormSubmit = async (formData) => {
    let finalSlug = formData.slug?.trim().toLowerCase().replace(/[\s_]+/g, '-');
    if (!finalSlug) finalSlug = translateAndGenerateSlug(formData.name);

    const payload = {
      name: formData.name.trim(),
      description: formData.desc?.trim() || '',
      slug: finalSlug,
      icon: formData.selectedIcon || '',
      attributes: formData.attributes || [],
    };

    try {
      if (isEditingId) {
        await categoryService.updateCategory(isEditingId, payload);
        setIsEditingId(null);
        setEditingCategory(null);
        toast.success(`تم تحديث تصنيف "${formData.name.trim()}" بنجاح!`);
      } else {
        await categoryService.createCategory(payload);
        toast.success(`تم إضافة تصنيف "${formData.name.trim()}" الجديد للمنصة!`);
      }
      await reloadCategories();
    } catch (error) {
      console.error('خطأ في حفظ التصنيف:', error);
      toast.error('حدث خطأ أثناء حفظ التصنيف');
    }
  };

  const handleEditClick = (category) => {
    setIsEditingId(category._id);
    setEditingCategory(category);
  };

  const handleDeleteCategory = (id) => {
    const categoryToDelete = categories.find(c => c._id === id);
    setModalConfig({
      isOpen: true,
      type: 'danger',
      title: 'تأكيد حذف التصنيف',
      message: 'هل أنت متأكد تماماً من رغبتك في حذف هذا التصنيف؟ هذا الإجراء قد يخفي المنتجات التابعة له فوراً.',
      confirmText: 'نعم، احذف الآن',
      onConfirm: async () => {
        try {
          await categoryService.deleteCategory(id);
          await reloadCategories();
          toast.error(`تم حذف تصنيف "${categoryToDelete?.name}" بنجاح.`);
        } catch {
          toast.error('حدث خطأ أثناء حذف التصنيف');
        }
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="category-management-container" dir="rtl">
      <Toaster />

      {/* المكون الفرعي الأول: فورم الإضافة والتعديل */}
      <CategoryForm 
        onSubmit={handleFormSubmit}
        isEditingId={isEditingId}
        initialData={editingCategory}
        onCancelEdit={() => { setIsEditingId(null); setEditingCategory(null); }}
      />

      {/* المكون الفرعي الثاني: جدول استعراض التصنيفات الحالي */}
      <CategoryList 
        categories={categories}
        onEdit={handleEditClick}
        onDelete={handleDeleteCategory}
      />

      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm} 
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}