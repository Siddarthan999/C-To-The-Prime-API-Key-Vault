// /pages/api/users/api-key/regenerate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../../lib/supabase";

function generateApiKey(): string {
  const prefix = "C-To-The-Prime";
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 25);
  return `${prefix}-${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const newKey = generateApiKey();

  const { error } = await supabase
    .from("api_keys")
    .upsert({ user_id: "admin", api_key: newKey });

  if (error) {
    console.error("Error regenerating API key:", error.message);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ apiKey: newKey });
}
