const express = require("express")
const router = new express.Router()
const { parseNumber } = require("./utils")
const tables = ["schools", "subjects", "students", "tags", "competitions", "results", "users"]
const pool = require("./mysql")

router.get("*", (req, res, next) => {
  const { query: { limit, skip } } = req
  res.locals.limit = parseNumber(limit, 100, 0, 100)
  res.locals.skip = parseNumber(skip, 0, 0)
  next()
})

tables.forEach(table => {
  router.get(`/${table}`, (req, res) => {
    const { locals: { limit, skip } } = res
    pool.query(`SELECT * FROM ${table} LIMIT ${limit} OFFSET ${skip};`, (err, data) => {
      if (err) {
        res.error(err)
      } else {
        res.jsonWithPaginator(data)
      }
    })
  })
})

tables.forEach(table => {
  router.get(`/${table}/:id`, ({ params: { id } }, res) => {
    pool.query(`SELECT * FROM ${table} WHERE id=${pool.escape(id)};`, (err, data) => {
      if (err) {
        res.error(err)
      } else {
        res.json(data)
      }
    })
  })
})

module.exports = router