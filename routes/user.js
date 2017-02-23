/**
 * Router for the user handling pages.
 */

//Requires
let router = require('express').Router();
let ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');
let csrf = require('csurf')();
let userdb = require('../lib/userresource');

//Routes---------------------------------------------------------------------------------------------------------------

/**
 * Display user-page.
 * Redirect to /login if user is not logged in.
 * Show 403 if user is not authorized.
 */
router.use('/:username', ensureLoggedIn, (req, res, next) => {
    if (req.params.username === req.user.username) {
        return next();
    }
    res.render('error', {message: 'that\'s not your page'}).status(403);
});

/**
 * Display user-page.
 */
router.route('/:username')
    .get((req, res, next) => {
        res.render('user/display');
    });

/**
 * Delete a user and log out.
 */
router.route('/:username/delete')
    .get(csrf, (req, res) => {
        res.locals.confirm = {
            message: 'are you sure you want to delete the user?'
        };
        res.render('user/display', {csrfToken: req.csrfToken()});
    })
    .post(csrf, (req, res) => {
        userdb.deleteUser(req.params.username)
            .then(() => {
                req.logout();
                req.session.destroy();
                res.redirect('/');
            });
    });

//Exports.
module.exports = router;
