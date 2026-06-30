import React, { useState, useEffect } from 'react';
import ProductCard from '../../molecules/ProductCard/ProductCard';
import Button from '../../atoms/Button/Button';
import { Package } from "lucide-react";
import { useCart } from '../../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { getIconComponent } from '../../../utils/iconHelper';
import API from '../../../api/api';
import './ProductsSection.css';

export default function ProductsSection({ onAddToCart }) {
  const [active, setActive] = useState("all");
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", label: "الكل", icon: <Package size={20} /> }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔄 جاري تحميل أول 5 منتجات...');
        const productsRes = await API.get('/products', { params: { limit: 5, page: 1 } });
        console.log('✅ استجابة المنتجات:', productsRes);

        if (productsRes?.data?.data) {
          const data = productsRes.data.data;
          const productsList = Array.isArray(data) ? data : (data.products || data || []);
          console.log('✅ تم تحميل:', productsList.length, 'منتج');

          if (productsList.length > 0) {
            setProducts(productsList);
            setPage(1);
            setTotalPages(data.pagination?.totalPages || 1);
          } else {
            setError('لم يتم العثور على منتجات');
            setProducts([]);
          }
        } else {
          console.error('❌ لا توجد بيانات منتجات:', productsRes?.data);
          setError('فشل تحميل المنتجات');
          setProducts([]);
        }

        // تحميل الفئات
        const categoriesRes = await API.get('/categories').catch(() => null);
        if (categoriesRes?.data?.data) {
          const cats = Array.isArray(categoriesRes.data.data) ? categoriesRes.data.data : [];
          setCategories([
            { id: "all", label: "الكل", icon: <Package size={20} /> },
            ...cats.map(cat => {
              const IconComponent = getIconComponent(cat.icon || 'Package');
              return { id: cat._id, label: cat.name, icon: <IconComponent size={20} /> };
            })
          ]);
        }
      } catch (e) {
        console.error('❌ خطأ:', e.message);
        setError(`خطأ: ${e.message}`);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCartAction = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product);
    }
  };

  const handleLoadMore = async () => {
    if (page >= totalPages || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const productsRes = await API.get('/products', { params: { limit: 5, page: nextPage } });

      if (productsRes?.data?.data) {
        const data = productsRes.data.data;
        const productsList = Array.isArray(data) ? data : (data.products || []);
        setProducts(prev => [...prev, ...productsList]);
        setPage(nextPage);
      }
    } catch (e) {
      console.error('خطأ في تحميل المزيد:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const filtered = active === "all"
    ? products
    : products.filter((p) => {
        const categoryId = typeof p.category === 'object' ? p.category?._id : p.category;
        return categoryId === active;
      });

  const latestEight = filtered.slice(0, 8);
  const hasMore = filtered.length > 8;

  return (
    <section className="products-section" id="products" dir="rtl">
      <div className="products-container">

        <header className="section-header">
          <h2>كل منتج حكاية... اكتشف جمال المنتجات الفلسطينية</h2>
        </header>

        <nav className="filter-nav">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={active === cat.id ? 'primary' : 'outline'}
              onClick={() => setActive(cat.id)}
            >
              <div className="btn-content-flex">
                {cat.icon}
                <span>{cat.label}</span>
              </div>
            </Button>
          ))}
        </nav>

        <div className="w-full px-4 max-sm:px-2">
          {loading ? (
            <div className="w-full py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2a6c2d] mb-4"></div>
              <p className="text-gray-600 font-semibold">جاري تحميل المنتجات...</p>
            </div>
          ) : error ? (
            <div className="no-products-message">
              <p className="text-base font-bold mb-1 text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-[#2a6c2d] text-white rounded-lg text-sm"
              >
                إعادة تحميل
              </button>
            </div>
          ) : latestEight.length > 0 ? (
            <div className="products-grid-layout">
              {latestEight.map((item) => (
                <div key={item._id} className="w-full flex justify-center">
                  <ProductCard
                    product={item}
                    onAddToCart={handleAddToCartAction}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products-message">
              <p className="text-base font-bold mb-1">عذراً، لا توجد منتجات متوفرة حالياً في هذا القسم</p>
              <p className="text-xs">سيقوم الأدمن بإضافة منتجات تراثية جديدة قريباً!</p>
            </div>
          )}
        </div>

        {page < totalPages && (
          <div className="w-full flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className={`px-6 py-2.5 border border-[#2d6a2d] text-[#2d6a2d] font-bold rounded-xl transition-all text-sm shadow-sm ${
                loadingMore
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#2d6a2d] hover:text-white'
              }`}
            >
              {loadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
            </button>
          </div>
        )}

        {hasMore && (
          <div className="w-full flex justify-center mt-4">
            <button
              onClick={() => navigate(`/products?category=${active}`)}
              className="px-6 py-2.5 border border-[#2d6a2d] text-[#2d6a2d] font-bold rounded-xl hover:bg-[#2d6a2d] hover:text-white transition-all text-sm shadow-sm"
            >
              عرض جميع المنتجات
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
