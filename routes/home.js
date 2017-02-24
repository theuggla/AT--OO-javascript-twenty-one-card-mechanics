/**
 * Router for the login and logout pages.
 */

//Requires.
let router = require('express').Router();
let passport = require('passport');

//Routes--------------------------------------------------------------------------------------------------------
/**
 * If the user is in session, redirect to user page,
 * else redirect to login screen.
 * */
router.route('/')
    .get((req, res) => {
    if (!req.user) {
        res.redirect('/login');
    } else {
        res.redirect('/user/' + (req.user.username));
    }
});

/**
 * If the user is in session, redirect to user page,
 * else show login screen.
 * */
router.route('/login')
    .get((req, res) => {
        if (req.user) {
            res.redirect('/user/' + (req.user.username));
        } else {
            res.render('login');
        }
    });

/**
 * Authenticate the user through github, request scopes.
 */
router.route('/login/github')
    .get(passport.authenticate('github', {scope: ['user', 'repo', 'admin:repo_hook']}));

/**
 * Handle the authentication. If failed, redirect to login screen with failure message.
 */
router.route('/login/github/return')
    .get((req, res, next) => {
        passport.authenticate('github', (err, user) => {
           //something went wrong
            if (err) {
                req.session.flash = {
                    type: 'failure',
                    message: 'something on my end went wrong while logging in. try again!'
                };
                return res.redirect('/login')
            }

            //login was not authenticated
            if (!user) {
                req.session.flash = {
                    type: 'failure',
                    message: 'login failed'
                };
                return res.redirect('/login');
            }

            //log user in
            req.login(user, (err) => {
                if (err) {
                    return next(err);
                }

                req.session.flash = {
                    type: 'success',
                    message: 'login successful'
                };

                return res.redirect('/user/' + user.username);
            });

        })(req, res, next);
    });

/**
 * Log user out. Destroy the session and redirect to login screen.
 */
router.route('/logout')
    .get((req, res) => {
        req.logout();
        res.redirect('/login');
    });


//Exports.
module.exports = router;