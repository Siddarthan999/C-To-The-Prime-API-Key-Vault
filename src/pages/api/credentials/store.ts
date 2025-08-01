// pages/api/credentials/store.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id, tool_id, credentials } = req.body;

  if (!user_id || !tool_id || !Array.isArray(credentials)) {
    console.error("Missing or invalid fields", { user_id, tool_id, credentials });
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  const updates = credentials.map((entry: any) => ({
    user_id,
    tool_id,
    field_name: entry.field_name,
    field_value: entry.field_value,
  }));

  try {
    const { error } = await supabase
      .from("credentials")
      .upsert(updates, {
        onConflict: "user_id,tool_id,field_name" // ✅ Use column names, NOT constraint name
      });

    if (error) {
      console.error("Supabase upsert error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "Credentials stored/updated" });
  } catch (e: any) {
    console.error("Unexpected server error:", e);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
