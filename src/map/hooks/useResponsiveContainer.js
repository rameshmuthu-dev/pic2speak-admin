import { useState, useEffect, useRef } from 'react';

const BASE_WIDTH = 800;

export const useResponsiveContainer = (responsiveContainerRef, isDataLoaded) => {
  const [containerHeight, setContainerHeight] = useState(600);
  const [containerWidth, setContainerWidth] = useState(BASE_WIDTH);

  useEffect(() => {
    const node = responsiveContainerRef.current;
    if (!node) return;

    const updateDimensions = () => {
      if (responsiveContainerRef.current) {
        setContainerWidth(responsiveContainerRef.current.clientWidth);
        setContainerHeight(responsiveContainerRef.current.clientHeight);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target) {
          setContainerWidth(entry.target.clientWidth);
          setContainerHeight(entry.target.clientHeight);
        }
      }
    });

    resizeObserver.observe(node);
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [isDataLoaded]);

  const scale = containerWidth / BASE_WIDTH;

  return {
    containerWidth,
    containerHeight,
    scale,
    BASE_WIDTH
  };
};
