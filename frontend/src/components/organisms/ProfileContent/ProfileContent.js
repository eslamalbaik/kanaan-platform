import React, { useState } from 'react';
import PersonalInfoForm from '../../molecules/Profile/PersonalInfoForm/PersonalInfoForm';
import OrderHistory from '../../molecules/Profile/OrderHistory/OrderHistory';
import SecurityForm from '../../molecules/Profile/SecurityForm/SecurityForm';

export default function ProfileContent() {
  const [activeTab, setActiveTab] = useState('personal-info');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <aside className="bg-white rounded-2xl p-6 shadow-sm border border-[#eae6dc] h-fit">
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#1a3a1a] mb-4 bg-gray-50 flex items-center justify-center">
                <span className="text-[#1a3a1a] text-2xl font-bold">هـ</span>
              </div>
              <h2 className="text-lg font-bold text-[#1a3a1a]">هبة منير</h2>
              <p className="text-xs text-gray-400 mt-0.5">heba.munir@example.com</p>
            </div>

            <nav className="mt-6 space-y-1.5">
              <button
                onClick={() => setActiveTab('personal-info')}
                className={`w-full flex items-center space-x-reverse space-x-3 px-4 py-3 rounded-xl text-right text-xs font-bold transition-colors ${
                  activeTab === 'personal-info'
                    ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>معلوماتي الشخصية</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-reverse space-x-3 px-4 py-3 rounded-xl text-right text-xs font-bold transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>طلباتي</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-reverse space-x-3 px-4 py-3 rounded-xl text-right text-xs font-bold transition-colors ${
                  activeTab === 'security'
                    ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>الأمان وكلمة المرور</span>
              </button>

              <hr className="my-2 border-gray-100" />

              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center space-x-reverse space-x-3 px-4 py-3 rounded-xl text-right text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <span>تسجيل الخروج</span>
              </button>
            </nav>
          </aside>

          {/* مساحة عرض المحتوى النشط */}
          <main className="lg:col-span-3 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#eae6dc]">
            {activeTab === 'personal-info' && <PersonalInfoForm />}
            {activeTab === 'orders' && <OrderHistory />}
            {activeTab === 'security' && <SecurityForm />}
          </main>

        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center border border-[#eae6dc]">
            <h4 className="text-base font-bold text-[#1a3a1a] mb-2">تسجيل الخروج</h4>
            <p className="text-gray-500 text-xs mb-6">هل أنت متأكد من رغبتك في تسجيل الخروج من منصة كنعان؟</p>
            <div className="flex space-x-reverse space-x-3">
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
              >
                نعم، خروج
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}