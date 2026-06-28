import React, { useState, useEffect } from "react";
import "./AdminProfile.css";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import API from "../../../../api/api";

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");

  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [pwdData, setPwdData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    API.get("/users/me")
      .then((res) => {
        const u = res.data.data || res.data;
        setProfile(u);
        const displayPhone = u.phone?.startsWith("+970")
          ? u.phone.replace("+970", "0")
          : u.phone || "";
        setFormData({ name: u.name || "", phone: displayPhone });
      })
      .catch(() => setErrorMsg("فشل تحميل بيانات الحساب"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    if (!formData.name.trim()) {
      setErrorMsg("الاسم مطلوب");
      return;
    }
    setSaving(true);
    try {
      const body = { name: formData.name.trim() };
      if (formData.phone.trim()) {
        const rawPhone = formData.phone.trim();
        body.phone = rawPhone.startsWith("+970")
          ? rawPhone
          : "+970" + rawPhone.replace(/^0/, "");
      }
      await API.put("/users/me", body);
      setSuccessMsg("تم حفظ البيانات بنجاح");
      setProfile((prev) => ({ ...prev, ...body }));
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "فشل حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSuccess("");
    setPwdError("");
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdError("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    if (pwdData.newPassword.length < 8) {
      setPwdError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    setSavingPwd(true);
    try {
      await API.put("/users/change-password", {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword,
        confirmPassword: pwdData.confirmPassword,
      });
      setPwdSuccess("تم تغيير كلمة المرور بنجاح");
      setPwdData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwdError(err.response?.data?.message || "فشل تغيير كلمة المرور");
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-profile-container">
        <p className="text-center text-gray-400 py-16">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="admin-profile-container" dir="rtl">
      {/* بطاقة الهوية */}
      <div className="admin-profile-identity-card">
        <div className="admin-avatar-circle">
          {profile?.name?.charAt(0) || "م"}
        </div>
        <h2 className="admin-identity-name">{profile?.name || "مدير النظام"}</h2>
        <p className="admin-identity-email">{profile?.email || "-"}</p>
        <div className="admin-role-badge">
          <ShieldCheck size={13} />
          <span>مدير النظام</span>
        </div>

        <div className="admin-identity-info">
          <div className="admin-info-row">
            <Mail size={14} />
            <span>{profile?.email || "-"}</span>
          </div>
          <div className="admin-info-row">
            <Phone size={14} />
            <span>
              {profile?.phone
                ? profile.phone.replace("+970", "0")
                : "غير مضاف"}
            </span>
          </div>
          <div className="admin-info-row">
            <User size={14} />
            <span>{profile?.name || "-"}</span>
          </div>
        </div>
      </div>

      {/* قسم التعديلات */}
      <div className="admin-profile-forms">
        {/* فورم البيانات الشخصية */}
        <div className="admin-form-card">
          <div className="admin-form-card-header">
            <User size={16} />
            <h3>تعديل البيانات الشخصية</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="admin-profile-form">
            <div className="admin-form-group">
              <label>الاسم الكامل</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="اسم المدير"
              />
            </div>

            <div className="admin-form-group">
              <label>رقم الهاتف</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="059xxxxxxx"
                dir="ltr"
              />
            </div>

            {successMsg && (
              <p className="text-green-600 text-sm font-medium">{successMsg}</p>
            )}
            {errorMsg && (
              <p className="text-red-500 text-sm font-medium">{errorMsg}</p>
            )}

            <button type="submit" disabled={saving} className="admin-save-btn">
              <Save size={14} />
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </form>
        </div>

        {/* فورم تغيير كلمة المرور */}
        <div className="admin-form-card">
          <div className="admin-form-card-header">
            <Lock size={16} />
            <h3>تغيير كلمة المرور</h3>
          </div>

          <form onSubmit={handleChangePassword} className="admin-profile-form">
            {[
              { key: "currentPassword", label: "كلمة المرور الحالية", showKey: "current" },
              { key: "newPassword", label: "كلمة المرور الجديدة", showKey: "new" },
              { key: "confirmPassword", label: "تأكيد كلمة المرور الجديدة", showKey: "confirm" },
            ].map(({ key, label, showKey }) => (
              <div className="admin-form-group" key={key}>
                <label>{label}</label>
                <div className="admin-password-input-wrapper">
                  <input
                    type={showPwd[showKey] ? "text" : "password"}
                    value={pwdData[key]}
                    onChange={(e) =>
                      setPwdData((p) => ({ ...p, [key]: e.target.value }))
                    }
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    className="admin-eye-btn"
                    onClick={() =>
                      setShowPwd((p) => ({ ...p, [showKey]: !p[showKey] }))
                    }
                  >
                    {showPwd[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}

            {pwdSuccess && (
              <p className="text-green-600 text-sm font-medium">{pwdSuccess}</p>
            )}
            {pwdError && (
              <p className="text-red-500 text-sm font-medium">{pwdError}</p>
            )}

            <button
              type="submit"
              disabled={savingPwd}
              className="admin-save-btn"
            >
              <Lock size={14} />
              {savingPwd ? "جاري التغيير..." : "تغيير كلمة المرور"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
