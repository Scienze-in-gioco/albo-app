const express = require("express")
const router = new express.Router()
const { parseNumber } = require("./utils")
const tables = ["schools", "subjects", "students", "tags", "competitions", "results", "users"]
const pool = require("./mysql")
const jwt = require("jsonwebtoken")
const md5 = require('md5')

const secret = "csaffjioijcemoijoijoijoijoijoijj"

const authMiddleware =(req, res, next) => {
  const token = req.get("authorization")
  jwt.verify(token, secret, (err, data) => {
    if (err) {
      res.status(403).json({ message: err.message })
    } else {
      next()
    }
  })
}

router.use((req, res, next) => {
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

router.get("/test", (req, res) => {
  const sql = `
SELECT
  st.id AS studentId,
  st.name,
  st.surname,
  st.cf,
  st.schoolId,

  sc.id AS schoolId,
  sc.name AS schoolName
FROM students AS st
INNER JOIN schools AS sc ON st.schoolId = sc.id
ORDER BY studentId
LIMIT 30
  `
  pool.query(sql, (err, data) => {
    if (err) {
      res.error(err)
    } else {
      res.json(data)
    }
  })
})

const hashPassword = password => md5(`${secret}${password}${secret}`)

router.post("/signup", authMiddleware, ({ body }, res) => {
  body.password = hashPassword(body.password)
  pool.query(`SELECT email FROM users WHERE email=${pool.escape(body.email)}`, (err, results) => {
    if (err) {
      res.error(err)
    } else {
      if (!results.length) {
        pool.query(`INSERT INTO users SET ?`, body, (err, results) => {
          if (err) {
            res.error(err)
          } else {
            res.status(201).json({ message: "user created" })
          }
        })
      } else {
        res.status(400).json({ message: "email already used" })
      }
    }
  })
})

router.post("/login", ({ body: { email, password } }, res) => {
  pool.query(`SELECT email FROM users WHERE email=${pool.escape(email)} AND password="${hashPassword(password)}"`, (err, results) => {
    if (err) {
      return res.error(err)
    }

    if (results.length) {
      const token = jwt.sign({
        email,
        admin: true
      }, secret, { algorithm: "HS512" })

      res.json({token})
    } else {
      res.status(401).json({ message: "wrong email or password"})
    }
  })
})

module.exports = router