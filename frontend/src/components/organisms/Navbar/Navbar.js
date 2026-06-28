import { useState, useEffect, useCallback } from "react";
import { User, Menu, X, Bell } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CartIcon from "../../molecules/CartIcon/CartIcon";
import Button from "../../atoms/Button/Button";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import API from "../../../api/api";
import "./Navbar.css";

export default function Navbar() {
  const { isLoggedIn, user } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const totalItemsCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const fetchUnread = useCallback(async () => {
    if (!isLoggedIn || user?.role === 'admin') return;
    try {
      const res = await API.get('/notifications?unreadOnly=true');
      setNotifCount(res.data?.data?.unreadCount || 0);
    } catch {}
  }, [isLoggedIn, user?.role]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: "الرئيسية", path: "/" },
    { label: "منتجات", path: "/products" },
    { label: "مساعدك الذكي", path: "/c" },
    { label: "من نحن", path: "/about" },
    { label: "تواصل معنا", path: "/contact" },
  ];

  return (
    <header
      dir="rtl"
      className={`navbar-header ${scrolled ? 'scrolled' : 'not-scrolled'}`}
    >
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="../assets/logo.png" alt="لوغو كنعان" className="logo-img" />
        </Link>

        {/* روابط الديسكتوب */}
        <nav className="desktop-nav hide-mobile">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="nav-link"
                style={{ color: isActive ? "#2d6a2d" : "#444" }}
              >
                {link.label}
                <span
                  className="link-underline"
                  style={{ width: isActive ? "100%" : "0%" }}
                />
              </Link>
            );
          })}
        </nav>

        {/* صف الأيقونات */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* أيقونة الإشعارات - للعملاء فقط */}
          {isLoggedIn && user?.role !== 'admin' && (
            <Link
              to="/profile"
              state={{ tab: 'notifications' }}
              className="icon-btn-nav hide-mobile"
              title="الإشعارات"
              style={{ position: 'relative' }}
            >
              <Bell size={19} color="#1f4d1f" />
              {notifCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-6px',
                  minWidth: '17px', height: '17px', padding: '0 3px',
                  background: '#dc2626', color: '#fff',
                  borderRadius: '999px', fontSize: '10px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff', lineHeight: 1,
                }}>
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </Link>
          )}

          {/* أيقونة السلة */}
          <Link to="/cart">
            <CartIcon count={totalItemsCount} />
          </Link>

          {/* أزرار الحساب */}
          {isLoggedIn ? (
            <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {user?.role !== 'admin' && (
                <Link to="/profile" className="icon-btn-nav" title={user?.name}>
                  <User size={19} color="#1f4d1f" />
                </Link>
              )}
            </div>
          ) : (
            <div className="auth-actions hide-mobile" style={{ display: "flex", gap: "10px" }}>
              <Link to="/login" className="login-btn-nav"><Button variant="outline">تسجيل دخول</Button></Link>
              <Link to="/signup" className="signup-btn-nav"><Button variant="primary">إنشاء حساب</Button></Link>
            </div>
          )}

          {/* زر المنيو للموبايل */}
          <button
            className="icon-btn-nav show-mobile"
            style={{ color: "#1f4d1f" }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* شريط البحث الدائم */}
      <div className="navbar-search-strip">
        <form onSubmit={handleSearch} className="navbar-search-form">
          <svg className="navbar-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منتجات كنعان..."
            className="navbar-search-input"
            dir="rtl"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="navbar-search-clear">
              <X size={14} color="#9ca3af" />
            </button>
          )}
        </form>
      </div>

      {/* موبايل منيو */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link key={link.path} to={link.path} className="mobile-link">
            {link.label}
          </Link>
        ))}
        {isLoggedIn && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "15px", borderTop: "1px solid #eee" }}>
            {user?.role !== 'admin' && (
              <Link to="/profile" style={{ width: "100%" }}>
                <Button variant="outline" className="sidebar-btn">حسابي</Button>
              </Link>
            )}
          </div>
        )}
      </div>
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}
