const { 
  e = "local",
  env = e,
  port = 8080
} = require("simple-argv")
const express = require("express")
const app = new express()
const apiRouter = require("./apiRouter.js")

app.use((req, res, next) => {
  res.error = (err, statusCode = 500) => {
    res.status(statusCode).json({
      error: env === "production" ? err.message : err.stack 
    })
  }

  res.jsonWithPaginator = data => {
    const { skip, limit } = res.locals
    res.json({
      skip,
      limit,
      count: data.length,
      next: skip + limit,
      data
    })
  }

  next()
})

app.get("/", (req, res) => {
  res.send("this is the home page")
})

app.use("/api/", apiRouter)

app.all("*", (req, res) => {
  res.status(404).send("page not found")
})

app.listen(port, () => console.log(`server listening on port ${port}`))