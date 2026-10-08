import React from 'react';
import PathPropertiesPanel from './PathPropertiesPanel.jsx';
import ObjectPropertiesPanel from './ObjectPropertiesPanel.jsx';
import MapSettingsPanel from './MapSettingsPanel.jsx';

const RightSidebar = ({
  isOpen,
  isEditMode,
  onClose,
  selectedItem,
  activeRoad,
  selectedPointIndex,
  mapItems,
  activeLanguage,
  languages,
  lessonOptions,
  lockAspect,
  onUpdateRoadName,
  onUpdateRoadWidth,
  onToggleRoadVisibility,
  onDeletePoint,
  onUpdatePoint,
  onUpdateItemField,
  onSelectLessonForCard,
  onToggleLockAspect,
  onCloneItem,
  onDeleteItem,
  onAddWalkFrame,
  onRemoveWalkFrame,
  onSetStepSound,
  onRemoveStepSound,
  uploadFileToServer,
  mapTitle,
  mapActive,
  onSetMapTitle,
  onToggleMapActive,
  onClearAll
}) => {
  return (
    <div className={`
      fixed lg:relative inset-y-0 right-0 z-40 w-full max-w-xs sm:w-80 lg:w-auto bg-white border-l border-slate-200 p-5 overflow-y-auto flex flex-col justify-between transition-transform duration-200
      ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      ${!isEditMode ? 'opacity-60 pointer-events-none select-none' : ''}
    `}>
      <div className="flex items-center justify-between pb-3 mb-2 lg:hidden border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">Properties & Settings</h3>
        <button onClick={onClose} className="text-slate-500 font-bold p-1">✕</button>
      </div>
      {!isEditMode && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold lg:hidden">
          Click "Edit" to make changes
        </div>
      )}
      
      <div className="flex flex-col justify-between h-full">
        <div>
          <PathPropertiesPanel
            activeRoad={activeRoad}
            selectedPointIndex={selectedPointIndex}
            onUpdateRoadName={onUpdateRoadName}
            onUpdateRoadWidth={onUpdateRoadWidth}
            onToggleRoadVisibility={onToggleRoadVisibility}
            onDeletePoint={onDeletePoint}
            onUpdatePoint={onUpdatePoint}
          />

          <ObjectPropertiesPanel
            selectedItem={selectedItem}
            activeLanguage={activeLanguage}
            languages={languages}
            lessonOptions={lessonOptions}
            mapItems={mapItems}
            lockAspect={lockAspect}
            onUpdateItemField={onUpdateItemField}
            onSelectLessonForCard={onSelectLessonForCard}
            onToggleLockAspect={onToggleLockAspect}
            onCloneItem={onCloneItem}
            onDeleteItem={onDeleteItem}
            onAddWalkFrame={onAddWalkFrame}
            onRemoveWalkFrame={onRemoveWalkFrame}
            onSetStepSound={onSetStepSound}
            onRemoveStepSound={onRemoveStepSound}
            uploadFileToServer={uploadFileToServer}
          />

          <MapSettingsPanel
            mapTitle={mapTitle}
            mapActive={mapActive}
            onSetMapTitle={onSetMapTitle}
            onToggleMapActive={onToggleMapActive}
            onClearAll={onClearAll}
          />
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <button onClick={onClearAll} className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition cursor-pointer">
            🗑️ Clear All Canvas Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
