import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Todo from './Todo';
import { AuthProvider, useAuth } from './AuthContext';
import NotificationManager from './NotificationManager';

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

function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <NotificationManager />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.username}!</h1>
          <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">Logout</button>
        </div>
        <div className="p-4 border rounded bg-gray-50 mb-6">
          <p className="text-lg">Your Role: <span className="font-semibold text-blue-600">{user.role}</span></p>
          {user.role === 'Admin' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h2 className="text-xl font-bold text-yellow-800">Admin Panel</h2>
              <p className="text-gray-700">You have access to administrative features.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/todos" className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition group">
            <h2 className="text-2xl font-bold text-blue-800 group-hover:text-blue-600">My Tasks</h2>
            <p className="text-gray-600 mt-2">Manage your personal to-do list.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/todos" element={
            <ProtectedRoute>
              <Todo />
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
