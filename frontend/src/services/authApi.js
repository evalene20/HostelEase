import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const apiBaseUrls = [
  configuredBaseUrl,
  "http://127.0.0.1:5001",
  "http://localhost:5001",
].filter(Boolean);

function getToken() {
  const session = localStorage.getItem("shm-session");
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    return parsed.token;
  } catch {
    return null;
  }
}

function createAxiosInstance(baseURL) {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add auth token to requests
  instance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

  // Handle 401 errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("shm-session");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

async function tryRequest(requestFn) {
  let lastError;

  for (const baseURL of apiBaseUrls) {
    try {
      const instance = createAxiosInstance(baseURL);
      const response = await requestFn(instance);
      return response.data?.data || response.data;
    } catch (error) {
      lastError = error;
      // Don't try other base URLs for 401/403 errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Unable to connect to the backend API.");
}

// Authentication
export async function login(credentials) {
  return tryRequest((api) => api.post('/auth/login', credentials));
}

export async function verifyToken() {
  return tryRequest((api) => api.get('/auth/verify'));
}

export async function getProfile() {
  return tryRequest((api) => api.get('/auth/profile'));
}

// Generic CRUD with auth
export async function fetchCollection(path) {
  const data = await tryRequest((api) => api.get(path));
  return normalizeCollection(data);
}

export async function createRecord(path, payload) {
  return tryRequest((api) => api.post(path, payload));
}

export async function updateRecord(path, payload) {
  return tryRequest((api) => api.put(path, payload));
}

export async function deleteRecord(path) {
  return tryRequest((api) => api.delete(path));
}

// Booking admin actions
export async function updateBookingStatus(bookingId, status) {
  return tryRequest((api) => api.put(`/bookings/${bookingId}/status`, { status }));
}

// Room admin actions
export async function requestRoomMaintenance(roomId, issueType, description) {
  return tryRequest((api) => api.post(`/rooms/${roomId}/maintenance`, { issue_type: issueType, description }));
}

export async function recordRoomPolicyInspection(roomId, notes) {
  return tryRequest((api) => api.post(`/rooms/${roomId}/policy`, { notes }));
}

// Student admin actions
export async function toggleStudentFlag(studentId, flagged = true, reason = '') {
  return tryRequest((api) => api.put(`/students/${studentId}/flag`, { flagged, reason }));
}

export async function fetchStudentPayments(studentId) {
  const data = await tryRequest((api) => api.get(`/payments?student_id=${studentId}`));
  return normalizeCollection(data);
}

// Complaint admin actions
export async function assignComplaint(complaintId, staffId, remarks) {
  return tryRequest((api) => api.post(`/admin/complaints/${complaintId}/assign`, { staff_id: staffId, remarks }));
}

export async function unassignComplaint(complaintId) {
  return tryRequest((api) => api.delete(`/admin/complaints/${complaintId}/assign`));
}

export async function updateComplaintPriority(complaintId, priority) {
  return tryRequest((api) => api.put(`/admin/complaints/${complaintId}/priority`, { priority }));
}

export async function updateComplaintRemarks(complaintId, remarks) {
  return tryRequest((api) => api.put(`/admin/complaints/${complaintId}/remarks`, { remarks }));
}

export async function fetchAdminComplaints() {
  const data = await tryRequest((api) => api.get('/admin/complaints'));
  return normalizeCollection(data);
}

export async function fetchAvailableStaff(role) {
  const data = await tryRequest((api) => api.get('/admin/complaints/staff', { params: { role } }));
  return normalizeCollection(data);
}

// Outing actions
export async function fetchOutings() {
  const data = await tryRequest((api) => api.get('/outings'));
  return normalizeCollection(data);
}

export async function createOuting(payload) {
  return tryRequest((api) => api.post('/outings', payload));
}

export async function updateOutingStatus(outingId, status) {
  return tryRequest((api) => api.put(`/outings/${outingId}/status`, { status }));
}

export async function recordOutingReturn(outingId, actualReturn) {
  return tryRequest((api) => api.put(`/outings/${outingId}/return`, { actual_return: actualReturn }));
}

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

export function getErrorMessage(error, fallbackMessage = "Unable to load data.") {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === "ERR_NETWORK") {
    return "Unable to reach the backend API on port 5001. Make sure the backend server is running.";
  }

  if (error.response?.status === 401) {
    return "Session expired. Please login again.";
  }

  if (error.response?.status === 403) {
    return "You don't have permission to perform this action.";
  }

  return error?.response?.data?.error || error?.message || fallbackMessage;
}
