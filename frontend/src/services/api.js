import axios from 'axios';

// Get the actual hostname (useful for mobile access via IP)
const hostname = window.location.hostname;
// Fallback to localhost:5000 if no env var is provided
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${hostname}:5000/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
