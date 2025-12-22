import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  username: string | null;
  name: string | null;
  role: "user" | "admin";
  authorized: number; // 0 = not authorized (mauve), 1 = authorized (green mint)
  profilePhoto?: string | null;
  customIcon?: string | null;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("devcave_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("devcave_user");
      }
    }
    setIsLoading(false);
  }, []);

  // Sync to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("devcave_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("devcave_user");
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("devcave_user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
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
