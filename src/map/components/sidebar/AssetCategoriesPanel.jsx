import React, { useRef, useCallback } from 'react';
import { sameCategory, isCharacterType } from '../../utils/mapCalculations.js';

const AssetCategoriesPanel = ({ categoriesList, customAssetsList, activeLayer, onSetActiveLayer, onAddLessonCard, onSetAllLayers, onOpenCategoryModal, onOpenAssetModal, onAddAssetToMap, onDeleteAsset, onScrollAssetRow, mapItems, setSelectedId, setActiveTool, setIsRightPanelOpen }) => {
  const assetRowRefs = useRef({});

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Object Layers & Categories</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddLessonCard}
            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
            title="Add a blank lesson card to the map"
          >
            + Add Card
          </button>
          <button
            onClick={onSetAllLayers}
            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer border ${activeLayer === 'All Layers' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
          >
            All Layers
          </button>
          <button
            onClick={onOpenCategoryModal}
            className="px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold cursor-pointer"
          >
            + Category
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {categoriesList.map((catName) => {
          const categoryItems = customAssetsList.filter(item => sameCategory(item.type, catName));
          return (
            <div
              key={catName}
              onClick={() => onSetActiveLayer(catName)}
              className={`border rounded-2xl p-3 shadow-sm cursor-pointer transition ${
                activeLayer === catName ? 'bg-teal-50/40 border-teal-500 ring-2 ring-teal-500/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${activeLayer === catName ? 'bg-teal-600' : 'bg-slate-300'}`}></span>
                  <span className={`text-xs font-bold ${activeLayer === catName ? 'text-teal-900' : 'text-slate-700'}`}>{catName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-semibold">{categoryItems.length}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAssetModal(catName);
                      onSetActiveLayer(catName);
                    }}
                    className="w-5 h-5 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {categoryItems.length === 0 ? (
                <div className="py-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                  <p className="text-[11px] text-slate-400 italic">No items added yet</p>
                </div>
              ) : (
                <div className="relative flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onScrollAssetRow(catName, -1);
                    }}
                    className="shrink-0 w-5 h-12 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-400 text-xs font-bold cursor-pointer shadow-xs"
                    title="Scroll left"
                  >
                    ‹
                  </button>

                  <div
                    ref={(el) => { assetRowRefs.current[catName] = el; }}
                    className="flex-1 flex gap-2 overflow-x-auto scroll-smooth scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5"
                  >
                    {categoryItems.map((asset) => (
                      <div key={asset.id} className="relative shrink-0 w-16 pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetActiveLayer(catName);
                            if (isCharacterType(catName)) {
                              const existing = mapItems.find((i) => isCharacterType(i.type));
                              if (existing) {
                                setSelectedId(existing.id);
                                setActiveTool('Select');
                                setIsRightPanelOpen(true);
                                return;
                              }
                            }
                            onAddAssetToMap(asset);
                          }}
                          title={isCharacterType(catName) ? `${asset.label} — edit on map` : asset.label}
                          className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex items-center justify-center hover:border-teal-500 hover:bg-teal-50/30 cursor-pointer transition"
                        >
                          <img src={asset.src} alt={asset.label} className="w-full h-full object-contain" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAsset(asset.id);
                          }}
                          title="Remove this asset from the list"
                          className="absolute top-0 right-0 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full text-[9px] leading-none font-bold flex items-center justify-center shadow-sm cursor-pointer z-10"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onScrollAssetRow(catName, 1);
                    }}
                    className="shrink-0 w-5 h-12 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-400 text-xs font-bold cursor-pointer shadow-xs"
                    title="Scroll right"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssetCategoriesPanel;
