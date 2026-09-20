const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT product_id, COUNT(*) as count FROM likes GROUP BY product_id'
      );
      const likes = {};
      result.rows.forEach(row => {
        likes[row.product_id] = parseInt(row.count);
      });
      return res.status(200).json(likes);
    }

    if (req.method === 'POST') {
      const { productId, action, userId } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'productId required' });
      }

      if (action === 'unlike') {
        await pool.query(
          'DELETE FROM likes WHERE product_id = $1 AND user_id = $2',
          [productId, userId || 'anon']
        );
      } else {
        await pool.query(
          'INSERT INTO likes (product_id, user_id) VALUES ($1, $2)',
          [productId, userId || 'anon']
        );
      }

      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM likes WHERE product_id = $1',
        [productId]
      );
      return res.status(200).json({
        success: true,
        productId,
        count: parseInt(countResult.rows[0].count)
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Failed to process like', details: err.message });
  }
};
