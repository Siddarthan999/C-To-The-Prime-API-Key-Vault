// /api/credentials/get.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";
import { validateApiKey } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!validateApiKey(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { user_id, tool_id } = req.query;

  if (!user_id || !tool_id) {
    return res.status(400).json({ error: "Missing required params" });
  }

  const { data: credentials, error: credError } = await supabase
    .from("credentials")
    .select("field_name, field_value")
    .eq("user_id", user_id)
    .eq("tool_id", tool_id);

  if (credError) {
    return res.status(500).json({ error: credError.message });
  }

  const result = credentials.reduce((acc, { field_name, field_value }) => {
    acc[field_name] = field_value;
    return acc;
  }, {} as Record<string, string>);

  return res.status(200).json(result);
}
