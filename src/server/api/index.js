const express = require('express');
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres'
});

const app = express.Router();

app.use(async (req, res, next) => {
  try {
    await client.connect();

    const { rows } = await client.query(`
      select * from images where asset_id is not null limit 1;
    `);

    res.json(rows[0]);
  } catch(e) {
    console.log(e)
    next(e)
  } finally {
    client.end();
  }
});

module.exports = app;
