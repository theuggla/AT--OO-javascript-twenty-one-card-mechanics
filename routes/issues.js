/**
 * Router for the issue handling pages.
 */

//Requires
let router = require('express').Router();
let crud = require('../lib/issueresource');
let csrf = require('csurf')();

//Routes---------------------------------------------------------------------------------------------------------------

/**
 * View all current issues
 * */
router.route('/')
    .get((req, res, next) => {
        crud.getAll(req.user.preferedRep.url)
            .then((response) => {
            if (response.length === 0) {
                res.locals.flash = {
                    type: 'failure',
                    message: 'no issues to show yet'
                }
            }
                res.render('issues/display', {issues: response});
            })
            .catch((error) => {
                if (error) {
                    next(error);
                } else {
                    next();
                }
            });
    });

/*View a Snippet*/
router.route('/view/:snippetID')
//view a specific snippet
    .get((req, res, next) => {
        crud.getSnippet(req.params.snippetID)
            .then((response) => {
                response.tags = response.tags.join(', ');
                res.render('snippets/snippet', response);
            })
            .catch((error) => {
                if (error) {
                    next(error);
                } else {
                    next();
                }
            });
    });

/*View all in a Tag*/
router.route('/tag/:tagName')
//view all snippets with a specific tag
    .get((req, res, next) => {
        crud.getAll({tags: req.params.tagName})
            .then((response) => {
                res.render('snippets/snippets', {snippets: response});
            })
            .catch((error) => {
                if (error) {
                    next(error);
                } else {
                    next();
                }
            });
    });

/*Make sure User is logged in for the following routes*/
router.route('/*')
    .all((req, res, next) => {
        if (!req.session.loggedIn) {
            res.status(403).render('error', {message: 'not authorized to do that. log in will ya. cheers.'});
        } else {
            next();
        }
    });

/*Create a Snippet*/
router.route('/create')
    //get a form for creating snippets
    .get(csrf, (req, res, next) => {
        res.render('snippets/snippetform', {csrfToken: req.csrfToken()});
    })
    //create the snippet
    .post(csrf, (req, res, next) => {
        crud.addSnippet(req.body)
            .then(() => {
                req.session.flash = {
                    type: 'success',
                    message: 'snippet ' + req.body.title + ' added'
                };
                res.redirect('/snippets');
            })
            .catch((error) => {
                if (error) {
                    next(error);
                } else {
                    next();
                }
            });
    });

/*Delete a Snippet*/
router.route('/delete/:snippetID')
    //get a confirmation form for deleting a snippet
    .get(csrf, (req, res, next) => {
        res.render('snippets/deleteform', {id: req.params.snippetID, csrfToken: req.csrfToken()});
    })
    //delete the snippet
    .post(csrf, (req, res, next) => {
        crud.deleteSnippet(req.params.snippetID)
            .then(() => {
                req.session.flash = {
                    type: 'success',
                    message: 'snippet deleted'
                };
                res.redirect('/snippets');
            })
            .catch((error) => {
                if (error) {
                    next(error);
                } else {
                    next();
                }
            });
    });

/*Edit a Snippet*/
router.route('/edit/:snippetID')
//view a specific snippet
    .get(csrf, (req, res, next) => {
        crud.getSnippet(req.params.snippetID)
            .then((response) => {
                response.tags = response.tags.join(', ');
                response.csrfToken = req.csrfToken();
                res.render('snippets/snippetform', response); //render the snippet-data in a form
            })
            .catch((error) => {
                if (error) {
                    next(error);
                } else {
                    next();
                }
            });
    })
    //edit a specific snippet
    .post(csrf, (req, res, next) => {
        crud.editSnippet(req.params.snippetID, req.body)
            .then(() => {
                req.session.flash = {
                    type: 'success',
                    message: 'snippet ' + req.body.title + ' is updated'
                };
                res.redirect('/snippets/edit/' + req.params.snippetID);
            })
            .catch((error) => {
                if (error) {
                    next(error);
                } else {
                    next();
                }
            });
    });

//Exports
module.exports = router;
