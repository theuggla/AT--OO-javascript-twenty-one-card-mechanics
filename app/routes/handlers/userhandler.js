/**
 * Handlers for the user-routes.
 */

module.exports.info = function (req, res, next) {
  if (req.user.authorized) res.send({message: 'Large user info'})
  else res.send({message: 'Small user info'})
  next(false)
}
