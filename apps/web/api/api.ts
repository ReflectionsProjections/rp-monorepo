import axios from "axios";
import type { ApiError, TypedAxiosInstance } from "./type-wrapper";
import Config from "../constants/config";
import { authRefresh, readJwtClaims } from "./auth";

function holdingSetupToken() {
  const jwt = localStorage.getItem("jwt");
  return jwt !== null && readJwtClaims(jwt)?.tokenType === "setup";
}

const axiosObject = axios.create({ baseURL: Config.API_BASE_URL });

axiosObject.interceptors.request.use((config) => {
  const jwt = localStorage.getItem("jwt");
  if (jwt) {
    config.headers.Authorization = jwt;
  } else {
    config.headers.Authorization = undefined;
  }

  return config;
});

axiosObject.interceptors.response.use(
  (response) => response,
  (error: ApiError) => {
    const errorType = error.response?.data?.error;

    if (errorType === "NoJWT") {
      localStorage.removeItem("jwt");
      authRefresh();
      return;
    }

    // RoleChecker validates the payload before it applies its weak-verification
    // bypass, so a setup token is rejected by routes that accept no token at
    // all. That means "this route needs a registered account", not "the session
    // is broken" — discarding the token here would drop a half-finished
    // registration and bounce the user back to the start.
    if (errorType === "InvalidJWT" && holdingSetupToken()) {
      return Promise.reject(error);
    }

    if (errorType === "ExpiredJWT" || errorType === "InvalidJWT") {
      localStorage.removeItem("jwt");
      window.location.reload();
      return;
    }

    console.error("API error:", error);

    return Promise.reject(error);
  }
);

const api: TypedAxiosInstance = {
  get: (url, config) => axiosObject.get(url as string, config),
  post: (url, data, config) => axiosObject.post(url as string, data, config),
  put: (url, data, config) => axiosObject.put(url as string, data, config),
  patch: (url, data, config) => axiosObject.patch(url as string, data, config),
  delete: (url, config) => axiosObject.delete(url as string, config)
};

export default api;
