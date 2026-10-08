import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { isCharacterType } from '../utils/mapCalculations.js';
import { findNearestPointIndex, buildChainedRoadCurve } from '../utils/roadCurveUtils.js';
import { getItemContent } from '../utils/languageUtils.js';

const WALK_SPEED_PX_PER_SEC = 34;

export const useWalkingAnimation = (mapItems, roadPaths, selectedRoadId, committedRoadPaths, scale, activeLanguage) => {
  const [isWalking, setIsWalking] = useState(false);
  const [walkFrameIndex, setWalkFrameIndex] = useState(0);
  const [walkKey, setWalkKey] = useState(0);
  const [walkSegmentIndex, setWalkSegmentIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const lessonLayoutKey = useMemo(() => {
    return (mapItems || [])
      .filter((item) => item.type === 'Lesson Cards' || item.type === 'Buildings')
      .map((item) => `${item.id}:${item.type}:${item.x}:${item.y}:${item.buildingId || ''}:${item.order || ''}`)
      .join('|');
  }, [mapItems]);

  const computeLessonWalkStops = (rawRoadPoints) => {
    const lessonCardsSorted = (mapItems || [])
      .filter((item) => item.type === 'Lesson Cards')
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const lessonWalkStops = [];
    let searchFrom = 0;
    lessonCardsSorted.forEach((card) => {
      if (!rawRoadPoints.length) return;
      const cardTitle = getItemContent(card, activeLanguage || 'en').title.trim().toLowerCase();
      const building = mapItems.find((i) => i.id === card.buildingId)
        || (cardTitle && mapItems.find((i) => (i.type || '') === 'Buildings'
          && getItemContent(i, activeLanguage || 'en').title.trim().toLowerCase() === cardTitle));
      const px = building ? building.x + (building.width || 40) / 2 : card.x + (card.width || 154) / 2;
      const py = building ? building.y + (building.height || 40) / 2 : card.y + (card.height || 72) / 2;
      const idx = findNearestPointIndex(rawRoadPoints, px, py, searchFrom);
      lessonWalkStops.push(idx);
      searchFrom = idx;
    });
    return lessonWalkStops;
  };

  useEffect(() => {
    const activeRoad = roadPaths.find(p => p.id === selectedRoadId) || roadPaths[0];
    const rawRoadPoints = [];
    if (activeRoad?.points?.length >= 4) {
      for (let i = 0; i < activeRoad.points.length; i += 2) {
        rawRoadPoints.push({ x: activeRoad.points[i], y: activeRoad.points[i + 1] });
      }
    }

    const lessonWalkStops = computeLessonWalkStops(rawRoadPoints);

    if (lessonWalkStops.length > 0) {
      setWalkSegmentIndex(lessonWalkStops[0]);
      setCurrentLessonIndex(0);
    }
  }, [lessonLayoutKey, roadPaths, selectedRoadId, activeLanguage]);

  const stepAudioRef = useRef(null);

  useEffect(() => {
    if (!isWalking) {
      setWalkFrameIndex(0);
      return undefined;
    }
    const walker = mapItems.find(item => isCharacterType(item.type));
    const frames = walker?.walkFrames || [];
    if (frames.length < 2) return undefined;
    const intervalId = setInterval(() => {
      setWalkFrameIndex((idx) => (idx + 1) % frames.length);
    }, 190);
    return () => clearInterval(intervalId);
  }, [isWalking, mapItems]);

  useEffect(() => {
    const walker = mapItems.find(item => isCharacterType(item.type));
    const stepSoundSrc = walker?.stepSound;

    if (!isWalking || !stepSoundSrc) {
      if (stepAudioRef.current) {
        stepAudioRef.current.pause();
        stepAudioRef.current.currentTime = 0;
        stepAudioRef.current = null;
      }
      return undefined;
    }

    const audio = new Audio(stepSoundSrc);
    audio.loop = true;
    audio.volume = 0.6;
    stepAudioRef.current = audio;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
      if (stepAudioRef.current === audio) stepAudioRef.current = null;
    };
  }, [isWalking, mapItems]);

  useEffect(() => {
    const walkerSprite = mapItems.find(item => isCharacterType(item.type));
    if (!walkerSprite || isWalking || walkSegmentIndex !== 0) return;

    const committedActiveRoad = committedRoadPaths.find(p => p.id === selectedRoadId) || committedRoadPaths[0];
    const walkPoints = [];
    if (committedActiveRoad?.points?.length >= 4) {
      for (let i = 0; i < committedActiveRoad.points.length; i += 2) {
        walkPoints.push({ x: committedActiveRoad.points[i] * scale, y: committedActiveRoad.points[i + 1] * scale });
      }
    }

    if (!walkPoints.length) return;

    const w = walkerSprite.width || 40;
    const h = walkerSprite.height || 40;
    const homeX = walkPoints[0].x / scale - w / 2;
    const homeY = walkPoints[0].y / scale - h * 0.88;
  }, [mapItems, isWalking, walkSegmentIndex, committedRoadPaths, selectedRoadId, scale]);

  const activeRoad = roadPaths.find(p => p.id === selectedRoadId) || roadPaths[0];

  const walkPoints = [];
  if (activeRoad?.points?.length >= 4) {
    for (let i = 0; i < activeRoad.points.length; i += 2) {
      walkPoints.push({ x: activeRoad.points[i] * scale, y: activeRoad.points[i + 1] * scale });
    }
  }

  const walkerSprite = mapItems.find(item => isCharacterType(item.type));
  const walkFrames = walkerSprite?.walkFrames || [];
  const hasWalkFrames = walkFrames.length >= 2;
  const currentWalkImageSrc = hasWalkFrames ? walkFrames[walkFrameIndex % walkFrames.length] : (walkerSprite?.src || '');
  const walkerScaledWidth = (walkerSprite?.width || 40) * scale;
  const walkerScaledHeight = (walkerSprite?.height || 40) * scale;

  const rawRoadPoints = [];
  if (activeRoad?.points?.length >= 4) {
    for (let i = 0; i < activeRoad.points.length; i += 2) {
      rawRoadPoints.push({ x: activeRoad.points[i], y: activeRoad.points[i + 1] });
    }
  }

  const lessonWalkStops = computeLessonWalkStops(rawRoadPoints);

  const actualTargetIndex = lessonWalkStops.length > 0 && currentLessonIndex < lessonWalkStops.length - 1
    ? lessonWalkStops[currentLessonIndex + 1]
    : (lessonWalkStops.length > 0 ? lessonWalkStops[0] : Math.min(walkSegmentIndex + 1, walkPoints.length - 1));

  const walkFrom = walkPoints[walkSegmentIndex] || walkPoints[0];
  const actualWalkTo = walkPoints[actualTargetIndex];
  const actualWalkChainCurve = buildChainedRoadCurve(walkPoints, walkSegmentIndex, actualTargetIndex);
  const actualWalkCurveXs = actualWalkChainCurve.map((p) => p.x);
  const actualWalkCurveYs = actualWalkChainCurve.map((p) => p.y);

  let walkDist = 0;
  for (let i = 1; i < actualWalkChainCurve.length; i++) {
    walkDist += Math.hypot(actualWalkChainCurve[i].x - actualWalkChainCurve[i - 1].x, actualWalkChainCurve[i].y - actualWalkChainCurve[i - 1].y);
  }

  const walkSegmentDuration = Math.max(1.8, walkDist / WALK_SPEED_PX_PER_SEC);
  const walkFacingLeft = actualWalkTo && walkFrom ? (actualWalkTo.x - walkFrom.x) < -2 : false;
  const isAtFinalStop = actualTargetIndex === walkSegmentIndex;

  const totalWalkStops = lessonWalkStops.length || Math.max(1, walkPoints.length - 1);
  const currentWalkStopNumber = lessonWalkStops.length
    ? Math.max(1, lessonWalkStops.filter((idx) => idx <= walkSegmentIndex).length)
    : walkSegmentIndex + 1;

  const handleTestWalk = useCallback(() => {
    const walker = mapItems.find(item => isCharacterType(item.type));
    if (!walker) {
      return { error: 'Add a character to the map first.' };
    }
    if (walkPoints.length < 2) {
      return { error: 'Draw a road path with at least 2 points first, then try the walk test.' };
    }
    if (isWalking) return { error: null };

    if (lessonWalkStops.length > 0 && currentLessonIndex >= lessonWalkStops.length - 1) {
      setCurrentLessonIndex(0);
      const startIdx = lessonWalkStops[0];
      setWalkSegmentIndex(startIdx);
      setWalkKey((k) => k + 1);
      requestAnimationFrame(() => setIsWalking(true));
      return { error: null };
    }

    if (lessonWalkStops.length > 0) {
      setWalkKey((k) => k + 1);
      requestAnimationFrame(() => setIsWalking(true));
      return { error: null };
    } else {
      if (walkSegmentIndex < walkPoints.length - 1) {
        setWalkSegmentIndex(walkSegmentIndex + 1);
        setWalkKey((k) => k + 1);
        requestAnimationFrame(() => setIsWalking(true));
        return { error: null };
      } else {
        return { error: 'Already at the final road point.' };
      }
    }
  }, [walkPoints, isWalking, walkSegmentIndex, lessonWalkStops, currentLessonIndex]);

  const handleAnimationComplete = useCallback(() => {
    setIsWalking(false);
    setWalkSegmentIndex(actualTargetIndex);
    if (lessonWalkStops.length > 0 && currentLessonIndex < lessonWalkStops.length - 1) {
      setCurrentLessonIndex((idx) => idx + 1);
    }
  }, [actualTargetIndex, lessonWalkStops, currentLessonIndex]);

  return {
    isWalking,
    walkFrameIndex,
    walkKey,
    walkSegmentIndex,
    walkPoints,
    walkFrom,
    walkTo: actualWalkTo,
    walkChainCurve: actualWalkChainCurve,
    walkCurveXs: actualWalkCurveXs,
    walkCurveYs: actualWalkCurveYs,
    walkSegmentDuration,
    walkFacingLeft,
    isAtFinalStop,
    currentWalkStopNumber,
    totalWalkStops,
    currentWalkImageSrc,
    walkerScaledWidth,
    walkerScaledHeight,
    hasWalkFrames,
    handleTestWalk,
    handleAnimationComplete
  };
};