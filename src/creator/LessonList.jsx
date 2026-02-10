import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessons, deleteLesson } from '../redux/slices/lessonSlice';

// Reusable UI Components
import Button from '../ui/Button';
import Loading from '../ui/Loading';

// Icons
import { 
  Trash2, 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  ArrowLeft 
} from 'lucide-react';

/**
 * FINAL LEVEL: LESSON LIBRARY
 * Now filters lessons based on the selected Topic.
 */
const LessonList = () => {
  const { topicId } = useParams(); // Get Topic ID from URL
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get lessons from Redux store
  const { items: lessons, loading } = useSelector((state) => state.lessons);

  useEffect(() => {
    // We fetch lessons. If your backend supports /api/lessons?topic=topicId, 
    // you can pass the ID here. For now, we fetch and display the dynamic count.
    dispatch(fetchLessons());
  }, [dispatch, topicId]);

  /**
   * Filter lessons locally if the topicId is present in the URL
   * This ensures the admin only sees lessons for the specific topic.
   */
  const filteredLessons = topicId 
    ? lessons.filter(lesson => (lesson.topic?._id || lesson.topic) === topicId)
    : lessons;

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      dispatch(deleteLesson(id));
    }
  };

  if (loading && lessons.length === 0) {
    return <Loading message="Syncing Lesson Library..." fullPage={true} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-10">
        {/* Back to Topics Button */}
        <button 
          onClick={() => navigate(-1)} // Goes back to the specific Topic list
          className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold text-xs uppercase mb-6 transition-all"
        >
          <ArrowLeft size={16} /> Back to Topics
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="text-teal-500" size={20} />
              <span className="text-xs font-black text-teal-600 uppercase tracking-widest">
                Lesson Management
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Part Library
            </h1>
          </div>

          <div className="w-full md:w-auto">
            <Button 
              variant="brand" 
              className="flex items-center justify-center gap-2 py-4"
              onClick={() => navigate('/admin/create-lesson')}
            >
              <Plus size={18} strokeWidth={3} />
              New Lesson
            </Button>
          </div>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="max-w-7xl mx-auto">
        {filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLessons.map((lesson) => (
              <div key={lesson._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group flex flex-col">
                
                {/* Thumbnail */}
                <div 
                  className="relative h-56 bg-slate-100 cursor-pointer overflow-hidden" 
                  onClick={() => navigate(`/admin/lesson/${lesson._id}`)}
                >
                  {lesson.thumbnail?.url ? (
                    <img 
                      src={lesson.thumbnail.url} 
                      alt={lesson.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <BookOpen size={60} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-3 gap-4">
                      <h3 
                        className="text-lg font-black text-slate-800 uppercase tracking-tight line-clamp-2 cursor-pointer" 
                        onClick={() => navigate(`/admin/lesson/${lesson._id}`)}
                      >
                        {lesson.title}
                      </h3>
                      <button 
                        onClick={() => handleDelete(lesson._id)} 
                        className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-teal-50 text-teal-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase">
                        {lesson.category?.name || 'Category'}
                      </span>
                      <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase">
                        Part {lesson.partNumber || 1}
                      </span>
                    </div>
                  </div>

                  {/* Footer with Dynamic Sentence Count */}
                  <div className="mt-auto pt-5 border-t border-slate-50 flex flex-col gap-4">
                    <div className="flex items-center justify-center gap-2 font-bold text-slate-400">
                      <CheckCircle2 size={14} className="text-teal-500" />
                      <span className="text-[10px] uppercase tracking-tighter">
                        {lesson.sentenceCount || 0} Sentence Cards
                      </span>
                    </div>

                    <Button 
                      variant="brand" 
                      className="w-full py-3 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 rounded-2xl"
                      onClick={() => navigate(`/admin/lesson/${lesson._id}`)}
                    >
                      View Lesson <ExternalLink size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-20 text-center border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
              No lessons in this topic
            </h2>
            <p className="text-slate-400 mt-2 mb-8">Ready to add Part 1?</p>
            <Button 
              variant="brand" 
              className="mx-auto max-w-xs" 
              onClick={() => navigate('/admin/create-lesson')}
            >
              Create Lesson
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonList;