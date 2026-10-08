import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import debounce from 'lodash.debounce';
import { saveDraftMap } from '../../redux/slices/adventureMapSlice';

export const useMapAutosave = (isDataLoaded, mapTitle, mapActive, bgSections, customThemes, mapItems, roadPaths) => {
  const dispatch = useDispatch();

  const debouncedSaveDraft = useRef(
    debounce((payload) => {
      dispatch(saveDraftMap(payload)).unwrap().catch((err) => {
        console.warn('Could not auto-save draft:', err);
      });
    }, 1200)
  ).current;

  useEffect(() => {
    if (isDataLoaded) {
      debouncedSaveDraft({
        mapTitle,
        mapActive,
        bgSections,
        customThemes,
        mapItems,
        roadPaths,
        updatedAt: new Date().toISOString()
      });
    }
  }, [mapTitle, mapActive, bgSections, customThemes, mapItems, roadPaths, isDataLoaded, debouncedSaveDraft]);

  useEffect(() => () => debouncedSaveDraft.cancel(), [debouncedSaveDraft]);

  return null;
};
