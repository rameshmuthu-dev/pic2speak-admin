import { useState, useCallback, useRef } from 'react';

const DEFAULT_ROAD = {
  name: 'Main Adventure Path',
  points: [],
  width: 36,
  dash: undefined,
  color: '#e8cd9e',
  visible: true,
};

const MIN_POINT_DISTANCE = 3;

export const useRoadPath = (
  roadPaths,
  setRoadPaths,
  activeTool,
  activeLayer,
  scale
) => {
  const [selectedRoadId, setSelectedRoadId] = useState(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const drawingPathIdRef = useRef(null);

  const activeRoad =
    roadPaths.find((path) => path.id === selectedRoadId) || roadPaths[0] || null;

  const getCurrentPath = useCallback(
    () =>
      roadPaths.find((path) => path.id === selectedRoadId) ||
      roadPaths[0] ||
      null,
    [roadPaths, selectedRoadId]
  );

  const getMapPoint = useCallback(
    (event, stageRef) => {
      const stage = stageRef?.current?.getStage?.();
      if (!stage || !scale || scale <= 0) return null;

      const pointer = stage.getPointerPosition();
      if (!pointer) return null;

      return {
        x: pointer.x / scale,
        y: pointer.y / scale,
      };
    },
    [scale]
  );

  const appendPoint = useCallback(
    (pathId, point, force = false) => {
      if (!point || !pathId) return;

      const previousPoint = lastPointRef.current;

      if (previousPoint && !force) {
        const dx = point.x - previousPoint.x;
        const dy = point.y - previousPoint.y;

        if (Math.hypot(dx, dy) < MIN_POINT_DISTANCE) return;
      }

      lastPointRef.current = point;

      setRoadPaths((previousPaths) =>
        previousPaths.map((path) => {
          if (path.id !== pathId) return path;

          const points = path.points || [];
          const lastX = points[points.length - 2];
          const lastY = points[points.length - 1];

          if (
            lastX !== undefined &&
            Math.hypot(point.x - lastX, point.y - lastY) < 0.5
          ) {
            return path;
          }

          return {
            ...path,
            points: [...points, point.x, point.y],
          };
        })
      );
    },
    [setRoadPaths]
  );

  const handleDrawStart = useCallback(
    (event, stageRef) => {
      if (activeTool !== 'Draw Path') return;
      if (activeLayer !== 'All Layers' && activeLayer !== 'Roads') return;

      const stage = stageRef?.current?.getStage?.();
      if (!stage) return;

      // Drawing should start only on the empty canvas/background,
      // not on objects or existing road-point handles.
      const target = event.target;
      const clickedOnStage = target === stage;
      const clickedOnBackground = [
        'bg-image',
        'bg-rect',
        'map-background',
      ].includes(target?.name?.());

      if (!clickedOnStage && !clickedOnBackground) return;

      const point = getMapPoint(event, stageRef);
      if (!point) return;

      let currentPath =
        roadPaths.find((path) => path.id === selectedRoadId) ||
        roadPaths.find((path) => path.name === DEFAULT_ROAD.name) ||
        null;

      if (!currentPath) {
        currentPath = {
          ...DEFAULT_ROAD,
          id: `path-${Date.now()}`,
          points: [],
        };

        setRoadPaths((previousPaths) => [...previousPaths, currentPath]);
      }

      setSelectedRoadId(currentPath.id);
      setSelectedPointIndex(null);

      isDrawingRef.current = true;
      drawingPathIdRef.current = currentPath.id;
      lastPointRef.current = null;

      appendPoint(currentPath.id, point, true);

      // Capture pointer movement through the Konva stage.
      stage.setPointersPositions?.(event.evt);
    },
    [
      activeTool,
      activeLayer,
      roadPaths,
      selectedRoadId,
      getMapPoint,
      appendPoint,
      setRoadPaths,
    ]
  );

  const handleDrawMove = useCallback(
    (event, stageRef) => {
      if (!isDrawingRef.current || activeTool !== 'Draw Path') return;

      const point = getMapPoint(event, stageRef);
      if (!point) return;

      appendPoint(drawingPathIdRef.current, point);
    },
    [activeTool, getMapPoint, appendPoint]
  );

  const handleDrawEnd = useCallback(() => {
    isDrawingRef.current = false;
    drawingPathIdRef.current = null;
    lastPointRef.current = null;
  }, []);

  const handleUndoLastPoint = useCallback(() => {
    const currentPath = getCurrentPath();
    if (!currentPath?.points?.length) return;

    setRoadPaths((previousPaths) =>
      previousPaths.map((path) =>
        path.id === currentPath.id
          ? { ...path, points: path.points.slice(0, -2) }
          : path
      )
    );

    setSelectedPointIndex(null);
    handleDrawEnd();
  }, [getCurrentPath, setRoadPaths, handleDrawEnd]);

  const handleSelectNextPoint = useCallback(() => {
    const currentPath = getCurrentPath();
    if (!currentPath?.points?.length) return;

    const count = currentPath.points.length / 2;

    setSelectedPointIndex((currentIndex) =>
      currentIndex === null || currentIndex >= count - 1
        ? 0
        : currentIndex + 1
    );
  }, [getCurrentPath]);

  // Keep this handler for existing callers that use click-to-add points.
  const handleStageClick = useCallback(
    (event, stageRef) => {
      if (activeTool === 'Draw Path') return;

      const stage = stageRef?.current?.getStage?.();
      if (!stage) return;

      const target = event.target;
      const clickedOnEmpty =
        target === stage ||
        ['bg-image', 'bg-rect', 'map-background'].includes(
          target?.name?.()
        );

      if (clickedOnEmpty) return { deselect: true };
    },
    [activeTool]
  );

  const handleUpdateRoadProperty = useCallback(
    (property, value) => {
      const currentPath = getCurrentPath();
      if (!currentPath) return;

      setRoadPaths((previousPaths) =>
        previousPaths.map((path) =>
          path.id === currentPath.id
            ? { ...path, [property]: value }
            : path
        )
      );
    },
    [getCurrentPath, setRoadPaths]
  );

  const handleUpdatePoint = useCallback(
    (index, axis, value) => {
      const currentPath = getCurrentPath();
      if (!currentPath || selectedPointIndex === null) return;

      setRoadPaths((previousPaths) =>
        previousPaths.map((path) => {
          if (path.id !== currentPath.id) return path;

          const points = [...path.points];
          const offset = selectedPointIndex * 2;

          if (axis && typeof axis === 'object') {
            points[offset] = axis.x;
            points[offset + 1] = axis.y;
          } else {
            points[offset + (axis === 'x' ? 0 : 1)] = value;
          }

          return { ...path, points };
        })
      );
    },
    [getCurrentPath, selectedPointIndex, setRoadPaths]
  );

  const handleDeletePoint = useCallback(() => {
    const currentPath = getCurrentPath();
    if (!currentPath || selectedPointIndex === null) return;

    setRoadPaths((previousPaths) =>
      previousPaths.map((path) => {
        if (path.id !== currentPath.id) return path;

        const offset = selectedPointIndex * 2;
        return {
          ...path,
          points: path.points.filter(
            (_, index) => index !== offset && index !== offset + 1
          ),
        };
      })
    );

    setSelectedPointIndex(null);
  }, [getCurrentPath, selectedPointIndex, setRoadPaths]);

  const handleDeleteRoad = useCallback(() => {
    const currentPath = getCurrentPath();
    if (!currentPath) return;

    handleDrawEnd();

    setRoadPaths((previousPaths) => {
      const remaining = previousPaths.filter(
        (path) => path.id !== currentPath.id
      );

      setSelectedRoadId(remaining[0]?.id || null);
      return remaining;
    });

    setSelectedPointIndex(null);
  }, [getCurrentPath, setRoadPaths, handleDrawEnd]);

  return {
    selectedRoadId,
    setSelectedRoadId,
    selectedPointIndex,
    setSelectedPointIndex,
    activeRoad,
    handleUndoLastPoint,
    handleSelectNextPoint,
    handleStageClick,
    handleDrawStart,
    handleDrawMove,
    handleDrawEnd,
    handleUpdateRoadProperty,
    handleUpdatePoint,
    handleDeletePoint,
    handleDeleteRoad,
  };
};