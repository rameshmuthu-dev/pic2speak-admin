import React from 'react';
import { Stage, Layer, Group, Rect, Transformer } from 'react-konva';
import BackgroundSection from './BackgroundSection.jsx';
import CanvasItem from './CanvasItem.jsx';
import LessonCard from './LessonCard.jsx';
import RoadPath from './RoadPath.jsx';
import RoadPoint from './RoadPoint.jsx';
import { isCharacterType } from '../../utils/mapCalculations.js';

const MapStage = React.memo(({
  stageRef,
  trRef,
  containerWidth,
  stageHeight,
  scale,
  isEditMode,
  bgSections,
  customThemes,
  roadPaths,
  mapItems,
  activeTool,
  activeLayer,
  selectedId,
  selectedPointIndex,
  fallbackBgColor,
  isWalking,
  onStageClick,
  onSelectItem,
  onDeleteItem,
  onCloneItem,
  onDragEnd,
  onTransformEnd,
  onCardDragEnd,
  onSelectPoint,
  onDragPoint
}) => {
  const nonLessonCardItems = mapItems.filter((item) => item.type !== 'Lesson Cards');
  const lessonCardItems = mapItems.filter((item) => item.type === 'Lesson Cards');
  const backgroundObjectItems = nonLessonCardItems.filter((item) => !isCharacterType(item.type));
  const characterObjectItems = nonLessonCardItems.filter((item) => isCharacterType(item.type));
  const orderedObjectItems = [...backgroundObjectItems, ...characterObjectItems];

  return (
    <Stage 
      ref={stageRef} 
      width={containerWidth} 
      height={stageHeight} 
      listening={isEditMode} 
      onClick={onStageClick} 
      onTap={onStageClick}
    >
      <Layer name="background-layer">
        <Rect x={0} y={0} width={containerWidth} height={stageHeight} fill={fallbackBgColor} listening={false} />
        <Group scaleX={scale} scaleY={scale}>
          {bgSections.map((sec) => (
            <BackgroundSection key={sec.id} sec={sec} customThemes={customThemes} stageWidth={800} />
          ))}
        </Group>
      </Layer>

      <Layer name="roads-layer" listening={activeLayer === 'Roads & Paths' || activeTool === 'Draw Path' || activeTool === 'Edit Points' || activeTool === 'Select'}>
        <Group scaleX={scale} scaleY={scale}>
          {roadPaths.map((path) => (
            <RoadPath key={path.id} path={path} scale={scale} />
          ))}

          {roadPaths.map((path) => (
            path.points.map((pt, index) => {
              if (index % 2 === 0) {
                const ptIndex = index / 2;
                const x = pt;
                const y = path.points[index + 1];
                const isCurrentSelectedPoint = selectedPointIndex === ptIndex;
                return (
                  <RoadPoint
                    key={`pt-${path.id}-${index}`}
                    x={x}
                    y={y}
                    index={ptIndex}
                    isSelected={isCurrentSelectedPoint}
                    isDraggable={activeTool === 'Draw Path' || activeTool === 'Edit Points' || activeTool === 'Select'}
                    onSelect={onSelectPoint}
                    onDragMove={onDragPoint}
                  />
                );
              }
              return null;
            })
          ))}
        </Group>
      </Layer>

      <Layer name="objects-layer" listening>
        <Group scaleX={scale} scaleY={scale}>
          {orderedObjectItems.map((item) => {
            const catName = item.type || 'Buildings';
            const isLayerActive = activeLayer === 'All Layers' || activeLayer === catName;
            const isCharacter = isCharacterType(item.type);
            const isHidden = isCharacter && isWalking;
            return (
              <CanvasItem
                key={item.id}
                item={item}
                activeTool={activeTool}
                isSelected={selectedId === item.id}
                isLayerActive={isLayerActive}
                isHidden={isHidden}
                onSelect={onSelectItem}
                onDelete={onDeleteItem}
                onClone={onCloneItem}
                onDragEnd={onDragEnd}
                onTransformEnd={onTransformEnd}
              />
            );
          })}
        </Group>
      </Layer>

      <Layer name="lesson-cards-layer" listening>
        <Group scaleX={scale} scaleY={scale}>
          {lessonCardItems.map((item, idx) => (
            <LessonCard
              key={`card-${item.id}`}
              item={item}
              slotNumber={item.order || idx + 1}
              activeLanguage="en"
              isSelected={selectedId === item.id}
              onSelect={onSelectItem}
              onCardDragEnd={onCardDragEnd}
              onDelete={onDeleteItem}
            />
          ))}
        </Group>
      </Layer>

      <Layer name="transformer-layer">
        <Transformer
          ref={trRef}
          keepRatio={false}
          borderStroke="#0d9488"
          anchorStroke="#0d9488"
          anchorFill="#ffffff"
          anchorSize={9}
          borderStrokeWidth={2}
        />
      </Layer>
    </Stage>
  );
});

export default MapStage;