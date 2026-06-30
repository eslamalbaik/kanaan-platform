import React, { useState, useEffect } from 'react';
import FiltersSidebar from '../FiltersSidebar/FiltersSidebar';
import { createPortal } from 'react-dom';
import ProductsToolbar from '../ProductsToolbar/ProductsToolbar';
import ProductsGrid from '../ProductsGrid/ProductsGrid';
import { Filter, X } from 'lucide-react';
import API from '../../../api/api';
import './ProductsContent.css';

const ProductsContent = ({ activeCategory, searchQuery = '', onAddToCart }) => {
  const [maxPrice, setMaxPrice] = useState(500);
  const [tempPrice, setTempPrice] = useState(500);
  const [sortBy, setSortBy] = useState('latest');
  const [inStockOnly, setInStockOnly] = useState(false);

  const [selectedExtraFilters, setSelectedExtraFilters] = useState({});
  const [tempExtraFilters, setTempExtraFilters] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [viewMode, setViewMode] = useState('grid');
  const [categoriesList, setCategoriesList] = useState([]);
  const [liveProducts, setLiveProducts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingProducts(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (activeCategory && activeCategory !== 'all') params.set('category', activeCategory);
        params.set('limit', '20');
        params.set('page', '1');
        const productUrl = `/products${params.toString() ? '?' + params.toString() : ''}`;
        console.log('🔄 جاري جلب:', productUrl);

        const [productsRes, categoriesRes] = await Promise.all([
          API.get(productUrl).catch(() => null),
          API.get('/categories').catch(() => null),
        ]);

        if (productsRes?.data?.data) {
          const p = productsRes.data.data;
          const products = Array.isArray(p) ? p : (p.products || p || []);
          console.log('✅ تم تحميل:', products.length, 'منتج');
          setLiveProducts(products);
        } else {
          console.error('❌ لا توجد بيانات:', productsRes?.data);
          setLiveProducts([]);
        }
        if (categoriesRes?.data?.data) {
          setCategoriesList(Array.isArray(categoriesRes.data.data) ? categoriesRes.data.data : []);
        }
      } catch (e) {
        console.error('❌ خطأ:', e.message);
        setLiveProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchData(); // eslint-disable-next-line react-hooks/exhaustive-deps
    setSelectedExtraFilters({});
    setTempExtraFilters({});
    setMaxPrice(500);
    setTempPrice(500);
    setInStockOnly(false);
    setSortBy('latest');
    setIsFilterOpen(false);
  }, [activeCategory, searchQuery]);


  const getActiveCategoryName = () => {
    if (activeCategory === 'all') return 'الكل';
    const found = categoriesList.find(cat => cat._id === activeCategory);
    return found ? found.name : 'قسم مخصص';
  };
const getFilteredAndSortedProducts = () => {
    console.log('🔍 تطبيق الفلاتر:', { maxPrice, inStockOnly, selectedExtraFilters });
    console.log('📦 عدد المنتجات الأصلي:', liveProducts.length);

    let result = liveProducts.filter(product => {
      const catId = product.category?._id || product.category;
      const matchCategory = activeCategory === 'all' || catId === activeCategory;

      const matchPrice = product.price <= (maxPrice * 100);
      const matchStock = !inStockOnly || (product.stockQuantity && product.stockQuantity > 0);

      return matchCategory && matchPrice && matchStock;
    });

    console.log('✅ بعد الفلتر الأساسي:', result.length, 'منتج');

    if (selectedExtraFilters && typeof selectedExtraFilters === 'object' && Object.keys(selectedExtraFilters).length > 0) {
      console.log('🎯 تطبيق فلاتر الخصائص:', selectedExtraFilters);

      Object.keys(selectedExtraFilters).forEach((attrName) => {
        const allowedValues = selectedExtraFilters[attrName] || [];

        if (Array.isArray(allowedValues) && allowedValues.length > 0) {
          const beforeFilter = result.length;
          result = result.filter((product) => {
            const productAttrVal = product.attributes?.[attrName];

            if (productAttrVal === undefined || productAttrVal === null) {
              console.log(`⚠️ المنتج ${product.name} لا يحتوي على الخاصية ${attrName}`);
              return false;
            }

            const productValuesArray = Array.isArray(productAttrVal) ? productAttrVal : [productAttrVal];
            const normalizedAllowedValues = allowedValues.map(v => v.toString().trim().toLowerCase());
            const normalizedProductValues = productValuesArray.map(v => v.toString().trim().toLowerCase());

            return normalizedProductValues.some(val => normalizedAllowedValues.includes(val));
          });
          console.log(`✅ فلتر ${attrName}: ${beforeFilter} → ${result.length} منتجات`);
        }
      });
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  };
  const processedProducts = getFilteredAndSortedProducts();
  const totalFilteredCount = processedProducts.length;

  const handleApplyFilters = () => {
    setMaxPrice(tempPrice);
    setSelectedExtraFilters(tempExtraFilters); 
    setIsFilterOpen(false);
  };

  return (
    <div className="products-content-layout" dir="rtl">
      
      {/* استخدام الـ Portal في الجوال */}
      {isFilterOpen && typeof window !== 'undefined' && createPortal(
        <>
          <div 
            className="mobile-overlay"
            onClick={() => setIsFilterOpen(false)} 
          />
          
          <aside className={`sidebar-wrapper open`}>
            <div className="flex lg:hidden justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <span className="font-bold text-gray-800 text-sm">خيارات التصفية</span>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <FiltersSidebar 
              activeCategory={activeCategory} 
              maxPrice={tempPrice} 
              setMaxPrice={setTempPrice}
              sortBy={sortBy}
              setSortBy={setSortBy}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              selectedExtraFilters={tempExtraFilters}
              setSelectedExtraFilters={setTempExtraFilters}
              onApply={handleApplyFilters} 
            />
          </aside>
        </>,
        document.body
      )}

      <div className="lg:hidden mb-4 flex justify-end">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 bg-[#2a6c2d] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#1f4d1f] transition-all"
        >
          <Filter size={16} />
          تصفية المنتجات
        </button>
      </div>

      <ProductsToolbar
        activeCategoryName={getActiveCategoryName()}
        totalProducts={totalFilteredCount}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      <div className="products-main-grid">
        <aside className="sidebar-wrapper hidden lg:block">
          <FiltersSidebar 
            activeCategory={activeCategory} 
            maxPrice={tempPrice} 
            setMaxPrice={setTempPrice}
            sortBy={sortBy}
            setSortBy={setSortBy}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            selectedExtraFilters={tempExtraFilters}
            setSelectedExtraFilters={setTempExtraFilters}
            onApply={handleApplyFilters} 
          />
        </aside>

        <main className="grid-and-toolbar-wrapper">
          {loadingProducts ? (
            <div className="w-full py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2a6c2d] mb-4"></div>
              <p className="text-gray-600 font-semibold">جاري تحميل المنتجات...</p>
            </div>
          ) : (
            <ProductsGrid
              products={processedProducts}
              activeCategory={activeCategory}
              maxPrice={maxPrice}
              onAddToCart={onAddToCart}
              viewMode={viewMode}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsContent;