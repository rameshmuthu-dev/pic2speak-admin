import React from 'react';
import { Stage, Layer, Group, Rect } from 'react-konva';
import BackgroundSection from '../canvas/BackgroundSection.jsx';
import CanvasItem from '../canvas/CanvasItem.jsx';
import LessonCard from '../canvas/LessonCard.jsx';
import RoadPath from '../canvas/RoadPath.jsx';

const PreviewModal = ({ 
  isOpen, 
  mapTitle, 
  activeLanguage, 
  languages, 
  bgSections, 
  customThemes, 
  roadPaths, 
  mapItems, 
  previewVisibleObjectItems, 
  previewVisibleLessonCards, 
  previewStageHeight, 
  containerWidth, 
  scale, 
  fallbackBgColor, 
  publishedSlotsForActiveLang, 
  totalBuildingSlots, 
  onClose, 
  onPublish 
}) => {
  if (!isOpen) return null;

  const currentLanguageName = languages.find(l => l.code === activeLanguage)?.name || activeLanguage;
  const objectItems = previewVisibleObjectItems && previewVisibleObjectItems.length > 0 
    ? previewVisibleObjectItems 
    : mapItems.filter((item) => item.type !== 'Lesson Cards');
  const lessonCards = previewVisibleLessonCards && previewVisibleLessonCards.length > 0 
    ? previewVisibleLessonCards 
    : mapItems.filter((item) => item.type === 'Lesson Cards');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-sm font-bold">Preview Map</h3>
            <p className="text-[11px] text-slate-300 mt-0.5">{mapTitle || 'Untitled Map'} — {currentLanguageName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-slate-100">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <Stage width={containerWidth} height={previewStageHeight} listening={false}>
                <Layer name="background-layer">
                  <Rect x={0} y={0} width={containerWidth} height={previewStageHeight} fill={fallbackBgColor} listening={false} />
                  <Group scaleX={scale} scaleY={scale}>
                    {bgSections && bgSections.length > 0 && bgSections.map((sec) => (
                      <BackgroundSection 
                        key={sec.id} 
                        sec={sec} 
                        customThemes={customThemes} 
                        stageWidth={800} 
                      />
                    ))}
                  </Group>
                </Layer>
                <Layer name="roads-layer">
                  <Group scaleX={scale} scaleY={scale}>
                    {roadPaths && roadPaths.length > 0 && roadPaths.map((path) => (
                      <RoadPath 
                        key={path.id} 
                        path={path} 
                        scale={scale} 
                      />
                    ))}
                  </Group>
                </Layer>
                <Layer name="objects-layer">
                  <Group scaleX={scale} scaleY={scale}>
                    {objectItems && objectItems.length > 0 && objectItems.map((item) => (
                      <CanvasItem
                        key={item.id}
                        item={item}
                        activeTool="Select"
                        isSelected={false}
                        isLayerActive={true}
                        isHidden={false}
                        isPreview={true}
                        onSelect={() => {}}
                        onDelete={() => {}}
                        onClone={() => {}}
                        onDragEnd={() => {}}
                        onTransformEnd={() => {}}
                      />
                    ))}
                  </Group>
                </Layer>
                <Layer name="lesson-cards-layer">
                  <Group scaleX={scale} scaleY={scale}>
                    {lessonCards && lessonCards.length > 0 && lessonCards.map((item, idx) => (
                      <LessonCard
                        key={`card-${item.id}`}
                        item={item}
                        slotNumber={item.order || idx + 1}
                        activeLanguage={activeLanguage}
                        isSelected={false}
                        isPreview={true}
                        onSelect={() => {}}
                        onCardDragEnd={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  </Group>
                </Layer>
              </Stage>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Sections</p>
              <p className="text-lg font-bold text-slate-800">{bgSections && bgSections.length ? bgSections.length : 0}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Items</p>
              <p className="text-lg font-bold text-slate-800">{mapItems && mapItems.length ? mapItems.length : 0}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Paths</p>
              <p className="text-lg font-bold text-slate-800">{roadPaths && roadPaths.length ? roadPaths.length : 0}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Published Lessons</p>
              <p className="text-lg font-bold text-slate-800">{publishedSlotsForActiveLang} / {totalBuildingSlots}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">Close Preview</button>
            <button onClick={onPublish} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 cursor-pointer">Publish Map</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;