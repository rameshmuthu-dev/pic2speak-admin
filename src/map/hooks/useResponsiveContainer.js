import { useState, useEffect } from 'react';

const BASE_WIDTH = 800;

export const useResponsiveContainer = (responsiveContainerRef, isDataLoaded) => {
  const [containerHeight, setContainerHeight] = useState(600);
  const [containerWidth, setContainerWidth] = useState(BASE_WIDTH);

  useEffect(() => {
    const node = responsiveContainerRef.current;
    if (!node) return;

    let disposed = false;
    let retryFrame = null;
    let retryCount = 0;

    const setMeasuredDimension = (setter, value) => {
      if (!Number.isFinite(value) || value <= 0) return false;
      setter((previous) => (previous === value ? previous : value));
      return true;
    };

    const updateDimensions = () => {
      if (disposed || !responsiveContainerRef.current) return;

      const currentNode = responsiveContainerRef.current;
      const rect = currentNode.getBoundingClientRect();
      const measuredWidth = Math.floor(rect.width || currentNode.clientWidth);
      const measuredHeight = Math.floor(rect.height || currentNode.clientHeight);
      const widthIsValid = setMeasuredDimension(setContainerWidth, measuredWidth);
      const heightIsValid = setMeasuredDimension(setContainerHeight, measuredHeight);

      // Flex layouts can report zero during an intermediate mobile layout
      // pass. Keep the last valid dimensions and retry on the next frame
      // instead of mounting a zero-sized Konva stage.
      if ((!widthIsValid || !heightIsValid) && retryCount < 10) {
        retryCount += 1;
        retryFrame = window.requestAnimationFrame(updateDimensions);
      } else if (widthIsValid && heightIsValid) {
        retryCount = 0;
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(node);
    window.addEventListener('resize', updateDimensions);

    return () => {
      disposed = true;
      if (retryFrame !== null) {
        window.cancelAnimationFrame(retryFrame);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [isDataLoaded, responsiveContainerRef]);

  const scale = Math.max(0.1, containerWidth / BASE_WIDTH);

  return {
    containerWidth,
    containerHeight,
    scale,
    BASE_WIDTH
  };
};
