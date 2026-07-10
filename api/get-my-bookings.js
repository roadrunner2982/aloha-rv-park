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
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('lot_orders')
      .select('id, lot_id, arrival_date, departure_date, amount_total, status, created_at')
      .eq('customer_email', email)
      .eq('status', 'paid')
      .gte('departure_date', todayStr)
      .order('arrival_date', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return res.status(500).json({ error: 'Could not fetch bookings' });
  }
}
