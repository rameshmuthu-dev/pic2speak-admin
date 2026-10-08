export const sameCategory = (itemType, catName) =>
  (itemType || '').trim().toLowerCase() === (catName || '').trim().toLowerCase();

export const isCharacterType = (itemType) => (itemType || '').trim().toLowerCase().includes('character');

export const getItemContent = (item, lang) => {
  return (item && item.content && item.content[lang]) || { title: '', published: false };
};

export const getLessonMasterId = (lessonMasterId) =>
  typeof lessonMasterId === 'object' ? lessonMasterId?._id : lessonMasterId;

export const getLanguageCode = (languageId) =>
  typeof languageId === 'object' ? languageId?.code : languageId;

export const normalizeLangCode = (lang) => String(lang || '').trim().toLowerCase();

export const isLessonContentPublished = (content) =>
  !!(content && content.title && content.title.trim() && (content.status ? content.status === 'published' : true));

export const getLanguageMapProgress = (items, lang) => {
  const cards = items
    .filter((item) => item.type === 'Lesson Cards')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const visibleCards = [];
  for (const card of cards) {
    const content = getItemContent(card, lang);
    if (content.published && content.title.trim()) {
      visibleCards.push(card);
    }
  }

  const lastCard = visibleCards[visibleCards.length - 1];
  return {
    visibleCards,
    visibleCardIds: new Set(visibleCards.map((card) => card.id)),
    visibleBuildingIds: new Set(visibleCards.map((card) => card.buildingId).filter(Boolean)),
    visibleHeight: lastCard ? Math.max(80, lastCard.revealHeight || 0, lastCard.y + (lastCard.height || 72) + 80) : 0
  };
};

export const deriveAssetsFromMapItems = (items) => {
  const seen = new Map();
  (items || []).forEach((item) => {
    if (!item || !item.src || item.type === 'Lesson Cards') return;
    const key = `${item.type}::${item.src}`;
    if (!seen.has(key)) {
      seen.set(key, {
        id: item.id,
        type: item.type || 'Buildings',
        label: item.label || item.type || 'Asset',
        src: item.src,
        width: item.width || 40,
        height: item.height || 40,
        color: item.color || '#3b82f6',
        walkFrames: item.walkFrames || [],
        stepSound: item.stepSound || ''
      });
    }
  });
  return Array.from(seen.values());
};

export const mergeAssetLists = (savedAssets, derivedAssets) => {
  const merged = [...(savedAssets || [])];
  const existingKeys = new Set(merged.map((a) => `${a.type}::${a.src}`));
  derivedAssets.forEach((asset) => {
    const key = `${asset.type}::${asset.src}`;
    if (!existingKeys.has(key)) {
      merged.push(asset);
      existingKeys.add(key);
    }
  });
  return merged;
};

export const extractCharacterConfig = (mapItems, positionSourceItems) => {
  const character = (mapItems || []).find((item) => isCharacterType(item.type));
  if (!character) return null;
  const positionCharacter = (positionSourceItems || mapItems || []).find((item) => isCharacterType(item.type)) || character;
  return {
    src: character.src || '',
    walkFrames: character.walkFrames || [],
    stepSound: character.stepSound || '',
    width: character.width || 40,
    height: character.height || 40,
    startPosition: { x: positionCharacter.x || 0, y: positionCharacter.y || 0 }
  };
};