import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import api from './services/api';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Todo from './features/todo/Todo';
import UserManagement from './features/admin/UserManagement';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import NotificationManager from './features/todo/NotificationManager';

import Home from './Home';
import Game from './features/game/ShmupGame';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  useEffect(() => {
    // Keep-alive ping every 12 minutes
    const ping = () => api.get('/health').catch(() => { });
    const interval = setInterval(ping, 12 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificationManager />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/todos" element={
            <ProtectedRoute>
              <Todo />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/game" element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
