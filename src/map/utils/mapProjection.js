/**
 * mapProjection.js
 * 
 * Responsive World-to-Screen Projection Engine for Pic2Speak Master Adventure Map.
 * Decouples stable world coordinates from dynamic container dimensions.
 * Eliminates all hardcoded 800px base width assumptions while preserving
 * 100% backward compatibility with existing saved MongoDB coordinates.
 */

export const REFERENCE_WORLD_WIDTH = 800;
export const DEFAULT_CARD_WIDTH = 154;
export const DEFAULT_CARD_HEIGHT = 72;
export const DEFAULT_ROAD_WIDTH = 38;
export const DEFAULT_NODE_STEP_Y = 190;
export const DEFAULT_START_Y = 60;

/**
 * Calculates responsive horizontal layout bounds for any viewport width.
 * On mobile, uses full width with clean safe margins.
 * On desktop, centers the travel spine to maintain visual tightness and game feel.
 * 
 * @param {number} viewportWidth - Actual measured container width in px.
 * @returns {object} Layout metrics.
 */
export const getResponsiveLayoutMetrics = (viewportWidth) => {
  const width = Math.max(300, Number(viewportWidth) || REFERENCE_WORLD_WIDTH);

  let margin = 16;
  let maxCorridor = width - margin * 2;

  if (width < 480) {
    // Mobile phones (320px - 480px): use full width with 16px safe margins
    margin = 16;
    maxCorridor = width - margin * 2;
  } else if (width < 768) {
    // Large mobile / small tablets: 28px margins
    margin = 28;
    maxCorridor = width - margin * 2;
  } else if (width < 1024) {
    // Tablets: 44px margins, max travel corridor 680px
    margin = 44;
    maxCorridor = Math.min(width - margin * 2, 680);
  } else {
    // Desktop / widescreen: center travel spine (max corridor 740px)
    margin = Math.max(48, (width - 760) / 2);
    maxCorridor = Math.min(width - 96, 760);
  }

  const corridorWidth = Math.max(260, maxCorridor);
  const leftBound = width <= corridorWidth + margin * 2
    ? margin
    : (width - corridorWidth) / 2;
  const rightBound = leftBound + corridorWidth;
  const centerX = width / 2;

  return {
    viewportWidth: width,
    margin,
    leftBound,
    rightBound,
    corridorWidth,
    centerX,
    // Scale factor for decorative background elements relative to comfortable reference
    ambientScale: Math.min(1.2, Math.max(0.85, width / 600)),
    scale: Number((width / REFERENCE_WORLD_WIDTH).toFixed(6)),
    containerWidth: width,
    corridorInsetX: leftBound,
  };
};

/**
 * Projects a horizontal world coordinate (either normalized 0..1 or legacy 800-space)
 * into actual screen pixel space for the current viewport width.
 * 
 * @param {number} x - Raw x coordinate (normalized or legacy 800-based).
 * @param {object} metrics - Metrics from getResponsiveLayoutMetrics.
 * @returns {number} Projected screen X coordinate in pixels.
 */
export const projectWorldXToScreen = (x, metrics) => {
  if (!Number.isFinite(x)) return metrics.centerX;

  // If x is between 0 and 1, it's already normalized.
  // Otherwise, if it's in legacy 800-space, normalize by REFERENCE_WORLD_WIDTH.
  let ratio = x;
  if (Math.abs(x) > 1.5 || x < 0) {
    ratio = x / REFERENCE_WORLD_WIDTH;
  }

  return metrics.leftBound + ratio * metrics.corridorWidth;
};

/**
 * Inverse projection: converts a screen X coordinate (from drag/drop or mouse click)
 * back to legacy 800-compatible world space for persistence in MongoDB.
 * 
 * @param {number} screenX - Clicked/dropped screen X coordinate.
 * @param {object} metrics - Metrics from getResponsiveLayoutMetrics.
 * @returns {number} Saved world X coordinate (compatible with existing MongoDB schema).
 */
export const projectScreenXToWorld = (screenX, metrics) => {
  if (!Number.isFinite(screenX)) return 400;

  const ratio = (screenX - metrics.leftBound) / metrics.corridorWidth;
  const legacyX = ratio * REFERENCE_WORLD_WIDTH;

  return Math.round(legacyX * 100) / 100;
};

/**
 * Projects a complete item (building, tree, character, lesson card) to screen space.
 * 
 * @param {object} item - Map item with x, y, width, height.
 * @param {object} metrics - Metrics from getResponsiveLayoutMetrics.
 * @returns {object} Projected item with screen coordinates.
 */
export const projectItemToScreen = (item, metrics) => {
  if (!item) return null;

  const screenX = projectWorldXToScreen(item.x ?? 0, metrics);
  const screenY = Number(item.y) || 0;

  const isCard = item.type === 'Lesson Cards';
  const width = isCard ? DEFAULT_CARD_WIDTH : (Number(item.width) || 40);
  const height = isCard ? DEFAULT_CARD_HEIGHT : (Number(item.height) || 40);

  return {
    ...item,
    screenX,
    screenY,
    screenWidth: width,
    screenHeight: height,
  };
};

/**
 * Projects a road path points array [x0, y0, x1, y1, ...] to screen space.
 * 
 * @param {number[]} points - Flat array of road coordinates.
 * @param {object} metrics - Metrics from getResponsiveLayoutMetrics.
 * @returns {number[]} Flat array of projected screen coordinates.
 */
export const projectRoadPointsToScreen = (points, metrics) => {
  if (!Array.isArray(points) || points.length < 2) return [];

  const projected = new Array(points.length);
  for (let i = 0; i < points.length; i += 2) {
    projected[i] = projectWorldXToScreen(points[i], metrics);
    projected[i + 1] = points[i + 1]; // vertical Y is preserved in world space
  }

  return projected;
};

/**
 * Generates an alternating serpentine winding pathway layout for any number of lessons (4 to 100+).
 * Guarantees zero collisions, optimal lesson readability, continuous curves,
 * and predictable smooth progression.
 * 
 * @param {number} lessonCount - Total number of lessons to position.
 * @param {object} options - Configuration overrides.
 * @returns {object} Generated nodes, road points, and recommended world height.
 */
export const generateSerpentineLayout = (lessonCount, options = {}) => {
  const count = Math.max(1, lessonCount || 5);
  const startY = options.startY ?? DEFAULT_START_Y;
  const stepY = options.stepY ?? DEFAULT_NODE_STEP_Y;
  const roadWidth = options.roadWidth ?? DEFAULT_ROAD_WIDTH;

  const nodes = [];
  const roadPoints = [];

  // Alternating ratio: left turns at 0.24, right turns at 0.76 of corridor
  const leftRatio = 0.24;
  const rightRatio = 0.76;
  const centerRatio = 0.5;

  // Starting anchor point before lesson 1
  roadPoints.push(centerRatio * REFERENCE_WORLD_WIDTH, startY - 40);

  for (let i = 0; i < count; i++) {
    const isEven = i % 2 === 0;
    // Alternate left and right
    const stationRatio = isEven ? rightRatio : leftRatio;
    const cardRatio = isEven ? rightRatio + 0.05 : leftRatio - 0.28;
    const stationY = startY + i * stepY;

    // Intermediate curve control point between stations to create graceful winding road
    if (i > 0) {
      const prevStationY = startY + (i - 1) * stepY;
      const midY = (prevStationY + stationY) / 2;
      const midRatio = centerRatio + (isEven ? -0.08 : 0.08);
      roadPoints.push(midRatio * REFERENCE_WORLD_WIDTH, midY);
    }

    const stationX = stationRatio * REFERENCE_WORLD_WIDTH;
    roadPoints.push(stationX, stationY);

    nodes.push({
      order: i + 1,
      stationX,
      stationY,
      cardX: Math.max(0, Math.min(cardRatio * REFERENCE_WORLD_WIDTH, REFERENCE_WORLD_WIDTH - DEFAULT_CARD_WIDTH)),
      cardY: stationY - DEFAULT_CARD_HEIGHT / 2,
      isRightSide: isEven,
    });
  }

  // Final exit path beyond last station
  const lastY = startY + (count - 1) * stepY;
  roadPoints.push(centerRatio * REFERENCE_WORLD_WIDTH, lastY + 120);

  const totalHeight = lastY + 280;

  return {
    nodes,
    roadPoints,
    roadWidth,
    totalHeight,
  };
};

