import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  fetchSubLessonsByLesson, 
  deleteSubLesson, 
  createSubLesson, 
  updateSubLesson, 
  resetSubLessonState 
} from '../redux/slices/subLessonSlice';
import Loading from '../ui/Loading';
import EditModal from '../ui/EditModal';
import ItemCard from '../ui/ItemCard';
import { Plus, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const AdminSubLessons = () => {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSubLesson, setSelectedSubLesson] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    order: 0,
    thumbnail: null 
  });

  const { subItems: subLessons, loading, success, error } = useSelector((state) => state.subLessons);
  const { items: allLessons } = useSelector((state) => state.lessons);

  useEffect(() => {
    if (lessonId) {
      dispatch(fetchSubLessonsByLesson(lessonId));
    }
  }, [dispatch, lessonId]);

  useEffect(() => {
    if (success) {
      toast.success(isEditMode ? "Sub-Lesson Updated!" : "Sub-Lesson Created!");
      setIsModalOpen(false);
      resetForm();
      dispatch(resetSubLessonState());
      dispatch(fetchSubLessonsByLesson(lessonId));
    }
  }, [success, dispatch, isEditMode, lessonId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetSubLessonState());
    }
  }, [error, dispatch]);

  const currentLesson = allLessons?.find(l => l._id === lessonId);

  const resetForm = () => {
    setFormData({ name: '', description: '', order: 0, thumbnail: null });
    setPreviewImage(null);
    setSelectedSubLesson(null);
    setIsEditMode(false);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return toast.warn("Sub-Lesson Name is required");
    
    const data = new FormData();
    data.append('title', formData.name);
    data.append('description', formData.description);
    data.append('order', Number(formData.order) || 0);
    data.append('lessonId', lessonId);
    
    if (formData.thumbnail instanceof File) {
      data.append('thumbnail', formData.thumbnail);
    }

    if (isEditMode) {
      dispatch(updateSubLesson({ id: selectedSubLesson._id, updateData: data }));
    } else {
      dispatch(createSubLesson(data));
    }
  };

  const handleEditClick = (subLesson) => {
    setIsEditMode(true);
    setSelectedSubLesson(subLesson);
    setFormData({
      name: subLesson.title || subLesson.name,
      description: subLesson.description || '',
      order: subLesson.order || 0,
      thumbnail: subLesson.thumbnail
    });
    setPreviewImage(subLesson.thumbnail?.url || subLesson.thumbnail || null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this sub-lesson?")) {
      dispatch(deleteSubLesson(id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto mb-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold text-xs uppercase mb-6 transition-all">
          <ArrowLeft size={14} /> Back to Lessons
        </button>
        <div className="flex items-center justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase text-slate-800">{currentLesson?.title || "Sub-Lessons"}</h1>
          </div>
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all">
            <Plus size={18} className="inline mr-2" /> New Sub-Lesson
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? <Loading /> : subLessons?.map((sub) => (
          <ItemCard 
            key={sub._id} item={sub} titleKey="title"
            onClick={() => navigate(`/admin/sublesson/${sub._id}/sentences`)}
            onEdit={() => handleEditClick(sub)}
            onDelete={() => handleDelete(sub._id)}
          />
        ))}
      </div>

      <EditModal isOpen={isModalOpen} title={isEditMode ? "Update" : "Create"} onClose={() => setIsModalOpen(false)} onSave={handleSave} loading={loading}>
        <div className="space-y-4 py-2">
          <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Name" />
          <textarea className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Description" />
          <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} placeholder="Order" />
          
          <label className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl cursor-pointer border-2 border-dashed border-slate-200">
            {previewImage ? (
              <img src={previewImage instanceof File ? URL.createObjectURL(previewImage) : previewImage} alt="Preview" className="h-20 w-full object-cover rounded-xl" />
            ) : (
              <><ImageIcon className="text-teal-600" /> <span>Upload Thumbnail</span></>
            )}
            <input type="file" className="hidden" onChange={(e) => {
              if (e.target.files[0]) {
                setFormData({...formData, thumbnail: e.target.files[0]});
                setPreviewImage(e.target.files[0]);
              }
            }} />
          </label>
        </div>
      </EditModal>
    </div>
  );
};

export default AdminSubLessons;