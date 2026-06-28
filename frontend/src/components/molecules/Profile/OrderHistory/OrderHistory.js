import React, { useState, useEffect } from 'react';
export default function OrderHistory() {
  const [orders, setOrders] = useState([]);

  const statusTranslations = {
    pending: "قيد التحضير",
    shipped: "قيد الشحن",
    delivered: "تم التسليم"
  };

  useEffect(() => {
    const mockOrders = [
      {
        orderId: "ORD-2026-001",
        totalAmount: 13500, 
        status: "delivered",
        createdAt: "2026-06-10",
        items: [
          { name: "زيت زيتون بكر", image: "https://via.placeholder.com/50" },
          { name: "زعتر فلسطيني بلدي", image: "https://via.placeholder.com/50" }
        ]
      },
      {
        orderId: "ORD-2026-002",
        totalAmount: 8500, 
        status: "shipped",
        createdAt: "2026-06-12",
        items: [
          { name: "ثوب مطرز", image: "https://via.placeholder.com/50" }
        ]
      }
    ];
    setOrders(mockOrders);
  }, []);

  return (
    <div>
      <h3 className="text-base font-bold text-[#1a3a1a] mb-6 pb-2 border-b border-[#eae6dc]/60">سجل طلباتي</h3>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.orderId} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-[#eae6dc] rounded-2xl bg-white hover:bg-emerald-50/10 transition-colors gap-4">
            
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                {order.items.map((item, idx) => (
                  <img key={idx} className="inline-block h-10 w-10 rounded-lg object-cover ring-2 ring-white border border-gray-100" src={item.image} alt={item.name} />
                ))}
              </div>
              
              <div>
                <span className="text-xs font-bold text-gray-800 block">رقم الطلب: {order.orderId}</span>
                <span className="text-[11px] text-gray-400">{order.createdAt}</span>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6">
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                order.status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {statusTranslations[order.status] || order.status}
              </span>

              <div className="text-left font-mono text-xs font-semibold text-gray-700">
                {(order.totalAmount / 100).toFixed(2)} ₪
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}