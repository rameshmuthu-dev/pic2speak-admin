import { deriveAssetsFromMapItems, extractCharacterConfig } from './mapCalculations.js';

export const cloneSerializable = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

// Only persisted editor data belongs in the dirty comparison. Selection,
// animation and the active tool must never make a map dirty.
export const createMapSnapshot = (data) => cloneSerializable({
  mapTitle: data.mapTitle ?? 'Adventure Map',
  mapActive: data.mapActive ?? true,
  bgSections: data.bgSections ?? [],
  customThemes: data.customThemes ?? {},
  mapItems: data.mapItems ?? [],
  roadPaths: data.roadPaths ?? [],
  characterConfig: data.characterConfig ?? null,
  customAssets: data.customAssets ?? [],
  categories: data.categories ?? []
});

export const loadMapSnapshot = (draft) => createMapSnapshot({
  ...draft,
  customAssets: Array.isArray(draft.customAssets)
    ? draft.customAssets
    : deriveAssetsFromMapItems(draft.mapItems),
  characterConfig: draft.characterConfig === undefined
    ? extractCharacterConfig(draft.mapItems)
    : draft.characterConfig
});

export const snapshotsEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);
