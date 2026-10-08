import React from 'react';
import { Line } from 'react-konva';

const RoadPath = React.memo(({ path, scale }) => {
  if (!path.visible || path.points.length < 2) return null;

  return (
    <React.Fragment>
      <Line
        points={path.points}
        stroke="#a9825a"
        strokeWidth={(path.width || 40) + 10}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        opacity={0.9}
      />
      <Line
        points={path.points}
        stroke={path.color || '#e8cd9e'}
        strokeWidth={path.width || 40}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        dash={path.dash}
      />
      <Line
        points={path.points}
        stroke="#f6ecd2"
        strokeWidth={Math.max(4, (path.width || 40) * 0.32)}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        opacity={0.7}
        dash={[16, 14]}
        listening={false}
      />
    </React.Fragment>
  );
});

export default RoadPath;
