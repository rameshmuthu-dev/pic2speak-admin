import React, { useEffect, useRef } from 'react';

const BackgroundPanel = ({ customThemes, bgSections, selectedThemeKey, onSetSelectedThemeKey, onOpenBgModal, onDeleteTheme, onAddBgSection, onRemoveBgSection, onChangeSectionTheme }) => {
  const swatchListRef = useRef(null);
  const selectedSwatchRef = useRef(null);

  useEffect(() => {
    if (selectedSwatchRef.current && swatchListRef.current) {
      selectedSwatchRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedThemeKey, customThemes]);

  return (
    <div className="mb-5 pb-4 border-b border-slate-200 bg-slate-50/70 p-3 rounded-2xl">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Background Layout</span>
        <button
          onClick={onOpenBgModal}
          className="px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold cursor-pointer"
        >
          + Add Grass/Bg
        </button>
      </div>

      <div ref={swatchListRef} className="grid grid-cols-2 gap-2 mb-3 max-h-40 overflow-y-auto pr-1 -mr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        {Object.entries(customThemes).map(([key, themeVal]) => {
          const isSelected = selectedThemeKey === key;
          const canDelete = Object.keys(customThemes).length > 1;
          return (
            <div key={key} ref={isSelected ? selectedSwatchRef : null} className="relative">
              <button
                onClick={() => onSetSelectedThemeKey(key)}
                className={`w-full p-2 rounded-xl border flex items-center gap-2 text-left transition cursor-pointer ${
                  isSelected ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-500/20 font-bold' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-4 h-4 rounded-md border border-black/10 shrink-0 flex items-center justify-center text-[9px] text-white font-black overflow-hidden" style={{ backgroundColor: themeVal.color || '#599824' }}>
                  {themeVal.image ? <img src={themeVal.image} className="w-full h-full object-cover" /> : '✓'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] truncate text-slate-700">{themeVal.label || key}</p>
                </div>
              </button>
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTheme(key);
                  }}
                  title="Remove this background from the list"
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full text-[9px] leading-none font-bold flex items-center justify-center shadow-sm cursor-pointer z-10"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onAddBgSection}
        className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
      >
        <span>➕</span> Add New Background Section
      </button>

      <div className="mt-3 pt-3 border-t border-slate-200">
        <span className="text-[11px] font-bold text-slate-700 uppercase block mb-2">
          Sections on Map ({bgSections.length})
        </span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 -mr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {bgSections.map((sec, idx) => (
            <div key={sec.id} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1.5">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <select
                value={sec.themeKey}
                onChange={(e) => onChangeSectionTheme(sec.id, e.target.value)}
                className="flex-1 min-w-0 text-[10px] border border-slate-200 rounded-lg px-1.5 py-1 bg-slate-50 cursor-pointer"
              >
                {Object.entries(customThemes).map(([key, val]) => (
                  <option key={key} value={key}>{val.label || key}</option>
                ))}
              </select>
              <span
                title="Height is fixed to the first section's original size"
                className="w-14 shrink-0 text-[10px] text-right text-slate-500 px-1 py-1"
              >
                {Math.round(sec.height)}px
              </span>
              {bgSections.length > 1 && (
                <button
                  onClick={() => onRemoveBgSection(sec.id)}
                  title="Remove this section"
                  className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center cursor-pointer shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackgroundPanel;