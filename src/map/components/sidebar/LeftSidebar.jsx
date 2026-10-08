import React from 'react';
import PathToolsPanel from './PathToolsPanel.jsx';
import BackgroundPanel from './BackgroundPanel.jsx';
import AssetCategoriesPanel from './AssetCategoriesPanel.jsx';

const LeftSidebar = ({
  isOpen,
  isEditMode,
  onClose,
  activeTool,
  activeLayer,
  customThemes,
  bgSections,
  selectedThemeKey,
  categoriesList,
  customAssetsList,
  activeRoad,
  mapItems,
  onSetActiveTool,
  onSetActiveLayer,
  onSetSelectedThemeKey,
  onUndoLastPoint,
  onSelectNextPoint,
  onUpdateRoadWidth,
  onUpdateRoadDash,
  onUpdateRoadColor,
  onClearRoadPoints,
  onDeleteRoad,
  onOpenBgModal,
  onDeleteTheme,
  onAddBgSection,
  onRemoveBgSection,
  onChangeSectionTheme,
  onAddLessonCard,
  onSetAllLayers,
  onOpenCategoryModal,
  onOpenAssetModal,
  onAddAssetToMap,
  onDeleteAsset,
  onScrollAssetRow,
  setSelectedId,
  setActiveTool,
  setIsRightPanelOpen
}) => {
  return (
    <div className={`
      fixed lg:relative inset-y-0 left-0 z-40 w-full max-w-xs sm:w-80 lg:w-auto bg-white border-r border-slate-200 p-4 overflow-y-auto flex flex-col justify-between transition-transform duration-200
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${!isEditMode ? 'opacity-60 pointer-events-none select-none' : ''}
    `}>
      <div className="flex items-center justify-between pb-3 mb-2 lg:hidden border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">Path Tools & Assets</h3>
        <button onClick={onClose} className="text-slate-500 font-bold p-1">✕</button>
      </div>
      {!isEditMode && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold lg:hidden">
          Click "Edit" to make changes
        </div>
      )}

      <div className="flex flex-col justify-between h-full">
        <div>
          <PathToolsPanel
            activeTool={activeTool}
            activeRoad={activeRoad}
            onSetActiveTool={onSetActiveTool}
            onSetActiveLayer={onSetActiveLayer}
            onDeleteRoad={onDeleteRoad}
            onUndoLastPoint={onUndoLastPoint}
            onSelectNextPoint={onSelectNextPoint}
            onUpdateRoadWidth={onUpdateRoadWidth}
            onUpdateRoadDash={onUpdateRoadDash}
            onUpdateRoadColor={onUpdateRoadColor}
            onClearRoadPoints={onClearRoadPoints}
          />

          <BackgroundPanel
            customThemes={customThemes}
            bgSections={bgSections}
            selectedThemeKey={selectedThemeKey}
            onSetSelectedThemeKey={onSetSelectedThemeKey}
            onOpenBgModal={onOpenBgModal}
            onDeleteTheme={onDeleteTheme}
            onAddBgSection={onAddBgSection}
            onRemoveBgSection={onRemoveBgSection}
            onChangeSectionTheme={onChangeSectionTheme}
          />

          <AssetCategoriesPanel
            categoriesList={categoriesList}
            customAssetsList={customAssetsList}
            activeLayer={activeLayer}
            onSetActiveLayer={onSetActiveLayer}
            onAddLessonCard={onAddLessonCard}
            onSetAllLayers={onSetAllLayers}
            onOpenCategoryModal={onOpenCategoryModal}
            onOpenAssetModal={onOpenAssetModal}
            onAddAssetToMap={onAddAssetToMap}
            onDeleteAsset={onDeleteAsset}
            onScrollAssetRow={onScrollAssetRow}
            mapItems={mapItems}
            setSelectedId={setSelectedId}
            setActiveTool={setActiveTool}
            setIsRightPanelOpen={setIsRightPanelOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;