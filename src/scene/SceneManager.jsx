import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  fetchScenes,
  createScene,
  updateScene,
  selectAllScenes,
  selectSceneActionStatus,
  selectSceneError,
  clearSceneError,
} from '../redux/slices/sceneSlice';

const getLessonId = (scene) =>
  typeof scene.lessonMasterId === 'object' ? scene.lessonMasterId?._id : scene.lessonMasterId;

const SceneManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lessonMasterId, sceneId } = useParams();

  const scenes = useSelector(selectAllScenes);
  const actionStatus = useSelector(selectSceneActionStatus);
  const error = useSelector(selectSceneError);

  const isEdit = Boolean(sceneId);

  const [orderMode, setOrderMode] = useState('auto');
  const [order, setOrder] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [formError, setFormError] = useState('');
  const [justCreatedId, setJustCreatedId] = useState(null);

  useEffect(() => {
    if (!lessonMasterId) return;
    dispatch(fetchScenes(lessonMasterId));
  }, [dispatch, lessonMasterId]);

  const lessonScenes = useMemo(
    () => scenes.filter((s) => getLessonId(s) === lessonMasterId),
    [scenes, lessonMasterId]
  );

  const currentLastOrder = useMemo(() => {
    if (!lessonScenes.length) return 0;
    return Math.max(...lessonScenes.map((s) => s.order || 0));
  }, [lessonScenes]);

  const nextAutoOrder = currentLastOrder + 1;

  useEffect(() => {
    if (isEdit) {
      const existing = lessonScenes.find((s) => s._id === sceneId);
      if (existing) {
        setOrderMode('manual');
        setOrder(existing.order);
        setImagePreview(existing.imageUrl);
        setIsActive(existing.isActive);
      }
    }
  }, [isEdit, sceneId, lessonScenes]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please upload a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size should be under 5MB.');
      return;
    }
    setFormError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, []);

  const buildOrderToSubmit = () => (orderMode === 'auto' ? nextAutoOrder : Number(order));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearSceneError());

    if (!lessonMasterId) {
      setFormError('Lesson reference missing. Go back and select a lesson.');
      return;
    }

    if (!isEdit && !imageFile) {
      setFormError('Background image is required.');
      return;
    }

    if (orderMode === 'manual' && (!order || Number(order) < 1)) {
      setFormError('Please choose a valid scene order.');
      return;
    }

    const formData = new FormData();

    if (isEdit) {
      const orderToSubmit = buildOrderToSubmit();
      if (orderToSubmit) formData.append('order', orderToSubmit);
      if (imageFile) formData.append('image', imageFile);

      const result = await dispatch(updateScene({ id: sceneId, formData }));
      if (result.meta.requestStatus !== 'fulfilled') {
        setFormError(result.payload || 'Could not update scene.');
        return;
      }
      toast.success('Scene updated successfully!');
      navigate(`/admin/scenes/${lessonMasterId}`);
    } else {
      formData.append('lessonMasterId', lessonMasterId);
      formData.append('order', buildOrderToSubmit());
      formData.append('image', imageFile);

      const result = await dispatch(createScene(formData));
      if (result.meta.requestStatus !== 'fulfilled') {
        setFormError(result.payload || 'Could not create scene.');
        return;
      }
      toast.success('Scene created successfully!');
      setJustCreatedId(result.payload._id);
      setImageFile(null);
      setImagePreview('');
      setOrderMode('auto');
      setOrder('');
    }
  };

  const goToSceneList = () => navigate(`/admin/scenes/${lessonMasterId}`);
  const goToContentForNewScene = () => navigate(`/admin/scenes/${lessonMasterId}/${justCreatedId}/content`);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isEdit ? 'Edit Scene' : 'Create New Scene'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dashboard <span className="mx-1">›</span> Lessons <span className="mx-1">›</span>
            {isEdit ? ' Edit Scene' : ' Create New Scene'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/lessons')}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            ← Back to Lessons
          </button>
          <button
            type="button"
            onClick={goToSceneList}
            className="flex items-center gap-1.5 px-4 py-2 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 cursor-pointer"
          >
            View Scene List →
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}
      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
          {formError}
        </div>
      )}

      {justCreatedId && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800">Scene created successfully!</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">
              Now add text and audio content for this scene.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToContentForNewScene}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              + Add Content
            </button>
            <button
              type="button"
              onClick={goToSceneList}
              className="px-4 py-2 border border-emerald-300 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 cursor-pointer"
            >
              Go to Scene List
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
          <h2 className="text-sm font-bold text-slate-800 mb-5">1. Scene Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scene Order <span className="text-red-500">*</span>
              </label>

              {isEdit ? (
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {Array.from({ length: lessonScenes.length }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              ) : (
                <div className="border border-slate-200 rounded-xl p-3 space-y-3">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="orderMode"
                      checked={orderMode === 'auto'}
                      onChange={() => setOrderMode('auto')}
                      className="mt-0.5"
                    />
                    <span className="text-xs">
                      <span className="font-semibold text-slate-800">Add as next scene (Auto)</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        This will be scene <span className="font-bold text-slate-600">{nextAutoOrder}</span>
                        {' '}(Current last scene order: {currentLastOrder})
                      </p>
                    </span>
                  </label>

                  <div className="border-t border-slate-100 pt-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="orderMode"
                        checked={orderMode === 'manual'}
                        onChange={() => setOrderMode('manual')}
                        className="mt-0.5"
                      />
                      <span className="text-xs font-semibold text-slate-800">Choose specific order</span>
                    </label>
                    <select
                      disabled={orderMode !== 'manual'}
                      value={order}
                      onChange={(e) => setOrder(e.target.value)}
                      className="w-full mt-2 px-3 py-2 text-xs border border-slate-200 rounded-xl disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                    >
                      <option value="">Select scene order</option>
                      {Array.from({ length: currentLastOrder + 1 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Background Image <span className="text-red-500">*</span>
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl h-56 flex flex-col items-center justify-center text-center transition-colors ${
                  isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="scene preview"
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <>
                    <p className="text-3xl mb-2">⬆️</p>
                    <p className="text-sm font-semibold text-slate-700">Drag & drop an image here</p>
                    <p className="text-xs text-slate-400 my-2">or</p>
                    <label className="px-4 py-2 border border-indigo-500 text-indigo-600 text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-50">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-3">
                      Recommended size: 1280 x 720 (16:9) | Max size: 5MB
                    </p>
                    <p className="text-[10px] text-slate-400">Format: JPG, PNG, WEBP</p>
                  </>
                )}

                {imagePreview && (
                  <label className="absolute bottom-3 right-3 px-3 py-1.5 bg-white border border-slate-200 text-[10px] font-bold rounded-lg cursor-pointer shadow-sm">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">2. Scene Settings</h2>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={isActive ? 'active' : 'inactive'}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                className={`w-full px-3 py-2 text-xs font-semibold border rounded-xl cursor-pointer ${
                  isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-3">3. Preview</h2>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="preview"
                className="w-full h-48 object-cover rounded-xl border border-slate-200"
              />
            ) : (
              <div className="w-full h-48 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center">
                <p className="text-2xl mb-2">🖼️</p>
                <p className="text-xs font-semibold text-slate-600">Scene preview will appear here</p>
                <p className="text-[10px] text-slate-400 mt-1">Upload a background image to see preview</p>
              </div>
            )}
          </div>
        </div>

        {!justCreatedId && (
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={goToSceneList}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionStatus === 'loading'}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-60"
            >
              {actionStatus === 'loading' ? 'Saving…' : isEdit ? '✓ Update Scene' : '+ Create Scene'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SceneManager;