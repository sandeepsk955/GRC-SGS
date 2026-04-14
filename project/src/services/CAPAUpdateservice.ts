// src/services/CAPAUpdateservice.ts
import axios from "axios";

/**
 * Use the Vite proxy /api or a defined base URL.
 */
const baseURL = (import.meta as any)?.env?.VITE_API_BASE_URL?.trim() || ((import.meta as any)?.env?.DEV ? "/api" : "https://sajoan-b.techoptima.ai/api");

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const CAPAUpdateservice = {
  updateCAPA: async (id: number, data: any) => {
    return api.put(`/UpdateCAPA_?id=${id}`, data);
  },
};

export const closeCapaUpdate = async () => {};
export const getCapaUpdate = async () => {};
export const getControlsForAudit = async () => {};

