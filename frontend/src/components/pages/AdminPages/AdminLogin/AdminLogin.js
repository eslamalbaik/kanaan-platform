import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import API from '../../../../api/api';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', formData);
      const { userId, name, role, token, refreshToken } = res.data.data;

      if (role !== 'admin') {
        setError('ليس لديك صلاحية الدخول للوحة الإدارة');
        setLoading(false);
        return;
      }

      localStorage.setItem('kanaan_admin_token', token);
      localStorage.setItem('kanaan_admin_refresh_token', refreshToken);
      login({ id: userId, name, email: formData.email, role, token });
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'بيانات غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', direction: 'rtl' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 16px rgba(0,0,0,0.1)', width: '360px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#1a3a1a' }}>لوحة تحكم كنعان</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            required
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', textAlign: 'right' }}
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={formData.password}
            onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
            required
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', textAlign: 'right' }}
          />
          {error && <p style={{ color: 'red', fontSize: '13px', margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '12px', background: '#1a3a1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
