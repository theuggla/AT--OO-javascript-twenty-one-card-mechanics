/**
 * A module for handling the CRUD-actions with issues against Github..
 */

//Requires.
let githubRequest = require('../lib/githubresource');
let Issue = require('../models/Issue');
let Comment = require('../models/Comment');

/**
 * Gets all issues from the currently chosen repository on Github.
 * @param repo {String} the url to the prefered repo.
 * @returns {Promise} that resolves with and array of the issues
 * or rejects with an error.
 */
function getAll(repo) {
    return new Promise((resolve, reject) => {
        githubRequest.getIssues(repo)
            .then((result) => {
                let list = result.map((issue) => {
                    //return a mapped object
                    return Issue(issue);
            });

            resolve(list);
        })
            .catch((error) => {
                reject(error);
        });
    });
}

/**
 * Creates an issue on the currently chosen repository on Github.
 * @param repo {String} the url to the repo to create the issue on..
 * @param issue {Object} an object containing the body and title of the issue.
 * @returns {Promise} that resolves with the newly created issue
 * or rejects with an error.
 */
function createIssue(repo, issue) {
    return new Promise((resolve, reject) => {
        githubRequest.createIssue(repo, issue)
            .then((result) => {
                resolve(Issue(result));
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**
 * Gets an issue from the currently chosen repository on Github.
 * @param repo {String} the url to the repo to get the issue from.
 * @param issue {String} the id of the issue.
 * @returns {Promise} that resolves with the issue
 * or rejects with an error.
 */
function getIssue(repo, issue) {
    return new Promise((resolve, reject) => {
        githubRequest.getIssue(repo, issue)
            .then((result) => {
                resolve(Issue(result));
            })
            .catch((error) => {
                reject(error);
            });
    });
}


/**
 * Edits an issue on the currently chosen repository on Github.
 * @param repo {String} the url to the repo of the issue to edit.
 * @param issueID {String} the id of the issue.
 * @param issue {Object} an object containing the body and title of the issue.
 * @returns {Promise} that resolves with the newly edited issue
 * or rejects with an error.
 */
function editIssue(repo, issueID, issue) {
    return new Promise((resolve, reject) => {
        githubRequest.editIssue(repo, issueID, issue)
            .then((result) => {
                resolve(Issue(result));
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**
 * Locks an issue from the currently chosen repository on Github.
 * @param repo {String} the url to the repo to get the issue from.
 * @param issue {String} the id of the issue.
 * @returns {Promise} that resolves empty
 * or rejects with an error.
 */
function lockIssue(repo, issue) {
    return new Promise((resolve, reject) => {
        githubRequest.lockIssue(repo, issue)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**
 * Gets all comments from the currently chosen issue.
 * @param repo {String} the url to the prefered repo.
 * @param issueID {String} the ID of the chosen issue.
 * @returns {Promise} that resolves with and array of the comments
 * or rejects with an error.
 */
function getComments(repo, issueID) {
    return new Promise((resolve, reject) => {
        githubRequest.getComments(repo, issueID)
            .then((result) => {
                let list = result.map((comment) => {
                    //return a mapped object
                    comment.issue = issueID;
                    return Comment(comment);
                });

                resolve(list);
            })
            .catch((error) => {
                reject(error);
            });
    });
}


/**
 * Creates an issue on the currently chosen repository on Github.
 *@param repo {String} the url to the prefered repo.
 * @param issue {String} the ID of the chosen issue.
 * @param comment {Object} containing the bosy of the comment
 * @returns {Promise} that resolves with the newly created issue
 * or rejects with an error.
 */
function addComment(repo, issue, comment) {
    return new Promise((resolve, reject) => {
        githubRequest.addComment(repo, issue, comment)
            .then((result) => {
                resolve(Comment(result));
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**
 * Deletes a comment from a chosen issue.
 * @param repo {String} the url to the repo.
 * @param commentID {String} the id of the comment to delete.
 * @returns {Promise} that resolves empty or rejects with an error.
 */
function deleteComment(repo, commentID) {
    return new Promise((resolve, reject) => {
        githubRequest.deleteComment(repo, commentID)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
    });
}

//Exports.
module.exports = {
    getAll: getAll,
    createIssue: createIssue,
    getIssue: getIssue,
    editIssue: editIssue,
    lockIssue: lockIssue,
    getComments: getComments,
    addComment: addComment,
    deleteComment: deleteComment
};