import axios, { AxiosHeaders } from "axios";
import { API_URL } from "config";
import { getAuth, getIdToken } from "@react-native-firebase/auth";

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
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const idToken = await getIdToken(currentUser);

        const headers = AxiosHeaders.from(config.headers ?? {});
        headers.set("Authorization", `Bearer ${idToken}`);
        config.headers = headers;
      }
    } catch (error) {
      console.error("Failed to attach Firebase token", error);
    }

    return config;
  }
)

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[${response.config.method?.toLocaleUpperCase()}] Response URL:`, response.config.url, 'Status:', response.status);
    return response;
  }
);
