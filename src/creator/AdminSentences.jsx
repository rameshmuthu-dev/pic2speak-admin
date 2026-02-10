import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSentencesByLesson, 
  createSentence, 
  updateSentence, 
  deleteSentence, 
  resetSentenceState 
} from '../redux/slices/sentenceSlice';
import { fetchLessonById } from '../redux/slices/lessonSlice';

// UI Components & Icons
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import EditModal from '../ui/EditModal';
import { 
  ArrowLeft, Plus, Trash2, Pencil, 
  Volume2, Image as ImageIcon, Star, 
  PlayCircle, Layout 
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminSentences = () => {
  const { id: lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { items: sentences, loading, success, error } = useSelector((state) => state.sentences);
  const { currentLesson } = useSelector((state) => state.lessons);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    isPremium: false,
    order: 0,
    image: null,
    audio: null
  });

  // 1. Initial Data Fetch
  useEffect(() => {
    dispatch(fetchLessonById(lessonId));
    dispatch(fetchSentencesByLesson(lessonId));
  }, [dispatch, lessonId]);

  // 2. Success/Error Listener
  useEffect(() => {
    if (success) {
      toast.success(isEditMode ? "Slide updated successfully!" : "Slide created successfully!");
      setIsModalOpen(false);
      setIsEditMode(false);
      dispatch(resetSentenceState());
      // Re-fetch to ensure the UI has the latest data from the server
      dispatch(fetchSentencesByLesson(lessonId));
    }
    if (error) {
      toast.error(error);
      dispatch(resetSentenceState());
    }
  }, [success, error, dispatch, isEditMode, lessonId]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({ text: '', isPremium: false, order: sentences.length + 1, image: null, audio: null });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setIsEditMode(true);
    setSelectedId(item._id);
    // Note: image/audio are set to null so we only update them if the user selects a new file
    setFormData({ text: item.text, isPremium: item.isPremium, order: item.order, image: null, audio: null });
    setIsModalOpen(true);
  };

  // Save/Update Logic
  const handleSave = () => {
    if (!formData.text.trim()) return toast.warning("Text content is required");

    const data = new FormData();
    data.append('text', formData.text);
    data.append('isPremium', String(formData.isPremium));
    data.append('order', String(formData.order));
    
    // Only append files if they are actually selected
    if (formData.image) data.append('image', formData.image);
    if (formData.audio) data.append('audio', formData.audio);

    if (isEditMode) {
      dispatch(updateSentence({ id: selectedId, formData: data }));
    } else {
      data.append('lessonId', lessonId);
      dispatch(createSentence(data));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this slide?")) {
      dispatch(deleteSentence(id));
    }
  };

  if (loading && sentences.length === 0) return <Loading message="Loading Slides..." fullPage />;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Header */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-teal-600 font-bold text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Lessons
        </button>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 text-teal-600 rounded-2xl">
              <Layout size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                {currentLesson?.title || "Manage Slides"}
              </h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Sentence Management</p>
            </div>
          </div>
          <Button onClick={handleOpenCreate} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl transition-all shadow-md">
            <Plus size={20} strokeWidth={3} /> Add New Slide
          </Button>
        </div>

        {/* Slides Grid */}
        <div className="grid grid-cols-1 gap-4">
          {sentences.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-6 group hover:border-teal-200 transition-all">
              
              {/* IMAGE WITH CACHE BUSTER - FIXES THE TEAL T-SHIRT UPDATE ISSUE */}
              <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-50 relative">
                <img 
                  src={`${item.image?.url}?t=${new Date().getTime()}`} 
                  alt="Slide" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded font-black uppercase">Order: {item.order}</span>
                  {item.isPremium && <Star size={14} className="text-amber-400 fill-amber-400" />}
                </div>
                <h3 className="text-lg font-bold text-gray-800 leading-tight">{item.text}</h3>
                
                {/* Audio Playback Preview */}
                <button 
                  onClick={() => item.audio?.url && new Audio(item.audio.url).play()} 
                  className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-teal-600 hover:text-teal-800 transition-colors"
                >
                  <PlayCircle size={14} /> Play Preview
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button onClick={() => handleOpenEdit(item)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sentences.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase text-sm">No slides added yet. Start by adding one!</p>
          </div>
        )}
      </div>

      {/* --- MODAL FOR CREATE/EDIT --- */}
      <EditModal 
        isOpen={isModalOpen} 
        title={isEditMode ? "Update Slide" : "New Slide"} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        loading={loading}
      >
        <div className="space-y-5 py-2">
          {/* Text Input */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Sentence Text</label>
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-xl font-bold text-sm border-2 border-transparent focus:border-teal-500 outline-none transition-all resize-none"
              rows="3"
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              placeholder="Ex: She is wearing a teal t-shirt."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Order</label>
              <input 
                type="number" 
                className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border-2 border-transparent focus:border-teal-500" 
                value={formData.order} 
                onChange={(e) => setFormData({...formData, order: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Access</label>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, isPremium: !formData.isPremium})} 
                className={`w-full p-4 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 border-2 transition-all ${formData.isPremium ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-50 text-gray-400 border-transparent'}`}
              >
                <Star size={16} fill={formData.isPremium ? "currentColor" : "none"} />
                {formData.isPremium ? 'Premium' : 'Free'}
              </button>
            </div>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {/* Image Preview/Upload */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Image Slide</label>
              <div className="relative aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden hover:border-teal-400 transition-all cursor-pointer">
                {formData.image ? (
                  <img src={URL.createObjectURL(formData.image)} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="text-gray-300 mb-1" size={24} />
                    <span className="text-[10px] font-black text-gray-400 uppercase">Change Image</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, image: e.target.files[0]})} />
              </div>
            </div>

            {/* Audio Upload */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Audio File</label>
              <div className={`relative aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${formData.audio ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200 hover:border-teal-400 cursor-pointer'}`}>
                <Volume2 className={formData.audio ? 'text-teal-500' : 'text-gray-300'} size={24} />
                <span className="text-[9px] font-black text-gray-400 mt-2 uppercase px-4 truncate w-full text-center">
                  {formData.audio ? formData.audio.name : 'Upload New MP3'}
                </span>
                <input type="file" accept="audio/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, audio: e.target.files[0]})} />
              </div>
            </div>
          </div>
        </div>
      </EditModal>
    </div>
  );
};

export default AdminSentences;