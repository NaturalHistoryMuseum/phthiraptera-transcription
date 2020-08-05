const { Pool, types } = require('pg');
const { localities: localityMap, typeStatuses, hostTypes } = require('../../data/form.json');
const countries = require('../../data/countries.json');
const validator = require('../validator');
const getenv = require('getenv');
const axios = require('axios')
const { default: sql, join, raw, empty } = require('sql-template-tag')
const hosts = require('../../data/hosts.json');

const localities = Object.keys(localityMap);

const DATE_MATCH = /^(?:([0-9]{4})|--)(?:(?:(?:\b-)?([0-9]{2})|-)([0-9]{2})?)?$/;

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

  if(c('collector_surnames')) validate(mapCollectors(data).every(c => c.surname), `Add surname to all collectors`)
  if(c('notes')) validate(data.notes.length <= 255, 'Explanation must be 255 characters or less')
  if(c('collection_date.end')) {
    const match = data['collection_date.end'].match(DATE_MATCH);

    if(match) {
      const [, year, month, day] = match;
      validate(!(!!year && !!day && !month), 'If collection end date includes year and day, it must also include month.');
    } else {
      validate(!data['collection_date.end'], 'Invalid end date ' + data['collection_date.end']);
    }
  }

  return validate.throw();
}

/**
 * Select distinct transcription values for a given row
 * @param {Client} client Postgres client
 * @param {string} field Field name
 * @param {Sql} where Sql query for adding to the end of where clause
 */
async function selectDistinct(client, field, where=empty){
  const fieldname = raw(field);
  const select = sql`SELECT DISTINCT ${fieldname} from fields WHERE ${fieldname} is not null and ${fieldname} != '' ${where}`;
  const { rows } = await client.query(select);
  return rows.map(c => c[field]);
}

module.exports = {
  /**
   * Add a new transcription to the database
   * @param data A map of the data to add
   * @param user The user who added the data
   */
  saveTranscription: connect(async (client, data, user) => {
    const barcode = data.barcode[0];

    data.country = data.country || '';
    data.host_type = data.host_type || '';
    await validateTranscription(data);

    const collectors = mapCollectors(data);

    const stage = data.stage || [];
    const host = data.host || data.host_other;
    const orcid = user.orcid;

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
        collection_date_end,
        collectors,
        collection,
        type_statuses,
        registration_number,
        total_count,
        adult_female,
        adult_male,
        nymph,
        requires_verification,
        notes,
        date,
        transcriber_id,
        transcriber_name
      )
      VALUES(
        ${barcode},
        ${data.locality},
        ${data.country},
        ${data.precise_locality},
        ${host},
        ${data.host_type},
        ${data['collection_date.year']},
        ${data['collection_date.month']},
        ${data['collection_date.day']},
        ${!!data['collection_date.end']},
        ${data['collection_date.end']},
        ${JSON.stringify(collectors)},
        ${data.collection},
        ${JSON.stringify((data.type_statuses || []).filter(Boolean))},
        ${data.registration_number},
        ${data.total_count || null},
        ${!!stage.includes('adult female(s)')},
        ${!!stage.includes('adult male(s)')},
        ${!!stage.includes('nymph(s)')},
        ${!!data.requires_verification},
        ${data.notes},
        NOW(),
        ${orcid},
        ${user.name}
      );`)
  }),
  /**
   * Update an existing transcription
   * @param data A map of the data to add
   * @param user The user who did the update
   */
  updateTranscriptions: connect(async (client, data, user) => {
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
        'collection',
        'type_statuses',
        'registration_number',
        'total_count',
        'requires_verification',
        'notes'
      ].map(k => [k ,k])),
      collection_year: 'collection_date.year',
      collection_month: 'collection_date.month',
      collection_day: 'collection_date.day',
      collection_date_end: 'collection_date.end',
      collection_range: 'collection_date.end',
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
      collection_year: data['collection_date.year'],
      collection_month: data['collection_date.month'],
      collection_day: data['collection_date.day'],
      collection_date_end: data['collection_date.end'],
      collection_range: !!data['collection_date.end'],
      collectors: JSON.stringify(collectors),
      collection: data.collection,
      type_statuses: JSON.stringify((data.type_statuses || []).filter(Boolean)),
      registration_number: data.registration_number,
      total_count: data.total_count || null,
      adult_female: !!stage.includes('adult female(s)'),
      adult_male: !!stage.includes('adult male(s)'),
      nymph: !!stage.includes('nymph(s)'),
      requires_verification: !!data.requires_verification,
      notes: data.notes,
    };

    const q = sql`
      UPDATE fields
      SET
        ${join(sqlFields.map(field => sql`
          ${raw(field)} = ${values[field]}`
        ))},
        transcriber_id = ${user.orcid},
        transcriber_name = ${user.name}
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
   * Get a list of values previously entered into various fields
   */
  getSuggestions: connect(
    async client => {
      return {
        collection: await selectDistinct(client, 'collection'),
        preciseLocality: await selectDistinct(client, 'precise_locality'),
        host: await selectDistinct(client, 'host', sql`AND host != ALL(${hosts})`)
      }
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

  /**
   * Get the name and barcode of the 5 most recent entries
   */
  getRecent: connect(
    async client => {
      const select = sql`SELECT fields.barcode, info.sciname FROM fields LEFT JOIN info ON (info.barcode = fields.barcode) ORDER BY fields.date DESC NULLS LAST LIMIT 5`;
      const { rows } = await client.query(select);
      return rows;
    }
  ),

  /**
   * Update all records whose transcriber email matches the given email,
   * and set the transcriber_* fields to the given user
   * @param {string} email The email address to search for
   * @param {object} user The user details to assign
   */
  updateTranscriber: connect(
    async (client, email, user) => {
      const orcid = user.orcid;
      await client.query(`UPDATE fields SET transcriber_name=${user.name}, transcriber_id=${orcid} WHERE user_email=${email}`);
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
