// pages/api/tools/delete-field.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tool_id, field_name } = req.body;

  if (!tool_id || !field_name) {
    return res.status(400).json({ error: "Missing tool_id or field_name" });
  }

  const { error } = await supabase
    .from("tool_fields")
    .delete()
    .match({ tool_id, name: field_name });

  if (error) {
    console.error("Error deleting field:", error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: "Field deleted" });
}
