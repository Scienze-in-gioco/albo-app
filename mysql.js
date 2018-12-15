const { 
  e = "local",
  env = e
} = require("simple-argv")

const mysql = require("mysql")
const config = require(`./db-config-${env}.json`)

const pool = mysql.createPool({
  connectionLimit: 10,
  ...config
})

module.exports = pool