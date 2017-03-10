/**
 * Router for the issue handling pages.
 */

//Requires
let router = require('express').Router();
let issues = require('../lib/issueresource');

//Routes---------------------------------------------------------------------------------------------------------------

/**
 * View all current issues
 * */
router.route('/')
    .get((req, res, next) => {
        issues.getAll(req.user)
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
        issues.createIssue(req.user, req.body)
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
    //get an issue
    .get((req, res, next) => {
        issues.getIssue(req.user, req.params.issueID)
            .then((response) => {
                res.send(response);
            })
            .catch((error) => {
                next(error);
            });
    })
    //edit an issue
    .patch((req, res, next) => {
        issues.editIssue(req.user, req.params.issueID, req.body)
            .then((response) => {
                res.send(response);
            })
            .catch((error) => {
                next(error);
            });
    })
    //lock conversation on an issue
    .put((req, res, next) => {
        issues.lockIssue(req.user, req.params.issueID)
            .then(() => {
                res.send({});
            })
            .catch((error) => {
                next(error);
            });
    });

/**
 * Requests against comments
 **/
router.route('/:issueID/comments')
    .get((req, res, next) => {
    //get comments
         issues.getComments(req.user, req.params.issueID)
             .then((response) => {
                 res.send({comments: response});
             })
             .catch((error) => {
                 next(error);
             })
    })
    .post((req, res, next) => {
        //add a comment
        issues.addComment(req.user, req.params.issueID, req.body)
            .then((response) => {
                res.send({comments: response});
            })
            .catch((error) => {
                next(error);
            })
    });

/**
 * Requests against a specific comment
 * */
router.route('/:issueID/comments/:commentID')
    .delete((req, res, next) => {
        //delete comment
        issues.deleteComment(req.user, req.params.commentID)
            .then(() => {
                res.send({});
            })
            .catch((error) => {
                next(error);
            })
    });

//Exports
module.exports = router;
