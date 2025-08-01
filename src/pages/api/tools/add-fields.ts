// pages/api/tools/add-fields.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tool_id, fields } = req.body;

  if (!tool_id || !Array.isArray(fields)) {
    return res.status(400).json({ error: "Missing or invalid input." });
  }

  const insertFields = fields.map((f: any) => ({
    tool_id,
    name: f.name,
    label: f.label,
  }));

  const { error } = await supabase.from("tool_fields").insert(insertFields);

  if (error) {
    console.error("Error adding tool fields:", error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: "Fields added successfully." });
}
