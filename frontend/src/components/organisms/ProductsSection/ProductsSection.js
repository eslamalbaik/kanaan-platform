import React, { useState, useEffect } from 'react';
import ProductCard from '../../molecules/ProductCard/ProductCard';
import Button from '../../atoms/Button/Button';
import { Package } from "lucide-react";
import { useCart } from '../../../context/CartContext';
import { getIconComponent } from '../../../utils/iconHelper';
import API from '../../../api/api';
import './ProductsSection.css';

export default function ProductsSection({ onAddToCart }) {
  const [active, setActive] = useState("all");
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", label: "الكل", icon: <Package size={20} /> }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          API.get('/products').catch(() => null),
          API.get('/categories').catch(() => null),
        ]);

        if (productsRes?.data?.data) {
          const p = productsRes.data.data;
          setProducts(Array.isArray(p) ? p : (p.products || []));
        }

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
        console.error('خطأ في جلب البيانات:', e);
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
          {latestEight.length > 0 ? (
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

        {hasMore && (
          <div className="w-full flex justify-center mt-8">
            <button
              onClick={() => window.location.href = `/products?category=${active}`}
              className="px-6 py-2.5 border border-[#2d6a2d] text-[#2d6a2d] font-bold rounded-xl hover:bg-[#2d6a2d] hover:text-white transition-all text-sm shadow-sm"
            >
              عرض كافة المنتجات في هذا القسم
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
