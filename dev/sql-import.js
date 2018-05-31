const { Client } = require('pg');
const csv = require('fast-csv');
const fs = require('fs')

const readCsv = file => new Promise((resolve, reject) => {
  const rows = [];
  
  const csvStream = fs.createReadStream(file)
  .pipe(csv({
    headers: true
  }))
  .on('data', data => {
    rows.push(data)
  })
  .on('error', err => {
    reject(err)
  })
  .on('end', () => resolve(rows))
})

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres'
});

(async () => {
  await client.connect()

  const rx = await client.query(`
    SELECT EXISTS (
    SELECT 1 
    FROM   information_schema.tables
    WHERE  table_name = 'images'
  );`)

  const { rows: [result] } = rx;

  if (result.exists) {
    return
  }

  await client.query(`
    CREATE TABLE images (
      barcode varchar(9) NOT NULL,
      irn varchar(7) NOT NULL,
      label varchar(7) NOT NULL,
      asset_id varchar(40) UNIQUE,
      PRIMARY KEY (barcode, irn)
    );
    
    CREATE TABLE fields (
      barcode varchar(9) PRIMARY KEY,
      locality varchar(255) NOT NULL,
      country varchar(255) NOT NULL,
      precise_locality varchar(255) NOT NULL
    );
  `)

  let line;

  console.log('Importing records...')

  let i = 0;

  for (const line of await readCsv(require.resolve("./images.csv"))) {
    process.stdout.clearLine();  // clear current text
    process.stdout.write(String(++i));
    process.stdout.cursorTo(0);
    if (!line.assetID) {
      console.warn(`Found record with no asset ID (barcode: ${line.Barcode}, IRN: ${line['Multimedia IRN']})`);
      continue;
    }
    const sql = `INSERT INTO images (barcode, irn, label, asset_id)
    VALUES('${line.Barcode}', '${line['Multimedia IRN']}', '${line['Image 1/2']}', '${line.assetID || null}')`

    await client.query(sql)
  }

  console.log(`Imported ${i} records`)
})().catch(e => {
  console.log(e)
}).then(() => {
  client.end()
})
