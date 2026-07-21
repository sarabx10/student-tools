import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Paraphrase from './pages/Paraphrase.jsx';
import Similarity from './pages/Similarity.jsx';
import Summarizer from './pages/Summarizer.jsx';
import Citations from './pages/Citations.jsx';
import StudyPlanner from './pages/StudyPlanner.jsx';
import Humanizer from './pages/Humanizer.jsx';
import Research from './pages/Research.jsx';
import Tutor from './pages/Tutor.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/paraphrase" element={<ProtectedRoute><Paraphrase /></ProtectedRoute>} />
          <Route path="/similarity" element={<ProtectedRoute><Similarity /></ProtectedRoute>} />
          <Route path="/summarizer" element={<ProtectedRoute><Summarizer /></ProtectedRoute>} />
          <Route path="/citations" element={<ProtectedRoute><Citations /></ProtectedRoute>} />
          <Route path="/study-planner" element={<ProtectedRoute><StudyPlanner /></ProtectedRoute>} />
          <Route path="/humanizer" element={<ProtectedRoute><Humanizer /></ProtectedRoute>} />
          <Route path="/research" element={<ProtectedRoute><Research /></ProtectedRoute>} />
          <Route path="/tutor" element={<ProtectedRoute><Tutor /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
