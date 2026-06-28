import React from 'react';
import BadgeIcon from '../../atoms/BadgeIcon/BadgeIcon';

export default function TrustCard({ icon, text }) {
  return (
    <div className="group flex items-center justify-center gap-3 bg-gradient-to-br from-[#eef6ee] to-white p-6 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_35px_rgba(0,0,0,0.12)] transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 cursor-pointer w-full">
      <div className="transition-transform duration-300 ease-in-out group-hover:scale-115">
        <BadgeIcon icon={icon} />
      </div>

      <span className="text-[16px] md:text-[18px] text-[#1b3d1b] font-medium text-center">
        {text}
      </span>
    </div>
  );
}