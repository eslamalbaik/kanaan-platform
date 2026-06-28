import React, { useState, useEffect } from 'react';
import ProductCard from '../../molecules/ProductCard/ProductCard';
import ProductListItem from '../../molecules/ProductListItem/ProductListItem';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useCart } from '../../../context/CartContext';

const ProductsGrid = ({ products = [], activeCategory, maxPrice, onAddToCart, viewMode = 'grid' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const { addToCart } = useCart();
  const handleAddToCartAction = (product) => {
    if (onAddToCart) onAddToCart(product);
    else addToCart(product);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, maxPrice, products.length]);

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div className="w-full flex flex-col gap-8" style={{ minHeight: '300px' }}>

      {currentProducts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 max-sm:gap-3 w-full px-4 max-sm:px-2">
            {currentProducts.map(item => (
              <div key={item._id} className="w-full">
                <ProductCard product={item} onAddToCart={handleAddToCartAction} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full px-4 max-sm:px-2">
            {currentProducts.map(item => (
              <ProductListItem key={item._id} product={item} onAddToCart={handleAddToCartAction} />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm w-full text-center">
          <p className="text-base font-bold mb-1">عذراً، لا توجد منتجات متوفرة حالياً ضمن هذه الخيارات</p>
          <p className="text-xs">جرّبي تعديل خيارات الفلترة لرؤية المزيد من المنتجات التراثية!</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4" dir="rtl">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all ${currentPage === 1 ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all border ${currentPage === page ? 'bg-[#2a6c2d] text-white border-[#2a6c2d] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all ${currentPage === totalPages ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;
