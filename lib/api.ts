import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_IP = '192.168.18.6'; 
const PORT = '8000';
const API_URL = `http://${LOCAL_IP}:${PORT}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;