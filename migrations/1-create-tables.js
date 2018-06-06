const csv = require('fast-csv');
const fs = require('fs');
const getenv = require('getenv');
const { migrate } = require('postgres-migrations');

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

module.exports.generateSql = async () => {
  let string = `
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
      precise_locality varchar(255) NOT NULL,
      host varchar(255) NOT NULL,
      collection_date date NOT NULL,
      collection_range boolean NOT NULL DEFAULT FALSE,
      collector varchar(255) NOT NULL,
      type_status varchar(255) NOT NULL,
      registration_number varchar(255) NOT NULL,
      total_count integer NOT NULL,
      adult_female boolean NOT NULL DEFAULT FALSE,
      adult_male boolean NOT NULL DEFAULT FALSE,
      nymph boolean NOT NULL DEFAULT FALSE
    );
  `

  let line;

  let i = 0;

  for (const line of await readCsv(require.resolve("./images.csv"))) {
    // process.stdout.clearLine();  // clear current text
    // process.stdout.write(`Importing record ${++i}`);
    // process.stdout.cursorTo(0);

    if (!line.assetID) {
      console.warn(`Found record with no asset ID (barcode: ${line.Barcode}, IRN: ${line['Multimedia IRN']})`);
      continue;
    }

    const sql = `
      INSERT INTO images
        (barcode, irn, label, asset_id)
      VALUES
        ('${line.Barcode}',
         '${line['Multimedia IRN']}',
         '${line['Image 1/2']}',
         '${line.assetID || null}'
        );
    `
    
    string += sql;
  }

  // console.log(`Imported ${i} records`)

  return string;
}
