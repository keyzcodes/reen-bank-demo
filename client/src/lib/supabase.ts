import { createClient } from "@supabase/supabase-js";

// SUPABASE CONNECTION:
// Vite reads these public connection values from .env.local.
// Add the same variables to Netlify before deploying this integration.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !publishableKey) {
  throw new Error("Supabase environment variables are missing.");
}

// SHARED CLIENT:
// Login, registration and database requests reuse this connection.
export const supabase = createClient(supabaseUrl, publishableKey);
