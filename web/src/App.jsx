import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/layout/Navbar/Navbar.jsx';

// Pages
import Home from './pages/Home/Home.jsx';
import Login from './pages/Auth/Login/Login.jsx';
import Register from './pages/Auth/Register/Register.jsx';
import Jobs from './pages/Candidate/Jobs/Jobs.jsx';
import Profile from './pages/Candidate/Profile/Profile.jsx';
import Applications from './pages/Candidate/Applications/Applications.jsx';
import Test from './pages/Candidate/Test/Test.jsx';
import RecruiterJobs from './pages/Recruiter/RecruiterJobs/RecruiterJobs.jsx';
import PostJob from './pages/Recruiter/PostJob/PostJob.jsx';


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Candidate routes */}
            <Route
              path="/jobs"
              element={
                <ProtectedRoute role="CANDIDATE">
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute role="CANDIDATE">
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute role="CANDIDATE">
                  <Applications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test/:jobId"
              element={
                <ProtectedRoute role="CANDIDATE">
                  <Test />
                </ProtectedRoute>
              }
            />

            {/* Recruiter routes */}
            <Route
              path="/recruiter/jobs"
              element={
                <ProtectedRoute role="RECRUITER">
                  <RecruiterJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruiter/post-job"
              element={
                <ProtectedRoute role="RECRUITER">
                  <PostJob />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}