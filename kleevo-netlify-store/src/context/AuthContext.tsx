import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthValue = { user: User | null; session: Session | null; role: string | null; loading: boolean; signOut: () => Promise<void>; refreshRole: () => Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshRole = async () => {
    const current = (await supabase.auth.getSession()).data.session;
    if (!current?.user) { setRole(null); return; }
    const { data } = await supabase.from("profiles").select("role").eq("id", current.user.id).maybeSingle();
    setRole(data?.role ?? "customer");
  };

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session);
      if (data.session) await refreshRole();
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      window.setTimeout(() => { void refreshRole(); }, 0);
      setLoading(false);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); setRole(null); };
  return <AuthContext.Provider value={{ user: session?.user ?? null, session, role, loading, signOut, refreshRole }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}