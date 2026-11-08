import React from 'react';
import { Group, Line, Circle } from 'react-konva';
import { DEFAULT_ROAD_WIDTH } from '../../utils/mapProjection.js';

const RoadPath = React.memo(({ path, stations = [] }) => {
  if (
    !path ||
    !path.visible ||
    !Array.isArray(path.points) ||
    path.points.length < 4
  ) {
    return null;
  }

  const points = path.points;
  const roadWidth = Math.max(24, Number(path.width) || DEFAULT_ROAD_WIDTH);

  return (
    <Group listening={false}>
      {/* Outer Cyan Glow Shadow */}
      <Line
        points={points}
        stroke="rgba(0, 240, 255, 0.4)"
        strokeWidth={roadWidth + 14}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        shadowColor="#00f0ff"
        shadowBlur={16}
        shadowOpacity={0.7}
        listening={false}
        perfectDrawEnabled={false}
      />

      {/* Electric Cyan Border */}
      <Line
        points={points}
        stroke="#00f0ff"
        strokeWidth={roadWidth + 6}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        listening={false}
        perfectDrawEnabled={false}
      />

      {/* Deep Neon Purple / Blue Road Surface */}
      <Line
        points={points}
        stroke="#1a1c3d"
        strokeWidth={roadWidth}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        dash={path.dash}
        listening={false}
        perfectDrawEnabled={false}
      />

      {/* Radiant Electric Blue Core Stream */}
      <Line
        points={points}
        stroke="#3b82f6"
        strokeWidth={roadWidth * 0.55}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        opacity={0.4}
        listening={false}
        perfectDrawEnabled={false}
      />

      {/* Crisp White Dashed Center Line */}
      <Line
        points={points}
        stroke="#ffffff"
        strokeWidth={Math.max(3, roadWidth * 0.08)}
        lineCap="round"
        lineJoin="round"
        tension={0.4}
        opacity={0.9}
        dash={[14, 12]}
        listening={false}
        perfectDrawEnabled={false}
      />

      {/* Milestone Station Node Rings along the road */}
      {stations.map((st, idx) => (
        <Group key={`station-node-${idx}`} x={st.x} y={st.y}>
          {/* Outer glow ring */}
          <Circle
            radius={15}
            stroke="#00f0ff"
            strokeWidth={3}
            fill="rgba(7, 20, 38, 0.9)"
            shadowColor="#00f0ff"
            shadowBlur={10}
            shadowOpacity={0.8}
          />
          {/* Secondary purple ring */}
          <Circle
            radius={9}
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="#071426"
          />
          {/* Glowing central core */}
          <Circle
            radius={4}
            fill={st.isCurrent ? '#00f0ff' : '#ffffff'}
            shadowColor={st.isCurrent ? '#00f0ff' : '#ffffff'}
            shadowBlur={6}
          />
        </Group>
      ))}
    </Group>
  );
});

RoadPath.displayName = 'RoadPath';

export default RoadPath;
