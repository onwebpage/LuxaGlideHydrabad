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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem("user");
    const storedProfile = localStorage.getItem("profile");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const response = await res.json() as {
        user: User;
        profile: UserProfile;
        message: string;
      };
      
      if (response.user) {
        setUser(response.user);
        setProfile(response.profile);
        localStorage.setItem("user", JSON.stringify(response.user));
        if (response.profile) {
          localStorage.setItem("profile", JSON.stringify(response.profile));
        }
      }
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  const register = async (data: any) => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", data);
      
      // Auto-login after registration
      await login(data.email, data.password);
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, register, isLoading }}>
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
