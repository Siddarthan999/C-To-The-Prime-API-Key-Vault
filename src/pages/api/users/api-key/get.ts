// /pages/api/users/api-key/get.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from("api_keys")
    .select("api_key")
    .eq("user_id", "admin")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ apiKey: data.api_key });
}
