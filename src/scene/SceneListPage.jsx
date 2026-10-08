import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  fetchScenes,
  changeSceneStatus,
  deleteScene,
  selectAllScenes,
  selectSceneStatus,
  selectSceneError,
  clearSceneError,
} from '../redux/slices/sceneSlice';
import {
  fetchLessonMasterById,
  selectSelectedLessonMaster,
} from '../redux/slices/lessonMasterSlice';
import {
  ArrowLeft,
  Plus,
  Clapperboard,
  Pencil,
  Trash2,
  FolderOpen,
  Power,
} from 'lucide-react';
import Loading from '../ui/Loading';

const getLessonId = (scene) =>
  typeof scene.lessonMasterId === 'object' ? scene.lessonMasterId?._id : scene.lessonMasterId;

const CARD_PALETTE = [
  { from: '#6d28d9', to: '#8b5cf6' },
  { from: '#0d9488', to: '#14b8a6' },
  { from: '#d97706', to: '#f59e0b' },
  { from: '#1d4ed8', to: '#3b82f6' },
  { from: '#be123c', to: '#f43f5e' },
  { from: '#065f46', to: '#10b981' },
];

const SceneCard = ({ scene, index, onEdit, onManageContent, onStatusToggle, onDelete }) => {
  const palette = CARD_PALETTE[index % CARD_PALETTE.length];

  return (
    <div className="group relative bg-white rounded-[1.75rem] overflow-hidden shadow-lg shadow-slate-200/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div
        className="relative h-56 overflow-hidden flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
      >
        <div
          className="glass-sweep absolute inset-0 pointer-events-none z-10 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 65%)',
            transform: 'translateX(60%) translateY(40%)',
          }}
          aria-hidden="true"
        />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full" />
        {scene.imageUrl ? (
          <img
            src={scene.imageUrl}
            alt={`Scene ${scene.order}`}
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Clapperboard size={52} className="text-white/25" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white font-black text-sm rounded-xl border border-white/25 shadow-sm">
            {String(scene.order).padStart(2, '0')}
          </span>
          <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm ${scene.isActive ? 'bg-white text-emerald-600' : 'bg-white/80 text-slate-500'}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${scene.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {scene.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/45 to-transparent">
          <p className="text-white font-black text-xl leading-tight">Scene {scene.order}</p>
        </div>
      </div>
      <div className="p-5 bg-white flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onEdit} className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/50 transition-all cursor-pointer">
            <Pencil size={14} strokeWidth={2.5} />
            Edit Scene
          </button>
          <button type="button" onClick={onManageContent} className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-indigo-200 text-indigo-700 rounded-2xl text-xs font-bold hover:border-indigo-400 hover:bg-indigo-50/60 transition-all cursor-pointer">
            <FolderOpen size={14} strokeWidth={2.5} />
            Manage Content
          </button>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <button type="button" onClick={onStatusToggle} className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer px-2 py-1 rounded-lg transition-all ${scene.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
            <Power size={13} strokeWidth={2.5} />
            {scene.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button type="button" onClick={onDelete} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer px-2 py-1 rounded-lg transition-all">
            <Trash2 size={13} strokeWidth={2.5} />
            Delete
          </button>
        </div>
      </div>
      <style>{`.group:hover .glass-sweep { transform: translateX(-10%) translateY(-10%) !important; }`}</style>
    </div>
  );
};

const SceneListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lessonMasterId } = useParams();

  const scenes = useSelector(selectAllScenes);
  const status = useSelector(selectSceneStatus);
  const error = useSelector(selectSceneError);
  const lessonMaster = useSelector(selectSelectedLessonMaster);

  useEffect(() => {
    if (!lessonMasterId) return;
    dispatch(fetchScenes(lessonMasterId));
    dispatch(fetchLessonMasterById(lessonMasterId));
  }, [dispatch, lessonMasterId]);

  const lessonScenes = useMemo(
    () => [...scenes].sort((a, b) => a.order - b.order),
    [scenes]
  );

  const handleStatusToggle = (scene) => {
    dispatch(changeSceneStatus({ id: scene._id, isActive: !scene.isActive })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') toast.success(scene.isActive ? 'Scene deactivated.' : 'Scene activated.');
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this scene? This cannot be undone.')) {
      dispatch(deleteScene(id)).then((res) => {
        if (res.meta.requestStatus === 'fulfilled') toast.success('Scene deleted successfully!');
        else toast.error(res.payload || 'Failed to delete scene.');
      });
    }
  };

  if (status === 'loading' && lessonScenes.length === 0) return <Loading fullPage />;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
              <Clapperboard size={26} strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Scenes</h1>
              <p className="text-slate-500 mt-0.5 font-medium text-sm">
                Dashboard <span className="mx-1 text-slate-300">›</span> Lessons{' '}
                <span className="mx-1 text-slate-300">›</span>{' '}
                <span className="text-indigo-600 font-semibold">
                  {lessonMaster ? `Lesson ${lessonMaster.order}` : 'Scenes'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button type="button" onClick={() => navigate('/admin/lesson-masters')} className="flex items-center gap-2 px-4 py-2.5 border-2 border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer">
              <ArrowLeft size={14} strokeWidth={2.5} />
              Back to Lessons
            </button>
            <button type="button" onClick={() => navigate(`/admin/scenes/create/${lessonMasterId}`)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-200 transition-all cursor-pointer">
              <Plus size={16} strokeWidth={3} />
              Add Scene
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-semibold text-red-600 flex items-center justify-between">
          {error}
          <button type="button" onClick={() => dispatch(clearSceneError())} className="text-red-400 hover:text-red-600 cursor-pointer text-lg leading-none">✕</button>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {status === 'loading' ? (
          <div className="text-center py-20 text-slate-400 font-semibold">Loading scenes…</div>
        ) : lessonScenes.length === 0 ? (
          <div className="py-28 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clapperboard size={38} className="text-indigo-300" strokeWidth={1.5} />
            </div>
            <h3 className="font-black text-2xl text-slate-700 mb-2">No Scenes Yet</h3>
            <p className="font-medium text-slate-400 mb-8 max-w-xs mx-auto">Add the first scene to start building this lesson.</p>
            <button type="button" onClick={() => navigate(`/admin/scenes/create/${lessonMasterId}`)} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg transition-all cursor-pointer">
              <Plus size={18} strokeWidth={3} />
              Add First Scene
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lessonScenes.map((scene, index) => (
                <SceneCard
                  key={scene._id}
                  scene={scene}
                  index={index}
                  onEdit={() => navigate(`/admin/scenes/${lessonMasterId}/edit/${scene._id}`)}
                  onManageContent={() => navigate(`/admin/scenes/${lessonMasterId}/${scene._id}/content`)}
                  onStatusToggle={() => handleStatusToggle(scene)}
                  onDelete={() => handleDelete(scene._id)}
                />
              ))}
            </div>
            <div className="mt-8 text-sm font-bold text-slate-400">
              Showing {lessonScenes.length} scene{lessonScenes.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SceneListPage;