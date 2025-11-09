import axios from 'axios';
import { API_URL } from 'config';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`[${config.method?.toLocaleUpperCase()}] Request URL:`, config.url);
    return config;
  }
)