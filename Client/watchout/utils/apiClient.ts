import axios from "axios";
import { API_URL } from "config";
import auth from "@react-native-firebase/auth";

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
      const currentUser = auth().currentUser;

      if (currentUser) {
        const idToken = await currentUser.getIdToken(true);

        if ((config.headers as any)?.set instanceof Function) {
          (config.headers as any).set("Authorization", `Bearer ${idToken}`);
        } else {
          (config.headers as any) = {
            ...(config.headers ?? {}),
            Authorization: `Bearer ${idToken}`,
          };
        }
      }
    } catch (error) {
      console.error("Failed to attach Firebase token", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);
