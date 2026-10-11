
import React from 'react';
import { Stage, Layer, Group, Rect, Transformer } from 'react-konva';

import BackgroundSection from './BackgroundSection.jsx';
import CanvasItem from './CanvasItem.jsx';
import LessonCard from './LessonCard.jsx';
import RoadPath from './RoadPath.jsx';
import RoadPoint from './RoadPoint.jsx';

import { isCharacterType } from '../../utils/mapCalculations.js';

const BACKGROUND_NAMES = ['bg-image', 'bg-rect', 'map-background'];

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
  activeLanguage,
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
  onDragPoint,
  onDrawStart,
  onDrawMove,
  onDrawEnd,
}) => {
  if (
    !Number.isFinite(containerWidth) ||
    !Number.isFinite(stageHeight) ||
    containerWidth <= 0 ||
    stageHeight <= 0
  ) {
    return null;
  }

  const safeMapItems = Array.isArray(mapItems) ? mapItems : [];
  const safeRoadPaths = Array.isArray(roadPaths) ? roadPaths : [];
  const safeBgSections = Array.isArray(bgSections) ? bgSections : [];
  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;

  const nonLessonCardItems = safeMapItems.filter(
    (item) => item.type !== 'Lesson Cards'
  );

  const lessonCardItems = safeMapItems.filter(
    (item) => item.type === 'Lesson Cards'
  );

  const backgroundObjectItems = nonLessonCardItems.filter(
    (item) => !isCharacterType(item.type)
  );

  const characterObjectItems = nonLessonCardItems.filter(
    (item) => isCharacterType(item.type)
  );

  const orderedObjectItems = [
    ...backgroundObjectItems,
    ...characterObjectItems,
  ];

  const canDrawRoad =
    isEditMode &&
    activeTool === 'Draw Path' &&
    (activeLayer === 'All Layers' ||
      activeLayer === 'Roads' ||
      activeLayer === 'Roads & Paths');

  const canEditRoadPoints =
    isEditMode &&
    (activeTool === 'Edit Points' || activeTool === 'Select') &&
    (activeLayer === 'All Layers' ||
      activeLayer === 'Roads' ||
      activeLayer === 'Roads & Paths');

  const handleMouseDown = (event) => {
    if (!canDrawRoad || !onDrawStart) return;
    onDrawStart(event);
  };

  const handleMouseMove = (event) => {
    if (!canDrawRoad || !onDrawMove) return;
    onDrawMove(event);
  };

  const handleMouseUp = () => {
    onDrawEnd?.();
  };

  const handleTouchStart = (event) => {
    if (!canDrawRoad || !onDrawStart) return;
    onDrawStart(event);
  };

  const handleTouchMove = (event) => {
    if (!canDrawRoad || !onDrawMove) return;
    onDrawMove(event);
  };

  const handleTouchEnd = () => {
    onDrawEnd?.();
  };

  const handleStageClick = (event) => {
    // Drawing is handled by pointer down/move/up.
    if (canDrawRoad) return;
    onStageClick?.(event);
  };

  return (
    <Stage
      ref={stageRef}
      width={containerWidth}
      height={stageHeight}
      listening={isEditMode}
      onClick={handleStageClick}
      onTap={handleStageClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Background */}
      <Layer name="background-layer">
        <Rect
          name="map-background"
          x={0}
          y={0}
          width={containerWidth}
          height={stageHeight}
          fill={fallbackBgColor}
          listening={canDrawRoad}
        />

        <Group scaleX={safeScale} scaleY={safeScale}>
          {safeBgSections.map((sec) => (
            <BackgroundSection
              key={sec.id}
              sec={sec}
              customThemes={customThemes}
              stageWidth={800}
            />
          ))}
        </Group>
      </Layer>

      {/* Roads and road points */}
      <Layer
        name="roads-layer"
        listening={
          isEditMode &&
          (canDrawRoad ||
            canEditRoadPoints ||
            activeLayer === 'Roads & Paths' ||
            activeLayer === 'Roads' ||
            activeLayer === 'All Layers')
        }
      >
        <Group scaleX={safeScale} scaleY={safeScale}>
          {safeRoadPaths.map((path) => (
            <RoadPath key={path.id} path={path} scale={safeScale} />
          ))}

          {safeRoadPaths.map((path) => {
            if (!Array.isArray(path.points)) return null;

            return path.points.map((pointX, index) => {
              if (index % 2 !== 0) return null;

              const pointIndex = index / 2;
              const pointY = path.points[index + 1];

              if (!Number.isFinite(pointX) || !Number.isFinite(pointY)) {
                return null;
              }

              return (
                <RoadPoint
                  key={`point-${path.id}-${pointIndex}`}
                  x={pointX}
                  y={pointY}
                  index={pointIndex}
                  isSelected={selectedPointIndex === pointIndex}
                  isDraggable={
                    canEditRoadPoints && activeTool === 'Edit Points'
                  }
                  onSelect={onSelectPoint}
                  onDragMove={onDragPoint}
                />
              );
            });
          })}
        </Group>
      </Layer>

      {/* Map objects */}
      <Layer name="objects-layer" listening={isEditMode}>
        <Group scaleX={safeScale} scaleY={safeScale}>
          {orderedObjectItems.map((item) => {
            const categoryName = item.type || 'Buildings';

            const isLayerActive =
              activeLayer === 'All Layers' ||
              activeLayer === categoryName ||
              activeTool === 'Delete';

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

      {/* Lesson cards */}
      <Layer name="lesson-cards-layer" listening={isEditMode}>
        <Group scaleX={safeScale} scaleY={safeScale}>
          {lessonCardItems.map((item, index) => (
            <LessonCard
              key={`card-${item.id}`}
              item={item}
              slotNumber={item.order || index + 1}
              activeLanguage={activeLanguage}
              activeTool={activeTool}
              isLayerActive={
                activeLayer === 'All Layers' ||
                activeLayer === 'Lesson Cards' ||
                activeTool === 'Delete'
              }
              isSelected={selectedId === item.id}
              onSelect={onSelectItem}
              onCardDragEnd={onCardDragEnd}
              onDelete={onDeleteItem}
              onClone={onCloneItem}
            />
          ))}
        </Group>
      </Layer>

      {/* Transformer */}
      <Layer name="transformer-layer" listening={isEditMode}>
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

MapStage.displayName = 'MapStage';

export default MapStage;
