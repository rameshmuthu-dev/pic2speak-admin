import React from 'react';
import { isCharacterType } from '../../utils/mapCalculations.js';

const AssetModal = ({ isOpen, targetCategory, newAssetForm, isUploading, onClose, onSubmit, onFormChange, onFileChange, onWalkFramesChange, onRemoveWalkFrame, onStepSoundChange, onRemoveStepSound }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <h3 className="text-sm font-bold">Add Object to "{targetCategory}"</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Object Name / Label</label>
            <input type="text" required placeholder="e.g., Tree 01, Main School" value={newAssetForm.label} onChange={(e) => onFormChange('label', e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Upload PNG / JPEG Image</label>
            <input type="file" accept="image/png, image/jpeg" onChange={onFileChange} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer" />
          </div>
          {newAssetForm.src && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img src={newAssetForm.src} alt="Preview" className="w-10 h-10 object-contain bg-white p-1 rounded-lg border border-slate-200" />
              <span className="text-xs font-medium text-slate-600 truncate">Image loaded — {newAssetForm.width}×{newAssetForm.height}px</span>
            </div>
          )}
          {isCharacterType(targetCategory) && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Walk Cycle Frames <span className="text-slate-400 font-normal">(optional — 2 to 8 poses)</span></label>
              <div className="flex gap-2 flex-wrap mb-2">
                {(newAssetForm.walkFrames || []).map((frameSrc, idx) => (
                  <div key={idx} className="relative w-14 h-14 shrink-0">
                    <img src={frameSrc} alt={`Frame ${idx + 1}`} className="w-full h-full object-contain bg-slate-50 border border-slate-200 rounded-lg p-1" />
                    <button type="button" onClick={() => onRemoveWalkFrame(idx)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center cursor-pointer">✕</button>
                  </div>
                ))}
                {(newAssetForm.walkFrames || []).length < 8 && (
                  <label className="w-14 h-14 shrink-0 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:border-teal-400 hover:text-teal-600 cursor-pointer text-xl">
                    +<input type="file" accept="image/png, image/jpeg" multiple onChange={onWalkFramesChange} className="hidden" />
                  </label>
                )}
              </div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 mt-3">Footstep Sound <span className="text-slate-400 font-normal">(optional)</span></label>
              {newAssetForm.stepSound ? (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <audio src={newAssetForm.stepSound} controls className="h-8 flex-1" />
                  <button type="button" onClick={onRemoveStepSound} className="w-6 h-6 shrink-0 bg-red-500 hover:bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center cursor-pointer">✕</button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-1.5 w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-teal-400 hover:text-teal-600 cursor-pointer text-xs font-semibold">
                  <span>🔊</span> Upload footstep sound<input type="file" accept="audio/*" onChange={onStepSoundChange} className="hidden" />
                </label>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Cancel</button>
            <button type="submit" disabled={isUploading || !newAssetForm.src} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 cursor-pointer">{isUploading ? 'Uploading…' : 'Add Object'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;
