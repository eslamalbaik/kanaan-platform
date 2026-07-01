import React, { useState, useEffect } from "react";
import "./ProductManagement.css";
import toast, { Toaster } from 'react-hot-toast';
import ConfirmationModal from '../../../molecules/ConfirmationModal/ConfirmationModal';
import ProductForm from "../../../organisms/ProductForm/ProductForm";
import ProductList from "../../../organisms/ProductList/ProductList";
import { productService } from "../../../../api/productService";
import { categoryService } from "../../../../api/categoryService";
import API from "../../../../api/api";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    stockQuantity: "",
    categoryId: "",
    description: "",
    isCustomizable: false,
  });

  const [productAttributes, setProductAttributes] = useState({}); 
  const [arrayInputs, setArrayInputs] = useState({});
  
  const [errors, setErrors] = useState({
    name: false,
    price: false,
    stockQuantity: false,
    description: false,
    dynamicFields: {} 
  });

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("all"); 

  const currentSelectedCategoryData = availableCategories.find(c => c._id === formData.categoryId);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const fetchedCategories = await categoryService.getAllCategories();
        const fetchedProducts = await productService.getProducts();
        
        setAvailableCategories(fetchedCategories);
        setProducts(fetchedProducts);

        if (fetchedCategories.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: fetchedCategories[0]._id }));
        }
      } catch (error) {
        console.error("حدث خطأ أثناء تحميل بيانات كنعان الأولى:", error);
        toast.error("فشل جلب البيانات الأساسية للمنصة", { position: 'top-center' });
      }
    };

    loadInitialData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (typeof value === 'string' && value.trim()) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }

    if (name === "categoryId") {
      setProductAttributes({});
      setArrayInputs({});
      setErrors(prev => ({ ...prev, dynamicFields: {} }));
    }
  };

  const handleDynamicAttributeChange = (attrName, value, type) => {
    if (type === 'number' && value < 0) return;
    setProductAttributes(prev => ({ ...prev, [attrName]: value }));
    setErrors(prev => ({ ...prev, dynamicFields: { ...prev.dynamicFields, [attrName]: "" } }));
  };

  const handleAddToArrayAttribute = (attrName) => {
    const valueToAdd = arrayInputs[attrName]?.trim();
    if (!valueToAdd) return;

    const currentArray = Array.isArray(productAttributes[attrName]) ? productAttributes[attrName] : [];
    setProductAttributes(prev => ({ ...prev, [attrName]: [...currentArray, valueToAdd] }));
    setErrors(prev => ({ ...prev, dynamicFields: { ...prev.dynamicFields, [attrName]: "" } }));
    setArrayInputs(prev => ({ ...prev, [attrName]: "" }));
  };

  const handleRemoveFromArrayAttribute = (attrName, indexToRemove) => {
    const currentArray = productAttributes[attrName] || [];
    setProductAttributes(prev => ({ ...prev, [attrName]: currentArray.filter((_, idx) => idx !== indexToRemove) }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation(); 
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setImageFile(null);
    const fileInput = document.getElementById("product-image-input");
    if (fileInput) fileInput.value = ""; 
  };

  const handleOpenDeleteModal = (id) => {
    setProductToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDeleteId) return;
    try {
      const productToDelete = products.find(p => p._id === productToDeleteId);
      const updatedProducts = await productService.deleteProduct(productToDeleteId, products);
      setProducts(updatedProducts);
      
      if (isEditing && editProductId === productToDeleteId) {
        resetForm();
      }
      toast.error(`تم حذف المنتج "${productToDelete?.name}" بنجاح.`, { position: 'top-center' });
    } catch (error) {
      toast.error("حدث خطأ أثناء محاولة حذف المنتج", { position: 'top-center' });
    } finally {
      setIsDeleteModalOpen(false);
      setProductToDeleteId(null);
    }
  };

  const generateProductSlug = (text) => {
    return text.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w\u0621-\u064A-]/g, '');
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    setEditProductId(product._id);
    setFormData({
      name: product.name,
      slug: product.slug || "",
      price: (product.price / 100).toString(), 
      stockQuantity: product.stockQuantity.toString(),
      categoryId: product.category?._id || (typeof product.category === "string" ? product.category : ""),
      description: product.description || "",
      isCustomizable: product.isCustomizable || false,
    });
    setProductAttributes(product.attributes || {});
    setImagePreview(product.images ? product.images[0] : "");
    setErrors({ name: false, price: false, stockQuantity: false, description: false, dynamicFields: {} });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      price: "",
      stockQuantity: "",
      categoryId: availableCategories[0]?._id || "",
      description: "",
      isCustomizable: false,
    });
    setProductAttributes({});
    setArrayInputs({});
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setImageFile(null);
    setIsEditing(false);
    setEditProductId(null);
    setErrors({ name: false, price: false, stockQuantity: false, description: false, dynamicFields: {} });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isNameEmpty = !formData.name || !formData.name.trim();
    const isPriceEmpty = !formData.price || !formData.price.toString().trim();
    const isStockEmpty = !formData.stockQuantity || !formData.stockQuantity.toString().trim();
    const isDescriptionEmpty = !formData.description || !formData.description.trim();
    const hasLetters = /[a-zA-Z\u0600-\u06FF]/.test(formData.name || "");

    if (isNameEmpty && isPriceEmpty && isStockEmpty && isDescriptionEmpty) {
      setErrors({ name: true, price: true, stockQuantity: true, description: true, dynamicFields: {} });
      toast.error("الرجاء تعبئة كافة الحقول الأساسية المطلوبة للمنتج", { position: 'top-center' });
      return;
    }

    const currentErrors = { name: isNameEmpty || !hasLetters, price: isPriceEmpty, stockQuantity: isStockEmpty, description: isDescriptionEmpty, dynamicFields: {} };

    if (isNameEmpty) { setErrors(currentErrors); toast.error("يرجى إدخال اسم المنتج أولاً", { position: 'top-center' }); return; }
    if (!hasLetters) { setErrors(currentErrors); toast.error("يجب أن يحتوي اسم المنتج على حروف هجائية صحيحة", { position: 'top-center' }); return; }
    if (isPriceEmpty) { setErrors(currentErrors); toast.error("يرجى تحديد سعر بيع المنتج بالمنصة", { position: 'top-center' }); return; }
    if (parseFloat(formData.price) < 0) { setErrors({ ...currentErrors, price: true }); toast.error("عذراً، لا يمكن أن يكون سعر المنتج قيمة سالبة!", { position: 'top-center' }); return; }
    if (isStockEmpty) { setErrors(currentErrors); toast.error("يرجى إدخال الكمية المتاحة في المخزن", { position: 'top-center' }); return; }
    if (parseInt(formData.stockQuantity, 10) < 0) { setErrors({ ...currentErrors, stockQuantity: true }); toast.error("عذراً، لا يمكن أن تكون كمية المخزون قيمة سالبة!", { position: 'top-center' }); return; }
    if (isDescriptionEmpty) { setErrors(currentErrors); toast.error("يرجى كتابة وصف وتفاصيل المنتج التراثي", { position: 'top-center' }); return; }

    let hasEmptyRequiredFields = false; 
    let hasValidationErrors = false;     

    if (currentSelectedCategoryData?.attributes) {
      for (const attr of currentSelectedCategoryData.attributes) {
        const val = productAttributes[attr.name];
        const stringVal = val ? String(val).trim() : "";
        const isFieldEmpty = !val || (Array.isArray(val) && val.length === 0);
        
        if (attr.required && isFieldEmpty) {
          currentErrors.dynamicFields[attr.name] = "هذا الحقل إلزامي لهذا القسم";
          hasEmptyRequiredFields = true;
          continue;
        }

        if (!isFieldEmpty) {
          if (attr.type === 'string') {
            if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(stringVal)) {
              currentErrors.dynamicFields[attr.name] = "يرجى إدخال حروف فقط";
              hasValidationErrors = true;
            }
          } else if (attr.type === 'number') {
            if (isNaN(Number(stringVal))) {
              currentErrors.dynamicFields[attr.name] = "يرجى إدخال قيمة رقمية صالحة";
              hasValidationErrors = true;
            }
          }
        }
      }
    }

    if (hasEmptyRequiredFields || hasValidationErrors) {
      setErrors(currentErrors);
      toast.error(hasEmptyRequiredFields ? "يرجى تعبئة الحقول الإلزامية الخاصة بخصائص القسم" : "يرجى تصحيح صيغ البيانات المدخلة في خصائص القسم", { position: 'top-center' });
      return;
    }

    const processedPrice = Math.round(parseFloat(formData.price) * 100);
    const chosenCategoryName = availableCategories.find(c => c._id === formData.categoryId)?.name || "تصنيف عام";
    let finalSlug = formData.slug.trim().toLowerCase().replace(/[\s_]+/g, '-');
    if (!finalSlug) finalSlug = generateProductSlug(formData.name);

    try {
      let finalImageUrl = imagePreview;

      // If there's a new file selected, upload it first
      if (imageFile) {
        toast.loading("جاري رفع الصورة للسيرفر...", { id: "upload-toast" });
        const uploadData = new FormData();
        uploadData.append("image", imageFile);
        
        const uploadRes = await API.post("/upload", uploadData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        
        toast.dismiss("upload-toast");
        if (uploadRes.data?.success) {
          finalImageUrl = uploadRes.data.url;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      if (isEditing) {
        const payload = {
          name: formData.name,
          slug: finalSlug,
          price: processedPrice,
          stockQuantity: parseInt(formData.stockQuantity, 10),
          description: formData.description,
          category: { _id: formData.categoryId, name: chosenCategoryName },
          attributes: productAttributes,
          isCustomizable: formData.isCustomizable,
          images: finalImageUrl ? [finalImageUrl] : products.find(p => p._id === editProductId)?.images,
        };
        const updatedList = await productService.updateProduct(editProductId, payload, products);
        setProducts(updatedList);
        toast.success(`تم تحديث بيانات "${formData.name.trim()}" بنجاح!`, { position: 'top-center' });
      } else {
        const payload = {
          name: formData.name,
          slug: finalSlug,
          price: processedPrice,
          stockQuantity: parseInt(formData.stockQuantity, 10),
          description: formData.description,
          category: { _id: formData.categoryId, name: chosenCategoryName },
          attributes: productAttributes,
          isCustomizable: formData.isCustomizable,
          images: finalImageUrl ? [finalImageUrl] : ["assets/h-st-tray.png"],
        };
        const result = await productService.addProduct(payload, products);
        setProducts(result.updatedList);
        toast.success(`تم إضافة المنتج "${formData.name.trim()}" للمتجر بنجاح!`, { position: 'top-center' });
      }
      resetForm();
    } catch (error) {
      toast.dismiss("upload-toast");
      console.error("Error saving product:", error);
      toast.error(error.message === "Failed to upload image" ? "فشل رفع الصورة للسيرفر" : "حدث خطأ أثناء حفظ المنتج", { position: 'top-center' });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesCategory = selectedCategory === "all" || product.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentDeletingProduct = products.find(p => p._id === productToDeleteId);

  return (
    <div className="product-management-container" dir="rtl">
      <Toaster />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setProductToDeleteId(null); }}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف المنتج التراثي"
        message={`هل أنتِ متأكدة من رغبتكِ في حذف المنتج "${currentDeletingProduct?.name || ''}" نهائياً من منصة كنعان؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.`}
        confirmText="نعم، احذف المنتج"
      />

      <ProductForm 
        isEditing={isEditing}
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        availableCategories={availableCategories}
        currentSelectedCategoryData={currentSelectedCategoryData}
        productAttributes={productAttributes}
        setProductAttributes={setProductAttributes}
        setErrors={setErrors}
        arrayInputs={arrayInputs}
        setArrayInputs={setArrayInputs}
        handleAddToArrayAttribute={handleAddToArrayAttribute}
        handleRemoveFromArrayAttribute={handleRemoveFromArrayAttribute}
        handleDynamicAttributeChange={handleDynamicAttributeChange}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
        handleRemoveImage={handleRemoveImage}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
      />

      <ProductList 
        filteredProducts={filteredProducts}
        productsCount={products.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        availableCategories={availableCategories}
        handleEditClick={handleEditClick}
        handleOpenDeleteModal={handleOpenDeleteModal}
      />
    </div>
  );
}
