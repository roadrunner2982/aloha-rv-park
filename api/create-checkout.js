import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = {
  '20lb': { name: '20 LB Propane Tank', unitAmount: 1800, unit: 'tank', maxQty: 20 },
  '30lb': { name: '30 LB Propane Tank', unitAmount: 3000, unit: 'tank', maxQty: 20 },
  '40lb': { name: '40 LB Propane Tank', unitAmount: 3600, unit: 'tank', maxQty: 20 },
  forklift: { name: 'Forklift Propane Tank', unitAmount: 3600, unit: 'tank', maxQty: 20 },
  motorhome: { name: 'Motor Home 40LB Tank Fill', unitAmount: 425, unit: 'gallon', maxQty: 200 },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, quantity, lotId, customerEmail } = req.body || {};

    const product = PRODUCTS[productId];
    if (!product) {
      return res.status(400).json({ error: 'Producto inválido' });
    }

    const isGallon = product.unit === 'gallon';
    const rawQty = isGallon ? parseFloat(quantity) : parseInt(quantity, 10);

    if (!Number.isFinite(rawQty) || rawQty <= 0) {
      return res.status(400).json({ error: 'Cantidad inválida' });
    }
    if (rawQty > product.maxQty) {
      return res.status(400).json({ error: `Cantidad máxima: ${product.maxQty}` });
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;

    // Stripe no acepta cantidades con decimales, así que para productos por galón
    // calculamos el precio total exacto y usamos quantity: 1
    const lineItemAmount = isGallon
      ? Math.round(product.unitAmount * rawQty)
      : product.unitAmount;
    const lineItemQty = isGallon ? 1 : rawQty;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: isGallon ? `${rawQty} gallons × $4.25` : `Quantity: ${rawQty}`,
            },
            unit_amount: lineItemAmount,
          },
          quantity: lineItemQty,
        },
      ],
      metadata: {
        productId,
        quantity: String(rawQty),
        lotId: lotId || '',
        park: 'aloha-rv-park',
      },
      success_url: `${origin}/?propane_payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?propane_payment=cancelled`,
    });

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: 'No se pudo crear la sesión de pago' });
  }
}
