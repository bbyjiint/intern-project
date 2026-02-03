const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export type AuthUser = {
  id: string;
  email: string;
  role: "CANDIDATE" | "COMPANY";
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth_token");
}

export function setToken(token: string) {
  window.localStorage.setItem("auth_token", token);
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
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
    // If unauthorized, clear token and redirect to login
    if (res.status === 401 && token) {
      // Token is invalid or expired
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("auth_token");
        // Only redirect if we're not already on login/register page
        if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
          console.warn("Token expired or invalid, redirecting to login");
          window.location.href = "/login";
        }
      }
    }
    
    // If forbidden (403), it might be a role mismatch - don't clear token immediately
    // Let the error propagate so the UI can handle it appropriately
    if (res.status === 403) {
      console.warn(`Access forbidden: ${data?.message || data?.error || "Insufficient permissions"}`);
    }
    
    // If unauthorized and no token, provide helpful error
    if (res.status === 401 && !token) {
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

