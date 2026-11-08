
import React, { useCallback, useMemo } from 'react';
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
  metrics,
  scale = 1,
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
  fallbackBgColor = '#071426',
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
  // Validate stage dimensions.
  const safeWidth = Number(containerWidth);
  const safeHeight = Number(stageHeight);

  if (
    !Number.isFinite(safeWidth) ||
    !Number.isFinite(safeHeight) ||
    safeWidth <= 0 ||
    safeHeight <= 0
  ) {
    return null;
  }

  // Prevent undefined, zero or invalid scale values.
  const safeScale =
    Number.isFinite(Number(scale)) && Number(scale) > 0
      ? Number(scale)
      : 1;

  const safeMapItems = Array.isArray(mapItems) ? mapItems : [];
  const safeRoadPaths = Array.isArray(roadPaths) ? roadPaths : [];
  const safeBgSections = Array.isArray(bgSections) ? bgSections : [];

  const nonLessonCardItems = safeMapItems.filter(
    (item) => item && item.type !== 'Lesson Cards'
  );

  const lessonCardItems = safeMapItems.filter(
    (item) => item && item.type === 'Lesson Cards'
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
    ['All Layers', 'Roads', 'Roads & Paths'].includes(activeLayer);

  const canEditRoadPoints =
    isEditMode &&
    ['Edit Points', 'Select'].includes(activeTool) &&
    ['All Layers', 'Roads', 'Roads & Paths'].includes(activeLayer);

  const canListenToRoadLayer =
    isEditMode &&
    (
      canDrawRoad ||
      canEditRoadPoints ||
      ['All Layers', 'Roads', 'Roads & Paths'].includes(activeLayer)
    );

  const handleMouseDown = useCallback((event) => {
    if (!canDrawRoad || !onDrawStart) return;
    onDrawStart(event);
  }, [canDrawRoad, onDrawStart]);

  const handleMouseMove = useCallback((event) => {
    if (!canDrawRoad || !onDrawMove) return;
    onDrawMove(event);
  }, [canDrawRoad, onDrawMove]);

  const handleMouseUp = useCallback(() => {
    if (canDrawRoad) onDrawEnd?.();
  }, [canDrawRoad, onDrawEnd]);

  const handleTouchStart = useCallback((event) => {
    if (!canDrawRoad || !onDrawStart) return;
    onDrawStart(event);
  }, [canDrawRoad, onDrawStart]);

  const handleTouchMove = useCallback((event) => {
    if (!canDrawRoad || !onDrawMove) return;
    onDrawMove(event);
  }, [canDrawRoad, onDrawMove]);

  const handleTouchEnd = useCallback(() => {
    if (canDrawRoad) onDrawEnd?.();
  }, [canDrawRoad, onDrawEnd]);

  const handleStageClick = useCallback((event) => {
    if (canDrawRoad) return;
    onStageClick?.(event);
  }, [canDrawRoad, onStageClick]);

  const backgroundSections = useMemo(
    () => safeBgSections.map((sec) => (
      <BackgroundSection
        key={sec.id}
        sec={sec}
        customThemes={customThemes}
        stageWidth={800}
      />
    )),
    [safeBgSections, customThemes]
  );

  return (
    <Stage
      ref={stageRef}
      width={safeWidth}
      height={safeHeight}
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
      {/* Background Layer */}
      <Layer name="background-layer">
        <Rect
          name="map-background"
          x={0}
          y={0}
          width={safeWidth}
          height={safeHeight}
          fill={fallbackBgColor}
          listening={canDrawRoad}
        />

        <Group
          scaleX={safeScale}
          scaleY={safeScale}
        >
          {backgroundSections}
        </Group>
      </Layer>

      {/* Road Layer */}
      <Layer
        name="roads-layer"
        listening={canListenToRoadLayer}
      >
        <Group
          scaleX={safeScale}
          scaleY={safeScale}
        >
          {safeRoadPaths.map((path) => (
            <RoadPath
              key={path.id}
              path={path}
            />
          ))}

          {safeRoadPaths.map((path) => {
            if (!Array.isArray(path.points)) return null;

            return path.points.map((pointX, index) => {
              if (index % 2 !== 0) return null;

              const pointIndex = index / 2;
              const pointY = path.points[index + 1];

              if (
                !Number.isFinite(pointX) ||
                !Number.isFinite(pointY)
              ) {
                return null;
              }

              return (
                <RoadPoint
                  key={`point-${path.id}-${pointIndex}`}
                  x={pointX}
                  y={pointY}
                  index={pointIndex}
                  scale={safeScale}
                  isSelected={selectedPointIndex === pointIndex}
                  isDraggable={
                    canEditRoadPoints &&
                    activeTool === 'Edit Points'
                  }
                  onSelect={onSelectPoint}
                  onDragMove={onDragPoint}
                />
              );
            });
          })}
        </Group>
      </Layer>

      {/* Decorative Objects and Characters */}
      <Layer name="objects-layer" listening={isEditMode}>
        <Group
          scaleX={safeScale}
          scaleY={safeScale}
        >
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
                scale={safeScale}
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

      {/* Lesson Cards */}
      <Layer name="lesson-cards-layer" listening={isEditMode}>
        <Group
          scaleX={safeScale}
          scaleY={safeScale}
        >
          {lessonCardItems.map((item, index) => (
            <LessonCard
              key={`card-${item.id}`}
              item={item}
              slotNumber={item.order || index + 1}
              scale={safeScale}
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
          borderStroke="#00f0ff"
          anchorStroke="#00f0ff"
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
