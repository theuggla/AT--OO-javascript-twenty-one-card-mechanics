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
    })
    .post((req, res, next) => {
    //create an issue
        crud.createIssue(req.user.preferedRep.url, req.body)
            .then((response) => {
                res.send(response);
            })
            .catch((error) => {
                next(error);
            });
    });

/**
 * Requests against a single issue
 **/
router.route('/:issueID')
    .get((req, res, next) => {
        crud.getIssue(req.user.preferedRep.url, req.params.issueID, req.body)
            .then((response) => {
                res.send(response);
            })
            .catch((error) => {
                next(error);
            });
    })
    .patch((req, res, next) => {
        crud.editIssue(req.user.preferedRep.url, req.params.issueID, req.body)
            .then((response) => {
                res.send(response);
            })
            .catch((error) => {
                next(error);
            });
    })
    .put((req, res, next) => {
        crud.lockIssue(req.user.preferedRep.url, req.params.issueID)
            .then((response) => {
                res.send(response);
            })
            .catch((error) => {
                next(error);
            });
    })
    .delete(() => {
        //unlock issue
    });

/**
 * Requests against comments
 **/
router.route('/:issueID/comments')
    .get((req, res, next) => {
        //view all comments for the issue
    })
    .post(() => {
        //add a comment
    })

/**
 * Requests against a specific comment
 * */
router.route('//:issueID/comments/:commentID')
    .patch(() => {
        //edit comment
    })
    .delete(() => {
        //delete comment
    });

//Exports
module.exports = router;
