import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  fetchCategories, 
  deleteCategory, 
  updateCategory, 
  createCategory,
  resetCategoryState 
} from '../redux/slices/categorySlice';

// UI Components
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import EditModal from '../ui/EditModal';

// Icons
import { 
  Plus, FolderTree, Trash2, ArrowRight, 
  Pencil, Image as ImageIcon, Layers, Hash 
} from 'lucide-react';

const AdminCategories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { items: categories, loading, success, error } = useSelector((state) => state.categories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // UPDATED: Added 'order' to the initial state
  const [formData, setFormData] = useState({ 
    name: '', 
    thumbnail: null, 
    level: 'Beginner', 
    order: '' 
  });

  // Initial Data Fetch
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Unified Notification Handler
  useEffect(() => {
    if (success) {
      if (isModalOpen) {
        toast.success(isEditMode ? "Category updated successfully!" : "Category created successfully!");
        setIsModalOpen(false);
      } else {
        toast.info("Category removed successfully");
      }
      dispatch(resetCategoryState());
    }

    if (error) {
      toast.error(error);
      dispatch(resetCategoryState());
    }
  }, [success, error, dispatch, isEditMode, isModalOpen]);

  const isDuplicate = categories.some(
    (cat) => cat.name.toLowerCase() === formData.name.toLowerCase() && cat._id !== selectedCategory?._id
  );

  // UPDATED: Reset order field on create
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedCategory(null);
    setFormData({ name: '', thumbnail: null, level: 'Beginner', order: '' });
    setIsModalOpen(true);
  };

  // UPDATED: Load existing order value into state for editing
  const handleOpenEdit = (category, e) => {
    e.stopPropagation();
    setIsEditMode(true);
    setSelectedCategory(category);
    setFormData({ 
      name: category.name, 
      thumbnail: null, 
      level: category.level || 'Beginner',
      order: category.order || '' 
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return toast.warning("Name is required");
    // VALIDATION: Order is now required due to backend schema
    if (!formData.order) return toast.warning("Display order number is required");
    if (isDuplicate) return toast.error("Name already exists");

    const data = new FormData();
    data.append('name', formData.name);
    data.append('level', formData.level);
    // UPDATED: Append order to FormData
    data.append('order', formData.order); 
    
    if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);

    if (isEditMode) {
      dispatch(updateCategory({ id: selectedCategory._id, formData: data }));
    } else {
      if (!formData.thumbnail) return toast.warning("Thumbnail image is required");
      dispatch(createCategory(data));
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation(); 
    if (window.confirm("Delete this category?")) {
      dispatch(deleteCategory(id));
    }
  };

  if (loading && categories.length === 0) return <Loading message="Syncing..." fullPage={true} />;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-teal-50 rounded-md text-teal-600">
              <FolderTree size={16} />
            </div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Admin Control</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Categories</h1>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="group flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-teal-100 transition-all active:scale-95"
        >
          <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300">
            <Plus size={16} strokeWidth={3} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">New Category</span>
        </button>
      </div>

      {/* CATEGORY GRID */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category._id} onClick={() => navigate(`/admin/category/${category._id}`)} className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col relative">
              
              {/* Displaying Order Badge for Admin Clarity */}
              <div className="absolute top-2 left-2 z-10 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                Order: {category.order}
              </div>

              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                <img 
                  src={category.thumbnail?.url} 
                  alt={category.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleOpenEdit(category, e)} className="p-2 bg-white/95 text-slate-600 rounded-xl shadow-md hover:text-teal-500"><Pencil size={14} /></button>
                  <button onClick={(e) => handleDelete(category._id, e)} className="p-2 bg-white/95 text-red-400 rounded-xl shadow-md hover:text-red-600"><Trash2 size={14} /></button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-1 bg-white/90 text-[10px] font-black uppercase text-slate-600 rounded-md shadow-sm">{category.level}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <h3 className="text-lg font-black text-slate-800 uppercase truncate">{category.name}</h3>
                <div className="mt-4 flex items-center text-[10px] font-black uppercase text-slate-400 group-hover:text-teal-500 transition-colors">
                  View Topics <ArrowRight size={14} className="ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL SECTION */}
      <EditModal 
        isOpen={isModalOpen} 
        title={isEditMode ? "Edit Category" : "New Category"} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        loading={loading}
        saveText={isEditMode ? "Update" : "Create"}
      >
        <div className="max-w-md mx-auto space-y-6 py-2">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
            <input 
              className={`w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 outline-none transition-all ${isDuplicate ? 'border-orange-400' : 'border-transparent focus:border-teal-500'}`}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter category name..."
            />
          </div>

          {/* NEW: Order Field (Required for the Lock System) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Display Order (Phase Number)</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="number"
                className="w-full p-4 pl-12 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-teal-500 outline-none transition-all"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: e.target.value})}
                placeholder="e.g. 1, 2, 3..."
              />
            </div>
          </div>

          {/* Level Field */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Learning Level</label>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                className="w-full p-4 pl-12 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-teal-500 outline-none appearance-none cursor-pointer"
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Thumbnail Field */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Thumbnail (16:9)</label>
            <div className="relative w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center overflow-hidden group hover:border-teal-400 transition-all cursor-pointer">
              {formData.thumbnail ? (
                <img src={URL.createObjectURL(formData.thumbnail)} className="w-full h-full object-cover" alt="preview" />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="text-slate-300 group-hover:text-teal-500 mb-2 transition-colors" size={40} />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Upload Image</span>
                </div>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, thumbnail: e.target.files[0]})} />
            </div>
          </div>
        </div>
      </EditModal>
    </div>
  );
};

export default AdminCategories;