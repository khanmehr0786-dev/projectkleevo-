import { createClient } from "@supabase/supabase-js";
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY)!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
export async function requireUser(event: { headers: Record<string,string|undefined> }) {
  const auth = event.headers.authorization || event.headers.Authorization;
  if (!auth?.startsWith("Bearer ")) throw new Error("Authentication required.");
  const token = auth.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid or expired session.");
  return data.user;
}
export function json(statusCode:number, body:unknown) {
  return { statusCode, headers: { "Content-Type":"application/json", "Cache-Control":"no-store" }, body: JSON.stringify(body) };
}
