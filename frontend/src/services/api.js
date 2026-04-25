import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const apiBaseUrls = [
  configuredBaseUrl,
  "http://127.0.0.1:5000",
  "http://localhost:5000",
].filter(Boolean);

function normalizeCollection(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  return [];
}

export async function fetchCollection(path) {
  let lastError;

  for (const baseURL of apiBaseUrls) {
    try {
      const response = await axios.get(`${baseURL}${path}`, {
        timeout: 10000,
      });
      return normalizeCollection(response.data);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to connect to the backend API.");
}

export async function createRecord(path, payload) {
  let lastError;

  for (const baseURL of apiBaseUrls) {
    try {
      const response = await axios.post(`${baseURL}${path}`, payload, {
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("Unable to connect to the backend API.");
}

export function getErrorMessage(error, fallbackMessage = "Unable to load data.") {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === "ERR_NETWORK") {
    return "Unable to reach the backend API on port 5000. Make sure the backend server is running.";
  }

  return error?.response?.data?.error || error?.message || fallbackMessage;
}
