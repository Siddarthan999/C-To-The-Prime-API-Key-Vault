// pages/api/tools/list.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from("tools")
    .select("id, name, tool_fields(name, label)");

  if (error) {
    console.error("Error fetching tools:", error.message);
    return res.status(500).json({ error: error.message });
  }

  // Rename 'tool_fields' to 'fields' to match frontend expectations
  const tools = data.map((tool) => ({
    id: tool.id,
    name: tool.name,
    fields: tool.tool_fields ?? [],
  }));

  res.status(200).json({ tools });
}
