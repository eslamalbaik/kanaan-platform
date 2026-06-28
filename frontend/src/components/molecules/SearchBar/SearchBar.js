import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api/api';
import './SearchBar.css';

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await API.get(`/products?search=${encodeURIComponent(query.trim())}`);
        const products = res.data?.data;
        const list = Array.isArray(products) ? products : (products?.products || []);
        setSuggestions(list.slice(0, 6));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (product) => {
    onClose();
    navigate(`/product/${product._id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-container" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="search-input-row">
          <Search size={22} color="#1f4d1f" className="flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="ابحث عن منتجات كنعان الأصيلة..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {loading && <span className="search-spinner" />}
          <button type="button" onClick={onClose} className="icon-btn-close">
            <X size={26} color="#444" />
          </button>
        </form>

        {suggestions.length > 0 && (
          <ul className="search-suggestions">
            {suggestions.map(product => (
              <li key={product._id} className="suggestion-item" onClick={() => handleSelect(product)}>
                <div className="suggestion-img">
                  {product.images?.[0]
                    ? <img src={product.images[0]} alt={product.name} />
                    : <Package size={18} className="text-gray-400" />}
                </div>
                <div className="suggestion-info">
                  <span className="suggestion-name">{product.name}</span>
                  <span className="suggestion-cat">{product.category?.name || ''}</span>
                </div>
                <span className="suggestion-price">{((product.price || 0) / 100).toFixed(2)} ₪</span>
              </li>
            ))}
            <li className="suggestion-view-all" onClick={handleSubmit}>
              عرض كل النتائج لـ "{query}"
            </li>
          </ul>
        )}

        {query.trim() && !loading && suggestions.length === 0 && (
          <div className="search-empty">لا توجد منتجات مطابقة</div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
