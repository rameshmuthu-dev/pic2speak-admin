import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/api';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import { Layers, ArrowLeft, Plus, Trash2, ChevronRight, FileText } from 'lucide-react';

const LessonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLessonDetails = async () => {
    try {
      const res = await API.get(`/lessons/${id}`);
      setLesson(res.data.lesson);
    } catch (err) {
      toast.error("Failed to load lesson details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonDetails();
  }, [id]);

  const handleDeleteSubLesson = async (subLessonId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this sub-lesson?")) {
      try {
        await API.delete(`/sublessons/${subLessonId}`);
        toast.success("Sub-Lesson deleted successfully");
        fetchLessonDetails();
      } catch (err) {
        toast.error("Failed to delete sub-lesson");
      }
    }
  };

  if (loading) return <Loading message="Loading Lesson Infrastructure..." fullPage={true} />;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold mb-8 transition-colors group text-xs uppercase"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Part Library
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit">
            <h2 className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-6 opacity-50">Master Settings</h2>
            <div className="aspect-video bg-slate-100 rounded-3xl overflow-hidden mb-6 border border-slate-100">
              <img src={lesson?.thumbnail?.url} className="w-full h-full object-cover" alt="Lesson Thumbnail" />
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex gap-2">
                <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  {lesson?.category?.name || "Category"}
                </span>
                <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  Part {lesson?.partNumber || 1}
                </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 uppercase leading-none tracking-tighter">
                {lesson?.title}
              </h1>
              <p className="text-sm font-bold text-slate-400 leading-relaxed">
                {lesson?.description || "No description provided."}
              </p>
            </div>
            <Button 
              variant="brand" 
              className="w-full py-4 text-xs tracking-widest font-black uppercase"
              onClick={() => navigate(`/admin/lessons`)}
            >
              Manage Main Lesson
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-black text-slate-800 uppercase text-[10px] tracking-widest opacity-50">Chapters Matrix</h2>
                <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Sub-Lessons List</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-teal-50 text-teal-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  {(lesson?.subLessons?.length || 0)} Units Total
                </span>
                <button 
                  onClick={() => navigate(`/admin/lesson/${id}/sublessons`)}
                  className="bg-[#14B8A6] text-white p-3 rounded-2xl hover:bg-[#0D9488] transition-all shadow-lg shadow-teal-200"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {lesson?.subLessons && lesson.subLessons.length > 0 ? (
                lesson.subLessons.map((subLesson, index) => (
                  <div 
                    key={subLesson._id} 
                    onClick={() => navigate(`/admin/sublesson/${subLesson._id}/sentences`)}
                    className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-black text-sm shrink-0">
                      {subLesson.order || index + 1}
                    </div>
                    <div className="flex-1 w-full min-w-0">
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate group-hover:text-teal-600 transition-colors">
                        {subLesson.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 line-clamp-1 mt-0.5">
                        {subLesson.description || "No description managed for this chapter unit."}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                      <button 
                        onClick={(e) => handleDeleteSubLesson(subLesson._id, e)}
                        className="p-3.5 bg-red-50 text-red-400 rounded-2xl border border-red-50 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="p-2 text-slate-300 group-hover:text-teal-500 transition-colors">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <FileText className="mx-auto mb-3 text-slate-400" size={20} />
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No Sub-Lessons created.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetails;