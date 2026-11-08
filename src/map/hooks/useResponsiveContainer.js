import { useState, useEffect, useMemo } from 'react';
import { getResponsiveLayoutMetrics } from '../utils/mapProjection.js';

export const CANONICAL_WORLD_WIDTH = 800;

export const useResponsiveContainer = (responsiveContainerRef, isDataLoaded) => {
  const [containerHeight, setContainerHeight] = useState(800);
  const [containerWidth, setContainerWidth] = useState(0);

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

      // Flex layouts can report zero during an intermediate layout pass.
      // Retry for up to 10 frames if dimensions are not yet valid.
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

  const effectiveWidth = containerWidth || (typeof window !== 'undefined' ? window.innerWidth : CANONICAL_WORLD_WIDTH);
  // Shared uniform responsive scale from the actual available canvas width relative to canonical 800px world
  const scale = Number((effectiveWidth / CANONICAL_WORLD_WIDTH).toFixed(6));
  const metrics = useMemo(() => getResponsiveLayoutMetrics(effectiveWidth), [effectiveWidth]);

  return {
    containerWidth: effectiveWidth,
    containerHeight,
    metrics,
    scale,
  };
};
