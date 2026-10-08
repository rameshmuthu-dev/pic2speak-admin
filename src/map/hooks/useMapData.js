import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  fetchDraftMap,
  saveMapAssets,
  fetchPublishedMap,
} from '../../redux/slices/adventureMapSlice';
import {
  fetchAssetGroups,
} from '../../redux/slices/assetGroupSlice';
import {
  fetchLessonMasters,
} from '../../redux/slices/lessonMasterSlice';
import {
  fetchLessonContents,
} from '../../redux/slices/lessonContentSlice';
import { deriveAssetsFromMapItems, mergeAssetLists, extractCharacterConfig } from '../utils/mapCalculations.js';

export const useMapData = () => {
  const dispatch = useDispatch();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [customAssetsList, setCustomAssetsList] = useState([]);

  const initializeData = useCallback(async (setCustomThemes, setMapActive, setMapTitle, setMapItems, setBgSections, setRoadPaths, setSelectedRoadId, setCharacterConfig) => {
    try {
      try {
        await dispatch(fetchAssetGroups()).unwrap();
      } catch (err) {
        console.warn('Could not load asset groups:', err);
      }

      try {
        await dispatch(fetchLessonMasters()).unwrap();
      } catch (err) {
        console.warn('Could not load lesson masters:', err);
      }

      try {
        await dispatch(fetchLessonContents()).unwrap();
      } catch (err) {
        console.warn('Could not load lesson contents:', err);
      }

      try {
        const savedDraft = await dispatch(fetchDraftMap()).unwrap();
        if (savedDraft) {
          if (savedDraft.customThemes && Object.keys(savedDraft.customThemes).length > 0) setCustomThemes(savedDraft.customThemes);
          if (savedDraft.mapActive !== undefined) setMapActive(savedDraft.mapActive);
          if (savedDraft.mapTitle) setMapTitle(savedDraft.mapTitle);
          if (Array.isArray(savedDraft.mapItems) && savedDraft.mapItems.length > 0) setMapItems(savedDraft.mapItems);
          if (Array.isArray(savedDraft.bgSections) && savedDraft.bgSections.length > 0) setBgSections(savedDraft.bgSections);
          if (Array.isArray(savedDraft.roadPaths) && savedDraft.roadPaths.length > 0) {
            setRoadPaths(savedDraft.roadPaths);
            setSelectedRoadId(savedDraft.roadPaths[0].id);
          }

          if (typeof setCharacterConfig === 'function') {
            if (savedDraft.characterConfig) {
              setCharacterConfig(savedDraft.characterConfig);
            } else if (Array.isArray(savedDraft.mapItems)) {
              setCharacterConfig(extractCharacterConfig(savedDraft.mapItems));
            }
          }

          const savedAssets = Array.isArray(savedDraft.customAssets) ? savedDraft.customAssets : [];
          const derivedAssets = deriveAssetsFromMapItems(savedDraft.mapItems);
          const finalAssets = mergeAssetLists(savedAssets, derivedAssets);
          if (finalAssets.length > 0) setCustomAssetsList(finalAssets);
        }
      } catch (err) {
        console.warn('Could not load saved draft from backend:', err);
      }

      try {
        await dispatch(fetchPublishedMap()).unwrap();
      } catch (err) {
        console.warn('Could not load published map from backend:', err);
      }
    } finally {
      setIsDataLoaded(true);
    }
  }, [dispatch]);

  const saveCustomAssets = useCallback(async (assets) => {
    if (isDataLoaded) {
      const formData = new FormData();
      formData.append('customAssets', JSON.stringify(assets));
      dispatch(saveMapAssets(formData)).unwrap().catch((err) => {
        console.warn('Could not save custom assets:', err);
      });
    }
  }, [isDataLoaded, dispatch]);

  return {
    isDataLoaded,
    customAssetsList,
    setCustomAssetsList,
    initializeData,
    saveCustomAssets
  };
};