
import React from 'react';
import {
  Group,
  Rect,
  Circle,
  Text as KonvaText,
  Path,
} from 'react-konva';

import { getItemContent } from '../../utils/languageUtils.js';

import {
  DEFAULT_CARD_WIDTH,
} from '../../utils/mapProjection.js';

const WORLD_WIDTH = 800;

// 16:9 card dimensions
const MIN_CARD_WIDTH = 144;
const CARD_ASPECT_RATIO = 16 / 9;

const LessonCard = React.memo(({
  item,
  slotNumber,
  activeLanguage,
  activeTool,
  isLayerActive = true,
  isSelected,
  isPreview = false,
  scale = 1,
  onSelect,
  onCardDragEnd,
  onDelete,
  onClone,
}) => {
  // ---------------------------------------
  // Lesson content
  // ---------------------------------------

  const langContent = getItemContent(item, activeLanguage);

  const title = langContent?.title || '';
  const isPublished = Boolean(langContent?.published);

  const lessonNumber = slotNumber || item.order || 1;

  const displayText = title || `Lesson ${lessonNumber}`;

  // ---------------------------------------
  // Card dimensions: 16:9
  // ---------------------------------------

  const storedWidth = Number(item.width);

  const cardWidth = Math.max(
    MIN_CARD_WIDTH,
    Number.isFinite(storedWidth) && storedWidth > 0
      ? storedWidth
      : DEFAULT_CARD_WIDTH
  );

  // Maintain 16:9 ratio.
  // Parent MapStage Group handles responsive scaling.
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  // ---------------------------------------
  // Interaction
  // ---------------------------------------

  const canInteract = !isPreview && isLayerActive;

  // Canonical 800px world coordinates
  const safeX = Math.max(
    0,
    Math.min(
      WORLD_WIDTH - cardWidth,
      Number.isFinite(item.x) ? item.x : 0
    )
  );

  const safeY = Math.max(
    0,
    Number.isFinite(item.y) ? item.y : 0
  );

  const handleDragEnd = (e) => {
    if (!canInteract) return;

    const clampedWorldX = Math.max(
      0,
      Math.min(
        WORLD_WIDTH - cardWidth,
        Math.round(e.target.x())
      )
    );

    const clampedWorldY = Math.max(
      0,
      Math.round(e.target.y())
    );

    onCardDragEnd?.(
      item.id,
      clampedWorldX,
      clampedWorldY
    );
  };

  const handleSelect = (e) => {
    if (!canInteract) return;

    e.cancelBubble = true;

    if (activeTool === 'Delete') {
      onDelete?.(item.id);
      return;
    }

    if (activeTool === 'Clone') {
      onClone?.(item.id);
      return;
    }

    onSelect?.(item);
  };

  const handleDelete = (e) => {
    e.cancelBubble = true;

    if (!canInteract) return;

    onDelete?.(item.id);
  };

  // ---------------------------------------
  // Colors and theme
  // ---------------------------------------

  const isHighlighted =
    isSelected || Number(lessonNumber) === 1;

  const borderColor = isHighlighted
    ? '#00f0ff'
    : isPublished
      ? '#8b5cf6'
      : '#64748b';

  const glowColor = isHighlighted
    ? '#00f0ff'
    : '#8b5cf6';

  // ---------------------------------------
  // Internal layout
  // ---------------------------------------

  const badgeX = 24;
  const badgeRadius = 15;

  const textX = 45;
  const textWidth = Math.max(35, cardWidth - 82);

  const headerY = 15;
  const titleY = 34;

  const titleHeight = Math.max(
    20,
    cardHeight - titleY - 7
  );

  const lockSvg =
    'M14 7V5c0-2.76-2.24-5-5-5S4 2.24 4 5v2H3c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-1ZM6 5c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6V5Z';

  return (
    <Group
      id={`item-${item.id}`}
      x={safeX}
      y={safeY}
      listening={canInteract}
      draggable={
        canInteract &&
        (activeTool === 'Move' || activeTool === 'Select')
      }
      onClick={handleSelect}
      onTap={handleSelect}
      onDragEnd={handleDragEnd}
    >
      {/* -------------------------------- */}
      {/* Outer Glow */}
      {/* -------------------------------- */}

      <Rect
        width={cardWidth}
        height={cardHeight}
        cornerRadius={18}
        fill="transparent"
        stroke={borderColor}
        strokeWidth={isSelected ? 3 : 2}
        shadowColor={glowColor}
        shadowBlur={isSelected ? 18 : 10}
        shadowOpacity={0.8}
        shadowOffsetY={3}
        listening={false}
      />

      {/* -------------------------------- */}
      {/* Card Background */}
      {/* -------------------------------- */}

      <Rect
        width={cardWidth}
        height={cardHeight}
        cornerRadius={18}
        fill="#071426"
        opacity={0.96}
        stroke={borderColor}
        strokeWidth={1.8}
      />

      {/* -------------------------------- */}
      {/* Glass Highlight */}
      {/* -------------------------------- */}

      <Rect
        x={7}
        y={4}
        width={cardWidth - 14}
        height={cardHeight * 0.35}
        cornerRadius={[14, 14, 0, 0]}
        fill="rgba(255, 255, 255, 0.06)"
        listening={false}
      />

      {/* -------------------------------- */}
      {/* Left Status Badge */}
      {/* -------------------------------- */}

      <Group
        x={badgeX}
        y={cardHeight / 2}
        listening={false}
      >
        <Circle
          radius={badgeRadius}
          fill="rgba(15, 23, 42, 0.9)"
          stroke={isHighlighted ? '#00f0ff' : '#8b5cf6'}
          strokeWidth={2}
          shadowColor={glowColor}
          shadowBlur={8}
          shadowOpacity={0.5}
        />

        {isHighlighted ? (
          <KonvaText
            text="0/6"
            fontSize={9}
            fontStyle="bold"
            fill="#00f0ff"
            align="center"
            width={28}
            x={-14}
            y={-5}
            listening={false}
          />
        ) : (
          <Path
            data={lockSvg}
            x={-7}
            y={-8}
            scaleX={0.75}
            scaleY={0.75}
            fill="#94a3b8"
            listening={false}
          />
        )}
      </Group>

      {/* -------------------------------- */}
      {/* Lesson Number */}
      {/* -------------------------------- */}

      <KonvaText
        text={`Lesson ${lessonNumber}`}
        fontSize={10}
        fontStyle="bold"
        fill={isHighlighted ? '#00f0ff' : '#a78bfa'}
        x={textX}
        y={headerY}
        width={textWidth}
        height={14}
        wrap="none"
        ellipsis
        listening={false}
      />

      {/* -------------------------------- */}
      {/* Lesson Title */}
      {/* -------------------------------- */}

      <KonvaText
        text={displayText}
        fontSize={11}
        fontStyle="bold"
        fill="#ffffff"
        x={textX}
        y={titleY}
        width={textWidth}
        height={titleHeight}
        wrap="word"
        ellipsis
        lineHeight={1.1}
        verticalAlign="top"
        listening={false}
      />

      {/* -------------------------------- */}
      {/* Right Chevron */}
      {/* -------------------------------- */}

      <KonvaText
        text="›"
        fontSize={20}
        fontStyle="bold"
        fill={isHighlighted ? '#00f0ff' : '#64748b'}
        x={cardWidth - 20}
        y={cardHeight / 2 - 12}
        width={14}
        height={24}
        align="center"
        listening={false}
      />

      {/* -------------------------------- */}
      {/* Admin Delete Button */}
      {/* -------------------------------- */}

      {!isPreview && (
        <Group
          x={cardWidth - 12}
          y={-6}
          listening={canInteract}
          onClick={handleDelete}
          onTap={handleDelete}
        >
          <Circle
            radius={9}
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth={1.5}
          />

          <KonvaText
            text="✕"
            fontSize={10}
            fontStyle="bold"
            fill="#ffffff"
            width={18}
            height={14}
            align="center"
            x={-9}
            y={-6}
            listening={false}
          />
        </Group>
      )}
    </Group>
  );
});

LessonCard.displayName = 'LessonCard';

export default LessonCard;
