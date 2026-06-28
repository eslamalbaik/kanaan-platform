import React, { useState, useEffect } from "react";
import {
  User, Calendar,
  ChevronRight, Heart, Edit3, LayoutGrid,
  DollarSign, ListOrdered, Home, Plus,
  Package, Map, ArrowRight, Bell, BellOff, CheckCheck,
  Eye, EyeOff, ShoppingCart
} from "lucide-react";
import { useFavorite } from "../../../context/FavoriteContext";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";
import { validateUpdateProfile, validateUpdatePassword } from "../../../validations/authValidation";
import ConfirmationModal from "../../molecules/ConfirmationModal/ConfirmationModal";
import { useAuth } from "../../../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import API from "../../../api/api";

export default function UserProfile() {
  const { user: authUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorite();

  const [activeTab, setActiveTab] = useState(location.state?.tab || "info");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [toastMessage, setToastMessage] = useState("");

  const showCanaanToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const statusTranslations = {
    pending: "قيد الانتظار",
    processing: "قيد التحضير",
    shipped: "قيد الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغي",
  };

  const [user, setUser] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    memberSince: authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' }) : "",
    stats: { totalOrders: 0, totalSpentILS: 0, favoritesCount: 0 }
  });

  const [nameState, setNameState] = useState(user.name);
  const [phoneState, setPhoneState] = useState(user.phone);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [addressState, setAddressState] = useState(authUser?.address || "");
  const [savingAddress, setSavingAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingOrders(true);
        const [profileRes, ordersRes, notifRes] = await Promise.all([
          API.get('/users/me').catch(() => null),
          API.get('/orders').catch(() => null),
          API.get('/notifications').catch(() => null),
        ]);

        let profileData = null;
        if (profileRes?.data?.data) {
          profileData = profileRes.data.data;
          setNameState(profileData.name || "");
          setPhoneState(profileData.phone ? profileData.phone.replace('+970', '0') : "");
          setAddressState(profileData.address || "");
        }

        const ordersList = (() => {
          const o = ordersRes?.data?.data;
          if (!o) return [];
          return Array.isArray(o) ? o : o.orders || [];
        })();

        setOrders(ordersList);

        setUser(prev => ({
          ...prev,
          ...(profileData ? {
            name: profileData.name || prev.name,
            email: profileData.email || prev.email,
            phone: profileData.phone || prev.phone,
            address: profileData.address || prev.address,
            memberSince: profileData.createdAt
              ? new Date(profileData.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })
              : prev.memberSince,
          } : {}),
          stats: {
            totalOrders: ordersList.length,
            totalSpentILS: ordersList.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0) / 100,
            favoritesCount: favorites.length,
          },
        }));

        if (notifRes?.data?.data) {
          setNotifications(notifRes.data.data.notifications || []);
          setUnreadCount(notifRes.data.data.unreadCount || 0);
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authUser || authUser.role === 'admin') return <Navigate to="/" replace />;

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const trimmed = addressState.trim();
    if (!trimmed || trimmed.length < 3) {
      showCanaanToast("يرجى إدخال عنوان صحيح (3 أحرف على الأقل)");
      return;
    }
    setSavingAddress(true);
    try {
      // نرسل name أيضاً لأن الـ backend يتطلب anyOf: [name, phone, address]
      await API.put('/users/me', { name: user.name, address: trimmed });
      setUser(prev => ({ ...prev, address: trimmed }));
      setAddressState(trimmed);
      setShowAddressForm(false);
      setIsAddingNew(false);
      showCanaanToast("تم حفظ العنوان بنجاح!");
    } catch (err) {
      showCanaanToast(err.response?.data?.message || "حدث خطأ أثناء حفظ العنوان");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await API.patch(`/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("خطأ في تحديث الإشعار:", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("خطأ في تحديث الإشعارات:", e);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    setLoadingOrderDetail(true);
    try {
      const res = await API.get(`/orders/${orderId}`);
      setSelectedOrder(res.data.data);
    } catch (e) {
      console.error("خطأ في جلب تفاصيل الطلب:", e);
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  const handleUpdateProfileSubmit = (e) => {
    e.preventDefault();
    setProfileErrors({}); 

    // فحص صحة البيانات من خلال ملف التحقق
    const validationErrors = validateUpdateProfile({ name: nameState, phone: phoneState });
    if (Object.keys(validationErrors).length > 0) {
      setProfileErrors(validationErrors);
      return;
    }

    if (nameState.trim() === user.name && phoneState.trim() === user.phone) {
      showCanaanToast("لم تقم بإجراء أي تغييرات على البيانات الحالية!");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSaveProfile = async () => {
    setShowConfirmModal(false);
    try {
      setSavingProfile(true);
      const rawPhone = phoneState.trim();
      const formattedPhone = rawPhone.startsWith('+970')
        ? rawPhone
        : '+970' + rawPhone.replace(/^0/, '');
      await API.put('/users/me', { name: nameState, phone: formattedPhone });
      setUser(prev => ({ ...prev, name: nameState, phone: formattedPhone }));
      showCanaanToast("تم تعديل البيانات الشخصية بنجاح!");
    } catch (error) {
      showCanaanToast(error.response?.data?.message || "عذراً، حدث خطأ أثناء التحديث");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordErrors({});

    const validationErrors = validateUpdatePassword({ currentPassword, newPassword, confirmPassword });
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    try {
      setSavingPassword(true);
      await API.put('/users/change-password', { currentPassword, newPassword, confirmPassword });
      showCanaanToast("تم تغيير كلمة المرور بنجاح!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showCanaanToast(error.response?.data?.message || "خطأ في تغيير كلمة المرور");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="canaan-dashboard-wrapper">
      <div className="pt-[130px]">
        <main className="dashboard-grid-canaan">
        
          {/*  العمود الأيمن الثابت: القائمة الجانبية */}
          <aside className="profile-sidebar-canaan">
            <div className="user-profile-card">
              <div className="user-avatar-large-fallback">
                {user.name ? user.name.charAt(0) : <User />}
              </div>
              <h3>{user.name}</h3>
              <p className="user-email">{user.email}</p>
              <button className="edit-account-btn" onClick={() => setActiveTab("settings")}>
                <Edit3 size={13} /> تعديل الحساب
              </button>
            </div>
            
            <ul className="sidebar-menu-canaan">
              <li className={activeTab === "info" ? "active" : ""} onClick={() => setActiveTab("info")}>
                <User size={15} /> معلوماتي
              </li>
              <li className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
                <ListOrdered size={15} /> طلباتي
              </li>
              <li className={activeTab === "addresses" ? "active" : ""} onClick={() => setActiveTab("addresses")}>
                <Map size={15} /> العناوين
              </li>
              <li className={activeTab === "favorites" ? "active" : ""} onClick={() => setActiveTab("favorites")} style={{ position: 'relative' }}>
                <Heart size={15} /> المفضلة
                {favorites.length > 0 && (
                  <span style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: '#e53e3e', color: '#fff', borderRadius: '999px',
                    fontSize: '10px', fontWeight: '700', minWidth: '18px', height: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
                  }}>
                    {favorites.length}
                  </span>
                )}
              </li>
              <li className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")} style={{ position: 'relative' }}>
                <Bell size={15} /> الإشعارات
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: '#dc2626', color: '#fff', borderRadius: '999px',
                    fontSize: '10px', fontWeight: '700', minWidth: '18px', height: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px'
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </li>
              <li className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
                <LayoutGrid size={15} /> الإعدادات
              </li>
              <li className="menu-logout" onClick={logout} style={{ cursor: 'pointer' }}>
                <Plus size={15} style={{ transform: "rotate(45deg)" }} /> تسجيل الخروج
              </li>
            </ul>
          </aside>

          {/*  المنطقة اليسرى العريضة */}
          <section className="dashboard-main-canaan">
            
            {/*  تبويب معلوماتي (Info) */}
            {activeTab === "info" && (
              <div className="tab-content-fade">
                <div className="main-content-header mb-6">
                  <h1 className="greeting-text">مرحباً، {user.name.split(" ")[0]} 👋</h1>
                  <p className="sub-greeting">أهلاً بكِ مجدداً في لوحة تحكم حسابكِ الشخصي على منصة كنعان.</p>
                </div>

                <div className="stats-cards-grid mb-8">
                  <div className="stat-card-canaan">
                    <div className="stat-icon-box"><Calendar size={18} /></div>
                    <div className="stat-info">
                      <span>عضو منذ</span>
                      <p className="stat-value">{user.memberSince}</p>
                    </div>
                  </div>
                  <div className="stat-card-canaan">
                    <div className="stat-icon-box"><Package size={18} /></div>
                    <div className="stat-info">
                      <span>عدد الطلبات</span>
                      <p className="stat-value">{user.stats.totalOrders} <span className="stat-unit">طلب</span></p>
                    </div>
                  </div>
                  <div className="stat-card-canaan">
                    <div className="stat-icon-box"><DollarSign size={18} /></div>
                    <div className="stat-info">
                      <span>مجموع المشتريات</span>
                      <p className="stat-value">{user.stats.totalSpentILS.toFixed(2)} <span className="stat-unit">شيكل</span></p>
                    </div>
                  </div>
                  <div className="stat-card-canaan">
                    <div className="stat-icon-box"><Heart size={18} /></div>
                    <div className="stat-info">
                      <span>المفضلة</span>
                      <p className="stat-value">{user.stats.favoritesCount} <span className="stat-unit">عناصر</span></p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-section-canaan">
                  <div className="section-header-canaan">
                    <h2>البيانات الشخصية المسجلة</h2>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-gray-100 flex flex-col gap-3 text-sm text-gray-600">
                    <p><strong>الاسم بالكامل:</strong> {user.name}</p>
                    <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
                    <p><strong>رقم الهاتف:</strong> {user.phone}</p>
                  </div>
                </div>
              </div>
            )}

            {/*  تبويب الطلبات (Orders) */}
            {activeTab === "orders" && (
              <div className="dashboard-section-canaan tab-content-fade">
                {selectedOrder ? (
                  /* ── عرض تفاصيل طلب واحد ── */
                  <div>
                    <div className="section-header-canaan" style={{ marginBottom: '16px' }}>
                      <div>
                        <h2>تفاصيل الطلب #{selectedOrder.orderId || selectedOrder._id?.slice(-6)}</h2>
                        <p className="section-subtitle-canaan">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <ArrowRight size={14} /> العودة للطلبات
                      </button>
                    </div>

                    {/* حالة الطلب */}
                    <div className="flex items-center gap-3 mb-5 p-4 bg-white rounded-xl border border-gray-100">
                      <span className={`status-badge tag-${selectedOrder.status}`}>
                        {statusTranslations[selectedOrder.status] || selectedOrder.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        حالة الدفع: <strong>{selectedOrder.paymentStatus === 'paid' ? 'مدفوع' : selectedOrder.paymentStatus === 'failed' ? 'فشل' : 'في الانتظار'}</strong>
                      </span>
                    </div>

                    {/* بيانات الشحن */}
                    {selectedOrder.shippingAddress && (
                      <div className="p-4 bg-white rounded-xl border border-gray-100 mb-4 text-sm text-gray-600 text-right">
                        <p className="font-bold text-gray-800 mb-2 text-xs">عنوان التوصيل</p>
                        <p>{selectedOrder.shippingAddress.fullName}</p>
                        <p>{selectedOrder.shippingAddress.city} — {selectedOrder.shippingAddress.street}</p>
                        <p>{selectedOrder.shippingAddress.phone}</p>
                      </div>
                    )}

                    {/* منتجات الطلب */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="text-xs font-bold text-gray-700">المنتجات</h3>
                      </div>
                      {(selectedOrder.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-b-0">
                          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Package size={20} className="text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">الكمية: {item.quantity}</p>
                            {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                              </p>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-[#2a6c2d]">{((item.price * item.quantity) / 100).toFixed(2)} ₪</p>
                            <p className="text-xs text-gray-400">{(item.price / 100).toFixed(2)} ₪ / قطعة</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* المجموع */}
                    <div className="p-4 bg-white rounded-xl border border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700">المجموع الكلي</span>
                      <span className="text-lg font-bold text-[#2a6c2d]">{(selectedOrder.totalAmount / 100).toFixed(2)} ₪</span>
                    </div>
                  </div>
                ) : (
                  /* ── قائمة الطلبات ── */
                  <>
                    <div className="section-header-canaan">
                      <div>
                        <h2>سجل الطلبات الشخصية</h2>
                        <p className="section-subtitle-canaan">تتبع حالة طلباتك الحالية وتفاصيل مشترياتك السابقة</p>
                      </div>
                    </div>

                    {loadingOrders ? (
                      <div className="text-center py-8 text-xs font-bold text-gray-400">جاري جلب سجل طلباتك...</div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <Package size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-bold">لا توجد طلبات بعد</p>
                        <p className="text-xs mt-1">ابدأ التسوق لتظهر طلباتك هنا</p>
                      </div>
                    ) : (
                      <div className="orders-list-canaan">
                        {orders.map((order) => (
                          <div key={order._id} className="modern-order-card">
                            <div className="order-main-details">
                              <div className="order-package-icon">
                                <Package size={22} className="text-amber-800" />
                              </div>
                              <div className="order-text-meta">
                                <div className="order-id-date-row">
                                  <span className="modern-order-id">#{order.orderId || order._id?.slice(-6)}</span>
                                  <span className="modern-order-divider">•</span>
                                  <span className="modern-order-date">
                                    {new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                <p className="modern-order-count">عدد المنتجات: {order.itemCount || '—'} قطع</p>
                              </div>
                            </div>

                            <div className="order-status-price-zone">
                              <div className="price-status-block">
                                <span className={`status-badge tag-${order.status}`}>
                                  {statusTranslations[order.status] || order.status}
                                </span>
                                <span className="modern-price-display">
                                  {(order.totalAmount / 100).toFixed(2)} <span className="currency-unit">₪</span>
                                </span>
                              </div>

                              <button
                                onClick={() => fetchOrderDetail(order._id)}
                                disabled={loadingOrderDetail}
                                className="modern-view-details-btn"
                              >
                                <span>تفاصيل الطلب</span>
                                <ChevronRight size={16} className="rotate-180" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/*  تبويب العناوين (Addresses) */}
            {activeTab === "addresses" && (
              <div className="dashboard-section-canaan tab-content-fade">
                <div className="section-header-canaan">
                  <h2>عنوان التوصيل</h2>
                  <p className="section-subtitle-canaan">عنوانك المحفوظ يُستخدم في طلبات التوصيل</p>
                </div>

                {!showAddressForm ? (
                  <div className="addresses-grid-canaan">
                    {user.address || addressState ? (
                      <div className="address-card-canaan">
                        <div className="address-header-canaan">
                          <div className="address-type-info">
                            <Home size={15} />
                            <h3>عنواني</h3>
                          </div>
                          <div className="address-controls">
                            <Edit3
                              size={13}
                              className="cursor-pointer hover:text-amber-700"
                              onClick={() => { setAddressState(user.address || addressState); setIsAddingNew(false); setShowAddressForm(true); }}
                            />
                          </div>
                        </div>
                        <p className="address-street mt-2 text-sm text-gray-600">{user.address || addressState}</p>
                      </div>
                    ) : null}

                    <div
                      className="add-address-card-blank cursor-pointer"
                      onClick={() => { setAddressState(""); setIsAddingNew(true); setShowAddressForm(true); }}
                    >
                      <Plus size={24} />
                      <p>إضافة عنوان توصيل</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveAddress} className="flex flex-col gap-4 bg-gray-50/40 border border-gray-100 rounded-2xl p-5 max-w-lg">
                    <h3 className="text-xs font-bold text-[#1a3a1a] border-b border-gray-200/60 pb-2 mb-1 text-right">
                      {isAddingNew ? "إضافة عنوان جديد" : "تعديل العنوان"}
                    </h3>
                    <div className="flex flex-col gap-1 text-right">
                      <label className="text-xs font-bold text-gray-700">العنوان التفصيلي (المدينة / الشارع / المنطقة)</label>
                      <textarea
                        rows={3}
                        required
                        value={addressState}
                        onChange={e => setAddressState(e.target.value)}
                        placeholder="مثال: رام الله، شارع الإرسال، بجانب مسجد النور"
                        className="border border-gray-200 rounded-xl p-2.5 text-sm bg-white outline-none transition-all text-right rtl focus:border-amber-700 resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={savingAddress}
                        className="bg-[#1a3a1a] text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50"
                      >
                        {savingAddress ? "جاري الحفظ..." : "حفظ العنوان"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="border border-gray-200 text-gray-600 text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/*  تبويب الإشعارات (Notifications) */}
            {activeTab === "notifications" && (
              <div className="dashboard-section-canaan tab-content-fade">
                <div className="section-header-canaan">
                  <div>
                    <h2>الإشعارات</h2>
                    <p className="section-subtitle-canaan">تابع آخر تحديثات طلباتك والعروض الخاصة</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-2 text-xs font-bold text-[#2a6c2d] hover:underline"
                    >
                      <CheckCheck size={14} /> تحديد الكل كمقروء
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 flex flex-col items-center">
                    <BellOff size={48} className="mb-3 opacity-30" />
                    <p className="text-sm font-bold">لا توجد إشعارات</p>
                    <p className="text-xs mt-1">ستظهر هنا إشعارات طلباتك وعروضنا</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {notifications.map(notif => {
                      const typeColors = {
                        order_status: { bg: 'bg-blue-50', border: 'border-blue-100', dot: '#3b82f6' },
                        payment: { bg: 'bg-emerald-50', border: 'border-emerald-100', dot: '#10b981' },
                        promo: { bg: 'bg-amber-50', border: 'border-amber-100', dot: '#f59e0b' },
                        system: { bg: 'bg-gray-50', border: 'border-gray-200', dot: '#9ca3af' },
                      };
                      const style = typeColors[notif.type] || typeColors.system;
                      const typeLabel = { order_status: 'طلبات', payment: 'الدفع', promo: 'عروض', system: 'النظام' };

                      return (
                        <div
                          key={notif._id}
                          onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                          className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                            notif.isRead ? 'bg-white border-gray-100 opacity-70' : `${style.bg} ${style.border}`
                          }`}
                        >
                          {/* نقطة الحالة */}
                          <div className="mt-1 flex-shrink-0">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ background: notif.isRead ? '#d1d5db' : style.dot }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                {typeLabel[notif.type] || notif.type}
                              </span>
                              {!notif.isRead && (
                                <span className="text-[10px] font-bold text-white bg-[#dc2626] rounded-full px-1.5 py-0.5">جديد</span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-gray-800">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                            <p className="text-[11px] text-gray-400 mt-1.5">
                              {new Date(notif.createdAt).toLocaleDateString('ar-EG', {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>

                          {!notif.isRead && (
                            <button
                              onClick={e => { e.stopPropagation(); handleMarkAsRead(notif._id); }}
                              className="flex-shrink-0 text-[11px] text-gray-400 hover:text-[#2a6c2d] font-bold mt-1 whitespace-nowrap"
                            >
                              تحديد كمقروء
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* تبويب المفضلة */}
            {activeTab === "favorites" && (
              <div className="dashboard-section-canaan tab-content-fade">
                <div className="section-header-canaan">
                  <div>
                    <h2>المنتجات المفضلة</h2>
                    <p className="section-subtitle-canaan">المنتجات التي أضفتها لقائمة مفضلتك</p>
                  </div>
                </div>

                {favorites.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 flex flex-col items-center">
                    <Heart size={48} className="mb-3 opacity-20" />
                    <p className="text-sm font-bold">لا توجد منتجات في المفضلة</p>
                    <p className="text-xs mt-1">اضغط على أيقونة القلب في أي منتج لإضافته</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="mt-5 bg-[#2a6c2d] text-white text-xs font-bold py-2.5 px-6 rounded-xl hover:bg-[#1f4d1f] transition-all"
                    >
                      تصفح المنتجات
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.filter(Boolean).map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all"
                      >
                        {/* صورة المنتج */}
                        <div
                          className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer"
                          onClick={() => navigate(`/product/${product._id}`)}
                        >
                          <img
                            src={product.images?.[0] || '/assets/h-st-tray.png'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* معلومات المنتج */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-bold text-gray-800 truncate cursor-pointer hover:text-[#2a6c2d] transition-colors"
                            onClick={() => navigate(`/product/${product._id}`)}
                          >
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.category?.name || ''}</p>
                          <p className="text-sm font-bold text-[#2a6c2d] mt-1">
                            {((product.price || 0) / 100).toFixed(2)} ₪
                          </p>
                        </div>

                        {/* أزرار */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => navigate(`/product/${product._id}`)}
                            title="عرض المنتج"
                            className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <ShoppingCart size={14} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => toggleFavorite(product)}
                            title="إزالة من المفضلة"
                            className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center hover:bg-red-100 transition-colors"
                          >
                            <Heart size={14} fill="#e53e3e" className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/*  تبويب إعدادات الحساب (Settings) */}
            {activeTab === "settings" && (
              <div className="dashboard-section-canaan tab-content-fade">
                <div className="section-header-canaan">
                  <h2>إعدادات الحساب وتغيير كلمة المرور</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
                  
                  {/* فورم تعديل البيانات الأساسية - تم ربطه بالدالة الصحيحة المصلحة 🎯 */}
                  <form onSubmit={handleUpdateProfileSubmit} className="flex flex-col gap-4 bg-gray-50/40 border border-gray-100 rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-[#1a3a1a] border-b border-gray-200/60 pb-2 mb-1 text-right">البيانات الأساسية</h3>
                    
                    <div className="flex flex-col gap-1 text-right">
                      <label className="text-xs font-bold text-gray-700">الاسم بالكامل</label>
                      <input 
                        type="text" 
                        className={`border rounded-xl p-2.5 text-sm bg-white outline-none transition-all text-right rtl ${
                          profileErrors.name 
                            ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                            : 'border-gray-200 focus:border-amber-700'
                        }`} 
                        value={nameState}
                        onChange={(e) => setNameState(e.target.value)}
                      />
                      {profileErrors.name && <span className="text-[11px] text-red-600 font-bold mt-0.5 text-right">{profileErrors.name}</span>}
                    </div>
                    
                    <div className="flex flex-col gap-1 text-right">
                      <label className="text-xs font-bold text-gray-700">رقم الهاتف</label>
                      <input 
                        type="text" 
                        className={`border rounded-xl p-2.5 text-sm bg-white font-mono outline-none transition-all text-left placeholder:text-right ${
                          profileErrors.phone 
                            ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                            : 'border-gray-200 focus:border-amber-700'
                        }`} 
                        style={{ direction: "ltr" }}
                        placeholder="أدخل رقم الهاتف (مثلاً 0599123456)"
                        value={phoneState} 
                        onChange={(e) => setPhoneState(e.target.value)}
                      />
                      {profileErrors.phone && <span className="text-[11px] text-red-600 font-bold mt-0.5 text-right" style={{ direction: "rtl" }}>{profileErrors.phone}</span>}
                    </div>

                    <button 
                      type="submit"
                      disabled={savingProfile}
                      className="bg-[#1a3a1a] text-white text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-opacity-90 transition-all mt-2 self-start disabled:opacity-50"
                    >
                      {savingProfile ? "جاري الحفظ..." : "حفظ التغييرات الأساسية"}
                    </button>
                  </form>

                  {/* فورم تعديل أمان الحساب */}
                  <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 bg-gray-50/40 border border-gray-100 rounded-2xl p-5">
                    <h3 className="text-xs font-bold text-[#1a3a1a] border-b border-gray-200/60 pb-2 mb-1 text-right">أمان الحساب</h3>
                    
                    <div className="flex flex-col gap-1 text-right">
                      <label className="text-xs font-bold text-gray-700">كلمة المرور الحالية</label>
                      <div className="relative w-full">
                        <input 
                          type={showCurrentPassword ? "text" : "password"} 
                          className={`w-full border rounded-xl p-2.5 pl-10 text-sm bg-white outline-none transition-all text-right rtl ${
                            passwordErrors.currentPassword 
                              ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                              : 'border-gray-200 focus:border-amber-700'
                          }`} 
                          placeholder="اكتب كلمة المرور الحالية" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && <span className="text-[11px] text-red-600 font-bold mt-0.5 text-right">{passwordErrors.currentPassword}</span>}
                    </div>

                    <div className="flex flex-col gap-1 text-right">
                      <label className="text-xs font-bold text-gray-700">كلمة المرور الجديدة</label>
                      <div className="relative w-full">
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          className={`w-full border rounded-xl p-2.5 pl-10 text-sm bg-white outline-none transition-all text-right rtl ${
                            passwordErrors.newPassword 
                              ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                              : 'border-gray-200 focus:border-amber-700'
                          }`} 
                          placeholder="8 أحرف، حرف كبير ورقم على الأقل" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowNewPassword(!showNewPassword)}>
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && <span className="text-[11px] text-red-600 font-bold mt-0.5 text-right">{passwordErrors.newPassword}</span>}
                    </div>

                    <div className="flex flex-col gap-1 text-right">
                      <label className="text-xs font-bold text-gray-700">تأكيد كلمة المرور الجديدة</label>
                      <div className="relative w-full">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          className={`w-full border rounded-xl p-2.5 pl-10 text-sm bg-white outline-none transition-all text-right rtl ${
                            passwordErrors.confirmPassword 
                              ? 'border-red-500 focus:border-red-500 bg-red-50/30' 
                              : 'border-gray-200 focus:border-amber-700'
                          }`} 
                          placeholder="أعد كتابة كلمة المرور الجديدة للتأكيد" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && <span className="text-[11px] text-red-600 font-bold mt-0.5 text-right">{passwordErrors.confirmPassword}</span>}
                    </div>

                    <button 
                      type="submit"
                      disabled={savingPassword}
                      className="bg-amber-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-amber-800 transition-all mt-2 self-start disabled:opacity-50"
                    >
                      {savingPassword ? "جاري التحديث..." : "تحديث كلمة المرور"}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </section>
        </main>
      </div>

      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmSaveProfile}
        title="تأكيد حفظ التعديلات"
        message="هل أنتِ متأكدة من رغبتكِ في حفظ التغييرات الجديدة على بيانات حسابكِ الشخصية؟"
        confirmText="نعم، احفظ التغييرات"
      />

      {/*  الـ Toast الاحترافي المتناسق مع ألوان كنعان */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-[#1a3a1a] text-white px-5 py-3 rounded-xl shadow-lg text-xs font-bold z-[99999] animate-bounce rtl">
          {toastMessage}
        </div>
      )}
    </div>
  );
}