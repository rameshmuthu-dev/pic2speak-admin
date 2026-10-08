import React from 'react';
import { motion } from 'framer-motion';
import { isCharacterType } from '../../utils/mapCalculations.js';

const WalkingCharacter = React.memo(({
  isWalking,
  walkKey,
  walkPoints,
  walkFrameIndex,
  walkFrames,
  src,
  width,
  height,
  scale,
  walkCurveXs,
  walkCurveYs,
  walkSegmentDuration,
  walkFacingLeft,
  hasWalkFrames,
  onAnimationComplete
}) => {
  const walkerScaledWidth = width * scale;
  const walkerScaledHeight = height * scale;
  const currentWalkImageSrc = hasWalkFrames ? walkFrames[walkFrameIndex % walkFrames.length] : src;
  const walkFrom = walkPoints[0] || walkPoints[0];
  const walkTo = walkPoints[walkPoints.length - 1] || walkFrom;

  if (!isWalking || walkPoints.length < 2 || !walkCurveXs || walkCurveXs.length < 2) return null;

  return (
    <motion.div
      key={`walking-${walkKey}`}
      className="absolute top-0 left-0 z-20 pointer-events-none"
      style={{
        width: walkerScaledWidth,
        height: walkerScaledHeight,
        marginLeft: -walkerScaledWidth / 2,
        marginTop: -walkerScaledHeight * 0.88,
      }}
      initial={{ x: walkCurveXs[0] ?? walkFrom.x, y: walkCurveYs[0] ?? walkFrom.y }}
      animate={{ x: walkCurveXs, y: walkCurveYs }}
      transition={{ duration: walkSegmentDuration, ease: 'linear', times: walkCurveXs.map((_, i) => i / Math.max(1, walkCurveXs.length - 1)) }}
      onAnimationComplete={() => onAnimationComplete()}
    >
      <motion.div
        style={{ scaleX: walkFacingLeft ? -1 : 1 }}
        animate={hasWalkFrames ? { y: [0, -3, 0] } : { y: [0, -5, 0, -5, 0], rotate: [0, -3, 0, 3, 0] }}
        transition={{ duration: hasWalkFrames ? 0.28 : 0.6, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full h-full flex items-end justify-center drop-shadow-md"
      >
        {currentWalkImageSrc && (
          <img src={currentWalkImageSrc} alt="Walking character" className="w-full h-full object-contain" />
        )}
      </motion.div>
    </motion.div>
  );
});

export default WalkingCharacter;