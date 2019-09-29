const express = require('express')
const router = express.Router()
const generator = require('../services/fractals-generator.js')
const debug = require('debug')('fractals-generator:routes')

/* GET home page. */
// example: http://localhost:3001/fractal?left=-0.75&bottom=0.05&top=0.052&right=-0.748&width=1000&height=1200&limit=10000
router.get('/fractal', async function (req, res, next) {
  const { left, top, bottom, right, width, height, limit } = req.query
  const rect = {
    left: parseFloat(left),
    top: parseFloat(top),
    bottom: parseFloat(bottom),
    right: parseFloat(right),
    width: parseInt(width),
    height: parseInt(height)
  }
  debug('generator', rect, limit)
  const now = Date.now()

  const value = await generator(rect, limit)
  res.send(`
<html>
  <head>
    <meta charset="utf-8"/>
    <title>Fractal Generator</title>
  </head>
  <body>
    <h1>Hello (${(Date.now() - now) / 1000})</h1>
    <img src="${value}"/>
  </body>
</html>
  `)
})

module.exports = router
