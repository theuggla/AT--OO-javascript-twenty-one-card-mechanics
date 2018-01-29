/**
 * Server starting point.
 **/

// Requires
let express = require('express')
let path = require('path')
let favicon = require('serve-favicon')

let app = express()

let port = process.env.PORT || 8080
let cwd = __dirname || process.cwd()
let staticPath = path.join(cwd, '/build')

// Middlewares-------------------------------------------------------------------------------------------------------

// Serve favicon.
app.use(favicon(path.join(staticPath, '/assets/', 'favicon.ico')))

// Find static resources.
app.use(express.static(staticPath))

// Start the server----------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log('server up on port ' + port)
})
