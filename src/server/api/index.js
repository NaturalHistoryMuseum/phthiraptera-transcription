const express = require('express');
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres'
});

const nextAsset = async () => {
  try {
    await client.connect();

    var { rows: [row] } = await client.query(`
      select * from images where asset_id is not null limit 1;
    `);
  } finally {
    await client.end();
  }

  return row;
}

const app = express.Router();

app.use(async (req, res, next) => {
  try {
    res.json(await nextAsset());
  } catch(e) {
    next(e)
  } finally {

  }
});

module.exports = {
  app,
  nextAsset
};
