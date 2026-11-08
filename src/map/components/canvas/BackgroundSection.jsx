import React from 'react';
import { Group, Rect } from 'react-konva';
import useImage from 'use-image';
import { isRenderableImage } from '../../utils/imageUtils.js';
import { getOptimizedImageUrl } from '../../utils/optimizedImageUrl.js';

const DEFAULT_THEME_COLOR = '#071426';

const BackgroundSection = React.memo(({ sec, customThemes, stageWidth }) => {
  const tObj = customThemes[sec.themeKey] || {};

  // Optimize Cloudinary image delivery without changing the stored URL.
  const optimizedImageUrl = getOptimizedImageUrl(tObj.image || '');
  const [bgImg] = useImage(optimizedImageUrl);

  const sectionHeight = Number(sec.height);
  const imageIsReady = isRenderableImage(bgImg);

  if (
    !Number.isFinite(sectionHeight) ||
    sectionHeight <= 0 ||
    !stageWidth ||
    stageWidth <= 0
  ) {
    return null;
  }

  return (
    <Group y={sec.y} listening={false}>
      {/* Base Deep Navy surface */}
      <Rect
        name="bg-rect"
        width={stageWidth}
        height={sectionHeight}
        fill={imageIsReady ? undefined : (tObj.color || DEFAULT_THEME_COLOR)}
        fillPatternImage={imageIsReady ? bgImg : undefined}
        fillPatternRepeat="repeat"
        listening={false}
      />
    </Group>
  );
});

BackgroundSection.displayName = 'BackgroundSection';

export default BackgroundSection;
