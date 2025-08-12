import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Projects from './pages/Projects';
import Users from './pages/Users';
import Applications from './pages/Applications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/tickets/*" element={
          <ProtectedRoute permission="ticket:read">
            <Tickets />
          </ProtectedRoute>
        } />
        
        <Route path="/projects/*" element={
          <ProtectedRoute permission="project:read">
            <Projects />
          </ProtectedRoute>
        } />
        
        <Route path="/users/*" element={
          <ProtectedRoute permission="user:read">
            <Users />
          </ProtectedRoute>
        } />
        
        <Route path="/applications/*" element={
          <ProtectedRoute permission="application:read">
            <Applications />
          </ProtectedRoute>
        } />
        
        <Route path="/reports/*" element={
          <ProtectedRoute permission="report:view">
            <Reports />
          </ProtectedRoute>
        } />
        
        <Route path="/settings/*" element={<Settings />} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
