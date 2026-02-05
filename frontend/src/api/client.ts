import axios from 'axios';

const client = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor not needed for cookies as they are sent automatically

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('signin')) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token (cookies are sent automatically)
        await client.post('/auth/token/refresh/');
        // Retry original request
        return client(originalRequest);
      } catch {
        // Refresh failed - do nothing, let the error propagate
        // AuthContext will handle clearing the user state
      }
    }
    return Promise.reject(error);
  },
);

export default client;
