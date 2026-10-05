"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getAuth } from "@/lib/auth";
import type { User } from "@/types";

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  error: string | null;
}>({ user: null, loading: true, error: null });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const auth = getAuth();
    const unsubscribe = auth.subscribe((next) => {
      if (active) {
        setUser(next);
        setLoading(false);
        setError(null);
      }
    });
    void auth
      .getSession()
      .then((next) => {
        if (active) setUser(next);
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Couldn't restore your session.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  return <AuthContext value={{ user, loading, error }}>{children}</AuthContext>;
}
export function useAuth() {
  return useContext(AuthContext);
}
