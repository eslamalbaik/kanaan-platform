export const storage = {
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.error(`خطأ أثناء قراءة البيانات من التخزين المحلي لـ ${key}:`, error);
      return fallback;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`خطأ أثناء حفظ البيانات في التخزين المحلي لـ ${key}:`, error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`خطأ أثناء حذف البيانات من التخزين المحلي لـ ${key}:`, error);
      return false;
    }
  }
};