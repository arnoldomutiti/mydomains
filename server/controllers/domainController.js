const axios = require('axios');
const db = require('../database');
const config = require('../config/config');

const getAllDomains = (req, res) => {
  const sql = `SELECT * FROM domains WHERE user_id = ?`;

  db.all(sql, [req.user.id], (err, rows) => {
    if (err) {
      console.error('Get domains error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    const domains = rows.map(row => ({
      ...row,
      fullDetails: JSON.parse(row.full_details || '{}')
    }));

    res.json(domains);
  });
};

const createDomain = (req, res) => {
  const { name, created_date, expiry_date, registrar, status, fullDetails } = req.body;

  const sql = `INSERT INTO domains (user_id, name, created_date, expiry_date, registrar, status, full_details)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    req.user.id,
    name,
    created_date,
    expiry_date,
    registrar,
    status,
    JSON.stringify(fullDetails)
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Create domain error:', err.message);
      return res.status(500).json({ error: 'Failed to save domain' });
    }

    res.json({
      id: this.lastID,
      message: 'Domain saved successfully'
    });
  });
};

const deleteDomain = (req, res) => {
  const sql = `DELETE FROM domains WHERE id = ? AND user_id = ?`;

  db.run(sql, [req.params.id, req.user.id], function (err) {
    if (err) {
      console.error('Delete domain error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    res.json({ message: 'Domain deleted successfully' });
  });
};

const getWhoisInfo = async (req, res) => {
  const { domain } = req.params;

  if (!config.whoxyApiKey) {
    console.error('[Config Error] WHOXY_API_KEY is missing from .env');
    return res.status(500).json({ error: 'Server configuration error: API Key missing' });
  }

  try {
    const url = `http://api.whoxy.com/?key=${config.whoxyApiKey}&whois=${domain}`;
    const response = await axios.get(url);

    console.log(`[Whoxy] Fetching ${domain} | Status: ${response.data.status}`);

    if (response.data.status !== 1) {
      console.warn(`[Whoxy Error] Response for ${domain}:`, JSON.stringify(response.data, null, 2));
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from Whoxy:', error.message);
    res.status(500).json({ error: 'Failed to fetch domain data' });
  }
};

module.exports = {
  getAllDomains,
  createDomain,
  deleteDomain,
  getWhoisInfo
};
