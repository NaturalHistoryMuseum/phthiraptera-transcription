const { Pool, types } = require('pg');
const jwt = require('jsonwebtoken');
const { localities: localityMap, typeStatuses, hostTypes } = require('../../data/form.json');
const countries = require('../../data/countries.json');
const validator = require('../validator');
const getenv = require('getenv');
const axios = require('axios')
const { default: sql, join, raw } = require('sql-template-tag')
const hosts = require('../../data/hosts.json');

const JWT_KEY = getenv('JWT_KEY', 'IJQLX9J9DU8Q');
const localities = Object.keys(localityMap);

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

async function getScientificName(barcode){
  const url = `http://data.nhm.ac.uk/api/action/datastore_search?resource_id=05ff2255-c38a-40c9-b657-4ccb55ab2feb&limit=5&q=${barcode}`;

  const httpClient = axios.create();
  httpClient.defaults.timeout = 2500;
  const result = httpClient.get(url);

  try {
    const record = (await result).data.result.records[0];
    const sciName = record.specificEpithet ? record.genus + ' ' + record.specificEpithet : record.scientificName;
    return sciName;
  } catch(e) {
    console.warn('Data portal appears to be down; ' + e.toString());
  }
}

function mapCollectors(data){
  return data.collector_surnames ? data.collector_surnames.map((surname, index) => ({
    surname,
    initials: data.collector_initials[index]
  })).filter(c => c.surname || c.initials) : []
}

function validateTranscription(data, ignoreEmpty) {
  const validate = validator();

  if('type_statuses' in data) {
    data.type_statuses = data.type_statuses.filter(s => s!='');
  }

  const c = f => (!ignoreEmpty || (f in data));

  if(c('locality')) validate(localities.includes(data.locality), `Invalid locality "${data.locality}"`);
  if(c('country')) validate(!data.country || countries.includes(data.country), `Invalid country "${data.country}"`);
  if(c('host_type')) validate(!data.host_type || hostTypes.includes(data.host_type), `Invalid host type "${data.host_type}"`);
  if(c('host') || c('host_other')) validate(!(data.host && data.host_other), 'Fill in either "Host" or "Host (other)", but not both')
  if(c('type_statuses'))
  for(const typeStatus of (data.type_statuses || [])) {
    validate(!!typeStatuses.includes(typeStatus), `Invalid type status "${typeStatus}`)
  }
  if(c('total_count')) validate(!data.total_count ||  data.total_count > 0, `Total count must be > 0 or empty`)

  validate(!!data.user_email, 'User email must not be empty.')

  if(c('collector_surnames')) validate(mapCollectors(data).every(c => c.surname), `Add surname to all collectors`)
  if(c('notes')) validate(data.notes.length <= 255, 'Explanation must be 255 characters or less')

  return validate.throw();
}

module.exports = {
  saveTranscription: connect(async (client, data) => {
    const barcode = data.barcode[0];

    data.country = data.country || '';
    data.host_type = data.host_type || '';
    await validateTranscription(data);

    const collectors = mapCollectors(data);

    const stage = data.stage || [];
    const host = data.host || data.host_other;

    await (client.query(sql`
      INSERT INTO info (barcode, thumbnails, sciName)
      VALUES(${barcode}, ${JSON.stringify(data.thumbnail)}, ${data.sciName})
    `).catch(e => {
      console.error(e);
    }));

    // Remove any previously entered fields
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
        collection,
        type_statuses,
        registration_number,
        total_count,
        adult_female,
        adult_male,
        nymph,
        user_email,
        requires_verification,
        notes,
        date
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
        ${data.collection},
        ${JSON.stringify((data.type_statuses || []).filter(Boolean))},
        ${data.registration_number},
        ${data.total_count || null},
        ${!!stage.includes('adult female(s)')},
        ${!!stage.includes('adult male(s)')},
        ${!!stage.includes('nymph(s)')},
        ${data.user_email},
        ${!!data.requires_verification},
        ${data.notes},
        NOW()
      );`)
  }),
  updateTranscriptions: connect(async (client, data) => {
    const barcodes = data.barcode;

    await validateTranscription(data, true);

    const collectors = mapCollectors(data);

    const stage = data.stage || [];
    const host = data.host || data.host_other;

    const fields = {
      ...Object.fromEntries([
        'locality',
        'country',
        'precise_locality',
        'host_type',
        'collection_year',
        'collection_month',
        'collection_day',
        'collection_range',
        'collection',
        'type_statuses',
        'registration_number',
        'total_count',
        'user_email',
        'requires_verification',
        'notes'
      ].map(k => [k ,k])),
      host: ['host', 'host_other'],
      collectors: ['collector_surnames','collector_initials'],
      adult_female: 'stage',
      adult_male: 'stage',
      nymph: 'stage'
    }

    const sqlFields = Object.keys(fields).filter(k => {
      if(Array.isArray(fields[k])) {
        return fields[k].some(n => n in data);
      } else {
        return fields[k] in data;
      }
    });

    const values = {
      locality: data.locality,
      country: data.country,
      precise_locality: data.precise_locality,
      host: host,
      host_type: data.host_type,
      collection_year: data.collection_year,
      collection_month: data.collection_month,
      collection_day: data.collection_day,
      collection_range: !!data.collection_range,
      collectors: JSON.stringify(collectors),
      collection: data.collection,
      type_statuses: JSON.stringify((data.type_statuses || []).filter(Boolean)),
      registration_number: data.registration_number,
      total_count: data.total_count || null,
      adult_female: !!stage.includes('adult female(s)'),
      adult_male: !!stage.includes('adult male(s)'),
      nymph: !!stage.includes('nymph(s)'),
      user_email: data.user_email,
      requires_verification: !!data.requires_verification,
      notes: data.notes,
    };

    const q = sql`
      UPDATE fields
      SET ${join(sqlFields.map(field => sql`
        ${raw(field)} = ${values[field]}`
      ))}
      WHERE barcode = ANY(${barcodes})
    `;

    return client.query(q)
  }),
  getNextBarcode: connect(async client => {
    const timeoutMins = getenv('TIMEOUT_MINS', '5');
    const { rows } = await client.query(`
      SELECT images.*
      FROM images
        LEFT JOIN fields ON images.barcode = fields.barcode
      WHERE images.asset_id IS NOT NULL
        AND fields.barcode IS NULL
        AND (
          access_date IS NULL
          OR access_date < NOW() - INTERVAL '${timeoutMins} minutes'
        )
      ORDER BY images.order;
    `);

    if (rows.length === 0) {
      return null;
    }

    const barcode = rows[0].barcode;

    await client.query(sql`UPDATE images SET access_date=NOW() WHERE barcode=${barcode}`);

    return barcode;
  }),
  getAssets: connect(async (client, barcodes, editing, copyFrom) => {
    const { rows: assets } = await client.query(sql`
      SELECT * FROM images WHERE barcode = ANY(${barcodes})
    `);

    const { rows: fields } = await client.query(sql`
      SELECT * FROM fields WHERE barcode = ANY(${[copyFrom, ...barcodes]})
    `);

    let scientificName;

    if(barcodes.length > 1) {
      scientificName = `${barcodes.length} transcriptions`
    } else {
      scientificName = await getScientificName(barcodes[0]);
    }

    if(editing) {
      scientificName = 'Editing ' + scientificName;
    }

    const { rows: [ count ] } = await client.query(`select (select count(distinct(barcode)) from images) as total, (select count(*) from fields) as completed`);

    return {
      scientificName,
      assets,
      fields,
      ...count
    };
  }),

  readData: connect(
    async (client) =>
      (await client.query(sql`SELECT * FROM fields`))
        .rows.map(r => ({
          ...r,
          is_free_text: !hosts.includes(r.host)
        }))
  ),

  /**
   * Get a list of values previously entered into the collections field
   */
  getCollections: connect(
    async client => {
      const { rows } = await client.query(sql`SELECT DISTINCT collection from fields where collection is not null and collection != ''`);
      return rows.map(c => c.collection);
    }
  ),

  getTranscriptions: connect(
    async (client, options) => {
      let barcodes = Array.isArray(options) ? options : null;
      const limit = options.limit || 10;
      const offset = options.offset || 0;

      const select = sql`SELECT fields.*, info.sciname, info.thumbnails FROM fields LEFT JOIN info ON (info.barcode = fields.barcode) ORDER BY fields.date DESC NULLS LAST`;

      const { rows } = await client.query(barcodes ? sql`${select} WHERE barcode = ANY(${barcodes})` : sql`${select} LIMIT ${limit} OFFSET ${offset}`);

      if(!barcodes || !barcodes.length) {
        barcodes = rows.map(r => r.barcode);
      }
      const { rows: images } = await client.query(sql`SELECT * FROM images WHERE barcode = ANY(${barcodes})`);
      const map = {};
      for(const image of images) {
        map[image.barcode] = (map[image.barcode] || []).concat(image.asset_id);
      }

      for(const r of rows) {
        if(!r.sciname) {
          const sciName = await getScientificName(r.barcode);
          if(sciName) {
            await client.query(sql`INSERT INTO info (barcode, sciName) VALUES(${r.barcode}, ${sciName}) ON CONFLICT (barcode) DO UPDATE SET sciName=${sciName}`);
            r.sciname = sciName;
          }
        }
      }

      return Promise.all(rows.map(async r => ({ ...r, scientificName: r.sciname, assets: map[r.barcode] })));
    }
  ),

  release: connect(async (client, token) => {
    try {
      // const { barcode } = jwt.verify(token, JWT_KEY);
      // await client.query(sql`UPDATE images SET access_date=null WHERE barcode=${barcode}`);
    } catch(e) {
      console.log(e);
    }
  })
}
