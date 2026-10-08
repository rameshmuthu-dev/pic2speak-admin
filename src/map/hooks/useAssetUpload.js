import { useCallback } from 'react';
import { uploadMapFile } from '../../redux/slices/adventureMapSlice';
import { loadImageNaturalSize, fitAssetDimensions } from '../utils/imageUtils.js';

export const useAssetUpload = (dispatch) => {
  const uploadFileToServer = useCallback(
    async (file) => {
      try {
        const result = await dispatch(uploadMapFile(file)).unwrap();
        const url = result?.url || result?.secure_url;
        if (!url) {
          throw new Error('Upload succeeded but the server did not return a file URL.');
        }
        return url;
      } catch (err) {
        console.error('uploadFileToServer failed, raw error:', err);
        const message =
          err?.response?.data?.message ||
          err?.message ||
          err?.error ||
          (typeof err === 'string' ? err : null) ||
          'Upload failed with no error details from the server — check the Network tab for the failed request (status code) and the backend logs.';
        throw new Error(message);
      }
    },
    [dispatch]
  );

  return {
    uploadFileToServer,
    loadImageNaturalSize,
    fitAssetDimensions
  };
};
