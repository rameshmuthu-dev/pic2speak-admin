import React from 'react';

const CategoryModal = ({ isOpen, newCategoryName, onClose, onSubmit, onNameChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="text-sm font-bold">Create New Category</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name</label>
            <input type="text" required placeholder="e.g., Trees, Vehicles" value={newCategoryName} onChange={(e) => onNameChange(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 cursor-pointer">Create Category</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
