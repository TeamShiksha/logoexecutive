import axios from "axios";

export const instance = axios.create({
  baseURL: `${process.env.API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Global Axios response interceptor for handling unauthenticated API requests.
 * If a request fails with a 401 Unauthorized status (e.g., when a session is revoked
 * from another device), this interceptor automatically clears the local storage
 * and redirects the user to the home page to force re-authentication.
 */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (globalThis.location.pathname !== "/") {
        localStorage.clear();
        globalThis.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
