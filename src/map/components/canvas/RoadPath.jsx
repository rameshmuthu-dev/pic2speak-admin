import React from 'react';
import { Line } from 'react-konva';

const RoadPath = React.memo(({ path }) => {
  if (
    !path ||
    !path.visible ||
    !Array.isArray(path.points) ||
    path.points.length < 4
  ) {
    return null;
  }

  const roadWidth = Math.max(1, Number(path.width) || 36);
  const roadColor = path.color || '#e8cd9e';

  return (
    <>
      {/* Outer road border */}
      <Line
        points={path.points}
        stroke="#a9825a"
        strokeWidth={roadWidth + 10}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        opacity={0.9}
        listening={false}
        perfectDrawEnabled={false}
      />

      {/* Main road surface */}
      <Line
        points={path.points}
        stroke={roadColor}
        strokeWidth={roadWidth}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        dash={path.dash}
        listening={false}
        perfectDrawEnabled={false}
      />

      {/* Dashed road center line */}
      <Line
        points={path.points}
        stroke="#f6ecd2"
        strokeWidth={Math.max(4, roadWidth * 0.32)}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        opacity={0.7}
        dash={[16, 14]}
        listening={false}
        perfectDrawEnabled={false}
      />
    </>
  );
});

RoadPath.displayName = 'RoadPath';

export default RoadPath;