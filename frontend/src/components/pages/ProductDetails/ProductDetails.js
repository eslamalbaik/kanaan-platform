import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, Heart, Sparkles, Palette } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFavorite } from '../../../context/FavoriteContext';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import ProductCard from '../../molecules/ProductCard/ProductCard';
import { productService } from '../../../api/productService';
import ColorCustomizer from '../../molecules/ColorCustomizer/ColorCustomizer';

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isFavorite, toggleFavorite } = useFavorite();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const sliderRef = useRef(null);

  const [showColorCustomizer, setShowColorCustomizer] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]); 
  const [selectedAttributes, setSelectedAttributes] = useState({});

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const { product: foundProduct, relatedProducts: related } = await productService.getProductById(productId);
        
        if (foundProduct) {
          setProduct(foundProduct);
          setRelatedProducts(related);
          
          if (foundProduct.images && foundProduct.images.length > 0) {
            setActiveImage(foundProduct.images[0]);
          } else if (foundProduct.image) {
            setActiveImage(foundProduct.image);
          } else {
            setActiveImage('/assets/placeholder.png'); 
          }
          
          const productSizes = foundProduct.sizes || foundProduct.attributes?.sizes || foundProduct.attributes?.size || [];
          if (productSizes && productSizes.length > 0) {
            const parsedSizes = typeof productSizes === 'string' 
              ? productSizes.split(',').map(s => s.trim()) 
              : productSizes;
            setSelectedSize(parsedSizes[0]);
          } else {
            setSelectedSize('');
          }

          const initialAttrs = {};
          if (foundProduct.attributes) {
            Object.entries(foundProduct.attributes).forEach(([key, value]) => {
              if (['sizes', 'size', 'isCustomizable', 'customizable'].includes(key)) return;
              
              let options = [];
              if (Array.isArray(value)) {
                options = value;
              } else if (typeof value === 'string' && value.includes(',')) {
                options = value.split(',').map(s => s.trim());
              }
              
              if (options.length > 0) {
                initialAttrs[key] = options[0];
              }
            });
          }
          setSelectedAttributes(initialAttrs);
          setQuantity(1);
          
        } else {
          setProduct(null);
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error("Error loading product details via productService:", error);
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, location.pathname]);

  const handleIncrement = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleSelectAttribute = (attrKey, optionValue) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attrKey]: optionValue
    }));
  };

  const handleAddToCartSubmit = () => {
    if (!product || product.stockQuantity === 0) return;
    if (!user) { navigate('/login', { state: { from: location.pathname } }); return; }

    // دمج الـ selectedSize ضمن selectedAttributes إذا وجد
    const finalAttributes = { ...selectedAttributes };
    if (selectedSize) finalAttributes['size'] = selectedSize;

    addToCart({
      _id: product._id,
      name: product.name,
      quantity,
      selectedAttributes: Object.keys(finalAttributes).length > 0 ? finalAttributes : null,
    });
  };

  const handleViewRelatedProduct = (relatedItem) => {
    navigate(`/product/${relatedItem._id || relatedItem.id}`);
  };

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const scrollAmount = 320; 

      if (direction === 'left') {
        container.scrollTo({
          left: container.scrollLeft - scrollAmount,
          behavior: 'smooth'
        });
      } else {
        container.scrollTo({
          left: container.scrollLeft + scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfcf9]" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2a6c2a]"></div>
        <p className="mt-4 text-[#2a6c2a] font-medium font-sans">جاري تحميل تفاصيل المنتج التراثي...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfcf9] text-center px-4" dir="rtl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 font-sans">عذراً، المنتج غير موجود!</h2>
        <p className="text-gray-600 mb-6 font-sans">قد يكون المنتج غير متوفر حالياً أو تم حذفه من قبل الإدارة.</p>
        <button 
          onClick={() => navigate('/products')} 
          className="bg-[#2a6c2a] hover:bg-[#1f521f] text-white px-6 py-2 rounded-xl transition duration-200 font-sans shadow-md"
        >
          العودة لصفحة المنتجات
        </button>
      </div>
    );
  }

  const displayPrice = (product.price / 100).toFixed(2);
  
  const availableSizes = product.sizes || product.attributes?.sizes || product.attributes?.size || [];
  const parsedSizesArray = typeof availableSizes === 'string' 
    ? availableSizes.split(',').map(s => s.trim()) 
    : availableSizes;

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans flex flex-col justify-between" dir="rtl">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 flex-grow w-full mt-[120px]">
        <div className="bg-white rounded-[20px] shadow-sm border border-[#f8faf7] p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            
            {/* الطرف الأيمن: صورة المنتج */}
            <div className="flex flex-col space-y-4">
              <div className="w-full aspect-square bg-[#f8faf7] rounded-[16px] overflow-hidden shadow-sm relative border border-gray-100">
                <img 
                  src={activeImage} 
                  alt={product.name || product.title} 
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
              </div>

              {/* معرض الصور المصغرة */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`aspect-square rounded-xl overflow-hidden bg-[#f8faf7] border-2 transition-all ${
                        activeImage === imgUrl ? 'border-[#2a6c2a] opacity-100 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`مصغرة ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* الطرف الأيسر: التفاصيل والخصائص */}
            <div className="flex flex-col justify-between py-2">
              <div className="space-y-6">
                
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#f8faf7] text-[#2a6c2a] text-xs font-medium px-2.5 py-1 rounded-md border border-[#eee/10]">🏷️ {product.category?.name || "منتج فلسطيني"}</span>
                  <span className="bg-[#fdfcf9] text-amber-700 text-xs font-medium px-2.5 py-1 rounded-md border border-amber-100">✨ جودة عالية</span>
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {product.name || product.title}
                  </h1>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-black text-[#2a6c2a]">
                      {displayPrice} <span className="text-lg font-normal text-gray-500">₪</span>
                    </div>
                    {/* زر المفضلة */}
                    <button
                      onClick={() => {
                        if (!user || user.role === 'admin') { navigate('/login'); return; }
                        toggleFavorite(product);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all"
                      style={isFavorite(product._id)
                        ? { background: '#fff1f1', borderColor: '#fca5a5', color: '#e53e3e' }
                        : { background: '#f9fafb', borderColor: '#e5e7eb', color: '#6b7280' }
                      }
                    >
                      <Heart size={14} fill={isFavorite(product._id) ? '#e53e3e' : 'none'} />
                      {isFavorite(product._id) ? 'في المفضلة' : 'أضف للمفضلة'}
                    </button>
                  </div>

                  <div>
                    {product.stockQuantity > 10 ? (
                      <span className="text-xs font-medium bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">● متوفر في المخزون</span>
                    ) : product.stockQuantity > 0 ? (
                      <span className="text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">⚠️ كمية محدودة ({product.stockQuantity})</span>
                    ) : (
                      <span className="text-xs font-medium bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200">✕ نفذت الكمية</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-800">وصف المنتج:</h3>
                  <p className="mt-2 text-sm md:text-base text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* ك خيارات الخصائص الديناميكية */}
                {product.attributes && Object.keys(product.attributes).length > 0 && (
                  <div className="space-y-4 pt-2">
                    {Object.entries(product.attributes).map(([key, value]) => {
                      if (['sizes', 'size', 'isCustomizable', 'customizable'].includes(key)) return null;
                      
                      let options = [];
                      if (Array.isArray(value)) {
                        options = value;
                      } else if (typeof value === 'string' && value.includes(',')) {
                        options = value.split(',').map(s => s.trim());
                      }

                      if (options.length === 0) {
                        if (!String(value).trim()) return null;
                        return (
                          <div key={key} className="text-sm bg-[#f9fcf8] px-4 py-3 rounded-xl border border-[#2a6c2a]/20 flex items-center gap-3 shadow-sm transition-all hover:shadow-md hover:border-[#2a6c2a]/40 w-fit">
                            <span className="text-[#2a6c2a] font-bold">{key}:</span>
                            <span className="font-semibold text-gray-800">{String(value)}</span>
                          </div>
                        );
                      }

                      return (
                        <div key={key} className="space-y-2">
                          <h3 className="text-sm font-bold text-gray-800">اختر {key}:</h3>
                          <div className="flex flex-wrap gap-2">
                            {options.map((option) => {
                              const isSelected = selectedAttributes[key] === option;
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => handleSelectAttribute(key, option)}
                                  className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-150 transform active:scale-95 ${
                                    isSelected
                                      ? 'border-[#2a6c2a] bg-[#2a6c2a] text-white shadow-md'
                                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {parsedSizesArray && parsedSizesArray.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-bold text-gray-800">المقاس المتاح:</h3>
                    <div className="flex gap-2">
                      {parsedSizesArray.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            selectedSize === size
                              ? 'border-[#2a6c2a] bg-[#f8faf7] text-[#2a6c2a] shadow-sm font-bold'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {String(size).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span className="text-sm font-bold text-gray-700">الكمية:</span>
                  
                  <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={product.stockQuantity === 0 || quantity <= 1}
                      className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 font-bold text-gray-800 text-sm min-w-[35px] text-center">
                      {product.stockQuantity === 0 ? 0 : quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={product.stockQuantity === 0 || quantity >= product.stockQuantity}
                      className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCartSubmit}
                  disabled={product.stockQuantity === 0}
                  className={`w-full py-3.5 px-6 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-200 ${
                    product.stockQuantity === 0
                      ? 'bg-gray-300 cursor-not-allowed shadow-none'
                      : 'bg-[#2a6c2a] hover:bg-[#1f521f] hover:shadow-lg transform active:scale-[0.99]'
                  }`}
                >
                  {product.stockQuantity === 0 ? 'نفذت الكمية - لا يمكن الإضافة' : 'أضف إلى سلة المشتريات 🛒'}
                </button>

                {product.isCustomizable && (
                  <button
                    type="button"
                    onClick={() => navigate(`/customize/${product._id}`)}
                    className="w-full py-3.5 px-6 rounded-xl text-sm font-bold border-2 border-[#2a6c2a] text-[#2a6c2a] bg-white hover:bg-[#f0f7f0] flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
                  >
                    <Sparkles size={16} />
                    تخصيص بالذكاء الاصطناعي
                  </button>
                )}

                {/* زر تغيير اللون */}
                <button
                  type="button"
                  onClick={() => setShowColorCustomizer(true)}
                  className="w-full py-3.5 px-6 rounded-xl text-sm font-bold border-2 border-[#b8943f] text-[#b8943f] bg-white hover:bg-[#fffbf0] flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
                >
                  <Palette size={16} />
                  جرّب ألوان مختلفة
                </button>
              </div>

            </div>
          </div>
        </div>

        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#2a6c2a]/40 to-transparent mb-8"></div>

        {relatedProducts.length > 0 && (
          <div className="mt-20 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#f4f8ef] via-[#fbfcf8] to-[#eef5e6] border border-[#d8e5c4] p-8 md:p-10 shadow-xl">   
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#2a6c2a]/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#d4a017]/10 blur-[120px] rounded-full"></div>          
            
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5 relative z-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-[#243018]">
                  منتجات قد تعجبك
                </h2>
                <p className="text-[#2a6c2a] font-medium mt-2">
                  اكتشف منتجات مشابهة تم اختيارها بعناية من نفس المجموعة التراثية
                </p>
              </div>

              <div className="flex items-center gap-4 relative z-20">
                <button 
                  onClick={() => handleScroll('right')}
                  className="w-10 h-10 rounded-2xl bg-[#2a6c2a] text-white shadow-xl hover:bg-[#1f521f] hover:scale-110 transition-all active:scale-95 flex items-center justify-center group"
                  title="السابق"
                >
                  <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1" />
                </button>
                <button 
                  onClick={() => handleScroll('left')}
                  className="w-10 h-10 rounded-2xl bg-[#2a6c2a] text-white shadow-xl hover:bg-[#1f521f] hover:scale-110 transition-all active:scale-95 flex items-center justify-center group"
                  title="التالي"
                >
                  <ArrowLeft className="w-5 h-5 text-white transition-transform group-hover:-translate-x-1" />
                </button>
              </div>
            </div>

            <div 
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto pb-4 pt-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none active:cursor-grabbing relative z-10"
            >
              {relatedProducts.map((item) => (
                <div 
                  key={item._id || item.id} 
                  className="w-[265px] sm:w-[290px] flex-shrink-0 transform hover:-translate-y-2.5 hover:shadow-2xl rounded-2xl transition-all duration-300 ease-out"
                >
                  <ProductCard
                    product={{ ...item, _id: item._id || item.id, name: item.name || item.title }}
                    onAddToCart={addToCart}
                    onViewProduct={handleViewRelatedProduct}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {showColorCustomizer && product && (
        <ColorCustomizer
          productId={product._id}
          imageUrl={activeImage || product.images?.[0]}
          onClose={() => setShowColorCustomizer(false)}
          onApprove={async () => {
            await addToCart({
              _id: product._id,
              name: product.name,
              price: product.price,
              images: product.images,
              quantity: quantity || 1,
              selectedAttributes,
            });
            setShowColorCustomizer(false);
            navigate('/checkout');
          }}
        />
      )}
    </div>
  );
}