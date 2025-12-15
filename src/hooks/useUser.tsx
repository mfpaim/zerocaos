import { createContext, useContext, useState, ReactNode } from 'react';
import { UserData } from '@/components/UserProfile';

interface UserContextType {
  user: UserData;
  updateUser: (user: UserData) => void;
}

const defaultUser: UserData = {
  id: '1',
  name: 'Administrador',
  email: 'admin@zerocaos.com',
  initials: 'AD',
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData>(defaultUser);

  const updateUser = (updatedUser: UserData) => {
    setUser(updatedUser);
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    return { user: defaultUser, updateUser: () => {} };
  }
  return context;
}
