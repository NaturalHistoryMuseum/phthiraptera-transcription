const { Pool, types } = require('pg');
const jwt = require('jsonwebtoken');
const { localities, typeStatuses, hostTypes } = require('../../components/form-fields');
const countries = require('../../data/countries.json');
const validator = require('../validator');
const getenv = require('getenv');
const axios = require('axios')
const sql = require('sql-tag')

const JWT_KEY = getenv('JWT_KEY', 'IJQLX9J9DU8Q');

// Output the DATE type as just a tex string
types.setTypeParser( 1082, 'text', v => v);

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
    const { barcode, exp } = jwt.verify(data.token, JWT_KEY, { ignoreExpiration: true });

    if (exp < Date.now()) {
      if((await client.query(sql`SELECT * FROM fields WHERE barcode=${barcode}`)).rowCount > 0) {
        return;
        //throw new Error('This slide was transcribed while you were filling out the form. Please refresh and try another.');
      }
    }

    const validate = validator();

    const host = data.host || data.host_other;

    const collectors = data.collector_surnames.map((surname, index) => ({
      surname,
      initials: data.collector_initials[index]
    })).filter(c => c.surname || c.initials)

    validate(localities.includes(data.locality), `Invalid locality "${data.locality}"`);
    validate(!data.country || countries.includes(data.country), `Invalid country "${data.country}"`);
    validate(!data.host_type || hostTypes.includes(data.host_type), `Invalid host type "${data.host_type}"`);
    validate(!(data.host && data.host_other), 'Fill in either "Host" or "Host (other)", but not both')
    for(const typeStatus of (data.type_statuses || [])) {
      validate(!!typeStatuses.includes(typeStatus), `Invalid type status "${typeStatus}`)
    }
    validate(!data.total_count ||  data.total_count > 0, `Total count must be > 0 or empty`)
    validate(!!data.user_email, 'User email must not be empty.')
    validate(collectors.every(c => c.surname), `Add surname to all collectors`)
    validate(data.notes.length <= 255, 'Explanation must be 255 characters or less')

    await validate.throw();

    const stage = data.stage || [];

    return client.query(sql`
      INSERT INTO fields (
        barcode,
        locality,
        country,
        precise_locality,
        host,
        host_type,
        collection_year,
        collection_month,
        collection_day,
        collection_range,
        collectors,
        type_statuses,
        registration_number,
        total_count,
        adult_female,
        adult_male,
        nymph,
        user_email,
        requires_verification,
        notes
      )
      VALUES(
        ${barcode},
        ${data.locality},
        ${data.country},
        ${data.precise_locality},
        ${host},
        ${data.host_type},
        ${data.collection_year},
        ${data.collection_month},
        ${data.collection_day},
        ${!!data.collection_range},
        ${JSON.stringify(collectors)},
        ${JSON.stringify((data.type_statuses || []).filter(Boolean))},
        ${data.registration_number},
        ${data.total_count || null},
        ${!!stage.includes('adult female(s)')},
        ${!!stage.includes('adult male(s)')},
        ${!!stage.includes('nymph(s)')},
        ${data.user_email},
        ${!!data.requires_verification},
        ${data.notes}
      );`)
  }),
  nextAsset: connect(async (client, opts = {}) => {
    const timeoutMins = getenv('TIMEOUT_MINS', '5');

    const { rows } = opts.empty ? { rows: [] } : await client.query(`
      SELECT images.*
      FROM images
        LEFT JOIN fields ON images.barcode = fields.barcode
      WHERE images.asset_id IS NOT NULL
        AND fields.barcode IS NULL
        AND (
          access_date IS NULL
          OR access_date < NOW() - INTERVAL '${timeoutMins} minutes'
        )
      ORDER BY images.barcode;
    `);

    if (rows.length === 0) {
      return null;
    }

    const barcode = opts.multiple ?
      (rows.find(r => r.label === "image 2")).barcode :
      rows[0].barcode;

    await client.query(sql`UPDATE images SET access_date=NOW() WHERE barcode=${barcode}`);

    const result = axios.get(`http://data.nhm.ac.uk/api/action/datastore_search?resource_id=05ff2255-c38a-40c9-b657-4ccb55ab2feb&limit=5&q=${barcode}`)

    const assets = rows.filter(row => row.barcode === barcode);

    const record = (await result).data.result.records[0];
    const scientificName = record.genus + ' ' + record.specificEpithet;
    // or record.scientificName

    const token = jwt.sign({barcode}, JWT_KEY, {
      expiresIn: `${timeoutMins} minutes`
    });

    return {
      scientificName,
      assets,
      token
    };
  }),

  readData: connect(async (client) => {
    return client.query(sql`SELECT * FROM fields`);
  }),

  release: connect(async (client, token) => {
    try {
      const { barcode } = jwt.verify(token, JWT_KEY);
      await client.query(sql`UPDATE images SET access_date=null WHERE barcode=${barcode}`);
    } catch(e) {
      console.log(e);
    }
  })
}
