// pages/api/tools/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tool_id } = req.body;

  if (!tool_id) {
    return res.status(400).json({ error: "Missing tool_id" });
  }

  const { error: fieldError } = await supabase
    .from("tool_fields")
    .delete()
    .eq("tool_id", tool_id);

  const { error: toolError } = await supabase
    .from("tools")
    .delete()
    .eq("id", tool_id);

  if (fieldError || toolError) {
    console.error("Error deleting tool:", fieldError || toolError);
    return res.status(500).json({ error: "Failed to delete tool" });
  }

  return res.status(200).json({ message: "Tool deleted successfully" });
}
