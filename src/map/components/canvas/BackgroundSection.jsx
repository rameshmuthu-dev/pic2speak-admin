import React from 'react';
import { Group, Rect } from 'react-konva';
import useImage from 'use-image';

const BackgroundSection = React.memo(({ sec, customThemes, stageWidth }) => {
  const tObj = customThemes[sec.themeKey] || {};
  const [bgImg] = useImage(tObj.image || '');

  return (
    <Group y={sec.y}>
      <Rect
        name="bg-rect"
        width={stageWidth}
        height={sec.height}
        fill={bgImg ? undefined : (tObj.color || "#599824")}
        fillPatternImage={bgImg || undefined}
        fillPatternRepeat="repeat"
      />
    </Group>
  );
});

export default BackgroundSection;
