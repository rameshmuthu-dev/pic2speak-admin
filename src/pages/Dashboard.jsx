import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStatsThunk, fetchSystemHealthThunk } from '../redux/slices/adminSlice';
import { 
  Users, BookOpen, MessageSquare, Star, Hash, 
  TrendingUp
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell 
} from 'recharts';
import Loading from '../ui/Loading';

/**
 * Pic2Speak Admin Dashboard
 * Displays filtered statistics, user growth trends, and content distribution.
 */
const Dashboard = () => {
  const dispatch = useDispatch();
  
  // Local state for time-range filtering: today, week, month, year
  const [activeRange, setActiveRange] = useState('today'); 
  const { stats, health, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    // Fetch statistics and system health on mount and whenever range changes
    dispatch(fetchDashboardStatsThunk(activeRange));
    dispatch(fetchSystemHealthThunk());
  }, [dispatch, activeRange]);

  /**
   * CHART DATA LOGIC:
   * Formats data for the AreaChart.
   * Displays "No Data" if the backend returns an empty array for the selected range.
   */
  const tradingData = useMemo(() => {
    const rawData = stats.userGrowth || [];
    if (rawData.length === 0) {
      return [{ name: 'No Data', users: 0 }];
    }
    return rawData;
  }, [stats.userGrowth]);

  // Data for the Donut Chart distribution overview
  const categoryData = useMemo(() => [
    { name: 'Lessons', value: stats.totalLessons || 0, color: '#14b8a6' }, // Teal 500
    { name: 'Topics', value: stats.totalTopics || 0, color: '#0ea5e9' },  // Sky 500
    { name: 'Categories', value: stats.totalCategories || 0, color: '#f59e0b' }, // Amber 500
  ], [stats]);

  // Show full-page loader only during the very first data initialization
  if (loading && !stats.totalUsers && !stats.totalLessons) {
     return <Loading message={`Fetching ${activeRange} metrics...`} fullPage={true} />;
  }

  /**
   * Sub-component: Statistical Metric Card
   */
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 flex-1 min-w-32 transition-all hover:shadow-md">
      <div className={`p-2 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={18} className={color.replace('bg-', 'text-')} />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-tighter">
          {title} <span className="text-[10px] opacity-70">({activeRange})</span>
        </p>
        <p className="text-xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col p-4 bg-slate-50 overflow-hidden">
      
      {/* --- HEADER SECTION --- 
          Redundant branding removed as it's already in the Navbar. 
      */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Analytics Overview</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            Real-time Insights • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* System Health Status Indicator */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-colors ${
          health.status === 'Healthy' ? 'bg-teal-50 border-teal-100 text-teal-600' : 'bg-red-50 border-red-100 text-red-600'
        }`}>
           <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute h-full w-full rounded-full opacity-75 ${health.status === 'Healthy' ? 'bg-teal-400' : 'bg-red-400'}`}></span>
            <span className={`relative h-2 w-2 rounded-full ${health.status === 'Healthy' ? 'bg-teal-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="text-xs font-black uppercase tracking-widest">System {health.status}</span>
        </div>
        
        {/* RANGE FILTER CONTROLS */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['today', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-4 py-1.5 text-xs font-black uppercase rounded-lg transition-all duration-300 ${
                activeRange === range 
                ? 'bg-white text-slate-900 shadow-sm scale-105' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* --- STATISTICAL CARDS ROW --- */}
      <div className="flex flex-wrap gap-4 mb-6 shrink-0">
        <StatCard title="New Students" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
        <StatCard title="Active Lessons" value={stats.totalLessons} icon={BookOpen} color="bg-teal-500" />
        <StatCard title="New Phrases" value={stats.totalSentences} icon={Hash} color="bg-orange-500" />
        <StatCard title="Avg Rating" value={`${stats.averageRating}/5`} icon={Star} color="bg-yellow-500" />
        <StatCard title="Feedbacks" value={stats.totalFeedbacks} icon={MessageSquare} color="bg-indigo-500" />
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grow grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 mb-2">
        
        {/* AREA CHART: GROWTH VISUALIZATION */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col relative">
          <h3 className="text-xs font-black text-slate-400 uppercase mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-500" /> Growth Fluctuations ({activeRange})
          </h3>
          <div className="grow w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold animate-pulse uppercase tracking-widest">
                Syncing Data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tradingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                    cursor={{ stroke: '#14b8a6', strokeWidth: 1 }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#14b8a6" 
                    strokeWidth={3} 
                    fill="url(#glow)" 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* DONUT CHART: CONTENT RATIO DISTRIBUTION */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xs font-black text-slate-400 uppercase mb-6">Distribution Overview</h3>
          <div className="grow">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie 
                  data={categoryData} 
                  innerRadius="60%" 
                  outerRadius="80%" 
                  paddingAngle={5} 
                  dataKey="value"
                  animationDuration={1000}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} cornerRadius={8} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend Area with counts */}
          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-around">
            {categoryData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-3 h-1.5 rounded-full mb-1" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] font-black text-slate-400 uppercase">{item.name}</span>
                <span className="text-xs font-bold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;