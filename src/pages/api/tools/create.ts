import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, name, user_id, fields } = req.body;

  if (!id || !name || !user_id || !Array.isArray(fields)) {
    console.error("Missing required fields", { id, name, user_id, fields });
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  // Insert tool
  const { error: toolError } = await supabase.from("tools").insert([{ id, name, user_id }]);
  if (toolError) {
    console.error("Error inserting tool:", toolError.message);
    return res.status(500).json({ error: toolError.message });
  }

  // Prepare tool fields
  const toolFields = fields.map((f: any) => ({
    tool_id: id,
    name: f.name,
    label: f.label,
  }));

  const { error: fieldError } = await supabase.from("tool_fields").insert(toolFields);
  if (fieldError) {
    console.error("Error inserting tool fields:", fieldError.message);
    return res.status(500).json({ error: fieldError.message });
  }

  return res.status(200).json({ message: "Tool created successfully" });
}
