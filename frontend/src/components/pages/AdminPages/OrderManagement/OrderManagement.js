import React, { useState, useEffect, useCallback } from "react";
import "./OrderManagement.css";
import {
  Search,
  ShoppingBag,
  User,
  Truck,
  Eye,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import API from "../../../../api/api";

const statusTranslations = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  processing: "قيد التنفيذ",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

const paymentStatusTranslations = {
  pending: "قيد الانتظار",
  paid: "مدفوع",
  failed: "فشل",
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 20 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await API.get("/admin/orders", { params });
      const { orders: data, pagination } = res.data.data;
      setOrders(data || []);
      setTotalPages(pagination?.totalPages || 1);
      setTotal(pagination?.total || 0);
      if (!selectedOrder && data?.length > 0) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      setError("فشل في تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, searchTerm]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "فشل تحديث حالة الطلب");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    setUpdating(true);
    try {
      await API.put(`/admin/orders/${orderId}/payment-status`, { paymentStatus: newPaymentStatus });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o
        )
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, paymentStatus: newPaymentStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "فشل تحديث حالة الدفع");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="order-management-container" dir="rtl">
      {/* بطاقة تفاصيل الطلب */}
      <aside className="order-details-card">
        {selectedOrder ? (
          <>
            <div className="card-header-with-icon">
              <ShoppingBag size={18} className="text-[#1a3a1a]" />
              <h2>تفاصيل الطلب الفردي</h2>
            </div>

            <div className="order-details-content">
              <div className="order-id-badge">
                <span className="font-bold text-[#1a3a1a]">
                  {selectedOrder.orderId || `#${selectedOrder._id?.substring(0, 8).toUpperCase()}`}
                </span>
                <span>{formatDate(selectedOrder.createdAt)}</span>
              </div>

              <div className="info-block-section">
                <div className="section-subtitle-with-icon">
                  <User size={14} />
                  <span>بيانات الزبون</span>
                </div>
                <div className="text-xs text-gray-700 flex flex-col gap-1 pr-1">
                  <p><strong>الاسم:</strong> {selectedOrder.userId?.name || "-"}</p>
                  <p><strong>البريد:</strong> {selectedOrder.userId?.email || "-"}</p>
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <div className="info-block-section">
                  <div className="section-subtitle-with-icon">
                    <Truck size={14} />
                    <span>عنوان التوصيل</span>
                  </div>
                  <div className="text-xs text-gray-700 flex flex-col gap-1 pr-1">
                    <p><strong>الاسم:</strong> {selectedOrder.shippingAddress.fullName || "-"}</p>
                    <p><strong>الهاتف:</strong> {selectedOrder.shippingAddress.phone || "-"}</p>
                    <p><strong>المدينة:</strong> {selectedOrder.shippingAddress.city || "-"}</p>
                    <p><strong>الشارع:</strong> {selectedOrder.shippingAddress.street || "-"}</p>
                  </div>
                </div>
              )}

              <div className="info-block-section">
                <div className="section-subtitle-with-icon">
                  <ClipboardList size={14} />
                  <span>المنتجات المطلوبة</span>
                </div>
                <div className="order-items-mini-list">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div className="mini-item-row" key={index}>
                      <div className="mini-item-info">
                        <span className="mini-item-name">{item.name}</span>
                        <span className="mini-item-qty">الكمية: {item.quantity}</span>
                      </div>
                      <span className="mini-item-price">
                        {((item.price * item.quantity) / 100).toFixed(2)} ₪
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="total-amount-row">
                <span>المبلغ الإجمالي:</span>
                <span className="text-base text-[#2a6c2a] font-mono">
                  {(selectedOrder.totalAmount / 100).toFixed(2)} ₪
                </span>
              </div>

              <div className="form-group mt-2">
                <label>تعديل حالة الطلب:</label>
                <select
                  className="order-select-input"
                  value={selectedOrder.status}
                  disabled={updating}
                  onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="processing">قيد التنفيذ</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التوصيل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>

              <div className="form-group">
                <label>تعديل حالة الدفع:</label>
                <select
                  className="order-select-input"
                  value={selectedOrder.paymentStatus}
                  disabled={updating || selectedOrder.paymentMethod !== "cod"}
                  onChange={(e) => handleUpdatePaymentStatus(selectedOrder._id, e.target.value)}
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="paid">مدفوع</option>
                  <option value="failed">فشل</option>
                </select>
                {selectedOrder.paymentMethod !== "cod" && (
                  <p className="text-xs text-gray-400 mt-1">الدفع الإلكتروني لا يمكن تعديله يدوياً</p>
                )}
              </div>

              <button
                className="bg-amber-700 text-white text-xs font-bold py-2 px-4 rounded-xl hover:bg-amber-800 transition-all"
                onClick={() => window.print()}
              >
                طباعة بوليصة الشحن
              </button>
            </div>
          </>
        ) : (
          <div className="no-order-selected">
            <AlertCircle size={24} className="mx-auto mb-2 text-gray-300" />
            <p>الرجاء تحديد طلب من الجدول لعرض تفاصيله.</p>
          </div>
        )}
      </aside>

      {/* قسم جدول الطلبات */}
      <section className="orders-list-section">
        <div className="section-title-wrapper">
          <div className="title-flex">
            <ClipboardList size={22} />
            <h2>طلبات المنصة</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="count-badge">{total} طلب</span>
            <button
              onClick={() => fetchOrders()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="تحديث"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-wrapper">
            <Search size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="ابحث برقم الطلب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">كل الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="confirmed">مؤكد</option>
            <option value="processing">قيد التنفيذ</option>
            <option value="shipped">تم الشحن</option>
            <option value="delivered">تم التوصيل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>

        {error && (
          <div className="p-4 text-red-600 text-sm text-center">{error}</div>
        )}

        <div className="orders-table-wrapper">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">جاري التحميل...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">لا توجد طلبات</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>الزبون</th>
                  <th>تاريخ الطلب</th>
                  <th>الإجمالي</th>
                  <th>حالة الطلب</th>
                  <th>الدفع</th>
                  <th>التحكم</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className={selectedOrder?._id === order._id ? "active-row" : ""}
                    onClick={() => setSelectedOrder(order)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="font-bold text-xs">
                      {order.orderId || `#${order._id?.substring(0, 8).toUpperCase()}`}
                    </td>
                    <td>
                      <div className="customer-cell-name">{order.userId?.name || "-"}</div>
                      <div className="customer-cell-phone">{order.userId?.email || "-"}</div>
                    </td>
                    <td className="text-xs text-gray-400">{formatDate(order.createdAt)}</td>
                    <td className="order-price-cell font-semibold">
                      {(order.totalAmount / 100).toFixed(2)} ₪
                    </td>
                    <td>
                      <span className={`status-badge tag-${order.status}`}>
                        {statusTranslations[order.status] || order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`payment-badge is-${order.paymentStatus}`}>
                        {paymentStatusTranslations[order.paymentStatus] || order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn view"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
            >
              <ChevronRight size={14} /> السابق
            </button>
            <span className="text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40"
            >
              التالي <ChevronLeft size={14} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
