import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', {
                username,
                password
            });
            navigate('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(' ')
                : (typeof err.response?.data === 'string' ? err.response.data : 'Registration failed.');
            setError(errorMessage);
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="px-8 py-6 mt-4 text-left bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Register a new account</h3>
                <form onSubmit={handleRegister}>
                    <div className="mt-4">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300" htmlFor="username">Username</label>
                            <input type="text" placeholder="Username"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="mt-4">
                            <label className="block text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
                            <input type="password" placeholder="Password"
                                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                        <div className="flex items-baseline justify-between mt-4">
                            <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition">Register</button>
                            <Link to="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Login</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
