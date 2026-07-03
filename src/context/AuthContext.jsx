import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [adminRole, setAdminRole] =
    useState(null);

  const [adminLoading, setAdminLoading] =
    useState(true);

  const [adminError, setAdminError] =
    useState("");

  const checkAdminAccess = useCallback(
    async (currentUser = null) => {
      setAdminLoading(true);
      setAdminError("");

      try {
        if (!currentUser) {
          setAdminRole(null);
          return null;
        }

        const { data, error } = await supabase
          .from("admin_users")
          .select("role")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        const role = data?.role || null;

        setAdminRole(role);

        return role;
      } catch (error) {
        console.error(
          "Failed to check admin access:",
          error
        );

        setAdminRole(null);

        setAdminError(
          error.message ||
            "Unable to verify admin access."
        );

        return null;
      } finally {
        setAdminLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.error(
          "Failed to load auth session:",
          error
        );
      }

      const currentUser =
        currentSession?.user ?? null;

      setSession(currentSession);
      setUser(currentUser);
      setAuthLoading(false);

      await checkAdminAccess(currentUser);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!isMounted) return;

        const currentUser =
          currentSession?.user ?? null;

        setSession(currentSession);
        setUser(currentUser);
        setAuthLoading(false);

        window.setTimeout(() => {
          if (isMounted) {
            checkAdminAccess(currentUser);
          }
        }, 0);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminAccess]);

  const signUp = useCallback(
    async ({
      firstName,
      lastName,
      email,
      password,
    }) => {
      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              full_name: `${firstName.trim()} ${lastName.trim()}`,
            },
          },
        });

      return {
        data,
        error,
      };
    },
    []
  );

  const signIn = useCallback(
    async ({ email, password }) => {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      return {
        data,
        error,
      };
    },
    []
  );

  const signOut = useCallback(async () => {
    setAdminRole(null);

    const { error } =
      await supabase.auth.signOut();

    return {
      error,
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,

      authLoading,
      isAuthenticated: Boolean(user),

      adminRole,
      adminLoading,
      adminError,

      isAdmin: Boolean(adminRole),
      isOwner: adminRole === "owner",

      checkAdminAccess,

      signUp,
      signIn,
      signOut,
    }),
    [
      user,
      session,
      authLoading,
      adminRole,
      adminLoading,
      adminError,
      checkAdminAccess,
      signUp,
      signIn,
      signOut,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}