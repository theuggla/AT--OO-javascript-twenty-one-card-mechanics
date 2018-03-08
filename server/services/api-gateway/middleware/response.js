/**
 * Middleware to handle the responses to the client.
 */

/**
 * Send response.
 */
function send () {
  return function (req, res, next) {
    if (req.result) {
      let status = req.status || 200
      let data = req.result
      return res.status(status).json(data)
    } else if (req.status) {
      return res.sendStatus(req.status)
    } else if (req.error) {
      return next(req.error)
    } else {
      return next()
    }
  }
}

// Exports.
module.exports = send
