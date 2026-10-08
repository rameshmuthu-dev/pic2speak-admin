import React from 'react';

const BackgroundModal = ({ isOpen, newBgForm, isUploading, isDragActive, onClose, onSubmit, onFormChange, onFileChange, onDragOver, onDragLeave, onDrop }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="text-sm font-bold">Add Grass Texture / Background</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Background Name</label>
            <input type="text" required placeholder="e.g., Grass Texture" value={newBgForm.label} onChange={(e) => onFormChange('label', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Grass Texture Image</label>
            <label onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`flex flex-col items-center justify-center gap-1 w-full py-6 px-3 border-2 border-dashed rounded-xl cursor-pointer transition ${isDragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/40'}`}>
              <input type="file" accept="image/png, image/jpeg" onChange={onFileChange} className="hidden" />
              {newBgForm.image ? (
                <>
                  <img src={newBgForm.image} alt="Preview" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                  <span className="text-[10px] font-semibold text-teal-700 mt-1">Image loaded — click or drop to replace</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🖼️</span>
                  <span className="text-xs font-semibold text-slate-600">Drag & drop image here</span>
                  <span className="text-[10px] text-slate-400">or click to browse (PNG / JPEG)</span>
                </>
              )}
            </label>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Background Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={newBgForm.color || '#599824'} onChange={(e) => onFormChange('color', e.target.value)} className="w-12 h-10 rounded-xl border border-slate-200 cursor-pointer p-0 bg-transparent shrink-0" />
              <input type="text" value={newBgForm.color || '#599824'} onChange={(e) => onFormChange('color', e.target.value)} placeholder="#599824" className="flex-1 px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button type="submit" disabled={isUploading} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 cursor-pointer">{isUploading ? 'Uploading…' : 'Add Background'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BackgroundModal;
