import { 
  LuTrendingUp, 
  LuShoppingBag, 
  LuPackage, 
  LuUsers 
} from 'react-icons/lu';

export const statsData = [
  {
    id: 1,
    title: 'إجمالي المبيعات',
    value: '2,450 شيكل',
    icon: LuTrendingUp,
    change: '+12%',
    changeType: 'positive',
    bgColor: 'bg-emerald-50 text-emerald-600'
  },
  {
    id: 2,
    title: 'الطلبات الجديدة',
    value: '18 طلب',
    icon: LuShoppingBag,
    change: 'اليوم',
    changeType: 'neutral',
    bgColor: 'bg-amber-50 text-amber-600'
  },
  {
    id: 3,
    title: 'المنتجات المحلية',
    value: '45 منتج',
    icon: LuPackage,
    change: '4 أقسام',
    changeType: 'neutral',
    bgColor: 'bg-blue-50 text-blue-600'
  },
  {
    id: 4,
    title: 'الزبائن المسجلين',
    value: '124 زبون',
    icon: LuUsers,
    change: '+5 هذا الأسبوع',
    changeType: 'positive',
    bgColor: 'bg-purple-50 text-purple-600'
  }
];

export const recentOrdersData = [
  { id: '1024', customer: 'فاطمة أحمد', total: '120 شيكل', status: 'قيد الانتظار', date: 'اليوم، 12:30 م' },
  { id: '1023', customer: 'محمد علي', total: '85 شيكل', status: 'جاري التجهيز', date: 'اليوم، 11:15 ص' },
  { id: '1022', customer: 'ريم خالد', total: '210 شيكل', status: 'تم التوصيل', date: 'أمس' },
  { id: '1021', customer: 'خليل عمر', total: '45 شيكل', status: 'ملغي', date: 'أمس' }
];