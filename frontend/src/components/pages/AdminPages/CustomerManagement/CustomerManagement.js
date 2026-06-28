import React, { useState, useEffect, useCallback } from "react";
import "./CustomerManagement.css";
import {
  Search,
  Users,
  User,
  Mail,
  ShoppingBag,
  ShieldCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import API from "../../../../api/api";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 20 };
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await API.get("/admin/dashboard/users", { params });
      const { users, pagination } = res.data.data;
      setCustomers(users || []);
      setTotalPages(pagination?.totalPages || 1);
      setTotal(pagination?.total || 0);
      if (!selectedCustomer && users?.length > 0) {
        setSelectedCustomer(users[0]);
      }
    } catch (err) {
      setError("فشل في تحميل بيانات الزبائن");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="customer-management-container">
      {/* بطاقة تفاصيل الزبون */}
      <section className="customer-details-card">
        <div className="card-header-with-icon">
          <Eye size={18} />
          <h2>ملف العميل المتقدم</h2>
        </div>

        {selectedCustomer ? (
          <div className="customer-details-content">
            <div className="customer-avatar-wrapper">
              <div className="avatar-circle">
                {selectedCustomer.name?.charAt(0) || "؟"}
              </div>
              <h3 className="customer-profile-name">{selectedCustomer.name}</h3>
              <span className="role-tag role-customer">زبون المنصة</span>
            </div>

            <div className="info-block-section">
              <h4 className="section-subtitle-with-icon">
                <User size={13} /> بيانات الحساب
              </h4>
              <div className="contact-item">
                <Mail size={14} className="text-gray-400" />
                <span className="text-xs text-gray-700">{selectedCustomer.email}</span>
              </div>
            </div>

            <div className="info-block-section">
              <h4 className="section-subtitle-with-icon">
                <ShoppingBag size={13} /> ملخص النشاط
              </h4>
              <div className="stats-mini-grid">
                <div className="stat-box">
                  <span className="stat-label">عدد الطلبات</span>
                  <strong className="stat-value">{selectedCustomer.totalOrders}</strong>
                </div>
                <div className="stat-box">
                  <span className="stat-label">إجمالي المدفوعات</span>
                  <strong className="stat-value text-[#1a3a1a]">
                    {((selectedCustomer.totalSpend || 0) / 100).toFixed(2)} ₪
                  </strong>
                </div>
              </div>
            </div>

            <div className="customer-id-footer">
              <ShieldCheck size={13} className="text-gray-400" />
              <span>
                رقم العميل المرجعي:{" "}
                <b className="font-mono">{selectedCustomer._id}</b>
              </span>
            </div>
          </div>
        ) : (
          <div className="no-customer-selected">
            <p>الرجاء اختيار أحد العملاء من الجدول لعرض ملفه التفصيلي.</p>
          </div>
        )}
      </section>

      {/* جدول الزبائن */}
      <section className="customers-list-section">
        <div className="section-title-wrapper">
          <div className="title-flex">
            <Users />
            <h2>إدارة زبائن ومستخدمي كنعان</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="count-badge">{total} زبون متواجد</span>
            <button
              onClick={() => fetchCustomers()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="تحديث"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="search-wrapper w-full">
            <Search size={18} />
            <input
              className="search-input"
              placeholder="ابحث بالاسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 text-red-600 text-sm text-center">{error}</div>
        )}

        <div className="customers-table-wrapper">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">جاري التحميل...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>الاسم والبريد الإلكتروني</th>
                  <th>الطلبات</th>
                  <th>إجمالي الإنفاق</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr
                      key={customer._id}
                      className={
                        selectedCustomer?._id === customer._id ? "active-row" : ""
                      }
                      onClick={() => setSelectedCustomer(customer)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <div className="customer-cell-name">{customer.name}</div>
                        <div className="customer-cell-email">{customer.email}</div>
                      </td>
                      <td className="text-center font-semibold text-xs">
                        {customer.totalOrders}
                      </td>
                      <td className="customer-spent-cell">
                        {((customer.totalSpend || 0) / 100).toFixed(2)} ₪
                      </td>
                      <td>
                        <button
                          className="action-btn view"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                          }}
                          title="مشاهدة الملف الشخصي"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-table-message">
                      لا يوجد زبائن يطابقون معايير البحث الحالية.
                    </td>
                  </tr>
                )}
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
