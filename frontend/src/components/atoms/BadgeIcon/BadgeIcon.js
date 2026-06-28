import React from 'react';

export default function BadgeIcon({ icon }) {
  return (
    <div className="badge-icon-wrapper w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#dcefdc] rounded-full p-2.5 sm:p-3.5 md:p-4 
    shadow-[0_6px_15px_rgba(45,106,45,0.15)] transition-transform duration-300 ease-in-out flex items-center justify-center shrink-0">
      
      <div className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
        {icon}
      </div>

    </div>
  );
}