/*
* Responses for OPTIONS requests.
*/

/*
* Response for open GET requests.
*/
module.exports.safeResource = function (req, res, next) {
  res.header('Allow', 'GET, HEAD, OPTIONS')
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  res.send()
  next(false)
}

/*
* Response for open PUT requests.
*/
module.exports.postResource = function (req, res, next) {
  res.header('Allow', 'POST, HEAD, OPTIONS')
  res.header('Access-Control-Allow-Methods', 'POST, HEAD, OPTIONS')
  res.send()
  next(false)
}
