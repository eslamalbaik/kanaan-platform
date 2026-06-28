import React from 'react';
import { Truck, HandHeart, MapPin, BadgeCheck } from "lucide-react";
import TrustCard from '../../molecules/TrustCard/TrustCard';

export default function TrustBadges() {
  const badges = [
    { icon: <HandHeart  color="#1f4d1f" />, text: "دعم للأسر المنتجة" },
    { icon: <Truck color="#1f4d1f" />, text: "توصيل داخل غزة" },
    { icon: <MapPin color="#1f4d1f" />, text: "منتجات محلية ١٠٠٪" },
    { icon: <BadgeCheck color="#1f4d1f" />, text: "جودة مضمونة" },
  ];

  return (
    <section className="bg-gradient-to-b from-[#eee6da] to-white py-16 md:py-24 my-16 md:my-24">
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-7" dir="rtl">
        {badges.map((badge, index) => (
          <TrustCard key={index} icon={badge.icon} text={badge.text} />
        ))}
      </div>
    </section>
  );
}