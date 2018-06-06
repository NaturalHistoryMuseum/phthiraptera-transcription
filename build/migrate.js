const { Client } = require('pg');
const csv = require('fast-csv');
const fs = require('fs');
const getenv = require('getenv');
const { migrate } = require('postgres-migrations');
const { parse } = require('pg-connection-string');
 
const connectionString = getenv('DATABASE_URL', '')

// See https://github.com/ThomWright/postgres-migrations/issues/14
const cfg = connectionString ? {
    ...parse(connectionString),
    ssl: true
  } : {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    port: 5432,
    password: ''
  };
cfg.port = Number(cfg.port);

module.exports = () => migrate(cfg, './migrations')

if (require.main === module) {
  module.exports();
}
