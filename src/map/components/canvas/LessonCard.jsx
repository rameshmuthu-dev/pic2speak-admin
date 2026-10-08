import React from 'react';
import { Group, Rect, Circle, Text as KonvaText } from 'react-konva';
import { getItemContent } from '../../utils/languageUtils.js';

const LessonCard = React.memo(({ 
  item, 
  slotNumber, 
  activeLanguage, 
  isSelected, 
  isPreview, 
  onSelect, 
  onCardDragEnd, 
  onDelete 
}) => {
  const langContent = getItemContent(item, activeLanguage);
  const title = langContent?.title || '';
  const isMissing = !langContent?.published;
  const displayText = title || 'Untitled lesson';
  const cardWidth = item.width || 154;
  const cardHeight = item.height || 72;

  const handleDragEnd = (e) => {
    if (isPreview) return;
    if (onCardDragEnd) {
      onCardDragEnd(item.id, e.target.x(), e.target.y());
    }
  };

  const handleSelect = (e) => {
    if (isPreview) return;
    e.cancelBubble = true;
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleDelete = (e) => {
    e.cancelBubble = true;
    if (onDelete) {
      onDelete(item.id);
    }
  };

  const borderColor = isSelected ? '#0d9488' : '#e2e8f0';
  const borderWidth = isSelected ? 2 : 1;
  const statusColor = isMissing ? '#64748b' : '#0d9488';

  return (
    <Group
      id={`item-${item.id}`}
      x={item.x}
      y={item.y}
      draggable={!isPreview}
      onClick={handleSelect}
      onTap={handleSelect}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={cardWidth}
        height={cardHeight}
        fill="#ffffff"
        cornerRadius={12}
        stroke={borderColor}
        strokeWidth={borderWidth}
        shadowColor="#000000"
        shadowOpacity={0.18}
        shadowBlur={5}
        shadowOffsetY={2}
      />
      
      <Circle 
        x={22} 
        y={cardHeight / 2} 
        radius={15} 
        fill={statusColor} 
      />
      
      <KonvaText
        text={displayText}
        fontSize={12}
        fontStyle="bold"
        fill="#1e293b"
        x={46}
        y={cardHeight / 2 - 7}
        width={cardWidth - 54}
        ellipsis
      />
      
      {!isPreview && (
        <Group
          x={cardWidth - 20}
          y={-8}
          onClick={handleDelete}
          onTap={handleDelete}
        >
          <Circle radius={12} fill="transparent" />
          <Circle 
            radius={10} 
            fill="#ef4444" 
            stroke="#ffffff" 
            strokeWidth={1.5} 
          />
          <KonvaText
            text="✕"
            fontSize={11}
            fontStyle="bold"
            fill="#ffffff"
            width={20}
            align="center"
            x={-10}
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