// pages/api/keys/get.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid user_id' });
  }

  const { data, error } = await supabase
    .from('credentials')
    .select(`
      id,
      values,
      tool_id,
      tools (
        name,
        label,
        fields
      )
    `)
    .eq('user_id', user_id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ credentials: data });
}
