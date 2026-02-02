import axios, { AxiosHeaders } from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

if (import.meta.env.PROD && (!apiUrl || !apiUrl.trim())) {
  throw new Error('VITE_API_URL must be set in production.');
}

const baseURL = apiUrl && apiUrl.trim()
  ? apiUrl.trim()
  : import.meta.env.DEV
    ? 'http://localhost:3000'
    : undefined;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  let token: string | null = null;
  try {
    token = localStorage.getItem('token');
  } catch {
    token = null;
  }

  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    const headers = config.headers instanceof AxiosHeaders ? config.headers : AxiosHeaders.from(config.headers ?? {});
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

export default apiClient;
