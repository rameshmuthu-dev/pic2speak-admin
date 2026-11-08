import React from 'react';
import { Circle } from 'react-konva';

const RoadPoint = React.memo(({
  x,
  y,
  index,
  scale = 1,
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
    const worldX = Math.max(0, Math.min(800, Math.round(e.target.x())));
    const worldY = Math.max(0, Math.round(e.target.y()));

    onDragMove?.(
      index,
      worldX,
      worldY
    );
  };

  const pointRadius = Math.max(6, Math.round((isSelected ? 9 : 6) / Math.sqrt(scale || 1)));

  return (
    <Circle
      x={x}
      y={y}
      radius={pointRadius}
      fill={isSelected ? '#00f0ff' : '#ffffff'}
      stroke={isSelected ? '#38bdf8' : '#8b5cf6'}
      strokeWidth={isSelected ? 3 : 2}
      shadowColor="#00f0ff"
      shadowBlur={isSelected ? 8 : 4}
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
