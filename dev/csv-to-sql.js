const csv = require('fast-csv');
const fs = require('fs');
const stream = require('stream');

const readCsv = file => new Promise((resolve, reject) => {
  const rows = [];

  if (!file instanceof stream.Readable) {
    file = fs.createReadStream(file)
  }
  
  file.pipe(csv({
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

module.exports = async (file) => {
  let string = '';

  for (const line of await readCsv(file)) {
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

if (require.main === module) {
  module.exports(process.stdin).then(
    sql => console.log(sql)
  )
}
