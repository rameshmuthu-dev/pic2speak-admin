import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStatsThunk, fetchSystemHealthThunk } from '../redux/slices/adminSlice';
import { Users, BookOpen, MessageSquare, Star, Hash, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import Loading from '../ui/Loading';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [activeRange, setActiveRange] = useState('today'); 
  const { stats, health, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStatsThunk(activeRange));
    dispatch(fetchSystemHealthThunk());
  }, [dispatch, activeRange]);

  const tradingData = useMemo(() => {
    const rawData = stats.userGrowth || [];
    return rawData.length === 0 ? [{ name: 'No Data', users: 0 }] : rawData;
  }, [stats.userGrowth]);

  const categoryData = useMemo(() => [
    { name: 'Lessons', value: stats.totalLessons || 0, color: '#14b8a6' }, 
    { name: 'Topics', value: stats.totalTopics || 0, color: '#0ea5e9' },  
    { name: 'Categories', value: stats.totalCategories || 0, color: '#f59e0b' }, 
  ], [stats]);

  if (loading && !stats.totalUsers && !stats.totalLessons) {
     return <Loading message="Syncing metrics..." />;
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 w-full h-full">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 shrink-0`}>
        <Icon size={22} className={color.replace('bg-', 'text-')} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-wider truncate">{title}</p>
        <p className="text-xl md:text-2xl font-black text-slate-800 leading-tight">{value}</p>
      </div>
    </div>
  );

  return (
    // TABLET FIX: Main wrapper-la irundhu 'container' class-ai remove panni 'w-full' use pannuvom
    <div className="min-h-screen bg-slate-50 w-full overflow-x-hidden">
      
      {/* IMPORTANT: 'container' class-ai inge use pannaadhunga. 
          Adhukku badhula 'w-full' and 'max-w' use panni tablet screen-ai fill pannuvom.
      */}
      <div className="w-full max-w-400 mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm w-full">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Analytics Overview</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Real-time Insights • Feb 10</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
              health.status === 'Healthy' ? 'bg-teal-50 border-teal-100 text-teal-600' : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              <span className={`h-2.5 w-2.5 rounded-full ${health.status === 'Healthy' ? 'bg-teal-500' : 'bg-red-500'} animate-pulse`} />
              System {health.status}
            </div>
            
            {/* Range Filter: Mobile-la 2x2, Tablet-la Single Row */}
            <div className="grid grid-cols-2 sm:flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto gap-1">
              {['today', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-4 py-2 text-[10px] md:text-xs font-black uppercase rounded-xl transition-all ${
                    activeRange === range ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- STAT CARDS GRID --- 
            TABLET FIX: md:grid-cols-3 kuduthurukkaen. 
            Idhu Laptop (lg) responsive-ai Tablet (md)-kkum appadiyae apply pannum.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-8 w-full">
          <StatCard title="New Students" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
          <StatCard title="Active Lessons" value={stats.totalLessons} icon={BookOpen} color="bg-teal-500" />
          <StatCard title="New Phrases" value={stats.totalSentences} icon={Hash} color="bg-orange-500" />
          <StatCard title="Avg Rating" value={`${stats.averageRating}/5`} icon={Star} color="bg-yellow-500" />
          <StatCard title="Feedbacks" value={stats.totalFeedbacks} icon={MessageSquare} color="bg-indigo-500" />
        </div>

        {/* --- CHARTS SECTION --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
          {/* Main Growth Chart */}
          <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm h-87 md:h-112 flex flex-col w-full">
            <h3 className="text-xs font-black text-slate-400 uppercase mb-8 flex items-center gap-2">
              <TrendingUp size={18} className="text-teal-500" /> Growth Fluctuations
            </h3>
            <div className="flex-1 w-full pb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tradingData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#14b8a6" strokeWidth={4} fill="url(#glow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm h-87 md:h-112 flex flex-col w-full">
            <h3 className="text-xs font-black text-slate-400 uppercase mb-8 text-center">Distribution Overview</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={categoryData} innerRadius="65%" outerRadius="85%" paddingAngle={8} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} cornerRadius={10} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-8 pt-8 border-t border-slate-50">
              {categoryData.map((item, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{item.name}</p>
                  <p className="text-base font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;