import React from 'react';
import { isCharacterType } from '../../utils/mapCalculations.js';
import { getItemContent } from '../../utils/languageUtils.js';

const ObjectPropertiesPanel = ({ selectedItem, activeLanguage, languages, lessonOptions, mapItems, lockAspect, onUpdateItemField, onSelectLessonForCard, onToggleLockAspect, onCloneItem, onDeleteItem, onAddWalkFrame, onRemoveWalkFrame, onSetStepSound, onRemoveStepSound, uploadFileToServer }) => {
  if (!selectedItem) {
    return (
      <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
        <p className="text-xs text-slate-400 italic">Select any item on canvas to edit properties.</p>
      </div>
    );
  }

  const selectedItemLangContent = getItemContent(selectedItem, activeLanguage);

  return (
    <div className="mb-6 p-4 bg-teal-50/70 border border-teal-200 rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
          Object ({selectedItem.type || 'Building'})
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCloneItem(selectedItem.id)}
            className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold cursor-pointer shadow-xs"
          >
            Clone
          </button>
          <button
            onClick={() => onDeleteItem(selectedItem.id)}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-[10px] font-bold cursor-pointer shadow-xs"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {(selectedItem.type || '') === 'Lesson Cards' ? (
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="block text-[10px] font-semibold text-slate-600">
                Lesson ({languages.find(l => l.code === activeLanguage)?.name || activeLanguage})
              </label>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                  selectedItemLangContent?.published
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}
              >
                {selectedItemLangContent?.published ? '✅ Published' : '🔒 Not translated'}
              </span>
            </div>
            <select
              value={selectedItem.lessonMasterId || ''}
              onChange={(e) => onSelectLessonForCard(selectedItem.id, e.target.value || null)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-teal-500"
            >
              <option value="">Select a lesson</option>
              {lessonOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {`Lesson ${opt.order}${opt.title ? ' — ' + opt.title : ' (untranslated)'}`}
                </option>
              ))}
            </select>
            <p className="text-[9px] text-slate-400 mt-1 leading-snug">
              The lesson title is pulled automatically from the selected lesson's content for {languages.find(l => l.code === activeLanguage)?.name || activeLanguage}. This card stays where you drag it.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Lesson Order</label>
                <input
                  type="number"
                  min="1"
                  value={selectedItem.order || 1}
                  onChange={(e) => onUpdateItemField(selectedItem.id, 'order', Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Map Ends At (Y)</label>
                <input
                  type="number"
                  min="80"
                  value={Math.round(selectedItem.revealHeight || selectedItem.y + (selectedItem.height || 72) + 80)}
                  onChange={(e) => onUpdateItemField(selectedItem.id, 'revealHeight', Math.max(80, Number(e.target.value) || 80))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
                />
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Linked Building</label>
              <select
                value={selectedItem.buildingId || ''}
                onChange={(e) => onUpdateItemField(selectedItem.id, 'buildingId', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="">Select building</option>
                {mapItems.filter((item) => item.type === 'Buildings').map((building) => (
                  <option key={building.id} value={building.id}>{building.label || `Building ${building.id}`}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Label</label>
            <input
              type="text"
              value={selectedItem.label || ''}
              onChange={(e) => {
                const val = e.target.value;
                onUpdateItemField(selectedItem.id, 'label', val);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-teal-500"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">X</label>
            <input
              type="number"
              value={Math.round(selectedItem.x)}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateItemField(selectedItem.id, 'x', val);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Y</label>
            <input
              type="number"
              value={Math.round(selectedItem.y)}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateItemField(selectedItem.id, 'y', val);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Rotation (°)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={Math.round(((selectedItem.rotation || 0) % 360 + 360) % 360)}
              onChange={(e) => onUpdateItemField(selectedItem.id, 'rotation', Number(e.target.value))}
              className="flex-1 accent-teal-600 cursor-pointer"
            />
            <input
              type="number"
              value={Math.round(((selectedItem.rotation || 0) % 360 + 360) % 360)}
              onChange={(e) => onUpdateItemField(selectedItem.id, 'rotation', Number(e.target.value))}
              className="w-16 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800 shrink-0"
            />
          </div>
          <div className="flex gap-1.5 mt-1.5">
            {[0, 90, 180, 270].map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => onUpdateItemField(selectedItem.id, 'rotation', deg)}
                className={`flex-1 py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${
                  Math.round(((selectedItem.rotation || 0) % 360 + 360) % 360) === deg
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-teal-200/70">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-600">Width &amp; Height</span>
            <button
              type="button"
              onClick={onToggleLockAspect}
              title="Keep Width and Height locked to the object's original proportions"
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition ${
                lockAspect
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {lockAspect ? '🔒' : '🔓'} Lock Aspect Ratio
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Width (px)</label>
              <input
                type="number"
                min="4"
                value={Math.round(selectedItem.width || 40)}
                onChange={(e) => onUpdateItemField(selectedItem.id, 'width', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Height (px)</label>
              <input
                type="number"
                min="4"
                value={Math.round(selectedItem.height || 40)}
                onChange={(e) => onUpdateItemField(selectedItem.id, 'height', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const w = selectedItem.width || 40;
              const h = selectedItem.height || 40;
              const side = Math.round((w + h) / 2);
              onUpdateItemField(selectedItem.id, 'width', side);
              onUpdateItemField(selectedItem.id, 'height', side);
            }}
            className="w-full mt-1.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200 transition cursor-pointer"
          >
            ⬛ Make Perfect Square
          </button>
          <p className="text-[9px] text-slate-400 mt-1 leading-snug">
            Width: {Math.round(selectedItem.width || 40)}px · Height: {Math.round(selectedItem.height || 40)}px ·{' '}
            {Math.round(selectedItem.width || 40) === Math.round(selectedItem.height || 40) ? 'Square ✅' : 'Not square ⚠️'}
          </p>
        </div>

      </div>

      {isCharacterType(selectedItem.type) && (
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-sm shrink-0">🚶</span>
            <div>
              <h4 className="text-xs font-bold text-slate-800 leading-tight">Walk Animation</h4>
              <p className="text-[9px] text-slate-400 leading-tight">Frames &amp; footstep sound for this character</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Walk Cycle Frames</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                (selectedItem.walkFrames || []).length >= 2 ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {(selectedItem.walkFrames || []).length}/8
              </span>
            </div>
            <p className="text-[9px] text-slate-400 mb-2 leading-snug">
              Add 2-8 walking-pose PNGs — "Test Walk" cycles through these instead of the static image above.
            </p>
            <div className="flex gap-2 flex-wrap">
              {(selectedItem.walkFrames || []).map((frameSrc, idx) => (
                <div key={idx} className="relative w-12 h-12 shrink-0">
                  <img src={frameSrc} alt={`Frame ${idx + 1}`} className="w-full h-full object-contain bg-white border border-slate-200 rounded-lg p-1" />
                  <span className="absolute -top-1 -left-1 w-4 h-4 bg-teal-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveWalkFrame(selectedItem.id, idx)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {(selectedItem.walkFrames || []).length < 8 && (
                <label className="w-12 h-12 shrink-0 border-2 border-dashed border-slate-300 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:border-teal-400 hover:text-teal-600 cursor-pointer text-lg transition">
                  +
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      e.target.value = '';
                      const remainingSlots = 8 - (selectedItem.walkFrames || []).length;
                      const filesToUpload = files.slice(0, remainingSlots);
                      try {
                        const urls = await Promise.all(filesToUpload.map((file) => uploadFileToServer(file)));
                        onAddWalkFrame(selectedItem.id, urls);
                      } catch (err) {
                        alert("Could not upload walk frames: " + (err?.response?.data?.message || err.message));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {(selectedItem.walkFrames || []).length === 1 && (
              <p className="text-[9px] text-amber-600 mt-2">Add at least one more frame so there's something to alternate between.</p>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Footstep Sound</span>
              {selectedItem.stepSound && (
                <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">✓ Added</span>
              )}
            </div>
            <p className="text-[9px] text-slate-400 mb-2 leading-snug">
              Plays once per step while this character is walking during Test Walk / Preview.
            </p>
            {selectedItem.stepSound ? (
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <audio src={selectedItem.stepSound} controls className="h-7 flex-1" />
                <button
                  type="button"
                  onClick={() => onRemoveStepSound(selectedItem.id)}
                  className="w-5 h-5 shrink-0 bg-red-500 hover:bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-1.5 w-full py-1.5 border-2 border-dashed border-slate-300 bg-white rounded-lg text-slate-400 hover:border-teal-400 hover:text-teal-600 cursor-pointer text-[10px] font-semibold transition">
                <span>🔊</span> Upload footstep sound
                <input
                  type="file"
                  accept="audio/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    e.target.value = '';
                    try {
                      const url = await uploadFileToServer(file);
                      onSetStepSound(selectedItem.id, url);
                    } catch (err) {
                      alert("Could not upload footstep sound: " + (err?.response?.data?.message || err.message));
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectPropertiesPanel;
