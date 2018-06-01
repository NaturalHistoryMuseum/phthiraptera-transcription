const { Client, Pool } = require('pg');
const { localities, countries } = require('../../components/form-fields');

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

    return await fn(client, ...args);
  } finally {
    await client.release();
  }
}

module.exports = {
  saveTranscription: connect(async (client, data) => {
    const { rowCount } = await query(client)`SELECT * FROM images WHERE barcode=${data.barcode}`;

    if (rowCount < 1) {
      throw new Error(`Unknown asset with barcode ${data.barcode}`);
    }

    if(!localities.includes(data.locality)) {
      throw new Error(`Invalid locality "${data.locality}"`);
    }

    if(!countries.includes(data.country)) {
      throw new Error(`Invalid country "${data.country}"`);
    }

    if(!data.precise_locality) {
      throw new Error(`Precise locality must not be empty`);
    }

    const stage = data.stage || [];

    return query(client)`
      INSERT INTO fields (
        barcode,
        locality,
        country,
        precise_locality,
        host,
        collection_date,
        collection_range,
        collector,
        type_status,
        registration_number,
        total_count,
        adult_female,
        adult_mail,
        nymph
      )
      VALUES(
        ${data.barcode},
        ${data.locality},
        ${data.country},
        ${data.precise_locality},
        ${data.host},
        ${new Date(data.collection_year, data.collection_month - 1, data.collection_day)},
        ${!!data.collection_range},
        ${data.collector},
        ${data.type_status},
        ${data.registration_number},
        ${data.total_count},
        ${!!stage.includes('adult female')},
        ${!!stage.includes('adult male')},
        ${!!stage.includes('nymph')}
      );`
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
