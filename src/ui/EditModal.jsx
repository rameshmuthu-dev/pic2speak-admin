import React from 'react';
import { X, Save, AlertCircle, PlusCircle } from 'lucide-react';

const EditModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  title, 
  children, 
  loading, 
  error,
  saveText = "Save Changes" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* FIX: Added 'max-h-[90vh]' and 'flex flex-col' to the container 
         to ensure it never goes off-screen 
      */}
      <div 
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden transform animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Header - Stays Fixed at Top */}
        <div className="flex justify-between items-center p-6 border-b border-slate-50 bg-slate-50/50 flex-shrink-0">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - This section will now scroll if content is long */}
        <div className="p-8 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold animate-pulse mb-4">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          
          <div className="space-y-4">
            {children}
          </div>
        </div>

        {/* Footer - Stays Fixed at Bottom */}
        <div className="p-6 bg-slate-50/50 flex gap-3 border-t border-slate-50 flex-shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-white transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onSave}
            disabled={loading}
            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-teal-600 shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                {saveText.toLowerCase().includes('create') ? <PlusCircle size={14}/> : <Save size={14}/>}
                {saveText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;