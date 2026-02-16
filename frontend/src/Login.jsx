import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });
            console.log(response.data);
            login(response.data);
            navigate('/');
        } catch (err) {
            setError('Login failed. Check credentials.');
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="px-8 py-6 mt-4 text-left bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Login to your account</h3>
                <form onSubmit={handleLogin}>
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
                            <button className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition">Login</button>
                            <Link to="/register" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Register</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
