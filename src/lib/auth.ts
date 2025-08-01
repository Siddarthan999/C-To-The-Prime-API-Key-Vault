// lib/auth.ts
import { NextApiRequest } from "next";
import { supabase } from "./supabase";

export async function validateApiKey(req: NextApiRequest): Promise<boolean> {
  const clientKey = req.headers["x-api-key"];
  if (!clientKey || typeof clientKey !== "string") return false;

  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("api_key", clientKey)
    .single();

  return !!data && !error;
}
