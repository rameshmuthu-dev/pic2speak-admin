import React from 'react';

const MapBuilderHeader = ({
  activeTool,
  languages,
  activeLanguage,
  publishedSlotsForActiveLang,
  totalBuildingSlots,
  isLeftPanelOpen,
  isRightPanelOpen,
  isWalking,
  isAtFinalStop,
  walkPoints,
  currentWalkStopNumber,
  totalWalkStops,
  isEditMode,
  onManageLanguages,
  onToggleLeftPanel,
  onToggleRightPanel,
  onTestWalk,
  onOpenPreview,
  onToggleEditMode,
  onSave
}) => {
  const walkProgressLabel = `${currentWalkStopNumber}/${totalWalkStops}`;

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={onManageLanguages} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer">
            🌐 Languages
          </button>
          <select
            value={activeLanguage}
            onChange={(e) => {
              window.location.href = `/map-builder?lang=${e.target.value}`;
            }}
            className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer focus:outline-none focus:border-teal-500"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg">
          <span className="text-[11px] font-bold text-teal-700">Published Lessons:</span>
          <span className="text-xs font-bold text-teal-900">{publishedSlotsForActiveLang} / {totalBuildingSlots}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button onClick={onToggleLeftPanel} className={`lg:hidden px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer shrink-0 ${isLeftPanelOpen ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-200'}`}>
          Tools
        </button>
        <button onClick={onToggleRightPanel} className={`lg:hidden px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer shrink-0 ${isRightPanelOpen ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-200'}`}>
          Props
        </button>
        <button onClick={onTestWalk} disabled={walkPoints.length < 2} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold border border-amber-600 cursor-pointer shadow-sm shrink-0">
          {isWalking
            ? (isAtFinalStop ? `🏁 Done (${walkProgressLabel})` : `🚶 Walking... (${walkProgressLabel})`)
            : `🚶 Test Walk (${walkProgressLabel})`}
        </button>
        <button onClick={onOpenPreview} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold border border-slate-800 cursor-pointer shadow-sm shrink-0">
          👁️ Preview
        </button>
        <button onClick={onToggleEditMode} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer shrink-0 ${isEditMode ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-200 text-slate-700 border-slate-300'}`}>
          {isEditMode ? '✏️ Edit' : '👁️ View'}
        </button>
        <button onClick={onSave} className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold border border-teal-700 cursor-pointer shadow-md shadow-teal-600/20 shrink-0">
          Save
        </button>
      </div>
    </header>
  );
};

export default MapBuilderHeader;