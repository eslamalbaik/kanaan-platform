import React from 'react';
import { LuPencil, LuTrash2 } from 'react-icons/lu';
import { getIconComponent } from '../../../utils/iconHelper';

export default function CategoryList({ categories, onEdit, onDelete }) {
  return (
    <section className="categories-list-section">
      <div className="section-title-wrapper">
        <h2>التصنيفات الحالية بالمنصة</h2>
        <span className="count-badge">{categories.length} أقسام</span>
      </div>

      <div className="w-full overflow-x-auto border border-[#eae6dc]/60 rounded-xl">
        <table className="w-full text-right border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#eae6dc] text-xs font-bold text-gray-500 bg-gray-50/50">
              <th className="p-3 text-center w-[60px]">الأيقونة</th>
              <th className="p-3 min-w-[150px]">معرف التصنيف</th>
              <th className="p-3 min-w-[120px]">اسم التصنيف</th>
              <th className="p-3 min-w-[200px]">الوصف</th>
              <th className="p-3 min-w-[180px]">الخصائص وقيمها الشاملة</th>
              <th className="p-3 min-w-[100px]">Slug</th>
              <th className="p-3 min-w-[110px]">تاريخ الإنشاء</th>
              <th className="p-3 text-center w-[90px]">إجراءات التحكم</th>
            </tr>
          </thead>

          <tbody className="text-sm divide-y divide-[#eae6dc]/40">
            {categories.map((category) => {
              const Icon = getIconComponent(category.icon);
              return (
                <tr key={category._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-3 text-center text-gray-600">
                    <div className="flex justify-center items-center"><Icon size={18} /></div>
                  </td>
                  <td className="p-3 font-mono text-xs text-gray-400 select-all whitespace-nowrap">{category._id}</td>
                  <td className="p-3 font-bold text-[#1a3a1a] whitespace-nowrap">{category.name}</td>
                  <td className="p-3 text-gray-500 text-xs leading-relaxed whitespace-normal break-words">
                    {category.description || <span className="text-gray-300 italic">لا يوجد وصف مضاف</span>}
                  </td>
                  
                  <td className="p-3 text-xs">
                    <div className="flex flex-col gap-1.5">
                      {category.attributes && category.attributes.length > 0 ? (
                        category.attributes.map((attr, idx) => (
                          <div key={idx} className="flex flex-col gap-0.5 bg-emerald-50/40 p-1.5 rounded border border-emerald-100">
                            <span className="text-emerald-800 text-[11px] font-bold">
                              {attr.name} {attr.required ? '*' : ''} ({attr.type})
                            </span>
                            {attr.isSelectable && <span className="text-[10px] text-blue-600 font-semibold">🔹 مخصصة كفلتر</span>}
                            {attr.type === 'array' && attr.options && (
                              <span className="text-[10px] text-gray-500 font-mono">[{attr.options.join(', ')}]</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-300 italic text-[11px]">لا يوجد خصائص ديناميكية</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 text-gray-600 font-mono text-xs font-medium whitespace-nowrap">{category.slug}</td>
                  <td className="p-3 text-gray-400 text-xs whitespace-nowrap">{category.createdAt}</td>
                  <td className="p-3 text-center">
                    <div className="actions-flex">
                      <button type="button" onClick={() => onEdit(category)} className="action-btn edit" title="تعديل التصنيف"><LuPencil size={14} /></button>
                      <button type="button" onClick={() => onDelete(category._id)} className="action-btn delete" title="حذف التصنيف"><LuTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}