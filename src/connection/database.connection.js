const {Pool} = require("pg");

// pg configuration Local
const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL,
  max: process.env.DB_MAX, // set pool max size to 20
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT, // close idle clients after 1 second
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT, // return an error after 1 second if connection could not be established
  maxUses: process.env.DB_MAX_USERS, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
});
module.exports = db;
