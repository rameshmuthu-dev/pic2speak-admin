import React from 'react';
import { Pencil, Trash2, ArrowRight, Crown } from 'lucide-react';

const ItemCard = ({ item, onClick, onEdit, onDelete, titleKey = 'name', subtitle = 'Manage Items' }) => {
  const isPremium = item.isPremium || false;

  return (
    <div 
      onClick={onClick} 
      className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col relative"
    >
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        <img 
          src={item.thumbnail?.url} 
          alt={item[titleKey]} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
            className="p-2 bg-white/95 text-slate-600 rounded-xl shadow-md hover:text-teal-500 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(item); }} 
            className="p-2 bg-white/95 text-red-400 rounded-xl shadow-md hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isPremium && (
        <div className="absolute top-2 left-2 p-1.5 bg-amber-500 text-white rounded-xl shadow-lg z-10">
          <Crown size={14} />
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <h3 className="text-lg font-black text-slate-800 uppercase truncate">
          {item[titleKey]}
        </h3>
        <div className="mt-4 flex items-center text-[10px] font-black uppercase text-slate-400 group-hover:text-teal-500">
          {subtitle} <ArrowRight size={14} className="ml-1" />
        </div>
      </div>
    </div>
  );
};

export default ItemCard;