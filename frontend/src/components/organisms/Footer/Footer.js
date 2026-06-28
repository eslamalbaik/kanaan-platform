import { Link } from "react-router-dom";
import "./Footer.css";
import SocialIcons from "../../molecules/SocialIcons/SocialIcons";
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const links = [
    { label: "الرئيسية", path: "/" },
    { label: "منتجات", path: "/products" },
    { label: "من نحن", path: "/about" },
    { label: "تواصل معنا", path: "/contact" },
  ];

  return (
    <footer className="footer-main" dir="rtl">
      <div className="footer-grid-container">

        {/* القسم الأول: الشعار */}
        <div className="footer-section-logo">
          <div className="logo-wrapper">
            <img src="/assets/footerlogo.png" alt="لوغو كنعان" />
          </div>
          <p className="footer-description">
            منصة المنتجات الفلسطينية الأصيلة. ندعم الأسر المنتجة ونحافظ على التراث.
          </p>
        </div>

        {/* القسم الثاني: روابط */}
        <div>
          <h3 className="footer-heading">روابط</h3>
          <div className="footer-links-list">
            {links.map((l) => (
              <Link key={l.path} to={l.path} className="footer-custom-link">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* القسم الثالث: تواصل */}
        <div>
          <h3 className="footer-heading">تواصل معنا</h3>
          <div className="footer-contact-list">
            <p className="footer-contact-item">
              <Mail size={20} color="#dbeedb" className="shrink-0" /> 
              <span className="direction-ltr">kanaan.platform@gmail.com</span>
            </p>
            <p className="footer-contact-item">
              <MapPin size={20} color="#dbeedb" className="shrink-0" /> 
              <span>Palestine - Gaza</span>
            </p>
          </div>
        </div>

        {/* القسم الرابع: سوشيال */}
        <div className="footer-section-social">
          <h3 className="footer-heading">تابعنا</h3>
          <div className="social-icons-wrapper">
            <SocialIcons />
          </div>
        </div>

      </div>

      {/* الجزء السفلي */}
      <div className="footer-copyrights">
        © 2026 كنعان - جميع الحقوق محفوظة
      </div>
    </footer>
  );
}