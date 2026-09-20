const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const result = await pool.query(
      'SELECT id, title, style, medium, size, year, likes, sold, price_original, price_digital, description, is_rare, sold_out FROM products ORDER BY id'
    );

    const products = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      style: row.style,
      medium: row.medium,
      size: row.size,
      year: row.year,
      likes: row.likes,
      sold: row.sold,
      price: {
        original: row.price_original,
        digital: row.price_digital
      },
      desc: row.description,
      rare: row.is_rare,
      soldOut: row.sold_out
    }));

    res.status(200).json(products);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};
