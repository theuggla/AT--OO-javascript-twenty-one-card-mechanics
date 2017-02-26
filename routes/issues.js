/**
 * Router for the issue handling pages.
 */

//Requires
let router = require('express').Router();
let crud = require('../lib/issueresource');

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
    //get an issue
    .get((req, res, next) => {
        crud.getIssue(req.user.preferedRep.url, req.params.issueID, req.body)
            .then((response) => {
                res.send(response);
            })
            .catch((error) => {
                next(error);
            });
    })
    //edit an issue
    .patch((req, res, next) => {
        crud.editIssue(req.user.preferedRep.url, req.params.issueID, req.body)
            .then((response) => {
                res.send(response);
            })
            .catch((error) => {
                next(error);
            });
    })
    //lock conversation on an issue
    .put((req, res, next) => {
        crud.lockIssue(req.user.preferedRep.url, req.params.issueID)
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
         crud.getComments(req.user.preferedRep.url, req.params.issueID)
             .then((response) => {
                 res.send({comments: response});
             })
             .catch((error) => {
                 next(error);
             })
    })
    .post((req, res, next) => {
        //add a comment
        crud.addComment(req.user.preferedRep.url, req.params.issueID, req.body)
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
        crud.deleteComment(req.user.preferedRep.url, req.params.commentID)
            .then(() => {
                res.send({});
            })
            .catch((error) => {
                next(error);
            })
    });

//Exports
module.exports = router;
