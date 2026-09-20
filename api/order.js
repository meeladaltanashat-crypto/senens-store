const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const order = req.body;

    if (!order || !order.id || !order.items || !order.items.length) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    await pool.query(
      `INSERT INTO orders 
       (id, first_name, last_name, email, address, city, postal, country, notes, subtotal, shipping_cost, shipping, total, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        order.id,
        order.firstName || null,
        order.lastName || null,
        order.email || null,
        order.address || null,
        order.city || null,
        order.postal || null,
        order.country || null,
        order.notes || null,
        order.subtotal || 0,
        order.shippingCost || 0,
        order.shipping || 'standard',
        order.total || 0,
        JSON.stringify(order.items)
      ]
    );

    res.status(200).json({ success: true, orderId: order.id });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: 'Failed to save order', details: err.message });
  }
};
