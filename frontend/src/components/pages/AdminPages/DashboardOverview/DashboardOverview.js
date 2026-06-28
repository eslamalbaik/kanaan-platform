import React, { useState, useEffect } from 'react';
import './DashboardOverview.css';
import {
  LuTrendingUp,
  LuShoppingBag,
  LuPackage,
  LuUsers,
  LuArrowUpRight
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import API from '../../../../api/api';

const STATUS_TRANSLATIONS = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'جاري التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي'
};

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/admin/dashboard/stats')
      .then((res) => {
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      })
      .catch(() => setError('فشل في تحميل الإحصائيات'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-processing';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipping';
      case 'delivered': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const formatCurrency = (amount) =>
    `${((amount || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} شيكل`;

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="dashboard-overview-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <p style={{ color: '#888', fontSize: 15 }}>جاري تحميل الإحصائيات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-overview-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <p style={{ color: '#c0392b', fontSize: 15 }}>{error}</p>
      </div>
    );
  }

  const statsCards = [
    {
      id: 1,
      title: 'إجمالي المبيعات',
      value: formatCurrency(dashboardData.totalRevenue),
      icon: LuTrendingUp,
      change: 'هذا الشهر',
      changeType: 'positive',
      bgColor: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 2,
      title: 'الطلبات المعلقة',
      value: `${dashboardData.pendingOrders} طلب`,
      icon: LuShoppingBag,
      change: `من أصل ${dashboardData.totalOrders}`,
      changeType: 'neutral',
      bgColor: 'bg-amber-50 text-amber-600'
    },
    {
      id: 3,
      title: 'المنتجات المحلية',
      value: `${dashboardData.totalProducts} منتج`,
      icon: LuPackage,
      change: 'في المتجر',
      changeType: 'neutral',
      bgColor: 'bg-blue-50 text-blue-600'
    },
    {
      id: 4,
      title: 'الزبائن المسجلين',
      value: `${dashboardData.totalCustomers} زبون`,
      icon: LuUsers,
      change: `+${dashboardData.ordersThisMonth} طلب جديد`,
      changeType: 'positive',
      bgColor: 'bg-purple-50 text-purple-600'
    }
  ];

  return (
    <div className="dashboard-overview-container">
      <section className="stats-grid">
        {statsCards.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id} className="stat-card">
              <div className="stat-card-header">
                <div className={`stat-icon-wrapper ${item.bgColor}`}>
                  <IconComponent size={22} />
                </div>
                <span className={`stat-badge ${item.changeType}`}>
                  {item.change}
                </span>
              </div>
              <div className="stat-card-body">
                <h3 className="stat-title">{item.title}</h3>
                <p className="stat-value">{item.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="recent-orders-section">
        <div className="section-header">
          <h2 className="section-title">آخر الطلبات الواردة</h2>
          <button className="view-all-btn" onClick={() => navigate('/admin/orders')}>
            عرض كل الطلبات <LuArrowUpRight size={16} />
          </button>
        </div>

        <div className="table-responsive-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>الزبون</th>
                <th>التاريخ</th>
                <th>الإجمالي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {(dashboardData.recentOrders || []).map((order) => (
                <tr key={order._id}>
                  <td className="font-bold text-gray-700">
                    {order.orderId || `#${order._id?.substring(0, 6).toUpperCase()}`}
                  </td>
                  <td>{order.userId?.name || order.customerName || 'زبون كنعان'}</td>
                  <td className="text-gray-500 text-sm">{formatDate(order.createdAt)}</td>
                  <td className="font-semibold text-[#1a3a1a]">{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <span className={`status-badge-table ${getStatusClass(order.status)}`}>
                      {STATUS_TRANSLATIONS[order.status] || order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
