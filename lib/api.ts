import axios from 'axios';
import { Platform } from 'react-native';

const LOCAL_IP = '192.168.0.16';

const API_URL = `http://${LOCAL_IP}:8000/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;