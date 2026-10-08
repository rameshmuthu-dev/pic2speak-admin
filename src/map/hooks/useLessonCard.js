import { useCallback, useEffect, useMemo } from 'react';
import { getItemContent, normalizeLangCode, isLessonContentPublished } from '../utils/languageUtils.js';
import { getLessonMasterId, getLanguageCode } from '../utils/mapCalculations.js';

export const useLessonCard = (lessonMasters, lessonContents, activeLanguage, mapItems, setMapItems) => {
  const getLessonContentForMaster = useCallback((lessonMasterId, lang) => {
    if (!lessonMasterId || !lang) return null;
    const targetId = String(lessonMasterId);
    const targetLang = normalizeLangCode(lang);
    return lessonContents.find((c) => {
      const cId = String(getLessonMasterId(c.lessonMasterId));
      const cLang = normalizeLangCode(getLanguageCode(c.languageId) || c.language);
      return cId === targetId && cLang === targetLang;
    }) || null;
  }, [lessonContents]);

  const lessonOptions = useMemo(() => {
    return [...lessonMasters]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((master) => {
        const content = getLessonContentForMaster(master._id, activeLanguage);
        return {
          id: master._id,
          order: master.order,
          title: content?.title || '',
        };
      });
  }, [lessonMasters, activeLanguage, getLessonContentForMaster]);

  const handleSelectLessonForCard = useCallback((cardId, lessonMasterId) => {
    setMapItems((prev) => prev.map((item) => {
      if (item.id !== cardId) return item;
      if (!lessonMasterId) {
        return {
          ...item,
          lessonMasterId: null,
          content: {
            ...(item.content || {}),
            [activeLanguage]: { title: '', published: false }
          }
        };
      }
      const content = getLessonContentForMaster(lessonMasterId, activeLanguage);
      return {
        ...item,
        lessonMasterId,
        content: {
          ...(item.content || {}),
          [activeLanguage]: { title: content?.title || '', published: isLessonContentPublished(content) }
        }
      };
    }));
  }, [activeLanguage, getLessonContentForMaster, setMapItems]);

  useEffect(() => {
    if (!activeLanguage) return;
    setMapItems((prev) => {
      let changed = false;
      const updated = prev.map((item) => {
        if (item.type !== 'Lesson Cards' || !item.lessonMasterId) return item;
        const content = getLessonContentForMaster(item.lessonMasterId, activeLanguage);
        const newTitle = content?.title || '';
        const newPublished = isLessonContentPublished(content);
        const existing = getItemContent(item, activeLanguage);
        if (existing.title === newTitle && existing.published === newPublished) return item;
        changed = true;
        return {
          ...item,
          content: {
            ...(item.content || {}),
            [activeLanguage]: { title: newTitle, published: newPublished }
          }
        };
      });
      return changed ? updated : prev;
    });
  }, [activeLanguage, lessonContents, getLessonContentForMaster, setMapItems]);

  return {
    lessonOptions,
    handleSelectLessonForCard,
    getLessonContentForMaster
  };
};
