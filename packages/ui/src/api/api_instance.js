import axios from "axios";

const apiBase = process.env.API_BASE_URL
  ? `${process.env.API_BASE_URL}/api`
  : "/api";

export const instance = axios.create({
  baseURL: apiBase,
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
    return Promise.reject(error);
  }
);
