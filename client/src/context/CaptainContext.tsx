import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface Captain {
  id: string;
  name: string;
  email: string;
  rNumber: string;
  uniqueId: string;
  phone: string;
  department: string;
  bloodGroup: string;
  gender: string;
  year: string;
  status: string;
}

interface CaptainContextType {
  captain: Captain | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, captain: Captain) => void;
  logout: () => void;
}

const CaptainContext = createContext<CaptainContextType | undefined>(undefined);

export function CaptainProvider({ children }: { children: ReactNode }) {
  const [captain, setCaptain] = useState<Captain | null>(() => {
    const stored = localStorage.getItem("captainData");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("captainToken");
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("captainToken");
    const storedCaptain = localStorage.getItem("captainData");

    if (storedToken && storedCaptain) {
      setToken(storedToken);
      setCaptain(JSON.parse(storedCaptain));
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newCaptain: Captain) => {
    setToken(newToken);
    setCaptain(newCaptain);
    localStorage.setItem("captainToken", newToken);
    localStorage.setItem("captainData", JSON.stringify(newCaptain));
  };

  const logout = () => {
    setToken(null);
    setCaptain(null);
    localStorage.removeItem("captainToken");
    localStorage.removeItem("captainData");
  };

  return (
    <CaptainContext.Provider
      value={{
        captain,
        token,
        isAuthenticated: !!token && !!captain,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </CaptainContext.Provider>
  );
}

export function useCaptain() {
  const context = useContext(CaptainContext);
  if (!context) {
    throw new Error("useCaptain must be used within a CaptainProvider");
  }
  return context;
}
