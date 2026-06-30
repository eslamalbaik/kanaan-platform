import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../api/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const loadCart = async () => {
    if (!user || user.role === 'admin') return;
    setIsLoading(true);
    try {
      const data = await cartService.getCart();
      setCartItems(data.items || []);
    } catch {
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      return;
    }
    loadCart();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const addToCart = async (product) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً', {
        style: { fontFamily: 'inherit', direction: 'rtl' }
      });
      return;
    }
    if (user.role === 'admin') {
      toast.error('المسؤولون لا يمكنهم الإضافة للسلة', {
        style: { fontFamily: 'inherit', direction: 'rtl' }
      });
      return;
    }
    try {
      // selectedAttributes = اختيارات المستخدم فقط (مش كل قيم المنتج)
      const data = await cartService.addToCart(product._id, product.quantity || 1, product.selectedAttributes || null, product.customizationId || null);
      setCartItems(data.items || []);
      toast.success(`تمت إضافة "${product.name}" إلى السلة`, {
        duration: 2500,
        style: {
          fontFamily: 'inherit', direction: 'rtl',
          background: '#fff', color: '#1a3a1a',
          border: '1px solid #d1fae5', borderRadius: '12px',
        },
        iconTheme: { primary: '#2a6c2d', secondary: '#fff' },
      });
      setIsCartOpen(true);
    } catch (error) {
      console.error("خطأ أثناء الإضافة للسلة:", error);
      toast.error(error?.response?.data?.message || 'فشل إضافة المنتج للسلة', {
        style: { fontFamily: 'inherit', direction: 'rtl' }
      });
    }
  };

  const updateQuantity = async (itemId, change, currentQty) => {
    try {
      const newQty = currentQty + change;
      if (newQty < 1) return;
      const data = await cartService.updateQuantity(itemId, newQty);
      setCartItems(data.items || []);
    } catch (error) {
      console.error("خطأ أثناء تحديث الكمية:", error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const data = await cartService.removeFromCart(itemId);
      setCartItems(data.items || []);
    } catch (error) {
      console.error("خطأ أثناء إزالة المنتج:", error);
    }
  };

  const restoreItem = async (item) => {
    try {
      // هيكل السلة: item.product._id هو المعرف الحقيقي للمنتج
      const productId = item.product?._id || item._id;
      const data = await cartService.addToCart(productId, item.quantity || 1, item.selectedAttributes || null, item.customizationId || null);
      setCartItems(data.items || []);
    } catch (error) {
      console.error("خطأ أثناء استعادة المنتج:", error);
    }
  };

  const clearCart = () => setCartItems([]);

  const clearCartApi = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
    } catch (error) {
      console.error("خطأ أثناء إفراغ السلة:", error);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, isLoading, isCartOpen, openCart, closeCart, addToCart, updateQuantity, removeItem, restoreItem, clearCart, clearCartApi }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
