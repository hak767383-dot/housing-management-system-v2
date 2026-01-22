import { getLoginUrl } from "@/const";
import { API_BASE_URL } from "@/const";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          setUser(null);
          if (redirectOnUnauthenticated && typeof window !== 'undefined') {
            window.location.href = redirectPath;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تحميل بيانات المستخدم');
        if (redirectOnUnauthenticated && typeof window !== 'undefined') {
          window.location.href = redirectPath;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [redirectOnUnauthenticated, redirectPath]);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {
        // Continue even if logout fails
      });
      
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = getLoginUrl();
      }
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  }, []);

  const state = useMemo(() => {
    return {
      user,
      loading: isLoading,
      error: error,
      isAuthenticated: Boolean(user),
    };
  }, [user, isLoading, error]);

  return {
    ...state,
    logout,
  };
}
