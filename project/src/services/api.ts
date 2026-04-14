import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";


/**
 * In dev mode, Vite's proxy handles /api/ → backend.
 * In production (deployed), we need the full absolute URL since there's no proxy.
 */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api/" : "https://sajoan-b.techoptima.ai/api/");

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { Accept: "application/json" },
});

// Attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("authToken");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** Always return the useful payload, supporting both {data:[]} and [] */
export async function unwrapData<T = any>(
  promise: Promise<AxiosResponse<any>>
): Promise<T> {
  const res = await promise;
  const d = res?.data;
  if (d && typeof d === "object" && "data" in d) {
    return (d as any).data as T;
  }
  return d as T;
}

export const apiService = {
  get:  <T = any>(url: string, config?: AxiosRequestConfig) => api.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => api.post<T>(url, data, config),
  put:  <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => api.put<T>(url, data, config),
  delete:<T = any>(url: string, config?: AxiosRequestConfig) => api.delete<T>(url, config),
};

export default api;
