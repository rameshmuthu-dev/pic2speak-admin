import { useState, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchDraftMap, fetchPublishedMap } from '../../redux/slices/Adventuremapslice.js';
import { fetchAssetGroups } from '../../redux/slices/Assetgroupslice.js';
import { fetchLessonMasters } from '../../redux/slices/Lessonmasterslice.js';
import { fetchLessonContents } from '../../redux/slices/Lessoncontentslice.js';
import { loadMapSnapshot } from '../utils/editorState.js';

export const useMapData = () => {
  const dispatch = useDispatch();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const initializationRef = useRef(null);

  const initializeData = useCallback(async (onLoaded, isCurrent) => {
    // StrictMode can mount effects twice. Reuse the requests and only hydrate
    // the live effect, so a late load cannot overwrite an editing session.
    if (!initializationRef.current) {
      initializationRef.current = Promise.all([
        dispatch(fetchDraftMap()).unwrap(),
        dispatch(fetchAssetGroups()).unwrap().catch((error) => {
          console.warn('Could not load asset groups:', error);
          return null;
        }),
        dispatch(fetchLessonMasters()).unwrap().catch((error) => {
          console.warn('Could not load lesson masters:', error);
          return null;
        }),
        dispatch(fetchLessonContents()).unwrap().catch((error) => {
          console.warn('Could not load lesson contents:', error);
          return null;
        }),
        dispatch(fetchPublishedMap()).unwrap().catch(() => null)
      ]);
    }
    try {
      const [draft] = await initializationRef.current;
      if (!isCurrent()) return;
      if (!draft) throw new Error('The saved draft could not be loaded.');
      onLoaded(loadMapSnapshot(draft));
      setIsDataLoaded(true);
    } catch (error) {
      if (isCurrent()) setLoadError(error?.message || String(error));
    }
  }, [dispatch]);

  return { isDataLoaded, loadError, initializeData };
};
