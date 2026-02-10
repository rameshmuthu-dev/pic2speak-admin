import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify'; // Added toast for notifications
import { 
  fetchTopicsByCategory, 
  deleteTopic, 
  createTopic, 
  updateTopic, 
  resetTopicState 
} from '../redux/slices/topicSlice';

// UI Components
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import EditModal from '../ui/EditModal';

// Icons
import { 
  Plus, LayoutGrid, Trash2, ArrowLeft, 
  ArrowRight, BookOpen, Pencil, 
  Image as ImageIcon, AlertTriangle 
} from 'lucide-react';

const AdminTopics = () => {
  const { categoryId } = useParams(); 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux State
  const { items: topics, loading, success, error } = useSelector((state) => state.topics);

  // Modal & Mode State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  // Security Delete State (Option 2)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  // Form & UX State
  const [formData, setFormData] = useState({ name: '', thumbnail: null });
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (categoryId) {
      dispatch(fetchTopicsByCategory(categoryId));
    }
  }, [dispatch, categoryId]);

  // Unified Notification & Modal Handler
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
  }, [success, error, dispatch, isModalOpen, isEditMode, showDeleteModal]);

  const isDuplicate = topics.some(
    (top) => top.name.toLowerCase() === formData.name.toLowerCase() && top._id !== selectedTopic?._id
  );

  const handleNameChange = (value) => {
    setFormData({ ...formData, name: value });
    if (value.length > 1) {
      const matches = topics.filter(top => 
        top.name.toLowerCase().includes(value.toLowerCase()) && top._id !== selectedTopic?._id
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedTopic(null);
    setFormData({ name: '', thumbnail: null });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (topic, e) => {
    e.stopPropagation();
    setIsEditMode(true);
    setSelectedTopic(topic);
    setFormData({ name: topic.name, thumbnail: null });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return toast.warning("Name is required");
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

  // Secure Delete Function
  const handleDeleteClick = (topic, e) => {
    e.stopPropagation();
    setTopicToDelete(topic);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmText === "DELETE") {
      dispatch(deleteTopic(topicToDelete._id));
    }
  };

  if (loading && topics.length === 0) return <Loading message="Syncing Topics..." fullPage={true} />;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
      
      {/* HEADER SECTION - Refined Standard Tailwind */}
      <div className="max-w-7xl mx-auto mb-10">
        <button 
          onClick={() => navigate('/admin/categories')}
          className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold text-xs uppercase tracking-widest mb-6 transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Categories
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-teal-50 rounded-md text-teal-600">
                <LayoutGrid size={16} />
              </div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Library Manager</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Topics Library</h1>
          </div>

          <button 
            onClick={handleOpenCreate}
            className="group flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-teal-100 transition-all active:scale-95"
          >
            <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
              <Plus size={16} strokeWidth={3} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">New Topic</span>
          </button>
        </div>
      </div>

      {/* GRID DISPLAY (16:9 Aspect Ratio) */}
      <div className="max-w-7xl mx-auto">
        {topics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topics.map((topic) => (
              <div 
                key={topic._id} 
                onClick={() => navigate(`/admin/topic/${topic._id}`)}
                className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col"
              >
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  <img src={topic.thumbnail?.url} alt={topic.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => handleOpenEdit(topic, e)} className="p-2 bg-white/95 text-slate-600 rounded-xl shadow-md hover:text-teal-500 transition-colors"><Pencil size={14} /></button>
                    <button onClick={(e) => handleDeleteClick(topic, e)} className="p-2 bg-white/95 text-red-400 rounded-xl shadow-md hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <h3 className="text-lg font-black text-slate-800 uppercase truncate">{topic.name}</h3>
                  <div className="mt-4 flex items-center text-[10px] font-black uppercase text-slate-400 group-hover:text-teal-500">
                    Manage Lessons <ArrowRight size={14} className="ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl py-20 text-center border-2 border-dashed border-slate-100">
            <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Topics Found</h2>
            <button onClick={handleOpenCreate} className="mt-4 text-teal-500 font-bold hover:underline">Add your first topic</button>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      <EditModal 
        isOpen={isModalOpen} 
        title={isEditMode ? "Update Topic" : "Create New Topic"} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        loading={loading}
        saveText={isEditMode ? "Save Changes" : "Create Topic"}
      >
        <div className="space-y-6 max-w-md mx-auto py-2">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Topic Name</label>
            <input 
              className={`w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 outline-none transition-all ${isDuplicate ? 'border-orange-400' : 'border-transparent focus:border-teal-500'}`}
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
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

      {/* DOUBLE CONFIRMATION DELETE MODAL (Option 2) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-red-50">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-red-50 rounded-2xl text-red-500 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase mb-2">Are you sure?</h2>
              <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
                This will delete <span className="font-bold text-slate-900">"{topicToDelete?.name}"</span>. 
                All lessons within this topic will be lost forever.
              </p>
              
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-left ml-1">
                    Type <span className="text-red-500">DELETE</span> to confirm
                  </label>
                  <input 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-red-500 outline-none transition-all text-center uppercase tracking-widest text-xs"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:bg-slate-100 transition-all">Cancel</button>
                  <button 
                    disabled={deleteConfirmText !== "DELETE"}
                    onClick={confirmDelete}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase text-white transition-all ${deleteConfirmText === "DELETE" ? 'bg-red-500 shadow-lg shadow-red-200 active:scale-95' : 'bg-slate-200 cursor-not-allowed'}`}
                  >
                    Delete Now
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