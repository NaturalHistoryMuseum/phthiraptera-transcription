const { Client, Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres'
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Tag to make use of pg parameterised queries
const query = client => (strings, ...params) => {
  const q = strings.reduce((query, part, ix) => `${query}$${ix}${part}`)
  return client.query(q, params)
}

// Helper function to connect & disconnect
const connect = fn => async (...args) => {
  try {
    client = await pool.connect();

    var rtn = await fn(client, ...args);
  } finally {
    await client.release();
  }

  return rtn;
}

module.exports = {
  saveTranscription: connect(async (client, data) => {
    const { rowCount } = await query(client)`SELECT * FROM images WHERE barcode=${data.barcode}`;
    if (rowCount < 1) {
      throw new Error(`Unknown asset with barcode ${data.barcode}`);
    }

    return query(client)`INSERT INTO fields (barcode) VALUES(${data.barcode});`
  }),
  nextAsset: connect(async (client) => {
   const { rows } = await query(client)`
      SELECT images.*
      FROM images
        LEFT JOIN fields ON images.barcode = fields.barcode
      WHERE images.asset_id IS NOT NULL
        AND fields.barcode IS NULL;
    `
    const bc =
      //(rows.find(r => r.label === "image 2")).barcode
      rows[0].barcode
    return rows.filter(row => row.barcode === bc);
  }
  )
}
