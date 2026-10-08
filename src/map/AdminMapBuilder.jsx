import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Transformer } from 'react-konva';

import {
  fetchDraftMap,
  saveDraftMap,
  saveMapAssets,
  publishMap,
  fetchPublishedMap,
  selectDraftMap,
  selectPublishedMap,
  selectAdventureMapStatus,
} from '../redux/slices/adventureMapSlice';
import {
  createAssetGroup,
} from '../redux/slices/assetGroupSlice';
import {
  fetchLanguages,
  setActiveLanguageCode,
  selectActiveLanguages,
  selectActiveLanguageCode,
  selectLanguagesStatus,
} from '../redux/slices/Languagesslice';
import {
  selectAllLessonMasters,
} from '../redux/slices/lessonMasterSlice';
import {
  fetchLessonContents,
  selectAllLessonContents,
} from '../redux/slices/lessonContentSlice';

import MapStage from './components/canvas/MapStage.jsx';
import WalkingCharacter from './components/canvas/WalkingCharacter.jsx';
import LeftSidebar from './components/sidebar/LeftSidebar.jsx';
import RightSidebar from './components/sidebar/RightSidebar.jsx';
import MapBuilderHeader from './components/header/MapBuilderHeader.jsx';
import AssetModal from './components/modals/AssetModal.jsx';
import BackgroundModal from './components/modals/BackgroundModal.jsx';
import CategoryModal from './components/modals/CategoryModal.jsx';
import PreviewModal from './components/modals/PreviewModal.jsx';

import { useMapData } from './hooks/useMapData.js';
import { useMapAutosave } from './hooks/useMapAutosave.js';
import { useWalkingAnimation } from './hooks/useWalkingAnimation.js';
import { useResponsiveContainer } from './hooks/useResponsiveContainer.js';
import { useRoadPath } from './hooks/useRoadPath.js';
import { useAssetUpload } from './hooks/useAssetUpload.js';
import { useLessonCard } from './hooks/useLessonCard.js';

import { getLanguageMapProgress } from './utils/mapCalculations.js';
import { isCharacterType } from './utils/mapCalculations.js';
import { sameCategory } from './utils/mapCalculations.js';
import { extractCharacterConfig } from './utils/mapCalculations.js';

const BASE_WIDTH = 800;
const defaultBgData = {
  themes: {
    rich_grass_green: {
      image: "",
      properties: { scale: 1, opacity: 1 },
      color: "#599824",
      label: "Rich Grass Green"
    },
  },
  currentTheme: "rich_grass_green"
};

const AdminBuilder = ({ onManageLanguages }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const assetGroups = useSelector((state) => state.assetGroups.items);
  const lessonMasters = useSelector(selectAllLessonMasters);
  const lessonContents = useSelector(selectAllLessonContents);
  const languages = useSelector(selectActiveLanguages);
  const activeLanguage = useSelector(selectActiveLanguageCode);
  const languagesStatus = useSelector(selectLanguagesStatus);

  const handleManageLanguages = useCallback(() => {
    if (onManageLanguages) {
      onManageLanguages();
    } else {
      navigate('/admin/languages');
    }
  }, [onManageLanguages, navigate]);

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [customThemes, setCustomThemes] = useState(defaultBgData.themes);
  const [activeTool, setActiveTool] = useState('Select');
  const [activeLayer, setActiveLayer] = useState('All Layers');
  const [selectedThemeKey, setSelectedThemeKey] = useState('rich_grass_green');
  const [mapActive, setMapActive] = useState(true);
  const [mapTitle, setMapTitle] = useState('Adventure Map');
  const [selectedId, setSelectedId] = useState(null);
  const [lockAspect, setLockAspect] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [committedMapItems, setCommittedMapItems] = useState([]);
  const [committedRoadPaths, setCommittedRoadPaths] = useState([]);
  const [characterConfig, setCharacterConfig] = useState(null);
  const hasCommittedInitialRef = useRef(false);
  const [mapItems, setMapItems] = useState([]);
  const [roadPaths, setRoadPaths] = useState([]);
  const [bgSections, setBgSections] = useState([
    { id: 1, y: 0, height: 800, themeKey: 'rich_grass_green' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState('Buildings');
  const [newAssetForm, setNewAssetForm] = useState({
    label: '', src: '', width: 40, height: 40, color: '#3b82f6', walkFrames: [], stepSound: ''
  });
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [newBgForm, setNewBgForm] = useState({ label: '', color: '', image: '' });
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [isBgDragActive, setIsBgDragActive] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [previewMapItems, setPreviewMapItems] = useState([]);
  const [previewRoadPaths, setPreviewRoadPaths] = useState([]);
  const [previewBgSections, setPreviewBgSections] = useState([]);
  const [previewCustomThemes, setPreviewCustomThemes] = useState(defaultBgData.themes);

  const responsiveContainerRef = useRef(null);
  const trRef = useRef(null);
  const stageRef = useRef(null);

  const { isDataLoaded, customAssetsList, setCustomAssetsList, initializeData, saveCustomAssets } = useMapData();
  const { uploadFileToServer, loadImageNaturalSize, fitAssetDimensions } = useAssetUpload(dispatch);
  const { containerWidth, containerHeight, scale } = useResponsiveContainer(responsiveContainerRef, isDataLoaded);
  const { selectedRoadId, setSelectedRoadId, selectedPointIndex, setSelectedPointIndex, activeRoad, handleUndoLastPoint, handleSelectNextPoint, handleStageClick, handleUpdateRoadProperty, handleUpdatePoint, handleDeletePoint, handleDeleteRoad } = useRoadPath(roadPaths, setRoadPaths, activeTool, activeLayer, scale);
  const { lessonOptions, handleSelectLessonForCard } = useLessonCard(lessonMasters, lessonContents, activeLanguage, mapItems, setMapItems);
  const { isWalking, walkFrameIndex, walkKey, walkSegmentIndex, walkPoints, walkFrom, walkTo, walkChainCurve, walkCurveXs, walkCurveYs, walkSegmentDuration, walkFacingLeft, isAtFinalStop, currentWalkStopNumber, totalWalkStops, currentWalkImageSrc, walkerScaledWidth, walkerScaledHeight, hasWalkFrames, handleTestWalk, handleAnimationComplete } = useWalkingAnimation(mapItems, roadPaths, selectedRoadId, committedRoadPaths, scale, activeLanguage);

  useMapAutosave(isDataLoaded, mapTitle, mapActive, bgSections, customThemes, mapItems, roadPaths);

  useEffect(() => {
    if (languagesStatus === 'idle') {
      dispatch(fetchLanguages());
    }
  }, [languagesStatus, dispatch]);

  useEffect(() => {
    if (languages.length > 0 && !activeLanguage) {
      dispatch(setActiveLanguageCode(languages[0].code));
    }
  }, [languages, activeLanguage, dispatch]);

  useEffect(() => {
    void initializeData(setCustomThemes, setMapActive, setMapTitle, setMapItems, setBgSections, setRoadPaths, setSelectedRoadId, setCharacterConfig);
  }, [initializeData]);

  useEffect(() => {
    if (isDataLoaded && !hasCommittedInitialRef.current) {
      setCommittedMapItems(mapItems);
      setCommittedRoadPaths(roadPaths);
      hasCommittedInitialRef.current = true;
    }
  }, [isDataLoaded]);

  useEffect(() => {
    void saveCustomAssets(customAssetsList);
  }, [customAssetsList, saveCustomAssets]);

  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    const selectedMapItem = mapItems.find((item) => item.id === selectedId);
    if (selectedId && selectedMapItem?.type !== 'Lesson Cards' && (activeTool === 'Select' || activeTool === 'Move')) {
      const stageNode = stageRef.current.getStage();
      const selectedNode = stageNode.findOne(`#item-${selectedId}`);
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        const layer = trRef.current.getLayer();
        if (layer) layer.batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    } else {
      trRef.current.nodes([]);
    }
  }, [selectedId, activeTool, mapItems]);

  const categoriesList = useMemo(() => assetGroups.map((g) => g.name), [assetGroups]);
  const selectedItem = mapItems.find((item) => item.id === selectedId);
  const { visibleBuildingIds, visibleHeight } = getLanguageMapProgress(mapItems, activeLanguage);

  const totalStageHeight = bgSections.reduce((acc, sec) => acc + sec.height, 0);
  const stageHeight = totalStageHeight * scale;

  const lastSectionTheme = bgSections.length
    ? customThemes[bgSections[bgSections.length - 1].themeKey]
    : null;
  const fallbackBgColor = lastSectionTheme?.color || '#599824';

  const previewVisibleObjectItems = mapItems.filter((item) => item.type !== 'Lesson Cards');
  const previewVisibleLessonCards = mapItems.filter((item) => item.type === 'Lesson Cards');
  const previewStageHeight = Math.max(600, visibleHeight || 600);

  const publishedSlotsForActiveLang = visibleBuildingIds.size;
  const totalBuildingSlots = mapItems.filter((item) => item.type === 'Lesson Cards').length;

  const handleSelectItem = useCallback((item) => {
    setSelectedId(item.id);
    setActiveLayer(item.type || 'Buildings');
    setActiveTool('Select');
    setIsRightPanelOpen(true);
  }, []);

  const handleDeleteItem = useCallback((id) => {
    setMapItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const handleCloneItem = useCallback((id) => {
    setMapItems((prev) => {
      const itemToClone = prev.find((item) => item.id === id);
      if (!itemToClone) return prev;
      const clonedItem = {
        ...itemToClone,
        id: Date.now(),
        x: itemToClone.x + 25,
        y: itemToClone.y + 25,
        lessonId: itemToClone.type === 'Lesson Cards' ? `${itemToClone.lessonId || 'lesson'}-copy-${Date.now()}` : itemToClone.lessonId,
        order: itemToClone.type === 'Lesson Cards' ? prev.filter((item) => item.type === 'Lesson Cards').length + 1 : itemToClone.order,
        content: itemToClone.content ? Object.fromEntries(Object.entries(itemToClone.content).map(([lang, c]) => [lang, { ...c }])) : undefined,
      };
      setSelectedId(clonedItem.id);
      setActiveTool('Select');
      return [...prev, clonedItem];
    });
  }, []);

  const handleDragEnd = useCallback((id, x, y) => {
    setMapItems((prev) => prev.map((item) => (item.id === id ? { ...item, x, y } : item)));
  }, []);

  const handleTransformEnd = useCallback((id, attrs) => {
    setMapItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...attrs } : item)));
  }, []);

  const handleCardDragEnd = useCallback((id, x, y) => {
    setMapItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const newRevealHeight = Math.max(80, y + (item.height || 72) + 80);
      return { ...item, x, y, revealHeight: newRevealHeight };
    }));
  }, []);

  const handleUpdateSelectedField = useCallback((id, field, value) => {
    setMapItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (lockAspect && (field === 'width' || field === 'height')) {
        const aspect = (item.width || 40) / (item.height || 40);
        if (field === 'width') {
          updated.height = Math.round(value / aspect);
        } else {
          updated.width = Math.round(value * aspect);
        }
      }
      return updated;
    }));
  }, [lockAspect]);

  const handleAddAssetToMap = useCallback((assetData) => {
    const itemType = assetData.type || 'Buildings';
    const isBuilding = sameCategory(itemType, 'Buildings');
    const itemWidth = assetData.width || 40;
    const itemHeight = assetData.height || 40;
    const sameTypeCount = mapItems.filter((i) => (i.type || 'Buildings') === itemType).length;
    const gridCols = 6;
    const gridSpacing = 70;
    const startX = 60;
    const startY = 60;
    const placeX = Math.min(BASE_WIDTH - itemWidth - 20, startX + (sameTypeCount % gridCols) * gridSpacing);
    const placeY = startY + Math.floor(sameTypeCount / gridCols) * gridSpacing;

    const newItem = {
      id: Date.now(),
      type: itemType,
      label: assetData.label || '',
      src: assetData.src || '',
      color: assetData.color || '#3b82f6',
      width: itemWidth,
      height: itemHeight,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      x: placeX,
      y: placeY,
      walkFrames: assetData.walkFrames || [],
      stepSound: assetData.stepSound || '',
      content: isBuilding ? (activeLanguage ? { [activeLanguage]: { title: '', published: false } } : {}) : undefined
    };
    setMapItems((prev) => [...prev, newItem]);
    setSelectedId(newItem.id);
    setActiveTool('Select');
    setActiveLayer(assetData.type || 'Buildings');

    requestAnimationFrame(() => {
      if (responsiveContainerRef.current) {
        responsiveContainerRef.current.scrollTo({ top: Math.max(0, placeY * scale - 100), behavior: 'smooth' });
      }
    });
  }, [activeLanguage, mapItems, scale]);

  const handleAddLessonCard = useCallback(() => {
    if (!activeLanguage) {
      alert('No active language selected yet. Add/activate a language from "Manage languages" first.');
      return;
    }
    const cardNumber = mapItems.filter((item) => item.type === 'Lesson Cards').length + 1;
    const newCard = {
      id: Date.now(),
      type: 'Lesson Cards',
      lessonId: `lesson-${cardNumber}`,
      lessonMasterId: null,
      order: cardNumber,
      buildingId: null,
      x: 100 + (cardNumber % 4) * 35,
      y: 100 + (cardNumber % 5) * 30,
      width: 154,
      height: 72,
      revealHeight: 100 + (cardNumber % 5) * 30 + 72 + 80,
      rotation: 0,
      content: { [activeLanguage]: { title: '', published: false } }
    };
    setMapItems((prev) => [...prev, newCard]);
    setSelectedId(newCard.id);
    setActiveLayer('Lesson Cards');
    setActiveTool('Select');
  }, [activeLanguage, mapItems]);

  const handleDeleteCustomAsset = useCallback((id) => {
    setCustomAssetsList((prev) => prev.filter((asset) => asset.id !== id));
  }, []);

  const handleDeleteBackgroundTheme = useCallback((key) => {
    setCustomThemes((prev) => {
      const updated = { ...prev };
      delete updated[key];
      if (Object.keys(updated).length === 0) {
        updated['rich_grass_green'] = defaultBgData.themes['rich_grass_green'];
      }
      if (selectedThemeKey === key) {
        setSelectedThemeKey(Object.keys(updated)[0]);
      }
      return updated;
    });
  }, [selectedThemeKey]);

  const handleScrollAssetRow = useCallback((category, direction) => {
    const row = document.querySelector(`[data-category="${category}"]`);
    if (row) {
      row.scrollBy({ left: direction * 100, behavior: 'smooth' });
    }
  }, []);

  const handleAddNewBackgroundSection = useCallback(() => {
    const lastSection = bgSections[bgSections.length - 1];
    const themeKeys = Object.keys(customThemes);
    const nextThemeKey = themeKeys.length > 0 ? themeKeys[bgSections.length % themeKeys.length] : selectedThemeKey;
    const newSection = {
      id: Date.now(),
      y: lastSection ? lastSection.y + lastSection.height : 0,
      height: 800,
      themeKey: nextThemeKey
    };
    setBgSections((prev) => [...prev, newSection]);
  }, [bgSections, selectedThemeKey, customThemes]);

  const handleRemoveBackgroundSection = useCallback((id) => {
    setBgSections((prev) => {
      const filtered = prev.filter((sec) => sec.id !== id);
      let yOffset = 0;
      return filtered.map((sec, idx) => {
        const updated = { ...sec, y: yOffset };
        yOffset += sec.height;
        return updated;
      });
    });
  }, []);

  const handleChangeSectionTheme = useCallback((id, themeKey) => {
    setBgSections((prev) => prev.map((sec) => (sec.id === id ? { ...sec, themeKey } : sec)));
  }, []);

  const handleClearRoadPoints = useCallback(() => {
    if (!activeRoad) return;
    setRoadPaths((prev) => prev.map((p) => (p.id === activeRoad.id ? { ...p, points: [] } : p)));
    setSelectedPointIndex(null);
  }, [activeRoad]);

  const handleAddWalkFrame = useCallback((id, urls) => {
    setMapItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      return { ...item, walkFrames: [...(item.walkFrames || []), ...urls] };
    }));
  }, []);

  const handleRemoveWalkFrame = useCallback((id, index) => {
    setMapItems((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      return { ...item, walkFrames: (item.walkFrames || []).filter((_, i) => i !== index) };
    }));
  }, []);

  const handleSetStepSound = useCallback((id, url) => {
    setMapItems((prev) => prev.map((item) => (item.id === id ? { ...item, stepSound: url } : item)));
  }, []);

  const handleRemoveStepSound = useCallback((id) => {
    setMapItems((prev) => prev.map((item) => (item.id === id ? { ...item, stepSound: '' } : item)));
  }, []);

  const handleSaveMapChanges = async () => {
    const payload = {
      mapTitle,
      mapActive,
      bgSections,
      customThemes,
      mapItems,
      roadPaths,
      characterConfig: extractCharacterConfig(mapItems, committedMapItems),
      updatedAt: new Date().toISOString()
    };
    try {
      await dispatch(saveDraftMap(payload)).unwrap();
      setCommittedMapItems(mapItems);
      setCommittedRoadPaths(roadPaths);
      setCharacterConfig(payload.characterConfig);
      setIsEditMode(false);
      alert("Adventure Map draft & Road paths saved successfully!");
    } catch (error) {
      alert("Error saving data to the server: " + (error?.message || error));
    }
  };

  const handleOpenPreview = useCallback(() => {
    setPreviewMapItems([...mapItems]);
    setPreviewRoadPaths([...roadPaths]);
    setPreviewBgSections([...bgSections]);
    setPreviewCustomThemes({ ...customThemes });
    setIsPreviewOpen(true);
  }, [mapItems, roadPaths, bgSections, customThemes]);

  const handlePublishMap = async () => {
    const payload = {
      mapTitle,
      mapActive,
      bgSections,
      customThemes,
      mapItems,
      roadPaths,
      characterConfig: extractCharacterConfig(mapItems, committedMapItems),
      updatedAt: new Date().toISOString()
    };
    try {
      await dispatch(saveDraftMap(payload)).unwrap();
      await dispatch(publishMap()).unwrap();
      setCommittedMapItems(mapItems);
      setCommittedRoadPaths(roadPaths);
      setCharacterConfig(payload.characterConfig);
      setIsEditMode(false);
      alert("Adventure Map with Roads & Buildings successfully PUBLISHED!");
      setIsPreviewOpen(false);
    } catch (error) {
      alert("Error publishing data: " + (error?.message || error));
    }
  };

  const resetAssetModal = useCallback(() => {
    setNewAssetForm({ label: '', src: '', width: 40, height: 40, color: '#3b82f6', walkFrames: [], stepSound: '' });
    setIsUploadingAsset(false);
  }, []);

  const closeAssetModal = useCallback(() => {
    setIsModalOpen(false);
    resetAssetModal();
  }, [resetAssetModal]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setIsUploadingAsset(true);
    try {
      const url = await uploadFileToServer(file);
      const { w, h } = await loadImageNaturalSize(url);
      const { width, height } = fitAssetDimensions(w, h);
      setNewAssetForm((prev) => ({ ...prev, src: url, width, height }));
    } catch (err) {
      alert("Could not upload image: " + (err?.response?.data?.message || err.message));
    } finally {
      setIsUploadingAsset(false);
    }
  };

  const handleWalkFramesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';
    const remainingSlots = 8 - (newAssetForm.walkFrames || []).length;
    const filesToUpload = files.slice(0, remainingSlots);
    try {
      const urls = await Promise.all(filesToUpload.map((file) => uploadFileToServer(file)));
      setNewAssetForm((prev) => ({ ...prev, walkFrames: [...(prev.walkFrames || []), ...urls] }));
    } catch (err) {
      alert("Could not upload walk frames: " + (err?.response?.data?.message || err.message));
    }
  };

  const handleStepSoundChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    try {
      const url = await uploadFileToServer(file);
      setNewAssetForm((prev) => ({ ...prev, stepSound: url }));
    } catch (err) {
      alert("Could not upload footstep sound: " + (err?.response?.data?.message || err.message));
    }
  };

  const handleCreateCustomAsset = async (e) => {
    e.preventDefault();
    setIsUploadingAsset(true);
    try {
      const newAsset = {
        id: Date.now(),
        type: targetCategory,
        label: newAssetForm.label,
        src: newAssetForm.src,
        width: newAssetForm.width,
        height: newAssetForm.height,
        color: newAssetForm.color,
        walkFrames: newAssetForm.walkFrames,
        stepSound: newAssetForm.stepSound
      };
      setCustomAssetsList((prev) => [...prev, newAsset]);
      setNewAssetForm({ label: '', src: '', width: 40, height: 40, color: '#3b82f6', walkFrames: [], stepSound: '' });
      setIsModalOpen(false);
      handleAddAssetToMap(newAsset);
    } catch (err) {
      alert("Could not create asset: " + (err?.response?.data?.message || err.message));
    } finally {
      setIsUploadingAsset(false);
    }
  };

  const processBgFile = async (file) => {
    try {
      const url = await uploadFileToServer(file);
      setNewBgForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      alert("Could not upload background image: " + (err?.response?.data?.message || err.message));
    }
  };

  const handleBgFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    processBgFile(file);
  };

  const handleBgDrop = (e) => {
    e.preventDefault();
    setIsBgDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      processBgFile(file);
    }
  };

  const handleCreateCustomBg = async (e) => {
    e.preventDefault();
    setIsUploadingBg(true);
    try {
      const key = `custom_${Date.now()}`;
      const previousThemeKey = selectedThemeKey;
      setCustomThemes((prev) => ({
        ...prev,
        [key]: {
          image: newBgForm.image,
          color: newBgForm.color || '#599824',
          label: newBgForm.label
        }
      }));
      setBgSections((prev) => prev.map((sec) => (sec.themeKey === previousThemeKey ? { ...sec, themeKey: key } : sec)));
      setSelectedThemeKey(key);
      setNewBgForm({ label: '', color: '', image: '' });
      setIsBgModalOpen(false);
    } catch (err) {
      alert("Could not create background: " + (err?.response?.data?.message || err.message));
    } finally {
      setIsUploadingBg(false);
    }
  };

  const handleCreateNewCategory = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createAssetGroup({ name: newCategoryName })).unwrap();
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } catch (err) {
      alert("Could not create category: " + (err?.response?.data?.message || err.message));
    }
  };

  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to clear all canvas data? This cannot be undone.')) {
      setMapItems([]);
      setRoadPaths([]);
      setBgSections([{ id: 1, y: 0, height: 800, themeKey: 'rich_grass_green' }]);
      setSelectedId(null);
      setSelectedRoadId(null);
      setSelectedPointIndex(null);
    }
  }, []);

  const handleStageClickWrapper = useCallback((e) => {
    const result = handleStageClick(e, stageRef);
    if (result?.deselect) {
      setSelectedId(null);
    }
  }, [handleStageClick]);

  const handleDragPoint = useCallback((index, x, y) => {
    handleUpdatePoint(index, 'x', x);
    handleUpdatePoint(index, 'y', y);
  }, [handleUpdatePoint]);

  const handleTestWalkWrapper = useCallback(() => {
    const result = handleTestWalk();
    if (result?.error) {
      alert(result.error);
    }
  }, [handleTestWalk]);

  const handleAnimationCompleteWrapper = useCallback(() => {
    handleAnimationComplete();
  }, [handleAnimationComplete]);

  const canvasMapItems = isWalking ? mapItems.filter((item) => !isCharacterType(item.type)) : mapItems;

  if (!isDataLoaded) {
    return <div className="flex items-center justify-center h-screen text-slate-500">Loading map data...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans overflow-hidden text-slate-800 relative w-full">
      <MapBuilderHeader
        activeTool={activeTool}
        languages={languages}
        activeLanguage={activeLanguage}
        publishedSlotsForActiveLang={publishedSlotsForActiveLang}
        totalBuildingSlots={totalBuildingSlots}
        isLeftPanelOpen={isLeftPanelOpen}
        isRightPanelOpen={isRightPanelOpen}
        isWalking={isWalking}
        isAtFinalStop={isAtFinalStop}
        walkPoints={walkPoints}
        currentWalkStopNumber={currentWalkStopNumber}
        totalWalkStops={totalWalkStops}
        isEditMode={isEditMode}
        onManageLanguages={handleManageLanguages}
        onToggleLeftPanel={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
        onToggleRightPanel={() => setIsRightPanelOpen(!isRightPanelOpen)}
        onTestWalk={handleTestWalkWrapper}
        onOpenPreview={handleOpenPreview}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onSave={handleSaveMapChanges}
      />

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[320px_1fr_320px] overflow-hidden w-full relative">
        <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-full max-w-xs sm:w-80 lg:w-auto bg-white border-r border-slate-200 p-4 overflow-y-auto flex flex-col justify-between transition-transform duration-200 ${isLeftPanelOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${!isEditMode ? 'opacity-60 pointer-events-none select-none' : ''}`}>
          <div className="flex items-center justify-between pb-3 mb-2 lg:hidden border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Path Tools & Assets</h3>
            <button onClick={() => setIsLeftPanelOpen(false)} className="text-slate-500 font-bold p-1">✕</button>
          </div>
          {!isEditMode && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold lg:hidden">
              Click "Edit" to make changes
            </div>
          )}
          <LeftSidebar
            isOpen={isLeftPanelOpen}
            isEditMode={isEditMode}
            onClose={() => setIsLeftPanelOpen(false)}
            activeTool={activeTool}
            activeLayer={activeLayer}
            customThemes={customThemes}
            bgSections={bgSections}
            selectedThemeKey={selectedThemeKey}
            categoriesList={categoriesList}
            customAssetsList={customAssetsList}
            activeRoad={activeRoad}
            mapItems={mapItems}
            onSetActiveTool={setActiveTool}
            onSetActiveLayer={setActiveLayer}
            onSetSelectedThemeKey={setSelectedThemeKey}
            onUndoLastPoint={handleUndoLastPoint}
            onSelectNextPoint={handleSelectNextPoint}
            onUpdateRoadWidth={(w) => handleUpdateRoadProperty('width', w)}
            onUpdateRoadDash={(d) => handleUpdateRoadProperty('dash', d)}
            onUpdateRoadColor={(c) => handleUpdateRoadProperty('color', c)}
            onClearRoadPoints={handleClearRoadPoints}
            onDeleteRoad={handleDeleteRoad}
            onOpenBgModal={() => setIsBgModalOpen(true)}
            onDeleteTheme={handleDeleteBackgroundTheme}
            onAddBgSection={handleAddNewBackgroundSection}
            onRemoveBgSection={handleRemoveBackgroundSection}
            onChangeSectionTheme={handleChangeSectionTheme}
            onAddLessonCard={handleAddLessonCard}
            onSetAllLayers={() => setActiveLayer('All Layers')}
            onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
            onOpenAssetModal={(cat) => { setTargetCategory(cat); setIsModalOpen(true); }}
            onAddAssetToMap={handleAddAssetToMap}
            onDeleteAsset={handleDeleteCustomAsset}
            onScrollAssetRow={handleScrollAssetRow}
            setSelectedId={setSelectedId}
            setActiveTool={setActiveTool}
            setIsRightPanelOpen={setIsRightPanelOpen}
          />
        </div>

        {isLeftPanelOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsLeftPanelOpen(false)}></div>
        )}

        <div className="bg-slate-100 p-2 md:p-4 flex flex-col items-stretch relative overflow-hidden w-full h-full flex-1">
          <div className="flex-1 relative overflow-y-auto overflow-x-hidden" ref={responsiveContainerRef}>
            <MapStage
              stageRef={stageRef}
              trRef={trRef}
              containerWidth={containerWidth}
              stageHeight={stageHeight}
              scale={scale}
              isEditMode={isEditMode}
              bgSections={bgSections}
              customThemes={customThemes}
              roadPaths={roadPaths}
              mapItems={canvasMapItems}
              activeTool={activeTool}
              activeLayer={activeLayer}
              selectedId={selectedId}
              selectedPointIndex={selectedPointIndex}
              fallbackBgColor={fallbackBgColor}
              isWalking={isWalking}
              onStageClick={handleStageClickWrapper}
              onSelectItem={handleSelectItem}
              onDeleteItem={handleDeleteItem}
              onCloneItem={handleCloneItem}
              onDragEnd={handleDragEnd}
              onCardDragEnd={handleCardDragEnd}
              onTransformEnd={handleTransformEnd}
              onSelectPoint={setSelectedPointIndex}
              onDragPoint={handleDragPoint}
            />

            {isEditMode && (
              <div className="absolute inset-0 z-30 pointer-events-none">
                <WalkingCharacter
                  isWalking={isWalking}
                  walkKey={walkKey}
                  walkPoints={walkPoints}
                  walkFrameIndex={walkFrameIndex}
                  walkFrames={mapItems.find(item => isCharacterType(item.type))?.walkFrames || []}
                  src={mapItems.find(item => isCharacterType(item.type))?.src || ''}
                  width={mapItems.find(item => isCharacterType(item.type))?.width || 40}
                  height={mapItems.find(item => isCharacterType(item.type))?.height || 40}
                  scale={scale}
                  walkCurveXs={walkCurveXs}
                  walkCurveYs={walkCurveYs}
                  walkSegmentDuration={walkSegmentDuration}
                  walkFacingLeft={walkFacingLeft}
                  hasWalkFrames={hasWalkFrames}
                  onAnimationComplete={handleAnimationCompleteWrapper}
                />
              </div>
            )}
          </div>
        </div>

        <div className={`fixed lg:relative inset-y-0 right-0 z-40 w-full max-w-xs sm:w-80 lg:w-auto bg-white border-l border-slate-200 p-4 overflow-y-auto flex flex-col justify-between transition-transform duration-200 ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} ${!isEditMode ? 'opacity-60 pointer-events-none select-none' : ''}`}>
          <div className="flex items-center justify-between pb-3 mb-2 lg:hidden border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Properties</h3>
            <button onClick={() => setIsRightPanelOpen(false)} className="text-slate-500 font-bold p-1">✕</button>
          </div>
          {!isEditMode && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold lg:hidden">
              Click "Edit" to make changes
            </div>
          )}
          <RightSidebar
            isOpen={isRightPanelOpen}
            isEditMode={isEditMode}
            onClose={() => setIsRightPanelOpen(false)}
            selectedItem={selectedItem}
            activeRoad={activeRoad}
            selectedPointIndex={selectedPointIndex}
            mapItems={mapItems}
            activeLanguage={activeLanguage}
            languages={languages}
            lessonOptions={lessonOptions}
            lockAspect={lockAspect}
            onUpdateRoadName={(n) => handleUpdateRoadProperty('name', n)}
            onUpdateRoadWidth={(w) => handleUpdateRoadProperty('width', w)}
            onToggleRoadVisibility={() => handleUpdateRoadProperty('visible', !activeRoad?.visible)}
            onDeletePoint={handleDeletePoint}
            onUpdatePoint={handleUpdatePoint}
            onUpdateItemField={handleUpdateSelectedField}
            onSelectLessonForCard={handleSelectLessonForCard}
            onToggleLockAspect={() => setLockAspect(!lockAspect)}
            onCloneItem={handleCloneItem}
            onDeleteItem={handleDeleteItem}
            onAddWalkFrame={handleAddWalkFrame}
            onRemoveWalkFrame={handleRemoveWalkFrame}
            onSetStepSound={handleSetStepSound}
            onRemoveStepSound={handleRemoveStepSound}
            uploadFileToServer={uploadFileToServer}
            mapTitle={mapTitle}
            mapActive={mapActive}
            onSetMapTitle={setMapTitle}
            onToggleMapActive={() => setMapActive(!mapActive)}
            onClearAll={handleClearAll}
          />
        </div>

        {isRightPanelOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsRightPanelOpen(false)}></div>
        )}
      </div>

      <AssetModal
        isOpen={isModalOpen}
        targetCategory={targetCategory}
        newAssetForm={newAssetForm}
        isUploading={isUploadingAsset}
        onClose={closeAssetModal}
        onSubmit={handleCreateCustomAsset}
        onFormChange={(field, value) => setNewAssetForm(prev => ({ ...prev, [field]: value }))}
        onFileChange={handleFileChange}
        onWalkFramesChange={handleWalkFramesChange}
        onRemoveWalkFrame={(idx) => setNewAssetForm(prev => ({ ...prev, walkFrames: prev.walkFrames.filter((_, i) => i !== idx) }))}
        onStepSoundChange={handleStepSoundChange}
        onRemoveStepSound={() => setNewAssetForm(prev => ({ ...prev, stepSound: '' }))}
      />

      <BackgroundModal
        isOpen={isBgModalOpen}
        newBgForm={newBgForm}
        isUploading={isUploadingBg}
        isDragActive={isBgDragActive}
        onClose={() => setIsBgModalOpen(false)}
        onSubmit={handleCreateCustomBg}
        onFormChange={(field, value) => setNewBgForm(prev => ({ ...prev, [field]: value }))}
        onFileChange={handleBgFileChange}
        onDragOver={(e) => { e.preventDefault(); setIsBgDragActive(true); }}
        onDragLeave={() => setIsBgDragActive(false)}
        onDrop={handleBgDrop}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        newCategoryName={newCategoryName}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateNewCategory}
        onNameChange={setNewCategoryName}
      />

      <PreviewModal
        isOpen={isPreviewOpen}
        mapTitle={mapTitle}
        activeLanguage={activeLanguage}
        languages={languages}
        bgSections={previewBgSections}
        customThemes={previewCustomThemes}
        roadPaths={previewRoadPaths}
        mapItems={previewMapItems}
        previewVisibleObjectItems={previewMapItems.filter((item) => item.type !== 'Lesson Cards')}
        previewVisibleLessonCards={previewMapItems.filter((item) => item.type === 'Lesson Cards')}
        previewStageHeight={previewStageHeight}
        containerWidth={containerWidth}
        scale={scale}
        fallbackBgColor={fallbackBgColor}
        publishedSlotsForActiveLang={publishedSlotsForActiveLang}
        totalBuildingSlots={totalBuildingSlots}
        onClose={() => setIsPreviewOpen(false)}
        onPublish={handlePublishMap}
      />
    </div>
  );
};

export default AdminBuilder;