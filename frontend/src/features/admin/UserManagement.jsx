import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../../services/api';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('User');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'Admin') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [currentUser, navigate]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
            setError('Failed to load users.');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await api.post('/users', {
                username: newUsername,
                password: newPassword,
                role: newRole
            });
            setNewUsername('');
            setNewPassword('');
            setNewRole('User');
            setMessage('User added successfully!');
            fetchUsers();
        } catch (err) {
            setError(err.response?.data || 'Failed to add user.');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch (err) {
            setError('Failed to delete user.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Management</h1>
                    <Link to="/" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">Back to Home</Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add User Form */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Add New User</h2>
                        <form onSubmit={handleAddUser}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                    <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                                        className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                    <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                                        className="w-full px-4 py-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500">
                                        <option value="User">User</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                {message && <p className="text-green-500 text-sm">{message}</p>}
                                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">Add User</button>
                            </div>
                        </form>
                    </div>

                    {/* User List Table */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Existing Users</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">ID</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Username</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Role</th>
                                        <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{u.id}</td>
                                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">{u.username}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'Admin' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button onClick={() => handleDeleteUser(u.id)}
                                                    disabled={u.username === currentUser.username}
                                                    className={`text-red-600 hover:text-red-800 font-medium transition ${u.username === currentUser.username ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-gray-500">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserManagement;
