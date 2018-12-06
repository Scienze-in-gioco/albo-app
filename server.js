const { 
  _: [sqlFileName],
  e = "local",
  env = e,
  port = 8080
} = require("simple-argv")
const express = require("express")
const app = new express()
const mysql = require("mysql")
const config = require(`./db-config-${env}.json`)

const pool = mysql.createPool({
  connectionLimit: 10,
  ...config
})

app.get("/", (req, res) => {
  res.send("this is the home page")
})


const parseNumber = (number, defaultValue, min = null, max = null) => {
  number = parseInt(number)

  if (isNaN(number)) {
    return defaultValue
  }

  if (max !== null && number > max) {
    return max
  }

  if (min !== null && number < min) {
    return min
  }

  return number
}

app.get("/api/schools", ({ query: { limit, skip } }, res) => {
  limit = parseNumber(limit, 100, 0, 100)
  skip = parseNumber(skip, 0, 0)
  pool.query(`SELECT * FROM schools LIMIT ${limit} OFFSET ${skip};`, (err, data) => {
    if (err) {
      res.status(500).send(err.stack)
    } else {
      res.json({
        skip,
        limit,
        count: data.length,
        next: skip + limit,
        data
      })
    }
  })
})

app.all("*", (req, res) => {
  res.status(404).send("page not found")
})

app.listen(port, () => console.log(`server listening on port ${port}`))