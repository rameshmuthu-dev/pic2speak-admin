import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  fetchTopicsByCategory, 
  deleteTopic, 
  createTopic, 
  updateTopic, 
  resetTopicState 
} from '../redux/slices/topicSlice';

import Loading from '../ui/Loading';
import EditModal from '../ui/EditModal';
import ItemCard from '../ui/ItemCard';
import { Plus, LayoutGrid, ArrowLeft, Image as ImageIcon, AlertTriangle } from 'lucide-react';

const AdminTopics = () => {
  const { categoryId } = useParams(); 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: topics, loading, success, error } = useSelector((state) => state.topics);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [formData, setFormData] = useState({ name: '', thumbnail: null });

  useEffect(() => {
    if (categoryId) {
      dispatch(fetchTopicsByCategory(categoryId));
    }
  }, [dispatch, categoryId]);

  useEffect(() => {
    if (success) {
      if (isModalOpen) {
        toast.success(isEditMode ? "Topic updated!" : "Topic created!");
        setIsModalOpen(false);
      } else if (showDeleteModal) {
        toast.info("Topic permanently deleted");
        setShowDeleteModal(false);
      }
      dispatch(resetTopicState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetTopicState());
    }
  }, [success, error, dispatch, isModalOpen, showDeleteModal, isEditMode]);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedTopic(null);
    setFormData({ name: '', thumbnail: null });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (topic) => {
    setIsEditMode(true);
    setSelectedTopic(topic);
    setFormData({ name: topic.name, thumbnail: null });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return toast.warning("Name is required");
    
    const isDuplicate = topics.some(
      (top) => top.name.toLowerCase() === formData.name.toLowerCase() && top._id !== selectedTopic?._id
    );
    if (isDuplicate) return toast.error("This topic already exists");

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', categoryId); 
    if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);

    if (isEditMode) {
      dispatch(updateTopic({ id: selectedTopic._id, formData: data }));
    } else {
      if (!formData.thumbnail) return toast.warning("Thumbnail is required");
      dispatch(createTopic(data));
    }
  };

  const handleDeleteClick = (topic) => {
    setTopicToDelete(topic);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmText.trim().toUpperCase() === "DELETE") {
      dispatch(deleteTopic(topicToDelete._id));
    }
  };

  if (loading && topics.length === 0) return <Loading message="Syncing Topics..." fullPage={true} />;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto mb-10">
        <button onClick={() => navigate('/admin/categories')} className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold text-xs uppercase tracking-widest mb-6 transition-all group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Categories
        </button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-teal-50 rounded-md text-teal-600"><LayoutGrid size={16} /></div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Library Manager</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Topics Library</h1>
          </div>
          <button onClick={handleOpenCreate} className="group flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-teal-100 transition-all active:scale-95">
            <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300"><Plus size={16} strokeWidth={3} /></div>
            <span className="text-xs font-black uppercase tracking-wider">New Topic</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {topics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topics.map((topic) => (
              <ItemCard 
                key={topic._id}
                item={topic}
                onClick={() => navigate(`/admin/topic/${topic._id}`)}
                onEdit={() => handleOpenEdit(topic)}
                onDelete={() => handleDeleteClick(topic)}
                subtitle="Manage Lessons"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl py-20 text-center border-2 border-dashed border-slate-100">
            <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Topics Found</h2>
            <button onClick={handleOpenCreate} className="mt-4 text-teal-500 font-bold hover:underline">Add your first topic</button>
          </div>
        )}
      </div>

      <EditModal 
        isOpen={isModalOpen} 
        title={isEditMode ? "Update Topic" : "Create New Topic"} 
        onClose={() => !loading && setIsModalOpen(false)}
        onSave={handleSave}
        loading={loading}
        saveText={loading ? "Processing..." : (isEditMode ? "Save Changes" : "Create Topic")}
      >
        <div className="space-y-6 max-w-md mx-auto py-2">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Topic Name</label>
            <input 
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-teal-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Morning Routines"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Thumbnail (16:9)</label>
            <div className="relative w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center overflow-hidden group hover:border-teal-400 cursor-pointer">
              {formData.thumbnail ? (
                <img src={URL.createObjectURL(formData.thumbnail)} className="w-full h-full object-cover" alt="preview" />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="text-slate-300 group-hover:text-teal-500 mb-2 transition-colors" size={40} />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Select Media</span>
                </div>
              )}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, thumbnail: e.target.files[0]})} />
            </div>
          </div>
        </div>
      </EditModal>

      {showDeleteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-red-50">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-red-50 rounded-2xl text-red-500 mb-4"><AlertTriangle size={32} /></div>
              <h2 className="text-xl font-black text-slate-900 uppercase mb-2">Are you sure?</h2>
              <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">This will delete <span className="font-bold text-slate-900">"{topicToDelete?.name}"</span>. All lessons within this topic will be lost forever.</p>
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left ml-1">Type <span className="text-red-500">DELETE</span> to confirm</label>
                  <input 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-red-500 outline-none transition-all text-center uppercase tracking-widest text-xs"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                    placeholder="DELETE"
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => !loading && setShowDeleteModal(false)} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:bg-slate-100 transition-all">Cancel</button>
                  <button 
                    disabled={loading || deleteConfirmText.trim() !== "DELETE"}
                    onClick={confirmDelete}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase text-white transition-all ${
                      (loading || deleteConfirmText.trim() !== "DELETE") 
                        ? 'bg-slate-200 cursor-not-allowed' 
                        : 'bg-red-500 hover:bg-red-600 cursor-pointer shadow-lg shadow-red-200 active:scale-95'
                    }`}
                  >
                    {loading ? "Deleting..." : "Delete Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTopics;