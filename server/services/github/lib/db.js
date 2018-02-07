/**
 * A module to set up and handle the database.
 */
let mongoose = require('mongoose')
let isConnected

/**
 * Connects to the database.
 */
function connect () {
  let db = mongoose.connection

  mongoose.Promise = global.Promise

  db.on('error', () => {
    isConnected = false
  })

  db.once('open', () => {
    isConnected = true
  })

    // Close database connection if node process closes.
  process.on('SIGINT', () => {
    db.close(() => {
      process.exit(0)
    })
  })

    // Connect to the database
  mongoose.connect(process.env.MONGODB_URI)
        .catch((error) => {
          console.error(error)
        })
}

// Exports.
module.exports = {
  connect: connect,
  isConnected: isConnected
}
