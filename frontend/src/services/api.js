import axios from "axios";

/**
 * A single, shared Axios instance rather than raw axios calls scattered
 * across components. Every domain service (auth.service.js,
 * student.service.js, etc.) imports THIS, not axios directly.
 *
 * withCredentials: true is what makes the browser actually send the
 * HTTP-only auth cookie set by the backend (see Phase 2) on every
 * request — without it, the cookie exists but never leaves the browser.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

/**
 * Normalizes every error into a plain object with a `message` (and
 * optional `errors` array for validation failures), so components never
 * have to know about Axios's error shape (`error.response.data.message`
 * vs a network error with no `response` at all).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The server responded with an error status — use its message.
      return Promise.reject({
        message: error.response.data?.message || "Something went wrong",
        errors: error.response.data?.errors,
        statusCode: error.response.status,
      });
    }
    if (error.request) {
      // Request was made but no response came back (server down, no network).
      return Promise.reject({
        message: "Could not reach the server. Please check your connection and try again.",
      });
    }
    return Promise.reject({ message: error.message || "An unexpected error occurred" });
  }
);
