export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------
// Zustand Auth Store (FINAL)
// --------------------------------------------------
export interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  persistLogin: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setInitialized: (value: boolean) => void;
  setPersistLogin: (value: boolean) => void;
  logout: () => void;
}

// --------------------------------------------------
// Response from backend
// --------------------------------------------------
export interface AuthResponse {
  user: User;
}

// --------------------------------------------------
// Payloads for API calls
// --------------------------------------------------
export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}
