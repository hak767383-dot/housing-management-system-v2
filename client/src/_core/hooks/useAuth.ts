import { getLoginUrl } from "@/const";
import { API_BASE_URL } from "@/const";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * useAuth Hook
 * 
 * Manages user authentication state and session.
 * Fetches current user on mount and handles logout.
 * Auto-redirects to login on 401 (unauthenticated) if enabled.
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user from backend and validate session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/student/auth/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setError(null);
        } else if (response.status === 401) {
          // User is not authenticated
          setUser(null);
          if (redirectOnUnauthenticated && typeof window !== 'undefined') {
            window.location.href = redirectPath;
          }
        } else {
          throw new Error('فشل تحميل بيانات المستخدم');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'فشل تحميل بيانات المستخدم';
        setError(errorMessage);
        setUser(null);
        if (redirectOnUnauthenticated && typeof window !== 'undefined') {
          window.location.href = redirectPath;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [redirectOnUnauthenticated, redirectPath]);

  // Logout user and redirect to login page
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/student/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {
        // Continue logout even if API call fails
      });
      
      setUser(null);
      setError(null);
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
