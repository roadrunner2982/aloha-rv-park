import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('storage_pricing')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching storage pricing:', err);
    return res.status(500).json({ error: 'Could not fetch pricing' });
  }
}
