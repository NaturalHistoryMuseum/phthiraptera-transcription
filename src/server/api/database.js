const { Client, Pool } = require('pg');
const { localities, typeStatuses, hostTypes } = require('../../components/form-fields');
const countries = require('../../data/countries.json');
const validator = require('../validator');
const getenv = require('getenv');

const connectionString = getenv('DATABASE_URL', '');

const pool = new Pool(
  connectionString ? {
    connectionString,
    ssl: true
  } : {
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
  const client = await pool.connect();

  try {
    return await fn(client, ...args);
  } finally {
    await client.release();
  }
}


module.exports = {
  saveTranscription: connect(async (client, data) => {
    const { rowCount } = await query(client)`SELECT * FROM images WHERE barcode=${data.barcode}`;
    const date = new Date(data.collection_year, data.collection_month - 1, data.collection_day);

    const validate = validator();

    validate(rowCount >= 1,`Unknown asset with barcode ${data.barcode}`);
    validate(localities.includes(data.locality), `Invalid locality "${data.locality}"`);
    validate(!data.country || countries.includes(data.country), `Invalid country "${data.country}"`);
    validate(!!data.host, `Host must not be empty`);
    validate(hostTypes.includes(data.host_type), `Invalid host type "${data.host_type}"`);
    const validDate = !isNaN(date) && data.collection_year > 0 && data.collection_month > 0 && data.collection_day > 0;
    validate(validDate, `Invalid date: ${data.collection_year}-${data.collection_month}-${data.collection_day}`);
    validate(date < Date.now(), `Date must be in the past.`)
    validate(!!data.collector, `Collector must not be empty`)
    validate(!!typeStatuses.includes(data.type_status), `Invalid type status "${data.type_status}`)
    validate(!!data.registration_number, `Registration number must not be empty`)
    validate(data.total_count > 0, `Total count must be > 0`)

    await validate.throw();

    const stage = data.stage || [];

    return query(client)`
      INSERT INTO fields (
        barcode,
        locality,
        country,
        precise_locality,
        host,
        host_type,
        collection_date,
        collection_range,
        collector,
        type_status,
        registration_number,
        total_count,
        adult_female,
        adult_male,
        nymph
      )
      VALUES(
        ${data.barcode},
        ${data.locality},
        ${data.country},
        ${data.precise_locality},
        ${data.host},
        ${data.host_type},
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
  }),
  readData: connect(async (client) => {
    return query(client)`SELECT * FROM fields`;
  })
}
