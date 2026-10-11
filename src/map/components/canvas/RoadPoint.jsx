import React from 'react';
import { Circle } from 'react-konva';

const RoadPoint = React.memo(({
  x,
  y,
  index,
  isSelected,
  isDraggable,
  onSelect,
  onDragMove,
}) => {
  const handleSelect = (e) => {
    e.cancelBubble = true;
    onSelect?.(index);
  };

  const handleDragMove = (e) => {
    e.cancelBubble = true;

    onDragMove?.(
      index,
      e.target.x(),
      e.target.y()
    );
  };

  return (
    <Circle
      x={x}
      y={y}
      radius={isSelected ? 9 : 6}
      fill={isSelected ? '#f59e0b' : '#ffffff'}
      stroke={isSelected ? '#b45309' : '#0d9488'}
      strokeWidth={isSelected ? 3 : 2}
      draggable={Boolean(isDraggable)}
      hitStrokeWidth={10}
      perfectDrawEnabled={false}
      onClick={handleSelect}
      onTap={handleSelect}
      onDragStart={(e) => {
        e.cancelBubble = true;
        onSelect?.(index);
      }}
      onDragMove={handleDragMove}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = isDraggable
            ? 'grab'
            : 'pointer';
        }
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) {
          stage.container().style.cursor = 'default';
        }
      }}
    />
  );
});

RoadPoint.displayName = 'RoadPoint';

export default RoadPoint;