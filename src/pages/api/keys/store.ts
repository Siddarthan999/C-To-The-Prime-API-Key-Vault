// pages/api/keys/store.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, tool_id, values } = req.body;

  if (!user_id || !tool_id || !values || typeof values !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const { data, error } = await supabase
    .from('credentials')
    .upsert(
      { user_id, tool_id, values },
      { onConflict: 'user_id,tool_id' }
    )
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({
    message: 'Credentials stored successfully',
    data,
  });
}
