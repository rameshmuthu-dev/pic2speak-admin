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
import Loading from '../ui/Loading';
import EditModal from '../ui/EditModal';
import ItemCard from '../ui/ItemCard';
import { Plus, FolderTree, Hash, Image as ImageIcon, ShieldCheck } from 'lucide-react';

const AdminCategories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { items: categories, loading, success, error } = useSelector((state) => state.categories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    thumbnail: null, 
    order: '',
    isPremium: false
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

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

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedCategory(null);
    setFormData({ name: '', thumbnail: null, order: '', isPremium: false });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setFormData({ 
      name: category.name, 
      thumbnail: null, 
      order: category.order || '',
      isPremium: category.isPremium || false
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return toast.warning("Name is required");
    if (!formData.order) return toast.warning("Display order number is required");
    if (isDuplicate) return toast.error("Name already exists");

    const data = new FormData();
    data.append('name', formData.name);
    data.append('order', formData.order);
    data.append('isPremium', formData.isPremium);
    
    if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);

    if (isEditMode) {
      dispatch(updateCategory({ id: selectedCategory._id, formData: data }));
    } else {
      if (!formData.thumbnail) return toast.warning("Thumbnail image is required");
      dispatch(createCategory(data));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this category?")) {
      dispatch(deleteCategory(id));
    }
  };

  if (loading && categories.length === 0) return <Loading message="Syncing..." fullPage={true} />;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-teal-50 rounded-md text-teal-600"><FolderTree size={16} /></div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Admin Control</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Categories</h1>
        </div>
        <button onClick={handleOpenCreate} className="group flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-teal-100 transition-all active:scale-95">
          <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform duration-300"><Plus size={16} strokeWidth={3} /></div>
          <span className="text-xs font-black uppercase tracking-wider">New Category</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <ItemCard 
              key={category._id} 
              item={category} 
              titleKey="name"
              onClick={() => navigate(`/admin/category/${category._id}`)}
              onEdit={() => handleOpenEdit(category)}
              onDelete={() => handleDelete(category._id)}
              subtitle="View Topics"
            />
          ))}
        </div>
      </div>

      <EditModal 
        isOpen={isModalOpen} 
        title={isEditMode ? "Edit Category" : "New Category"} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        loading={loading}
        saveText={isEditMode ? "Update" : "Create"}
      >
        <div className="max-w-md mx-auto space-y-6 py-2">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
            <input 
              className={`w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 outline-none transition-all ${isDuplicate ? 'border-orange-400' : 'border-transparent focus:border-teal-500'}`}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter category name..."
            />
          </div>

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

          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl cursor-pointer" onClick={() => setFormData({...formData, isPremium: !formData.isPremium})}>
            <div className={`p-2 rounded-xl ${formData.isPremium ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
              <ShieldCheck size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800">Premium Content</p>
              <p className="text-xs text-slate-500">Enable to lock for non-premium users</p>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isPremium ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isPremium ? 'left-7' : 'left-1'}`} />
            </div>
          </div>

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