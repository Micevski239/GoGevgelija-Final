import axios from "axios";
import Constants from "expo-constants";
import { getAccess, getRefresh, saveTokens } from "../auth/tokens";

const baseURL = (Constants.expoConfig?.extra as any)?.API_URL || process.env.EXPO_PUBLIC_API_URL;
export const api = axios.create({ 
  baseURL,
  timeout: 10000, // 10 second timeout
});

let refreshing: Promise<string | null> | null = null;
console.log("=== API Client Configuration ===");
console.log("Constants.expoConfig?.extra:", Constants.expoConfig?.extra);
console.log("process.env.EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
console.log("Final API baseURL =", baseURL);

async function refreshAccess(): Promise<string | null> {
  if (refreshing) return refreshing;
  const r = getRefresh();
  if (!r) return null;
  refreshing = api.post("/api/token/refresh/", { refresh: r })
    .then(async ({ data }) => {
      await saveTokens(data.access, r);
      return data.access as string;
    })
    .catch(async () => { await saveTokens(undefined, undefined); return null; })
    .finally(() => { refreshing = null; });
  return refreshing;
}

api.interceptors.request.use(async (config) => {
  const token = getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const newAccess = await refreshAccess();
      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);
