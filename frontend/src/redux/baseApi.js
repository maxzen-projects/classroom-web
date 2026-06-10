import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const UPLOADS_BASE_URL = API_BASE_URL.replace('/api', '');

export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
