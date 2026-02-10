import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  fetchLessons, 
  deleteLesson, 
  createFullLesson, 
  updateLesson, 
  resetLessonState 
} from '../redux/slices/lessonSlice';

// UI Components
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import EditModal from '../ui/EditModal';
import { Plus, Trash2, ArrowLeft, Pencil, Image as ImageIcon } from 'lucide-react';

const AdminLessons = () => {
  const { topicId } = useParams(); 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    level: 'Beginner', 
    partNumber: 1, 
    thumbnail: null 
  });

  const { items: lessons, loading, success, error } = useSelector((state) => state.lessons);
  const { items: allTopics } = useSelector((state) => state.topics); 

  useEffect(() => {
    dispatch(fetchLessons('all'));
  }, [dispatch]);

  // Handle Success and Error Notifications
  useEffect(() => {
    if (success) {
      toast.success(isEditMode ? "Lesson Updated!" : "Lesson Created!");
      setIsModalOpen(false);
      resetForm();
      dispatch(resetLessonState());
      dispatch(fetchLessons('all')); 
    }
    if (error) {
      toast.error(error);
      dispatch(resetLessonState());
    }
  }, [success, error, dispatch, isEditMode]);

  const currentTopic = allTopics?.find(t => t._id === topicId);
  const filteredLessons = (lessons || []).filter(lesson => 
    (lesson.topic === topicId || lesson.topic?._id === topicId)
  );

  const resetForm = () => {
    setFormData({ title: '', description: '', level: 'Beginner', partNumber: 1, thumbnail: null });
    setSelectedLesson(null);
    setIsEditMode(false);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return toast.warn("Title is required");
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('level', formData.level);
    data.append('partNumber', formData.partNumber);
    data.append('topic', topicId);
    
    const categoryId = currentTopic?.category?._id || currentTopic?.category;
    if (categoryId) data.append('category', categoryId);

    if (formData.thumbnail) {
      data.append('thumbnail', formData.thumbnail);
    }

    if (isEditMode) {
      dispatch(updateLesson({ id: selectedLesson._id, formData: data }));
    } else {
      if (!formData.thumbnail) return toast.warn("Please select a thumbnail");
      dispatch(createFullLesson(data));
    }
  };

  const handleEditClick = (lesson, e) => {
    e.stopPropagation();
    setIsEditMode(true);
    setSelectedLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      level: lesson.level,
      partNumber: lesson.partNumber,
      thumbnail: null
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      dispatch(deleteLesson(id)).then(() => toast.info("Lesson deleted"));
    }
  };

  if (loading && (!lessons || lessons.length === 0)) return <Loading fullPage={true} />;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto mb-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold text-xs uppercase mb-6 transition-all">
          <ArrowLeft size={14} /> Back to Topics
        </button>

        <div className="flex items-center justify-between gap-6 border-b border-slate-200 pb-6">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-800">
            {currentTopic?.name || "Lessons"}
          </h1>
          
          {/* Small button with scroll/spin icon effect on hover */}
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="group flex items-center bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg shadow-teal-100 whitespace-nowrap"
          >
            <Plus size={18} className="mr-2 transition-transform duration-500 group-hover:rotate-180" />
            <span className="hidden sm:inline">New Lesson</span>
          </button>
        </div>
      </div>

      {/* Lesson Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredLessons.length > 0 ? (
          filteredLessons.map((lesson) => (
            <div 
              key={lesson._id} 
              onClick={() => navigate(`/admin/lesson/${lesson._id}`)}
              className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
            >
              <div className="h-48 bg-slate-200 relative">
                {lesson.thumbnail?.url && (
                  <img src={lesson.thumbnail.url} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleEditClick(lesson, e)} className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:text-teal-600"><Pencil size={14}/></button>
                  <button onClick={(e) => handleDelete(lesson._id, e)} className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Part {lesson.partNumber}</span>
                <h3 className="text-xl font-black uppercase tracking-tight truncate text-slate-800">{lesson.title}</h3>
                <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-relaxed">{lesson.description}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <ImageIcon size={24} />
             </div>
             <p className="font-bold text-slate-400 uppercase text-sm">No lessons found for this topic.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <EditModal 
        isOpen={isModalOpen} 
        title={isEditMode ? "Update Lesson" : "Create New Lesson"} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        loading={loading}
      >
        <div className="space-y-4 py-2">
          <input 
            className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-teal-500 transition-all outline-none" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            placeholder="Lesson Title" 
          />
          <textarea 
            className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-teal-500 min-h-[100px] transition-all outline-none" 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            placeholder="Description" 
          />
          <div className="grid grid-cols-2 gap-4">
            <select 
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none appearance-none" 
              value={formData.level} 
              onChange={(e) => setFormData({...formData, level: e.target.value})}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <input 
              type="number" 
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" 
              value={formData.partNumber} 
              onChange={(e) => setFormData({...formData, partNumber: e.target.value})} 
              placeholder="Part #" 
            />
          </div>
          
          {/* Custom File Upload UI */}
          <div className="relative w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center overflow-hidden transition-colors hover:border-teal-300 group/file">
            {formData.thumbnail ? (
               <img src={URL.createObjectURL(formData.thumbnail)} className="w-full h-full object-cover" alt="preview" />
            ) : (
              <div className="flex flex-col items-center text-slate-400 group-hover/file:text-teal-500 transition-colors">
                <ImageIcon size={32} />
                <span className="text-[10px] font-black uppercase mt-2">Upload Thumbnail</span>
              </div>
            )}
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => setFormData({...formData, thumbnail: e.target.files[0]})} 
            />
          </div>
        </div>
      </EditModal>
    </div>
  );
};

export default AdminLessons;