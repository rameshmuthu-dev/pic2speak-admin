import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout & Auth Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';



import AdminMapBuilder from './map/AdminMapBuilder'; // Adventure Map Builder Component
import LanguageManager from './languages/Languagemanager';
import LessonContent from './lessons/Lessoncontent';
import SceneManager from './scene/SceneManager';
import SceneListPage from './scene/SceneListPage';
import SceneContentPanel from './scene/SceneContentPanel';
import EditScene from './scene/EditScene';
import LessonList from './lessons/LessonList';

/**
 * PROTECTED ROUTES WRAPPER
 * Redirects unauthenticated users to the login page.
 */
const ProtectedRoutes = ({ isAuthenticated }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

/**
 * MAIN APP COMPONENT
 * Handles global routing for the Pic2Speak Admin Panel.
 */
const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation bar remains visible across all pages */}
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
          />

          {/* --- PRIVATE / ADMIN ROUTES --- */}
          <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
            
            {/* Admin Dashboard / Stats */}
            <Route path="/" element={<Dashboard />} />


            {/* Adventure Map: Roads, Buildings, Trees & multi-language lesson cards */}
            <Route path="/admin/adventure-map" element={<AdminMapBuilder />} />
            <Route path="/admin/languages" element={<LanguageManager />} />
             <Route path="/admin/lesson-masters" element={<LessonList />} />
             <Route path="/admin/lesson-content" element={<LessonContent />} />
             <Route path="/admin/scenes/create/:lessonMasterId" element={<SceneManager />} />
             <Route path="scenes/:lessonMasterId/edit/:sceneId" element={<SceneManager />} />
             <Route path="/admin/scenes/:lessonMasterId" element={<SceneListPage />} />
             <Route path="/admin/scenes/:lessonMasterId/:sceneId/content" element={<SceneContentPanel />} />
             <Route path="/admin/scenes/:lessonMasterId/edit/:sceneId" element={<EditScene />} />
             
          </Route>

          {/* --- FALLBACK ROUTE --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;