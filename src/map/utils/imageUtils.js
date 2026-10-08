export const loadImageNaturalSize = (src) => new Promise((resolve) => {
  if (!src) {
    resolve({ w: 40, h: 40 });
    return;
  }
  const img = new window.Image();
  img.onload = () => resolve({ w: img.naturalWidth || 40, h: img.naturalHeight || 40 });
  img.onerror = () => resolve({ w: 40, h: 40 });
  img.src = src;
});

const DEFAULT_ASSET_MAX_DIM = 64;
const DEFAULT_ASSET_MIN_DIM = 28;

export const fitAssetDimensions = (naturalW, naturalH) => {
  const w = naturalW || 40;
  const h = naturalH || 40;
  const shrinkRatio = Math.min(DEFAULT_ASSET_MAX_DIM / w, DEFAULT_ASSET_MAX_DIM / h, 1);
  const growRatio = Math.max(DEFAULT_ASSET_MIN_DIM / w, DEFAULT_ASSET_MIN_DIM / h, 1);
  const ratio = shrinkRatio < 1 ? shrinkRatio : growRatio;
  return {
    width: Math.max(4, Math.round(w * ratio)),
    height: Math.max(4, Math.round(h * ratio))
  };
};
