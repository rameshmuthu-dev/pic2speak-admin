import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchLessonMasters,
  createLessonMaster,
  updateLessonMaster,
  deleteLessonMaster,
  changeLessonMasterStatus,
  selectAllLessonMasters,
  selectLessonMasterStatus,
  selectLessonMasterActionStatus,
  selectLessonMasterError,
  clearLessonMasterError
} from '../redux/slices/lessonMasterSlice';
import { fetchLessonContents, selectAllLessonContents } from '../redux/slices/lessonContentSlice';
import { fetchScenes, selectAllScenes } from '../redux/slices/sceneSlice';
import { fetchLanguages, selectActiveLanguageId } from '../redux/slices/Languagesslice';

import EditModal from '../ui/EditModal';
import Loading from '../ui/Loading';
import Button from '../ui/Button';
import { Plus, Pencil, Trash2, ShieldAlert, Star, ShieldCheck } from 'lucide-react';

const LessonList = () => {
  const dispatch = useDispatch();
  
  const lessons = useSelector(selectAllLessonMasters);
  const lessonContents = useSelector(selectAllLessonContents);
  const scenes = useSelector(selectAllScenes);
  const activeLanguageId = useSelector(selectActiveLanguageId);

  const status = useSelector(selectLessonMasterStatus);
  const actionStatus = useSelector(selectLessonMasterActionStatus);
  const error = useSelector(selectLessonMasterError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [formData, setFormData] = useState({
    order: '',
    completionXP: 20,
    xpPerSentence: 2,
    rewardCoins: 10,
    accessType: 'free'
  });

  useEffect(() => {
    dispatch(fetchLessonMasters());
    dispatch(fetchLessonContents());
    dispatch(fetchScenes());
    dispatch(fetchLanguages('active'));
  }, [dispatch]);

  useEffect(() => {
    if (actionStatus === 'succeeded') {
      setIsModalOpen(false);
      resetForm();
    }
    if (error) {
      toast.error(error);
      dispatch(clearLessonMasterError());
    }
  }, [actionStatus, error, dispatch]);

  const resetForm = () => {
    setFormData({ order: '', completionXP: 20, xpPerSentence: 2, rewardCoins: 10, accessType: 'free' });
    setSelectedLesson(null);
    setIsEditMode(false);
  };

  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate('/admin/lesson-content');
  };

  const handleEditClick = (lesson) => {
    setIsEditMode(true);
    setSelectedLesson(lesson);
    setFormData({
      order: lesson.order,
      completionXP: lesson.completionXP,
      xpPerSentence: lesson.xpPerSentence !== undefined ? lesson.xpPerSentence : 2,
      rewardCoins: lesson.rewardCoins,
      accessType: lesson.accessType || 'free'
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.order) return toast.warn("Order is required");

    const payload = {
      order: Number(formData.order),
      completionXP: Number(formData.completionXP),
      xpPerSentence: Number(formData.xpPerSentence),
      rewardCoins: Number(formData.rewardCoins),
      accessType: formData.accessType
    };

    if (isEditMode) {
      dispatch(updateLessonMaster({ id: selectedLesson._id, ...payload }));
      toast.success("Lesson updated successfully!");
    } else {
      dispatch(createLessonMaster(payload));
      toast.success("Lesson created successfully!");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lesson? This might affect lesson contents.")) {
      dispatch(deleteLessonMaster(id)).then(res => {
        if (!res.error) toast.info("Lesson deleted");
      });
    }
  };

  const handleToggleStatus = (lesson) => {
    dispatch(changeLessonMasterStatus({ id: lesson._id, isActive: !lesson.isActive }));
    toast.success("Status updated!");
  };

  const getLessonTitle = (lessonMasterId) => {
    if (!activeLanguageId) return { title: 'Untitled Lesson', subtitle: 'No content available' };
    const content = lessonContents.find(
      c => (typeof c.lessonMasterId === 'object' ? c.lessonMasterId._id : c.lessonMasterId) === lessonMasterId &&
           (typeof c.languageId === 'object' ? c.languageId._id : c.languageId) === activeLanguageId
    );
    if (content && content.title) {
      return { title: content.title, subtitle: 'Active Content' };
    }
    return { title: 'Untitled Lesson', subtitle: 'No content available' };
  };

  const getSceneCount = (lessonMasterId) => {
    return scenes.filter(
      s => (typeof s.lessonMasterId === 'object' ? s.lessonMasterId._id : s.lessonMasterId) === lessonMasterId
    ).length;
  };

  const getCardStyle = (index) => {
    const palette = [
      { bg: 'bg-gradient-to-br from-[#10b981] to-[#34d399]' }, // Green
      { bg: 'bg-gradient-to-br from-[#3b82f6] to-[#60a5fa]' }, // Blue
      { bg: 'bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]' }, // Purple
      { bg: 'bg-gradient-to-br from-[#f43f5e] to-[#fb7185]' }, // Rose
      { bg: 'bg-gradient-to-br from-[#f59e0b] to-[#fbbf24]' }, // Amber
    ];
    return palette[index % palette.length];
  };

  if (status === 'loading' && lessons.length === 0) return <Loading fullPage={true} />;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-100 rounded-3xl flex items-center justify-center text-teal-600 shadow-sm">
              <span className="font-bold text-2xl">📖</span>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Lessons</h1>
              <p className="text-slate-500 mt-1 font-medium">Manage Lesson Masters and Free/Premium access</p>
            </div>
          </div>
          <div className="w-48 relative">
            {/* Small visual decorations */}
            <div className="absolute -top-6 -left-6 text-amber-300 text-xl font-bold animate-pulse">+</div>
            <div className="absolute -bottom-4 -right-4 text-pink-300 text-xl font-bold rotate-45">+</div>
            <Button onClick={handleCreateNew} variant="brand" className="flex items-center justify-center gap-2 rounded-2xl py-3.5">
              <Plus size={18} strokeWidth={3} />
              <span className="font-bold text-[13px]">NEW LESSON</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lessons.map((lesson, index) => {
              const titleInfo = getLessonTitle(lesson._id);
              const cardStyle = getCardStyle(index);
              
              return (
                <div key={lesson._id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group relative">
                  {/* Colorful Hero Area */}
                  <div className={`relative h-[220px] p-6 ${cardStyle.bg} overflow-hidden`}>
                    {/* Wavy Decorative Background */}
                    <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
                    
                    {/* White wavy bottom shape using SVG */}
                    <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-none">
                      <svg className="relative block w-[calc(130%+1.3px)] h-[50px] -ml-[15%]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C52.16,93.26,104.32,90.72,156.48,88.18,211.5,85.51,266.5,82.84,321.39,56.44Z" className="fill-white"></path>
                      </svg>
                    </div>

                    <div className="flex justify-between items-start relative z-10">
                      <span className="px-4 py-1.5 bg-white/20 text-white rounded-xl font-black text-sm backdrop-blur-md shadow-sm border border-white/30">
                        {String(lesson.order).padStart(2, '0')}
                      </span>
                      {lesson.accessType === 'premium' ? (
                        <span className="px-3 py-1.5 bg-white text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1 shadow-md">
                          <Star size={12} className="fill-amber-500" /> Premium
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-white text-teal-600 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1 shadow-md">
                          <ShieldCheck size={12} /> Free
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-8 left-6 right-6 z-10 flex flex-col justify-end">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-3xl font-black text-white uppercase drop-shadow-md tracking-tight leading-none truncate max-w-[80%]">
                          {titleInfo.title}
                        </h3>
                        <span 
                          className="flex-shrink-0 px-2.5 py-1 bg-white/20 text-white rounded-full font-black text-xs backdrop-blur-md border border-white/30 shadow-sm flex items-center justify-center min-w-[2rem]"
                          title={`${getSceneCount(lesson._id)} Scenes`}
                        >
                          {getSceneCount(lesson._id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1.5 ${lesson.isActive ? 'bg-white text-emerald-600' : 'bg-white/80 text-slate-500'}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${lesson.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {lesson.isActive ? 'Active' : 'Inactive'}
                        </span>
                    
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="px-6 pb-6 pt-2 bg-white flex-1 flex flex-col relative z-20">
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                          <Star size={20} className="fill-emerald-500" />
                        </div>
                        <div>
                          <p className="font-black text-emerald-900 text-lg leading-none">{lesson.xpPerSentence !== undefined ? lesson.xpPerSentence : 2}</p>
                          <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mt-0.5">XP / Sent</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-amber-50/50 border border-amber-100 p-3 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center shadow-inner">
                          <span className="font-black text-lg">🪙</span>
                        </div>
                        <div>
                          <p className="font-black text-amber-900 text-lg leading-none">{lesson.rewardCoins}</p>
                          <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mt-0.5">Coins / Comp</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-auto gap-3">
                      <Button variant="secondary" className="flex-1 py-3 flex items-center justify-center shadow-sm" onClick={() => navigate(`/admin/scenes/${lesson._id}`)}>
                        <span className="font-bold text-[11px] uppercase tracking-wider">VIEW DETAILS</span>
                      </Button>
                      <button onClick={() => handleEditClick(lesson)} className="p-3 text-slate-400 hover:text-teal-600 hover:bg-teal-50 border border-transparent hover:border-teal-100 rounded-2xl transition-all shadow-sm bg-white">
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => handleDelete(lesson._id)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-2xl transition-all shadow-sm bg-white">
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <ShieldAlert size={40} />
            </div>
            <h3 className="font-black text-2xl text-slate-700 mb-2">No Lessons Found</h3>
            <p className="font-medium text-slate-500 mb-8 max-w-sm mx-auto">You haven't created any lessons yet. Start building your curriculum now!</p>
            <div className="w-64 mx-auto">
              <Button onClick={handleCreateNew} variant="brand" className="py-3.5 flex items-center justify-center gap-2">
                <Plus size={20} strokeWidth={3} /> 
                <span className="font-bold text-sm">CREATE FIRST LESSON</span>
              </Button>
            </div>
          </div>
        )}

        {lessons.length > 0 && (
          <div className="mt-8 text-sm font-bold text-slate-400">
            Showing {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <EditModal 
        isOpen={isModalOpen} 
        title={isEditMode ? "Update Lesson" : "Create New Lesson"} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        loading={actionStatus === 'loading'}
      >
        <div className="space-y-5 py-3">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Lesson Order</label>
            <input 
              type="number"
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-800 border-2 border-transparent focus:border-teal-500 focus:bg-white transition-all outline-none" 
              value={formData.order} 
              onChange={(e) => setFormData({...formData, order: e.target.value})} 
              placeholder="e.g. 1" 
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Completion XP</label>
              <input 
                type="number"
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-800 border-2 border-transparent focus:border-teal-500 focus:bg-white transition-all outline-none" 
                value={formData.completionXP} 
                onChange={(e) => setFormData({...formData, completionXP: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">XP / Sentence</label>
              <input 
                type="number"
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-800 border-2 border-transparent focus:border-teal-500 focus:bg-white transition-all outline-none" 
                value={formData.xpPerSentence} 
                onChange={(e) => setFormData({...formData, xpPerSentence: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Reward Coins</label>
              <input 
                type="number"
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-800 border-2 border-transparent focus:border-teal-500 focus:bg-white transition-all outline-none" 
                value={formData.rewardCoins} 
                onChange={(e) => setFormData({...formData, rewardCoins: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Access Type</label>
            <select
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-800 border-2 border-transparent focus:border-teal-500 focus:bg-white transition-all outline-none cursor-pointer"
              value={formData.accessType}
              onChange={(e) => setFormData({...formData, accessType: e.target.value})}
            >
              <option value="free">FREE</option>
              <option value="premium">PREMIUM</option>
            </select>
          </div>
        </div>
      </EditModal>
    </div>
  );
};

export default LessonList;

