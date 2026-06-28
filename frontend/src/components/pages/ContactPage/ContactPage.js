import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Edit3, 
  Send, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Leaf 
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const palPhoneRegex = /^(059|056)\d{7}$/;
    if (!palPhoneRegex.test(formData.phone.trim())) {
      setStatus({
        type: 'error',
        message: 'رقم الهاتف غير صحيح، يجب أن يبدأ بـ 059 أو 056 ويتكون من 10 أرقام.'
      });
      return false;
    }

    if (formData.message.trim().length < 10) {
      setStatus({ 
        type: 'error',
        message: 'فضلاً، يجب أن تحتوي الرسالة على 10 أحرف على الأقل.'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await fetch('https://formspree.io/f/xykaenwp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'تم استلام رسالتك بنجاح، وسيرد فريق كنعان عليك في أقرب وقت.'
        });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        throw new Error('فشل إرسال البيانات الخادمة');
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'حدث خطأ أثناء إرسال رسالتك، يرجى المحاولة مرة أخرى لاحقاً.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fcfbf7] text-gray-800" dir="rtl">
      <section 
        className="relative w-full h-[350px] flex flex-col justify-center items-center bg-center bg-cover bg-no-repeat select-none pt-[90px]"
        style={{ backgroundImage: "url('/assets/herophoto.jpeg')" }} 
      >

        <div className="absolute inset-0 bg-black/60 z-[1]" />
        
        <div className="relative z-[2] text-center px-4 space-y-3 max-w-2xl flex flex-col items-center justify-center">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-normal drop-shadow-sm ">
            تواصل معنا
          </h1>
          <p className="text-gray-200 text-sm md:text-base font-light leading-relaxed">
            نسعد بتواصلكم معنا، فريق كنعان هنا لخدمتكم والإجابة على كافة استفساراتكم.
          </p>
          
          <div className="flex items-center justify-center gap-2 pt-2 opacity-8xl">
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-400"></div>
            <Leaf className="w-4 h-4 text-amber-400 transform rotate-45" />
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-400"></div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          <section className="lg:col-span-5 bg-white border border-[#2a6c2d]/10 rounded-2xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 text-[#2a6c2d]/5 transform -rotate-12 select-none pointer-events-none">
              <Leaf className="w-48 h-48" />
            </div>

            <div className="text-center space-y-2 mb-8">
              <h2 className="text-xl md:text-2xl font-black text-gray-900">معلومات التواصل</h2>
              <div className="flex justify-center text-[#2a6c2d] opacity-40"><Leaf className="w-4 h-4" /></div>
              <p className="text-xs md:text-sm text-gray-500 font-light leading-relaxed max-w-xs mx-auto">
                يمكنك التواصل معنا من خلال المعلومات التالية أو عبر النموذج، فريق كنعان جاهز لخدمتك.
              </p>
            </div>

            <div className="space-y-6 relative z-10">
              <a 
                href="mailto:info@canaan.ps" 
                className="flex items-center gap-4 p-4 bg-[#fcfbf7] border border-gray-100 rounded-xl hover:border-[#2a6c2d]/30 hover:bg-emerald-50/20 transition-all duration-200 group text-right"
              >
                <div className="w-12 h-12 bg-[#2a6c2d]/10 text-[#2a6c2d] rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#2a6c2d] group-hover:text-white transition-colors duration-200">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs text-gray-400 font-medium">البريد الإلكتروني</h3>
                  <p className="text-sm md:text-base font-bold text-gray-800 dir-ltr">kanaan.platform@gmail.com</p>
                </div>
              </a>

              <a 
                href="tel:+970591234567" 
                className="flex items-center gap-4 p-4 bg-[#fcfbf7] border border-gray-100 rounded-xl hover:border-[#2a6c2d]/30 hover:bg-emerald-50/20 transition-all duration-200 group text-right"
              >
                <div className="w-12 h-12 bg-[#2a6c2d]/10 text-[#2a6c2d] rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#2a6c2d] group-hover:text-white transition-colors duration-200">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs text-gray-400 font-medium">رقم الهاتف</h3>
                  <p className="text-sm md:text-base font-bold text-gray-800 dir-ltr">+970 59 123 4567</p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 bg-[#fcfbf7] border border-gray-100 rounded-xl">
                <div className="w-12 h-12 bg-[#2a6c2d]/10 text-[#2a6c2d] rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs text-gray-400 font-medium">الموقع</h3>
                  <p className="text-sm md:text-base font-bold text-gray-800">Palestine - Gaza</p>
                </div>
              </div>

            </div>
          </section>

          <section className="lg:col-span-7 bg-white border border-[#2a6c2d]/10 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-[#2a6c2d] mb-2">
              <Leaf className="w-5 h-5 stroke-[2.5]" />
              <h2 className="text-lg md:text-xl font-extrabold">أرسل لنا رسالة</h2>
            </div>
            <p className="text-xs md:text-sm text-gray-400 font-light mb-6">
              املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* حقل الاسم الكامل */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs md:text-sm font-bold text-gray-700">الاسم الكامل <span className="text-red-500">*</span></label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="ادخل اسمك الكامل"
                    className="w-full pr-10 pl-4 py-3 bg-[#fcfbf7] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2a6c2d] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* حقل البريد الإلكتروني */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs md:text-sm font-bold text-gray-700">البريد الإلكتروني <span className="text-red-500">*</span></label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ادخل بريدك الإلكتروني"
                    className="w-full pr-10 pl-4 py-3 bg-[#fcfbf7] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2a6c2d] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* حقل رقم الهاتف مع الملاحظة التوضيحية لشبكات غزة */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs md:text-sm font-bold text-gray-700">رقم الهاتف <span className="text-red-500">*</span></label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="مثال: 0591234567"
                    className="w-full pr-10 pl-4 py-3 bg-[#fcfbf7] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2a6c2d] focus:bg-white transition-colors text-right"
                  />
                </div>
                <p className="text-[11px] text-gray-400 font-light">يجب أن يبدأ الرقم بـ 059 (جوال) أو 056 (وطنية).</p>
              </div>

              {/* حقل الموضوع */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs md:text-sm font-bold text-gray-700">الموضوع <span className="text-red-500">*</span></label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="ادخل موضوع الرسالة"
                    className="w-full pr-10 pl-4 py-3 bg-[#fcfbf7] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2a6c2d] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* حقل نص الرسالة */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs md:text-sm font-bold text-gray-700">الرسالة <span className="text-red-500">*</span></label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute top-3.5 right-3.5 text-gray-400">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="اكتب رسالتك هنا بالتفصيل..."
                    className="w-full pr-10 pl-4 py-3 bg-[#fcfbf7] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2a6c2d] focus:bg-white transition-colors resize-none"
                  ></textarea>
                </div>
              </div>

           
              {status.type && (
                <div 
                  className={`flex items-center gap-3 p-4 rounded-xl text-xs md:text-sm font-medium border animate-fadeIn ${
                    status.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                  <span>{status.message}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-[#2a6c2d] text-white font-bold text-sm rounded-xl hover:bg-[#1f5222] transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md shadow-[#2a6c2d]/10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال الرسالة</span>
                  </>
                )}
              </button>

            </form>
          </section>

        </div>
      </main>
    </div>
  );
};

export default ContactPage;