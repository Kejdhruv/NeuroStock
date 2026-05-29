const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || "https://neurostock-backend-9fog.onrender.com"
);

export const PREDICTION_API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_PREDICTION_API_BASE_URL || "https://neurostock-prediction.onrender.com"
);

const withBaseUrl = (baseUrl, path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

export const apiUrl = (path) => withBaseUrl(API_BASE_URL, path);
export const predictionApiUrl = (path) => withBaseUrl(PREDICTION_API_BASE_URL, path);
