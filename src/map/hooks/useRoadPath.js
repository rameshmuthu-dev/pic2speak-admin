import { useState, useCallback } from 'react';
import { findNearestPointIndex, buildChainedRoadCurve } from '../utils/roadCurveUtils.js';

export const useRoadPath = (roadPaths, setRoadPaths, activeTool, activeLayer, scale) => {
  const [selectedRoadId, setSelectedRoadId] = useState(null);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);

  const activeRoad = roadPaths.find(p => p.id === selectedRoadId) || roadPaths[0];

  const handleUndoLastPoint = useCallback(() => {
    const currentPath = roadPaths.find(p => p.id === selectedRoadId) || roadPaths[0];
    if (!currentPath || currentPath.points.length === 0) return;

    const newPoints = [...currentPath.points];
    newPoints.pop();
    newPoints.pop();

    setRoadPaths(roadPaths.map(p => p.id === currentPath.id ? { ...p, points: newPoints } : p));
    setSelectedPointIndex(null);
  }, [roadPaths, selectedRoadId, setRoadPaths]);

  const handleSelectNextPoint = useCallback(() => {
    const currentPath = roadPaths.find(p => p.id === selectedRoadId) || roadPaths[0];
    if (!currentPath || currentPath.points.length === 0) return;

    const totalPointsCount = currentPath.points.length / 2;
    if (selectedPointIndex === null || selectedPointIndex >= totalPointsCount - 1) {
      setSelectedPointIndex(0);
    } else {
      setSelectedPointIndex(selectedPointIndex + 1);
    }
  }, [roadPaths, selectedRoadId, selectedPointIndex]);

  const handleStageClick = useCallback((e, stageRef) => {
    const stage = stageRef.current.getStage();
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;

    const virtualX = pointerPosition.x / scale;
    const virtualY = pointerPosition.y / scale;

    if (activeTool === 'Draw Path') {
      const currentPath = roadPaths.find(p => p.id === selectedRoadId) || roadPaths[0];

      if (currentPath) {
        const updatedPoints = [...currentPath.points, virtualX, virtualY];
        setRoadPaths(roadPaths.map(p => p.id === currentPath.id ? { ...p, points: updatedPoints } : p));
        setSelectedPointIndex(updatedPoints.length / 2 - 1);
      } else {
        const newPath = {
          id: `path-${Date.now()}`,
          name: 'Main Adventure Path',
          points: [virtualX, virtualY],
          width: 36,
          dash: undefined,
          color: '#e8cd9e',
          visible: true
        };
        setRoadPaths([...roadPaths, newPath]);
        setSelectedRoadId(newPath.id);
        setSelectedPointIndex(0);
      }
      return;
    }

    const clickedOnEmpty =
      e.target === e.target.getStage() ||
      e.target.name() === 'bg-image' ||
      e.target.name() === 'bg-rect';

    if (clickedOnEmpty) {
      return { deselect: true };
    }
  }, [activeTool, roadPaths, selectedRoadId, scale, setRoadPaths]);

  const handleUpdateRoadProperty = useCallback((property, value) => {
    if (!activeRoad) return;
    setRoadPaths(roadPaths.map(p => p.id === activeRoad.id ? { ...p, [property]: value } : p));
  }, [activeRoad, roadPaths, setRoadPaths]);

  const handleUpdatePoint = useCallback((index, axis, value) => {
    if (!activeRoad || selectedPointIndex === null) return;
    const newPoints = [...activeRoad.points];
    const pointIndex = selectedPointIndex * 2 + (axis === 'x' ? 0 : 1);
    newPoints[pointIndex] = value;
    setRoadPaths(roadPaths.map(p => p.id === activeRoad.id ? { ...p, points: newPoints } : p));
  }, [activeRoad, selectedPointIndex, setRoadPaths]);

  const handleDeletePoint = useCallback(() => {
    if (!activeRoad || selectedPointIndex === null) return;
    const newPoints = activeRoad.points.filter((_, idx) => idx !== selectedPointIndex * 2 && idx !== selectedPointIndex * 2 + 1);
    setRoadPaths(roadPaths.map(p => p.id === activeRoad.id ? { ...p, points: newPoints } : p));
    setSelectedPointIndex(null);
  }, [activeRoad, selectedPointIndex, setRoadPaths]);

  const handleDeleteRoad = useCallback(() => {
    if (!activeRoad) return;
    const remainingRoads = roadPaths.filter(p => p.id !== activeRoad.id);
    setRoadPaths(remainingRoads);
    setSelectedRoadId(remainingRoads[0]?.id || null);
    setSelectedPointIndex(null);
  }, [activeRoad, roadPaths, setRoadPaths]);

  return {
    selectedRoadId,
    setSelectedRoadId,
    selectedPointIndex,
    setSelectedPointIndex,
    activeRoad,
    handleUndoLastPoint,
    handleSelectNextPoint,
    handleStageClick,
    handleUpdateRoadProperty,
    handleUpdatePoint,
    handleDeletePoint,
    handleDeleteRoad
  };
};