import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { authApi } from "@/utils/api";

interface User {
  id: number;
  email: string;
  full_name: string;
  profile_photo?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await authApi.getCurrentUser();
          setUser(response.user);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(email, password);
      if (response.user) {
        setUser(response.user);
        return { user: response.user };
      } else {
        throw { message: "Invalid response from server" };
      }
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof err.message === "string"
          ? err.message
          : "Failed to login";

      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.signup(email, password, fullName);
      if (response.user) {
        setUser(response.user);
        return { user: response.user };
      } else {
        throw { message: "Invalid response from server" };
      }
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof err.message === "string"
          ? err.message
          : "Failed to create account";

      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      return { success: true };
    } catch (err: unknown) {
      console.error("Logout error:", err);
      // Even if logout fails on the server, clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
