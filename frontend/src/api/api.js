import axios from 'axios';

// إعداد الرابط الأساسي الذي أرسله مطور الباك-إند
const API = axios.create({
  baseURL: 'http://31.97.196.73/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// إرسال التوكن تلقائياً — الأدمن له كي منفصل حتى لا يتعارض مع جلسة المستخدم العادي
API.interceptors.request.use((config) => {
  const isAdminRequest = config.url?.includes('/admin/');
  const token = isAdminRequest
    ? (localStorage.getItem('kanaan_admin_token') || localStorage.getItem('kanaan_token'))
    : (localStorage.getItem('kanaan_token') || localStorage.getItem('kanaan_admin_token'));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;