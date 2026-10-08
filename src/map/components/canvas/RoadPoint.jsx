import React from 'react';
import { Circle } from 'react-konva';

const RoadPoint = React.memo(({ x, y, index, isSelected, isDraggable, onSelect, onDragMove }) => {
  return (
    <Circle
      x={x}
      y={y}
      radius={isSelected ? 9 : 6}
      fill={isSelected ? '#f59e0b' : '#ffffff'}
      stroke="#0d9488"
      strokeWidth={isSelected ? 4 : 3}
      draggable={isDraggable}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect(index);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect(index);
      }}
      onDragMove={(e) => {
        const newX = e.target.x();
        const newY = e.target.y();
        onDragMove(index, newX, newY);
      }}
    />
  );
});

export default RoadPoint;
