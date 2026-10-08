import React, { useRef, useEffect } from 'react';
import { Group, Image as KonvaImage, Rect, Text as KonvaText } from 'react-konva';
import useImage from 'use-image';

const CanvasItem = React.memo(({ item, activeTool, isSelected, onSelect, onDelete, onClone, onDragEnd, onTransformEnd, isPreview, isHidden, isLayerActive = true }) => {
  const [img] = useImage(item.src || item.imageUrl || '');
  const shapeRef = useRef(null);

  useEffect(() => {
    if (isSelected && shapeRef.current && !isPreview) {
      shapeRef.current.moveToTop();
    }
  }, [isSelected, isPreview]);

  const canInteract = !isPreview && !isHidden && isLayerActive;

  return (
    <Group
      ref={shapeRef}
      id={`item-${item.id}`}
      name="map-item"
      x={item.x}
      y={item.y}
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
        if (canInteract) onDragEnd(item.id, e.target.x(), e.target.y());
      }}
      onTransformEnd={() => {
        if (!canInteract) return;
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        const newWidth = Math.max(10, (item.width || 40) * scaleX);
        const newHeight = Math.max(10, (item.height || 40) * scaleY);

        onTransformEnd(item.id, {
          x: node.x(),
          y: node.y(),
          scaleX: 1,
          scaleY: 1,
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
        });
      }}
    >
      <Rect
        width={item.width || 40}
        height={item.height || 40}
        fill="transparent"
        listening={true}
      />
      {img ? (
        <KonvaImage
          image={img}
          width={item.width || 40}
          height={item.height || 40}
          listening={false}
        />
      ) : (
        <Group listening={false}>
          <Rect
            width={item.width || 40}
            height={item.height || 40}
            fill={item.color || "#599824"}
            cornerRadius={6}
            stroke="#386623"
            strokeWidth={1}
          />
          <KonvaText text={item.emoji || "🏢"} fontSize={16} x={10} y={10} />
        </Group>
      )}
    </Group>
  );
});

export default CanvasItem;
