import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  fetchSceneContents,
  createSceneContent,
  updateSceneContent,
  deleteSceneContent,
  changeSceneContentStatus,
  publishSceneContent,
  selectAllSceneContents,
  selectSceneContentActionStatus,
  selectSceneContentError,
  clearSceneContentError,
  resetSceneContentItems,
} from '../redux/slices/sceneContentSlice';
import {
  fetchLanguages,
  selectActiveLanguages,
} from '../redux/slices/Languagesslice';
import {
  fetchSceneById,
  selectSelectedScene,
} from '../redux/slices/sceneSlice';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Power,
  Globe,
  CheckCircle2,
  Clapperboard,
  Mic,
} from 'lucide-react';

const getId = (value) => {
  if (!value) return '';
  if (typeof value === 'object') {
    return String(value._id || '');
  }
  return String(value);
};

const getSceneId = (content) => getId(content.sceneId);
const getLangId = (content) => getId(content.languageId);

const SceneContentPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lessonMasterId, sceneId } = useParams();

  const scene = useSelector(selectSelectedScene);
  const languages = useSelector(selectActiveLanguages);
  const allContents = useSelector(selectAllSceneContents);
  const actionStatus = useSelector(selectSceneContentActionStatus);
  const error = useSelector(selectSceneContentError);

  const [languageId, setLanguageId] = useState('');
  const [sentence, setSentence] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!sceneId) return;
    dispatch(resetSceneContentItems());
    dispatch(fetchSceneById(sceneId));
    dispatch(fetchSceneContents(sceneId));
    dispatch(fetchLanguages('active'));
  }, [dispatch, sceneId]);

  useEffect(() => {
    if (languages.length > 0 && !languageId) {
      const englishLanguage = languages.find(
        (language) => language.code?.toLowerCase() === 'en'
      );
      setLanguageId(englishLanguage?._id || languages[0]._id);
    }
  }, [languages, languageId]);

  const normalizedSceneId = String(sceneId || '');
  const normalizedLanguageId = String(languageId || '');

  const contents = useMemo(() => {
    return allContents.filter(
      (content) => getSceneId(content) === normalizedSceneId
    );
  }, [allContents, normalizedSceneId]);

  const existingContent = useMemo(() => {
    return (
      contents.find(
        (content) => getLangId(content) === normalizedLanguageId
      ) || null
    );
  }, [contents, normalizedLanguageId]);

  useEffect(() => {
    if (existingContent) {
      setSentence(existingContent.sentence || '');
      setAudioFile(null);
      setAudioPreviewUrl(existingContent.audioUrl || '');
      setFormError('');
    } else {
      setSentence('');
      setAudioFile(null);
      setAudioPreviewUrl('');
      setFormError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingContent?._id, languageId]);

  useEffect(() => {
    return () => {
      // Clean up object URLs
    };
  }, [audioPreviewUrl]);

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSelectLanguage = (id) => {
    setLanguageId(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearSceneContentError());

    if (!languageId) {
      setFormError('Please select a language.');
      return;
    }
    if (!sentence.trim()) {
      setFormError('Sentence is required.');
      return;
    }

    if (existingContent) {
      const formData = new FormData();
      formData.append('sentence', sentence.trim());
      if (audioFile) {
        formData.append('audio', audioFile);
      }

      const result = await dispatch(
        updateSceneContent({ id: existingContent._id, formData })
      );
      if (result.meta.requestStatus !== 'fulfilled') {
        setFormError(result.payload || 'Could not update content.');
        return;
      }

      toast.success('Content updated successfully!');
      dispatch(fetchSceneContents(sceneId));
      setAudioFile(null);
      setAudioPreviewUrl('');
    } else {
      if (!audioFile) {
        setFormError('Audio is required.');
        return;
      }

      const formData = new FormData();
      formData.append('sceneId', sceneId);
      formData.append('languageId', languageId);
      formData.append('sentence', sentence.trim());
      formData.append('audio', audioFile);

      const result = await dispatch(createSceneContent(formData));
      if (result.meta.requestStatus !== 'fulfilled') {
        setFormError(result.payload || 'Could not create content.');
        return;
      }

      toast.success('Content created successfully!');
      dispatch(fetchSceneContents(sceneId));
    }
  };

  const handlePublish = (contentId) => {
    dispatch(publishSceneContent(contentId)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success('Content published!');
        dispatch(fetchSceneContents(sceneId));
      } else {
        toast.error(res.payload || 'Failed to publish.');
      }
    });
  };

  const handleStatusToggle = (content) => {
    dispatch(changeSceneContentStatus({ id: content._id, isActive: !content.isActive })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(fetchSceneContents(sceneId));
      }
    });
  };

  const handleDelete = (content) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    dispatch(deleteSceneContent(content._id)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success('Content deleted successfully!');
        dispatch(fetchSceneContents(sceneId));
      } else {
        toast.error(res.payload || 'Failed to delete.');
      }
    });
  };

  const activeLanguageObj = languages.find((l) => l._id === languageId);
  const isEditMode = !!existingContent;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm flex-shrink-0">
              <Globe size={26} strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Manage Content</h1>
              <p className="text-slate-500 mt-0.5 font-medium text-sm">
                Dashboard <span className="mx-1 text-slate-300">›</span> Lessons{' '}
                <span className="mx-1 text-slate-300">›</span> Scenes <span className="mx-1 text-slate-300">›</span>{' '}
                <span className="text-teal-600 font-semibold">Content</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/admin/scenes/${lessonMasterId}`)}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            Back to Scenes
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-semibold text-red-600 flex items-center justify-between">
          {error}
          <button onClick={() => dispatch(clearSceneContentError())} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left Column: Scene Context & Single Editor */}
        <div className="lg:col-span-1 space-y-6">

          {/* Scene Hero Card */}
          <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="h-40 relative bg-gradient-to-br from-indigo-500 to-purple-600">
              {scene?.imageUrl ? (
                <img src={scene.imageUrl} alt="scene" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Clapperboard className="text-white/30 w-12 h-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white font-black text-xs rounded-lg border border-white/20">
                    Scene {String(scene?.order || 0).padStart(2, '0')}
                  </span>
                  <span className={`px-2 py-1 text-[9px] font-bold uppercase rounded-lg ${scene?.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                    {scene?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Single Content Editor */}
          <div className="bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <h2 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
              {isEditMode ? (
                <Pencil className="text-teal-500" size={18} />
              ) : (
                <Plus className="text-teal-500" size={20} />
              )}
              {isEditMode
                ? `Edit ${activeLanguageObj?.name || ''} Content`
                : `Add ${activeLanguageObj?.name || ''} Content`}
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Language</label>
                <div className="relative">
                  <select
                    value={languageId}
                    onChange={(e) => handleSelectLanguage(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-semibold border-2 border-slate-100 rounded-2xl appearance-none bg-slate-50 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors cursor-pointer"
                  >
                    {languages.map((lang) => (
                      <option key={lang._id} value={lang._id}>{lang.name}</option>
                    ))}
                  </select>
                  <Globe className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sentence <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  placeholder={`e.g. Translation in ${activeLanguageObj?.name || 'selected language'}`}
                  value={sentence}
                  onChange={(e) => setSentence(e.target.value)}
                  className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-2xl bg-slate-50 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right font-medium">{sentence.length} / 1000</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isEditMode ? 'Replace Audio (Optional)' : (
                    <>Audio <span className="text-red-500">*</span></>
                  )}
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full px-4 py-3 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors ${audioFile ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-slate-50 group-hover:border-teal-400 group-hover:bg-teal-50/30'}`}>
                    <Mic className={audioFile ? 'text-teal-600' : 'text-slate-400'} size={24} />
                    <span className="text-xs font-bold text-slate-600 text-center">
                      {audioFile ? audioFile.name : 'Click or drop audio file'}
                    </span>
                  </div>
                </div>

                {(() => {
                  const displayedAudioUrl = audioPreviewUrl || existingContent?.audioUrl || '';
                  return displayedAudioUrl ? (
                    <div className="mt-3 bg-slate-900 rounded-xl p-2 shadow-inner">
                      <audio
                        controls
                        src={displayedAudioUrl}
                        className="w-full h-8 [&::-webkit-media-controls-panel]:bg-slate-900 [&::-webkit-media-controls-current-time-display]:text-white [&::-webkit-media-controls-time-remaining-display]:text-white"
                      />
                    </div>
                  ) : null;
                })()}
              </div>

              <button
                type="submit"
                disabled={actionStatus === 'loading'}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-teal-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
              >
                {actionStatus === 'loading'
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update Content'
                  : 'Add Content'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Content Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg shadow-slate-200/50 border border-slate-100 min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-800">
                Translations <span className="text-slate-400 text-lg font-bold ml-2">({contents.length})</span>
              </h2>
            </div>

            {contents.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Globe className="text-slate-300 w-10 h-10" />
                </div>
                <p className="text-lg font-bold text-slate-600 mb-1">No translations yet</p>
                <p className="text-sm text-slate-400">Use the panel on the left to add your first language.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {contents.map((content) => {
                  const lang = typeof content.languageId === 'object' ? content.languageId : null;
                  const isSelected = getLangId(content) === languageId;

                  return (
                    <div
                      key={content._id}
                      onClick={() => handleSelectLanguage(getLangId(content))}
                      className={`group relative bg-white border-2 rounded-3xl p-5 hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 flex flex-col cursor-pointer ${
                        isSelected ? 'border-teal-400 shadow-lg shadow-teal-100/50' : 'border-slate-100 hover:border-teal-200'
                      }`}
                    >
                      {/* Top Bar */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shadow-sm">
                            {lang?.code || 'LA'}
                          </div>
                          <span className="font-black text-slate-800">{lang?.name || 'Language'}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wide rounded-full ${content.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {content.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wide rounded-full ${content.isActive ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-600'}`}>
                            {content.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 flex flex-col justify-center bg-slate-50 rounded-2xl p-4 mb-4">
                        <p className="text-slate-800 font-medium text-base text-center leading-relaxed">
                          "{content.sentence}"
                        </p>
                      </div>

                      {/* Audio Player */}
                      {content.audioUrl && (
                        <div className="bg-slate-900 rounded-xl p-2 shadow-inner mb-4">
                          <audio
                            controls
                            src={content.audioUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full h-8 [&::-webkit-media-controls-panel]:bg-slate-900 [&::-webkit-media-controls-current-time-display]:text-white [&::-webkit-media-controls-time-remaining-display]:text-white"
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                        {content.status !== 'published' ? (
                          <button onClick={() => handlePublish(content._id)} className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1">
                            <CheckCircle2 size={14} /> Publish
                          </button>
                        ) : (
                          <button onClick={() => handleStatusToggle(content)} className={`py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 ${content.isActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                            <Power size={14} /> {content.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        <button onClick={() => handleSelectLanguage(getLangId(content))} className="py-2 border-2 border-slate-100 hover:border-teal-200 hover:text-teal-700 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1">
                          <Pencil size={14} /> Edit
                        </button>
                        <button onClick={() => handleDelete(content)} className="col-span-2 py-2 mt-1 border-2 border-transparent hover:border-red-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1">
                          <Trash2 size={14} /> Delete Translation
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneContentPanel;