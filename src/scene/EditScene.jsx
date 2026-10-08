import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
// Unga redux paths-ai sariyaaga check pannikonga
import {
  fetchSceneById,
  updateScene,
  selectSelectedScene,
  selectSceneActionStatus,
  clearSceneError
} from '../redux/slices/sceneSlice';

const EditScene = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lessonMasterId, sceneId } = useParams();

  const scene = useSelector(selectSelectedScene);
  const actionStatus = useSelector(selectSceneActionStatus);

  const [order, setOrder] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');

  // Component mount aagumbothu scene data-vai fetch pannanum
  useEffect(() => {
    if (sceneId) {
      dispatch(fetchSceneById(sceneId));
    }
  }, [dispatch, sceneId]);

  // Fetch aana scene data-vai state-la set pandrom
  useEffect(() => {
    if (scene) {
      setOrder(scene.order || '');
      setImagePreview(scene.imageUrl || '');
    }
  }, [scene]);

  // Image select pannumbothu preview kaatta
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Local preview URL
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearSceneError());

    if (!order) {
      setFormError('Scene order is required.');
      return;
    }

    // FormData use pandrom yenna image file anuppa porom
    const formData = new FormData();
    formData.append('order', order);
    
    // Puthu image select panniruntha mattum append panna pothum
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const result = await dispatch(updateScene({ id: sceneId, formData }));
    
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Scene updated successfully!');
      // Update aanathum thirumba list page-kku poga
      navigate(`/admin/scenes/${lessonMasterId}`);
    } else {
      setFormError(result.payload || 'Failed to update scene.');
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen flex justify-center items-start pt-10">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header Section */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Scene</h2>
            <p className="text-xs text-slate-500 mt-1">Update scene image and details</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/admin/scenes/${lessonMasterId}`)}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Section */}
        <div className="p-6">
          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Scene Order Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Scene Order
              </label>
              <input
                type="number"
                min="1"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                placeholder="e.g., 1"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Scene Image
              </label>
              
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Image Preview Box */}
                <div className="w-full sm:w-64 h-40 bg-slate-100 border border-dashed border-slate-300 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Scene Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No Image</span>
                  )}
                </div>

                {/* Upload Input */}
                <div className="flex-1 w-full">
                  <p className="text-xs text-slate-500 mb-3">
                    Upload a new image to replace the current one. Leave this empty if you want to keep the existing image.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-xs file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => navigate(`/admin/scenes/${lessonMasterId}`)}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionStatus === 'loading'}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-60"
              >
                {actionStatus === 'loading' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditScene;