import React from 'react';
import { 
  Eye, 
  Compass, 
  Truck, 
  ShieldCheck, 
  Gift, 
  PackageCheck,
  Leaf
} from 'lucide-react';

import HeroContent from '../../molecules/HeroContent/HeroContent';
import Button from '../../atoms/Button/Button';
const HeroSection = () => {
  const heroTitle = {
    main: "من نحن",
    accent: "منصة فلسطينية من غزة"
  };
  
  const heroDesc = "كنعان منصة فلسطينية من غزة، تعمل بشغف لتقديم منتجات أصيلة تحكي حكاية أرضنا وتراثنا.";

  return (
    <section 
      className="relative w-full h-screen min-h-[600px] flex items-center overflow-hidden bg-center bg-cover bg-no-repeat m-0 p-0 border-none box-border select-none"
      style={{ backgroundImage: "url('/assets/herophoto.jpeg')" }}
    >
      <div 
        className="absolute inset-0 z-[1]" 
        style={{ background: "linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 100%)" }}
      />
      
      <div className="relative z-[2] max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col justify-center h-full text-right items-start pt-[80px]">
        <HeroContent title={heroTitle} description={heroDesc} />
        <div className="mt-4">
          <Button href="#our-story" variant="secondary" className="text-sm">
            اكتشف قصتنا
          </Button>
        </div>
      </div>
    </section>
  );
};

const StorySection = () => (
  <section id="our-story" className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      
      <div className="lg:col-span-7 space-y-4 text-right">
        <div className="flex items-center gap-2 text-[#2a6c2d] font-bold text-lg">
          <Leaf className="w-5 h-5 stroke-[2.5]" />
          <h2 className="font-extrabold text-base tracking-wide">عن كنعان</h2>
        </div>
        <h3 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-snug">
          منصة إلكترونية تضع دعم غزة في مقدمة أولوياتها
        </h3>
        <div className="space-y-4 text-gray-600 leading-relaxed text-base font-light">
          <p>
            انطلقت منصة كنعان من قلب قطاع غزة بهدف أساسي وهو دعم المنتج المحلي، وتمكين الحرفيين وأصحاب المشاريع الصغيرة، والحفاظ على الهوية الثقافية والتراث الفلسطيني الأصيل من الاندثار.
          </p>
          <p>
            نؤمن في كنعان بأن خلف كل منتج يُصنع يدويًا قصة كفاح، هوية، وصمود. نسعى جاهدين لربط هذه المنتجات المميزة بالأسواق المحلية والعالمية بأفضل صورة وبأعلى كفاءة تكنولوجية ممكنة تتناسب مع تحديات البنية التحتية.
          </p>
        </div>
      </div>

      <div className="lg:col-span-5 flex justify-center">
        <div className="relative w-full max-w-[460px] aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-gray-100">
          <img 
            src="/assets/thobe-product.png"
            alt="التراث والهوية الفلسطينية" 
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
);

const VisionMissionSection = () => (
  <section className="bg-white border-y border-gray-100 py-16">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="flex items-center justify-center gap-2 text-[#2a6c2d] font-bold text-2xl mb-12 text-center">
         <Leaf className="w-5 h-5 stroke-[2.5]" />
        <h2 className="font-extrabold ">رؤيتنا ورسالتنا</h2>
      </div>

      {/* شبكة العرض */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* كارد الرؤية  */}
        <div className="bg-[#f5f2e9] border border-[#2a6c2d]/15 p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-all duration-300">
          <div className="w-12 h-12 bg-[#2a6c2d]/15 text-[#2a6c2d] rounded-full flex items-center justify-center mb-4 shrink-0 shadow-sm">
            <Eye className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3">رؤيتنا</h3>
          <p className="text-sm text-gray-700 leading-relaxed font-normal max-w-sm">
            أن نكون المنصة الرقمية الرائدة والأولى عالميًا في دعم وتسويق المنتجات الفلسطينية الغزية، مساهمين في نقل الهوية الوطنية لكل منزل حول العالم وبناء اقتصاد محلي رقمي مرن ومستدام.
          </p>
        </div>

        {/* كارد الرسالة - ممركّز بالكامل ومغمق بلون دافئ متناسق ليبرز عن البيج والأبيض */}
        <div className="bg-[#f5f2e9] border border-[#2a6c2d]/15 p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-all duration-300">
          <div className="w-12 h-12 bg-[#2a6c2d]/15 text-[#2a6c2d] rounded-full flex items-center justify-center mb-4 shrink-0 shadow-sm">
            <Compass className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-3">رسالتنا</h3>
          <p className="text-sm text-gray-700 leading-relaxed font-normal max-w-sm">
            تمكين الحرفيين، المزارعين، والنساء صاحبات المشاريع المنزلية والإنتاجية في غزة من الوصول الآمن والسهل لأسواق أوسع، وتعزيز ركائز الاقتصاد المحلي من خلال توفير نافذة تسوق سلسة وموفرة للبيانات.
          </p>
        </div>

      </div>
    </div>
  </section>
);

const WhyChooseUs = () => {
  const features = [
    {
      icon: PackageCheck,
      title: "منتجات فلسطينية",
      description: "مجموعة مختارة من المنتجات الأصيلة من غزة وفلسطين تعكس هويتنا وتراثنا."
    },
    {
      icon: Gift,
      title: "دعم مباشر للحرفيين",
      description: "نضمن وصول دعمك مباشرة لأصحاب المشاريع، العائلات المنتجة، والحرفيين."
    },
    {
      icon: ShieldCheck,
      title: "جودة مضمونة",
      description: "نختار منتجاتنا بعناية فائقة ومعايير عالية لضمان أفضل جودة تليق بكم."
    },
    {
      icon: Truck,
      title: "توصيل سريع وآمن",
      description: "نوفر تجربة تسوق سهلة، سلسة، وآمنة مع خيارات توصيل موثوقة."
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
      <div className="flex items-center justify-center gap-2 text-[#2a6c2d] font-bold text-2xl mb-12 text-center">
        <Leaf className="w-5 h-5 stroke-[2.5]" />
        <h2 className="font-extrabold">لماذا تختار كنعان؟</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={index} 
              className="bg-[#f5f2e9] border border-gray-300/70 rounded-2xl p-6 text-center shadow-md hover:border-[#2a6c2d]/40 hover:shadow-lg transition-all duration-200 flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-[#2a6c2d]/15 text-[#2a6c2d] rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <IconComponent className="w-6 h-6 stroke-[2]" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
const AboutPage = () => {
  return (
    <div className="w-full bg-[#fcfbf7] text-gray-800" dir="rtl">
      
      <HeroSection />
      <StorySection />
      <VisionMissionSection />
      <WhyChooseUs />
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-l from-[#1b431e] to-[#2a6c2d] rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-md">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h2 className="text-xl md:text-2xl font-bold leading-tight">
              كن جزءاً من دعم وتعزيز المنتج الفلسطيني
            </h2>
            <p className="text-emerald-100 text-xs md:text-sm font-light">
              تسوق الآن وساهم بفعالية في تمكين عائلاتنا وحرفيينا المبدعين في قطاع غزة وتحفيز عجلة الاقتصاد الداخلي.
            </p>
            <div className="pt-3">
              <Button href="/products" variant="success">
                تصفح المنتجات المميزة
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;