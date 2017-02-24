/**
 * Router for the user handling pages.
 */

//Requires
let router = require('express').Router();
let ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');
let csrf = require('csurf')();
let userdb = require('../lib/userresource');
let gitRequest = require('../lib/githubresource');

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
    res.status(403).render('error', {message: 'that\'s not your page'});
});

/**
 * Display user-page.
 */
router.route('/:username')
    .get((req, res, next) => {
         if (req.user.preferedRep) {
            return res.render('user/display');
        }
            return res.redirect('/user/' + req.params.username + '/repos');

    });

/**
 * Display page to choose repository to watch.
 */
router.route('/:username/repos')
    .get(csrf, (req, res, next) => {
    //fetch the repos
        gitRequest.getRepos()
            .then((result) => {
                return res.render('user/repos', {repos: result, csrfToken: req.csrfToken()});
            })
            .catch((error) => {
                return next(error);
            });
    })
    .post(csrf, (req, res, next) => {

    //if there is no prefered repo, set to this
        if (!req.user.preferedRep) {
            req.user.preferedRep = {
                url: req.body.url,
                name: req.body.name
            };
            req.user.save();
        }

    //if prefered repo has changed, update it
        if (req.user.preferedRep.url !== req.body.url) {
            //remove the old hook
            gitRequest.removeHook(req.user.preferedRep.url)
                .then(() => {
                //update preference
                    req.user.preferedRep = {
                        url: req.body.url,
                        name: req.body.name
                    };

                    req.user.save();

                    //set new hook
                    return gitRequest.setHook(req.user.preferedRep);
                })
                .then(() => {
                    return res.redirect('/user/' + req.user.username + '/issues/');
                })
                .catch((error) => {
                    return next(error);
                });
        } else {
            //if prefered repo hasn't changed, redirect
            return res.redirect('/user/' + req.user.username + '/issues/');
    }
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
        userdb.delete(req.params.username)
            .then(() => {
                req.logout();
                req.session.flash = {
                    type: 'success',
                    message: 'user successfully deleted'
                };
                res.redirect('/');
            });
    });

//Exports.
module.exports = router;
