import "./AboutBanner.css";

export default function AboutBanner() {
  return (
    <section id="about" className="about-banner">

      {/* الخلفية */}
      <img
        src="../assets/aboutsec.png"
        alt="منتجات فلسطينية"
        className="about-bg"
      />

      {/* طبقة غامقة */}
      <div className="about-overlay"></div>

      {/* المحتوى */}
      <div className="about-content">
        <h2 className="about-title">
          منتجات فلسطينية أصيلة مع كنعان
        </h2>

        <p className="about-text">
          من غزة وإليها.. كنعان تجمعنا لدعم الإنتاج المحلي وربط المستهلك
          بمنتجات الأسر الفلسطينية التي تحافظ على تراثنا الأصيل.
        </p>
      </div>

    </section>
  );
}