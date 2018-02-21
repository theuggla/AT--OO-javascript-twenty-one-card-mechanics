/**
 * Model for an Desired trip to be stored in the database.
 */

// Requires.
let mongoose = require('mongoose')
let tripBase = require('./TripBase')
let findOrCreate = require('mongoose-find-or-create')

/**
 * Set up additional parameters for the Trip.
 */
let plannedTripSchema = tripBase({
  time: {type: Date},
  spaces: {type: Number},
  passengers: [{type: String, ref: 'User'}]
})

plannedTripSchema.plugin(findOrCreate)

/**
 * Model the trip.
 */
let PlannedTrip = mongoose.model('PlannedTrip', plannedTripSchema)

// Exports.
module.exports = PlannedTrip
