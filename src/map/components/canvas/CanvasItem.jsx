import React, { useRef, useEffect } from 'react';
import {
  Group,
  Image as KonvaImage,
  Rect,
  Text as KonvaText,
} from 'react-konva';
import useImage from 'use-image';
import { isRenderableImage } from '../../utils/imageUtils.js';
import { getOptimizedImageUrl } from '../../utils/optimizedImageUrl.js';

const CanvasItem = React.memo(({
  item,
  metrics,
  activeTool,
  isSelected,
  onSelect,
  onDelete,
  onClone,
  onDragEnd,
  onTransformEnd,
  isPreview,
  isHidden,
  isLayerActive = true,
}) => {
  const originalImageUrl = item.src || item.imageUrl || '';
  const optimizedImageUrl = getOptimizedImageUrl(originalImageUrl);
  const [img] = useImage(optimizedImageUrl);

  const shapeRef = useRef(null);
  const imageIsReady = isRenderableImage(img);

  useEffect(() => {
    if (isSelected && shapeRef.current && !isPreview) {
      shapeRef.current.moveToTop();
    }
  }, [isSelected, isPreview]);

  const canInteract = !isPreview && !isHidden && (isLayerActive || activeTool === 'Delete');

  const itemWidth = item.width || 40;
  const itemHeight = item.height || 40;
  // Ensure item stays completely within canonical 800px world bounds
  const safeX = Math.max(0, Math.min(800 - itemWidth, Number.isFinite(item.x) ? item.x : 0));
  const safeY = Math.max(0, Number.isFinite(item.y) ? item.y : 0);

  return (
    <Group
      ref={shapeRef}
      id={`item-${item.id}`}
      name="map-item"
      x={safeX}
      y={safeY}
      scaleX={1}
      scaleY={1}
      opacity={isHidden ? 0 : 1}
      listening={canInteract}
      rotation={item.rotation || 0}
      draggable={canInteract && (activeTool === 'Move' || activeTool === 'Select')}
      onClick={(e) => {
        if (!canInteract) return;
        e.cancelBubble = true;

        if (activeTool === 'Delete') {
          onDelete(item.id);
        } else if (activeTool === 'Clone') {
          onClone(item.id);
        } else {
          onSelect(item);
        }
      }}
      onTap={(e) => {
        if (!canInteract) return;
        e.cancelBubble = true;

        if (activeTool === 'Delete') {
          onDelete(item.id);
        } else if (activeTool === 'Clone') {
          onClone(item.id);
        } else {
          onSelect(item);
        }
      }}
      onDragEnd={(e) => {
        if (canInteract) {
          const clampedWorldX = Math.max(0, Math.min(800 - itemWidth, Math.round(e.target.x())));
          const clampedWorldY = Math.max(0, Math.round(e.target.y()));
          onDragEnd(item.id, clampedWorldX, clampedWorldY);
        }
      }}
      onTransformEnd={() => {
        if (!canInteract) return;

        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        const newWidth = Math.max(20, Math.round(itemWidth * scaleX));
        const newHeight = Math.max(20, Math.round(itemHeight * scaleY));
        const clampedWorldX = Math.max(0, Math.min(800 - newWidth, Math.round(node.x())));
        const clampedWorldY = Math.max(0, Math.round(node.y()));

        onTransformEnd(item.id, {
          x: clampedWorldX,
          y: clampedWorldY,
          scaleX: 1,
          scaleY: 1,
          width: newWidth,
          height: newHeight,
          rotation: Math.round(node.rotation()),
        });
      }}
    >
      {imageIsReady ? (
        <KonvaImage
          image={img}
          width={item.width || 40}
          height={item.height || 40}
          stroke={isSelected ? '#00f0ff' : undefined}
          strokeWidth={isSelected ? 2 : 0}
          shadowColor={isSelected ? '#00f0ff' : undefined}
          shadowBlur={isSelected ? 10 : 0}
        />
      ) : (
        <Rect
          width={item.width || 40}
          height={item.height || 40}
          fill={item.color || '#3b82f6'}
          cornerRadius={6}
          stroke={isSelected ? '#00f0ff' : undefined}
          strokeWidth={isSelected ? 2 : 0}
        />
      )}

      {/* Label for visual identification */}
      {item.label && !imageIsReady && (
        <KonvaText
          text={item.label}
          fontSize={10}
          fill="#ffffff"
          x={2}
          y={2}
          width={(item.width || 40) - 4}
          ellipsis
        />
      )}
    </Group>
  );
});

CanvasItem.displayName = 'CanvasItem';

export default CanvasItem;
