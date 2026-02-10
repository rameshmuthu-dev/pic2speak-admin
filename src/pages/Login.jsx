import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminLoginThunk, clearError } from '../redux/slices/authSlice';
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

// Reusable components
import Button from '../ui/Button';
import Loading from '../ui/Loading';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get auth state from Redux store
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // If already logged in, redirect to Dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    // Clear old error messages when page loads
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(adminLoginThunk({ email, password }));
  };

  // Show your custom Loading component when waiting for API
  if (loading) return <Loading message="Verifying Admin..." fullPage={true} />;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="bg-teal-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-teal-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pic2Admin</h2>
          <p className="text-slate-500 font-bold mt-2 text-xs uppercase tracking-widest">
            Secure Management Portal
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm font-bold animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Admin Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
              <input 
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all font-semibold"
                placeholder="admin@pic2speak.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all font-semibold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button using your 'brand' variant */}
          <div className="pt-4">
            <Button 
              type="submit" 
              variant="brand" 
              className="flex items-center justify-center gap-3 py-4 text-base shadow-teal-100"
            >
              Authorize Login <LogIn size={20} />
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          Authorized Personnel Only • 2026
        </p>
      </div>
    </div>
  );
};

export default Login;