/**
 * Model for an Desired trip to be stored in the database.
 */

// Requires.
let mongoose = require('mongoose')
let tripBase = require('./TripBase')

/**
 * Set up additional parameters for the Trip.
 */
let plannedTripSchema = tripBase({
  _creator: {type: String, ref: 'User', required: true},
  time: {type: Date},
  spaces: {type: Number},
  passengers: [{type: String, ref: 'User'}]
})

/**
 * Model the trip.
 */
let PlannedTrip = mongoose.model('PlannedTrip', plannedTripSchema)

// Exports.
module.exports = PlannedTrip
