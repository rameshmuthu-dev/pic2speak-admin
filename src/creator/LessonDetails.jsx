import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import { Image as ImageIcon, Music, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const LessonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await API.get(`/lessons/${id}`);
        setLesson(res.data.lesson);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  if (loading) return <Loading message="Loading Lesson..." fullPage={true} />;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Navigation */}
      <button 
        onClick={() => navigate('/admin/lessons')} 
        className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        BACK TO LIBRARY
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Side: Dynamic Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit">
            <h2 className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-6 opacity-50">Master Settings</h2>
            
            <div className="aspect-video bg-slate-100 rounded-3xl overflow-hidden mb-6 border border-slate-100">
              <img src={lesson?.thumbnail?.url} className="w-full h-full object-cover" alt="Thumbnail" />
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex gap-2">
                <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  {lesson?.category?.name || "No Category"}
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

            <Button variant="brand" className="w-full py-4 text-xs tracking-widest font-black uppercase">
              Update Lesson
            </Button>
          </div>
        </div>

        {/* Right Side: Dynamic Content (Cards) */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-black text-slate-800 uppercase text-[10px] tracking-widest opacity-50">Sentence Cards</h2>
                <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Lesson Content</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-teal-50 text-teal-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  {(lesson?.content?.length || 0)} Cards Total
                </span>
                <button className="bg-[#14B8A6] text-white p-3 rounded-2xl hover:bg-[#0D9488] transition-all shadow-lg shadow-teal-200">
                  <Plus size={20} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {lesson?.content && lesson.content.length > 0 ? (
                lesson.content.map((item, index) => (
                  <div key={index} className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-6 items-center hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300">
                    
                    {/* Sentence Text */}
                    <div className="flex-1 w-full space-y-1">
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Card #{index + 1}</p>
                      <p className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none mb-1">
                        {item.englishText}
                      </p>
                      <p className="text-md font-bold text-teal-600 tracking-tight uppercase">
                        {item.tamilText}
                      </p>
                    </div>
                    
                    {/* Media Actions */}
                    <div className="flex gap-2">
                      <button className={`p-4 rounded-2xl border transition-all ${item.audio?.url ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-white border-slate-100 text-slate-300 hover:text-teal-500 hover:border-teal-200'}`}>
                        <Music size={22} />
                      </button>
                      <button className={`p-4 rounded-2xl border transition-all ${item.image?.url ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-white border-slate-100 text-slate-300 hover:text-teal-500 hover:border-teal-200'}`}>
                        <ImageIcon size={22} />
                      </button>
                      <button className="p-4 bg-red-50 text-red-400 rounded-2xl border border-red-50 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No cards found in this lesson.</p>
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