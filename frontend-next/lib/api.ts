// Frontend talks to backend on port 5000 by default.
// You can override this with NEXT_PUBLIC_API_BASE_URL in .env.local if needed.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export type AuthUser = {
  id: string;
  email: string;
  role: "CANDIDATE" | "COMPANY";
};

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  const hasBody = init.body !== undefined && init.body !== null;
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch (err) {
    // Network error - backend might not be running
    throw new Error("Unable to connect to server. Please make sure the backend is running.");
  }

  const contentType = res.headers.get("content-type");
  const text = await res.text();
  
  // Check if response is JSON
  if (!contentType || !contentType.includes("application/json")) {
    if (res.status === 404) {
      throw new Error(`API endpoint not found: ${path}`);
    }
    if (res.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }
    throw new Error(`Unexpected response format. Expected JSON but got ${contentType}`);
  }

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (parseError) {
    throw new Error("Invalid JSON response from server");
  }

  if (!res.ok) {
    // If unauthorized, redirect to login (cookie-based auth)
    if (res.status === 401 && typeof window !== "undefined") {
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        console.warn("Unauthorized, redirecting to login");
        window.location.href = "/login";
      }
    }

    // If forbidden (403), it might be a role mismatch - don't clear token immediately
    // Let the error propagate so the UI can handle it appropriately
    if (res.status === 403) {
      console.warn(`Access forbidden: ${data?.message || data?.error || "Insufficient permissions"}`);
    }
    
    // If unauthorized, provide helpful error
    if (res.status === 401) {
      const error: any = new Error("Please log in to continue");
      error.status = 401;
      throw error;
    }
    
    const error: any = new Error(data?.error || data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.details = data?.details; // Pass through additional error details
    throw error;
  }

  return data as T;
}

// Upload file function for FormData (e.g., profile pictures)
export async function apiUploadFile<T>(
  path: string,
  file: File,
  fieldName: string = "profilePicture"
): Promise<T> {
  const token = getToken();
  const formData = new FormData();
  formData.append(fieldName, file);

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Don't set Content-Type header - browser will set it with boundary for FormData

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch (err) {
    throw new Error("Unable to connect to server. Please make sure the backend is running.");
  }

  const contentType = res.headers.get("content-type");
  const text = await res.text();

  // Check if response is JSON
  if (!contentType || !contentType.includes("application/json")) {
    if (res.status === 404) {
      throw new Error(`API endpoint not found: ${path}`);
    }
    if (res.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }
    throw new Error(`Unexpected response format. Expected JSON but got ${contentType}`);
  }

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (parseError) {
    throw new Error("Invalid JSON response from server");
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("auth_token");
        if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
          console.warn("Token expired or invalid, redirecting to login");
          window.location.href = "/login";
        }
      }
    }

    if (res.status === 403) {
      console.warn(`Access forbidden: ${data?.message || data?.error || "Insufficient permissions"}`);
    }

    if (res.status === 401 && !token) {
      const error: any = new Error("Please log in to continue");
      error.status = 401;
      throw error;
    }

    const error: any = new Error(data?.error || data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  return data as T;
}
