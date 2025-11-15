import axios, { AxiosRequestHeaders } from "axios";
import { API_URL } from "config";
import { auth } from "../firebase";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    console.log(`[${config.method?.toUpperCase()}] Request URL:`, config.url);

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken();

        if (!config.headers) {
          config.headers = {} as AxiosRequestHeaders;
        }

        config.headers.Authorization = `Bearer ${idToken}`;      
      }
    } catch (e) {
      console.error("Failed to attach token to request", e);
    }

    return config;
  },
  (error) => Promise.reject(error)
);
