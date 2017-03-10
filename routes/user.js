/**
 * Router for the user handling pages.
 */

//Requires.
let router = require('express').Router();
let ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');
let csrf = require('csurf')();
let verifyGithubWebhook = require('github-express-webhook-verifying');
let userdb = require('../lib/userresource');
let wss = require('../lib/wssresource');
let gitRequest = require('../lib/githubresource');
let event = require('../models/Event');

//Routes---------------------------------------------------------------------------------------------------------------

//Receive data from Github------------------------------------------------------------------------------------------
router.route('/:username/githook')
    .get((req, res, next) => {
    //can't GET this resource
        return next();
    })
    .post(verifyGithubWebhook(process.env.WEBHK_SECRET), (req, res) => {
        //confirm that message was received
        res.status(200).send();
        //send to client
        if (wss.connection(req.params.username)) { //there is a socket sonnection
            wss.connection(req.params.username).sendUTF(JSON.stringify(event(req.body)));
        }
    });
//------------------------------------------------------------------------------------------------------------------

/**
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
    .get((req, res) => {
         if (req.user.preferedRep) {
            return res.redirect('/user/' + req.params.username + '/issues');
        }
            return res.redirect('/user/' + req.params.username + '/repos');

    });

/**
 * Display page where user can choose
 * what repository to watch.
 */
router.route('/:username/repos')
    .get(csrf, (req, res, next) => {
        //fetch the repos
        gitRequest.getRepos(req.user)
            .then((result) => {
                return res.render('user/repos', {repos: result, csrfToken: req.csrfToken()});
            })
            .catch((error) => {
                return next(error);
            });
    })
    .post(csrf, (req, res, next) => {
        //if there is no preferred repo, set to selected
        if (!req.user.preferedRep) {
                req.user.preferedRep = {
                    url: req.body.url,
                    name: req.body.name
                };
                req.user.save();

                //set hook on that repo
                gitRequest.setHook(req.user)
                    .then(() => {
                        return res.redirect('/user/' + req.user.username + '/issues/');
                    })
                    .catch((error) => {
                        return next(error);
                    });
        } else if (req.user.preferedRep.url !== req.body.url) { //repo preference has changed
            //remove old hook
            gitRequest.removeHook(req.user)
                .then(() => {
                //update preference
                    req.user.preferedRep = {
                        url: req.body.url,
                        name: req.body.name
                    };

                    req.user.save();

                    //set new hook
                    return gitRequest.setHook(req.user);
                })
                .then(() => {
                //redirect to issues
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
        req.session.flash = {
            confirm: {message: 'are you sure you want to delete the user?', url: '/user/' + req.params.username + '/delete', csrfToken: req.csrfToken()}
        };
        res.redirect('back');
    })
    .post(csrf, (req, res) => {
        //remove old hook
        if (req.user.preferedRep) {
            gitRequest.removeHook(req.user)
                .then(() => {
                    //delete user
                    userdb.delete(req.params.username)
                        .then(() => {
                            req.logout();
                            req.session.flash = {
                                type: 'success',
                                message: 'user successfully deleted'
                            };
                            res.redirect('/');
                        });
                })
        } else {
            //delete user
            userdb.delete(req.params.username)
                .then(() => {
                    req.session.flash = {
                        type: 'success',
                        message: 'user successfully deleted'
                    };
                    req.logout();
                    res.redirect('/');
                });
        }
    });

//Exports.
module.exports = router;
