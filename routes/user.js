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
        wss.connection(req.params.username).sendUTF(JSON.stringify(event(req.body)));
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
    .get((req, res, next) => {
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
        gitRequest.getRepos()
            .then((result) => {
                return res.render('user/repos', {repos: result, csrfToken: req.csrfToken()});
            })
            .catch((error) => {
                return next(error);
            });
    })
    .post(csrf, (req, res, next) => {
        console.log('setting hook');
        console.log(req.user);
        //if there is no prefered repo, set to selected
        if (!req.user.preferedRep) {
            console.log('no prefered repository');
                req.user.preferedRep = {
                    url: req.body.url,
                    name: req.body.name
                };
                req.user.save();

                //set hook on that repo
            console.log('setting hook then');
                gitRequest.setHook(req.user.username, req.user.preferedRep.url)
                    .then(() => {
                    console.log('hook sat');
                        return res.redirect('/user/' + req.user.username + '/issues/');
                    })
                    .catch((error) => {
                        return next(error);
                    });
        } else if (req.user.preferedRep.url !== req.body.url) { //repo preference has changed
            console.log('pref has changed');

            //remove old hook
            gitRequest.removeHook(req.user.username, req.user.preferedRep.url)
                .then(() => {
                //update preference
                    req.user.preferedRep = {
                        url: req.body.url,
                        name: req.body.name
                    };

                    req.user.save();

                    //set new hook
                    console.log('changing hook');
                    return gitRequest.setHook(req.user.username, req.user.preferedRep.url);
                })
                .then(() => {

                //redirect to issues
                    console.log('hook is changed');
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
        res.render('user/repos', {csrfToken: req.csrfToken()});
    })
    .post(csrf, (req, res) => {

        //remove old hook
        if (req.user.preferedRep) {
            gitRequest.removeHook(req.user.username, req.user.preferedRep.url)
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
