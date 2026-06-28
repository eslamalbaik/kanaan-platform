import React from 'react';
import { createPortal } from 'react-dom'; 
import { FiAlertTriangle } from 'react-icons/fi';
import { LuX } from 'react-icons/lu';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "نعم، متأكد"
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity" dir="rtl">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-[#eae6dc] transform transition-all scale-100 flex flex-col gap-4 text-right">
        
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-50 cursor-pointer"
        >
          <LuX size={18} />
        </button>

        <div className="flex items-center gap-3 mt-2">
          <div className="p-2.5 rounded-xl bg-[#d42323]/10 text-[#d42323]">
            <FiAlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#d42323] hover:bg-[#ad0505] transition-colors cursor-pointer"
          >
            {confirmText}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            تراجع وإلغاء
          </button>
        </div>

      </div>
    </div>,
    document.body 
  );
}