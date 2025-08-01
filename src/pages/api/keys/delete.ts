// pages/api/keys/delete.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, tool_id } = req.body;

  if (!user_id || !tool_id) {
    return res.status(400).json({ error: 'Missing user_id or tool_id' });
  }

  const { error } = await supabase
    .from('credentials')
    .delete()
    .eq('user_id', user_id)
    .eq('tool_id', tool_id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Credential deleted successfully' });
}
