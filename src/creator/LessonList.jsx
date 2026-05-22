import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchLessons, deleteLesson } from '../redux/slices/lessonSlice';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import { Trash2, BookOpen, Plus, CheckCircle2, ExternalLink, Layers, ArrowLeft } from 'lucide-react';

const LessonList = () => {
  const { topicId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: lessons, loading } = useSelector((state) => state.lessons);

  useEffect(() => {
    dispatch(fetchLessons());
  }, [dispatch]);

  const filteredLessons = topicId 
    ? lessons.filter(lesson => (lesson.topic?._id || lesson.topic) === topicId)
    : lessons;

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await dispatch(deleteLesson(id)).unwrap();
        toast.success("Lesson deleted successfully");
      } catch (err) {
        toast.error("Failed to delete lesson");
      }
    }
  };

  if (loading && lessons.length === 0) return <Loading message="Syncing Lesson Library..." fullPage={true} />;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto mb-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold text-xs uppercase mb-6 transition-all">
          <ArrowLeft size={16} /> Back to Topics
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Part Library</h1>
          </div>
          <Button variant="brand" className="py-4 px-6" onClick={() => navigate('/admin/create-lesson')}>
            <Plus size={18} strokeWidth={3} /> New Lesson
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredLessons.map((lesson) => (
          <div key={lesson._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col">
            <div className="relative h-56 bg-slate-100 cursor-pointer overflow-hidden" onClick={() => navigate(`/admin/lesson/${lesson._id}/sublessons`)}>
              <img src={lesson.thumbnail?.url} alt={lesson.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3 gap-4">
                <h3 className="text-lg font-black text-slate-800 uppercase cursor-pointer" onClick={() => navigate(`/admin/lesson/${lesson._id}/sublessons`)}>
                  {lesson.title}
                </h3>
                <button onClick={() => handleDelete(lesson._id)} className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-auto pt-5 border-t border-slate-50">
                <div className="flex items-center justify-center gap-2 font-bold text-slate-400 mb-4">
                  <CheckCircle2 size={14} className="text-teal-500" />
                  <span className="text-[10px] uppercase">{lesson.subLessonsCount || 0} Sub-Lessons</span>
                </div>
                <Button variant="brand" className="w-full py-3 text-xs font-black uppercase tracking-[0.2em]" onClick={() => navigate(`/admin/lesson/${lesson._id}/sublessons`)}>
                  View Sub-Lessons <ExternalLink size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonList;