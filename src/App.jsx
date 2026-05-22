import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout & Auth Components
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

// Content Hierarchy Components
import AdminCategories from './creator/AdminCategories';
import AdminTopics from './creator/AdminTopics';
import AdminLessons from './creator/AdminLessons';
import AdminSubLessons from './creator/AdminSubLessons'; // New Sub-Lesson Creator Component
import LessonDetails from './creator/LessonDetails';     // Lesson Details Component
import AdminSentences from './creator/AdminSentences';   // Sentence Management Component

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

            {/* Level 1: Category Management (Home, School, etc.) */}
            <Route path="/admin/categories" element={<AdminCategories />} />

            {/* Level 2: Topic Management (Kitchen, Classroom, etc.) */}
            <Route path="/admin/category/:categoryId" element={<AdminTopics />} />

            {/* Level 3: Lesson Management (Daily Routines, etc.) */}
            <Route path="/admin/topic/:topicId" element={<AdminLessons />} />

            {/* Level 3.5: Sub-Lesson Management (Bedroom Routine, Kitchen Routine, etc.) */}
            {/* <Route path="/admin/lesson/:id/sublessons" element={<AdminSubLessons />} /> */}

            <Route path="/admin/lesson/:lessonId/sublessons" element={<AdminSubLessons />} />

            {/* Level 4: Sentence & Media Management inside a Specific Sub-Lesson */}
            <Route path="/admin/sublesson/:subLessonId/sentences" element={<AdminSentences />} />
            
            {/* Optional: Lesson Profile/Overview Layout */}
            <Route path="/admin/lesson/:id" element={<LessonDetails />} />
            
            {/* General Lesson List Fallback */}
            <Route path="/admin/lessons" element={<AdminLessons />} />

          </Route>

          {/* --- FALLBACK ROUTE --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;