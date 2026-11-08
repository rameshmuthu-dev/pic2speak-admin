import React from 'react';

const MapBuilderHeader = ({
  languages = [],
  activeLanguage = '',
  publishedSlotsForActiveLang = 0,
  totalBuildingSlots = 0,
  isLeftPanelOpen = false,
  isRightPanelOpen = false,
  isWalking = false,
  isAtFinalStop = false,
  walkPoints = [],
  currentWalkStopNumber = 1,
  totalWalkStops = 1,
  isEditMode = false,
  isSaving = false,
  onManageLanguages,
  onLanguageChange,
  onToggleLeftPanel,
  onToggleRightPanel,
  onTestWalk,
  onOpenPreview,
  onToggleEditMode,
  onSave
}) => {
  const walkProgressLabel = `${currentWalkStopNumber}/${totalWalkStops}`;

  return (
    <header className="bg-white border-b border-slate-200 px-2 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between shrink-0 gap-1 sm:gap-3 w-full min-w-0">
      {/* Left controls: Language Management */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={onManageLanguages}
          className="px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] sm:text-xs font-semibold border border-slate-200 cursor-pointer flex items-center gap-1 shrink-0"
          title="Manage languages"
        >
          <span>🌐</span>
          <span className="hidden xs:inline">Languages</span>
        </button>
        <select
          value={activeLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-white text-slate-700 rounded-lg text-[11px] sm:text-xs font-semibold border border-slate-200 cursor-pointer focus:outline-none focus:border-teal-500 max-w-[90px] xs:max-w-[120px] sm:max-w-none truncate"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg shrink-0">
          <span className="text-[11px] font-bold text-teal-700">Published:</span>
          <span className="text-xs font-bold text-teal-900">{publishedSlotsForActiveLang}/{totalBuildingSlots}</span>
        </div>
      </div>

      {/* Right controls: Editor actions */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
        {/* Mobile & Tablet Tools Drawer Button */}
        <button
          onClick={onToggleLeftPanel}
          className={`lg:hidden px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border cursor-pointer shrink-0 transition-colors ${
            isLeftPanelOpen
              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle tools panel"
        >
          Tools
        </button>

        {/* Mobile & Tablet Properties Drawer Button */}
        <button
          onClick={onToggleRightPanel}
          className={`lg:hidden px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border cursor-pointer shrink-0 transition-colors ${
            isRightPanelOpen
              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle properties panel"
        >
          Props
        </button>

        {/* Test Walk */}
        <button
          onClick={onTestWalk}
          disabled={walkPoints.length < 2}
          className="px-2 py-1 sm:px-3 sm:py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-[11px] sm:text-xs font-semibold border border-amber-600 cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
          title={`Test walk animation (${walkProgressLabel})`}
        >
          {isWalking
            ? (isAtFinalStop ? `🏁 Done` : `🚶 Walking...`)
            : `🚶 Walk`}
          <span className="hidden sm:inline"> ({walkProgressLabel})</span>
        </button>

        {/* Preview */}
        <button
          onClick={onOpenPreview}
          className="px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-[11px] sm:text-xs font-semibold border border-slate-800 cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
          title="Preview map"
        >
          👁️ <span className="hidden xs:inline">Preview</span>
        </button>

        {/* Mode Toggle */}
        <button
          onClick={onToggleEditMode}
          className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border cursor-pointer shrink-0 whitespace-nowrap ${
            isEditMode
              ? 'bg-teal-600 text-white border-teal-600'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          {isEditMode ? '↩️ Cancel' : '✏️ Edit'}
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          disabled={isSaving || !isEditMode}
          className="px-2.5 py-1 sm:px-4 sm:py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-[11px] sm:text-xs font-bold border border-teal-700 cursor-pointer shadow-sm shrink-0 whitespace-nowrap"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </header>
  );
};

export default MapBuilderHeader;
