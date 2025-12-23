import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  nickname: string;
  profilePhoto: string | null;
  nicknameColor: string;
  mood: string;
  createdAt: Date;
  lastSeenAt: Date;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('devcave_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
  }, []);

  // Sauvegarder l'utilisateur dans localStorage quand il change
  useEffect(() => {
    if (user) {
      localStorage.setItem('devcave_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('devcave_user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoggedIn: !!user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
