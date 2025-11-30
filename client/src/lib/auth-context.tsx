import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import type { Buyer, Vendor } from "@shared/schema";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "buyer" | "vendor" | "admin";
  createdAt: string;
}

type UserProfile = Buyer | Vendor | null;

interface AuthContextType {
  user: User | null;
  profile: UserProfile;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<User>;
  refreshProfile: (updatedUser: User, updatedProfile: UserProfile) => void;
  isLoading: boolean;
}

export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem("user");
    const storedProfile = localStorage.getItem("profile");
    const storedToken = localStorage.getItem("authToken");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
      if (storedToken) {
        setToken(storedToken);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const response = await res.json() as {
        user: User;
        profile: UserProfile;
        token: string;
        message: string;
      };
      
      if (response.user) {
        setUser(response.user);
        setProfile(response.profile);
        setToken(response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("authToken", response.token);
        if (response.profile) {
          localStorage.setItem("profile", JSON.stringify(response.profile));
        }
        return response.user;
      }
      throw new Error("Login failed - no user data received");
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  const register = async (data: any): Promise<User> => {
    try {
      const res = await apiRequest("POST", "/api/auth/register", data);
      const response = await res.json() as {
        user: User;
        profile: UserProfile;
        token: string;
        message: string;
      };
      
      if (response.user) {
        setUser(response.user);
        setProfile(response.profile);
        setToken(response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("authToken", response.token);
        if (response.profile) {
          localStorage.setItem("profile", JSON.stringify(response.profile));
        }
        return response.user;
      }
      throw new Error("Registration failed - no user data received");
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (authToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
      localStorage.removeItem("authToken");
    }
  };

  const refreshProfile = (updatedUser: User, updatedProfile: UserProfile) => {
    setUser(updatedUser);
    setProfile(updatedProfile);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    if (updatedProfile) {
      localStorage.setItem("profile", JSON.stringify(updatedProfile));
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, token, login, logout, register, refreshProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
