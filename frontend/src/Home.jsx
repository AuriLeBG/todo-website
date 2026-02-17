import { Link } from 'react-router-dom';
import { useAuth } from './features/auth/AuthContext';
import NotificationManager from './features/todo/NotificationManager';

function Home() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <NotificationManager />
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.username}!</h1>
                    <div className="flex gap-4">
                        <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">Logout</button>
                    </div>
                </div>
                <div className="p-4 border rounded bg-gray-50 mb-6">
                    <p className="text-lg">Your Role: <span className="font-semibold text-blue-600">{user.role}</span></p>
                    {user.role === 'Admin' && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                            <h2 className="text-xl font-bold text-yellow-800">Admin Panel</h2>
                            <p className="text-gray-700">You have access to administrative features.</p>
                            <div className="mt-4">
                                <Link to="/admin/users" className="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition">Manage Users</Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* TODO Section */}
                    <Link to="/todos" className="block p-6 bg-blue-50 border border-blue-200 rounded-xl hover:shadow-lg transition transform hover:-translate-y-1 group">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-blue-800 group-hover:text-blue-600">My Tasks</h2>
                            <span className="text-3xl">📝</span>
                        </div>
                        <p className="text-gray-600 mt-2">Manage your personal to-do list, set deadines and priorities.</p>
                    </Link>

                    {/* Game Section */}
                    <Link to="/game" className="block p-6 bg-indigo-900 border border-indigo-700 rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition transform hover:-translate-y-1 group">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-black text-indigo-300 group-hover:text-indigo-200 uppercase tracking-tighter italic">Antigravity Shmup</h2>
                            <span className="text-3xl animate-pulse">🚀</span>
                        </div>
                        <p className="text-indigo-200/70 mt-2 font-medium">Arcade action! Defend mission control from the alien interceptors.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
