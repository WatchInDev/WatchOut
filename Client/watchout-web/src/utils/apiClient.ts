import axios from "axios";
import { API_URL } from "../config";
import { auth } from "../lib/firebase";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const token = await currentUser.getIdToken();

        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("❗ Błąd podczas pobierania tokenu Firebase", e);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("❗ Nieautoryzowany — użytkownik nie jest zalogowany lub token wygasł");
    }

    if (status === 403) {
      console.warn("❗ Brak uprawnień — użytkownik nie ma roli ADMIN");
    }

    return Promise.reject(error);
  }
);
