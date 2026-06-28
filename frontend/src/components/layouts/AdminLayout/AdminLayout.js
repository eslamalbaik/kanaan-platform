import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '../../atoms/Button/Button';
import './AdminLayout.css';
import {
  LuLayoutDashboard,
  LuBoxes,
  LuShoppingBag,
  LuPackageOpen,
  LuUsers,
  LuLogOut,
  LuMenu,
  LuX,
  LuUserCog,
  LuTag,
  LuBell,
  LuCheck,
} from 'react-icons/lu';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../api/api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // إشعارات الأدمن
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await API.get('/admin/notifications');
      setNotifs(res.data?.data?.notifications || []);
      setUnread(res.data?.data?.unreadCount || 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30000);
    return () => clearInterval(iv);
  }, [fetchNotifs]);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await API.patch('/admin/notifications/read-all');
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {}
  };

  const markOneRead = async (id) => {
    try {
      await API.patch(`/admin/notifications/${id}/read`);
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('kanaan_admin_token');
    localStorage.removeItem('kanaan_admin_refresh_token');
    navigate('/admin/login');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin':           return 'لوحة الإحصائيات العامة';
      case '/admin/categories': return 'إدارة التصنيفات المحلية';
      case '/admin/products':   return 'إدارة قائمة المنتجات';
      case '/admin/orders':     return 'إدارة طلبات الزبائن';
      case '/admin/customers':  return 'قائمة الزبائن المسجلين';
      case '/admin/profile':    return 'الملف الشخصي للمدير';
      case '/admin/coupons':    return 'إدارة كوبونات الخصم';
      default:                  return 'لوحة التحكم';
    }
  };

  return (
    <div className="admin-layout-container" dir="rtl">
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">منصة كنعان</div>
          <button className="admin-sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <LuX size={24} />
          </button>
        </div>

        <nav className="admin-sidebar-menu">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LuLayoutDashboard className="admin-sidebar-icon" size={20} />
            <span className="admin-sidebar-text">الإحصائيات العامة</span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LuBoxes className="admin-sidebar-icon" size={20} />
            <span className="admin-sidebar-text">إدارة التصنيفات</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LuShoppingBag className="admin-sidebar-icon" size={20} />
            <span className="admin-sidebar-text">إدارة المنتجات</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LuPackageOpen className="admin-sidebar-icon" size={20} />
            <span className="admin-sidebar-text">إدارة الطلبات</span>
          </NavLink>

          <NavLink
            to="/admin/customers"
            className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LuUsers className="admin-sidebar-icon" size={20} />
            <span className="admin-sidebar-text">إدارة الزبائن</span>
          </NavLink>

          <NavLink
            to="/admin/coupons"
            className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LuTag className="admin-sidebar-icon" size={20} />
            <span className="admin-sidebar-text">الكوبونات</span>
          </NavLink>

          <NavLink
            to="/admin/profile"
            className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LuUserCog className="admin-sidebar-icon" size={20} />
            <span className="admin-sidebar-text">الملف الشخصي</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Button
            variant="outline"
            onClick={handleLogout}
            icon={LuLogOut}
            className="admin-logout-btn"
          >
            <span className="admin-sidebar-text">تسجيل الخروج</span>
          </Button>
        </div>
      </aside>

      <div className="admin-main-content">
        <header className="admin-header">
          <div className="admin-header-right-block">
            <button className="admin-menu-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
              <LuMenu size={24} />
            </button>
            <div className="admin-header-title">
              <h1>{getPageTitle()}</h1>
            </div>
          </div>

          <div className="admin-header-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

            {/* جرس الإشعارات */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                style={{
                  position: 'relative', background: 'none', border: 'none',
                  cursor: 'pointer', padding: 6, borderRadius: 10,
                  display: 'flex', alignItems: 'center',
                  color: notifOpen ? '#2a6c2d' : '#555',
                }}
                title="الإشعارات"
              >
                <LuBell size={20} />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    minWidth: 17, height: 17, padding: '0 3px',
                    background: '#dc2626', color: '#fff',
                    borderRadius: 999, fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #fff',
                  }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div style={{
                  position: 'absolute', left: 0, top: 'calc(100% + 8px)',
                  width: 340, maxHeight: 420, overflowY: 'auto',
                  background: '#fff', border: '1px solid #e5e7eb',
                  borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  zIndex: 9999,
                }} dir="rtl">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1a3a1a' }}>الإشعارات</span>
                    {unread > 0 && (
                      <button onClick={markAllRead} style={{ fontSize: 11, color: '#2a6c2d', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <LuCheck size={12} /> قراءة الكل
                      </button>
                    )}
                  </div>

                  {notifs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>لا توجد إشعارات</div>
                  ) : (
                    notifs.map(n => (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && markOneRead(n._id)}
                        style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid #f9f9f9',
                          background: n.isRead ? '#fff' : '#f0fdf4',
                          cursor: n.isRead ? 'default' : 'pointer',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                            background: n.isRead ? '#d1d5db' : '#2a6c2d',
                          }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: '#1a3a1a' }}>{n.title}</p>
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{n.message}</p>
                            <p style={{ margin: '4px 0 0', fontSize: 10, color: '#9ca3af' }}>
                              {new Date(n.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <NavLink
              to="/admin/profile"
              className="admin-user-profile-trigger"
              style={{ textDecoration: 'none', gap: 8, cursor: 'pointer' }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#2a6c2d', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 11, flexShrink: 0,
              }}>
                {user?.name?.charAt(0) || 'م'}
              </div>
              <span className="admin-name">{user?.name || 'مدير النظام'}</span>
            </NavLink>
          </div>
        </header>

        <main className="admin-page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
