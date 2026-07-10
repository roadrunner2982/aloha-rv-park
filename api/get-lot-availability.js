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
    const { lotId } = req.query;
    if (!lotId) {
      return res.status(400).json({ error: 'Missing lot ID' });
    }

    const { data, error } = await supabase
      .from('lot_orders')
      .select('arrival_date, departure_date')
      .eq('lot_id', lotId)
      .eq('status', 'paid')
      .not('arrival_date', 'is', null)
      .not('departure_date', 'is', null);

    if (error) throw error;

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('Error fetching lot availability:', err);
    return res.status(500).json({ error: 'Could not fetch availability' });
  }
}
