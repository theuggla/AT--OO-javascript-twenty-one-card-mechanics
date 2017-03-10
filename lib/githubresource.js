/**
 * A module to handle requests against
 * the Github API.
 */

//Requires.
let request = require('request-promise-native');
let config = require('../config/configs');

/**
 * Get the user's repositories.
 * @param user {Object} the userdata of the user requesting the repos
 * @returns a Promise that resolves with the repositories
 * or rejects with the error.
 */
function getRepos(user) {
    return new Promise((resolve, reject) => {
        if (!user.accessToken) {
            console.log('no token');
            return reject()
        }
        request.get({
            uri: 'https://api.github.com/user/repos',
            headers: {
                'User-Agent': config.username,
                'Authorization': 'token ' + user.accessToken
            },
            json: true,
        })
        .then((result) => {
            resolve(cleanUpRepos(result));
        })
        .catch((error) => {
            reject(error);
        })
    });
}

/**
 * Sets up a webhook on the chosen repository.
 * @param user {Object} the userdata of the user requesting the repo
 * @returns a Promise that resolves when the hook is done
 * or rejects with the error.
 */
function setHook(user) {
    return new Promise((resolve, reject) => {
        if (!user.accessToken) {
            console.log('no token');
            return reject()
        }
        request.post({
            uri: user.preferedRep.url + '/hooks',
            headers: {
                'Authorization': 'token ' + user.accessToken,
                'User-Agent': config.username
            },
            json: true,
            body: {
                name: 'web',
                active: true,
                events: [
                    "issue_comment",
                    "issues"
                ],
                config: {
                    url: config.hookurl + '/user/' + user.username + '/githook',
                    content_type: "json",
                    secret: process.env.WEBHK_SECRET
                }
            }
        })
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            })
    });
}

/**
 * Removes a webhook on the choosen repository.
 * @param user {Object} the userdata of the user removing the hook
 * @returns a Promise that resolves when the hook is done
 * or rejects with the error.
 */
function removeHook(user) {
    return new Promise((resolve, reject) => {
        request.get({
            //get the hooks to delete
            uri: user.preferedRep.url + '/hooks',
            headers: {
                'Authorization': 'token ' + user.accessToken,
                'User-Agent': config.username
            },
            json: true
            })
            .then((result) => {

            //make sure there's actually a hook
            if (result.length === 0) {
                return Promise.resolve();
            }

            //make sure to only delete our hooks
                result.forEach((hook) => {
                    if (hook.config.url === config.siteurl + '/user/' + user.username + '/githook') {
                        return request.delete({
                            uri: hook.url,
                            headers: {
                                'Authorization': 'token ' + user.accessToken,
                                'User-Agent': config.username
                            },
                            json: true
                        });
                    }
                });

            })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            })
    });
}

/**
 * Gets all the issues for a chosen repository.
 * @param user {Object} the userdata of the user getting the issues for.
 * @returns {Promise} that resolves with the issues or rejects with an error.
 */
function getIssues(user) {
    return new Promise((resolve, reject) => {
        request.get({
            uri: user.preferedRep.url + '/issues?sort=updated',
            headers: {
                'Authorization': 'token ' + user.accessToken,
                'User-Agent': config.username
            },
            json: true,
        })
            .then((result) => {
            resolve(result);
        })
            .catch((error) => {
            reject(error);
        });
    })
}

/**
 * Create an issue on the chosen repository.
 * @param user {Object} the userdata of the user creating the issue.
 * @param issue {Object} the issue to create
 * @returns {Promise} that resolves with the issues or rejects with an error.
 */
function createIssue(user, issue) {
    return new Promise((resolve, reject) => {
        request.post({
            uri: user.preferedRep.url + '/issues',
            headers: {
                'Authorization': 'token ' + user.accessToken,
                'User-Agent': config.username
            },
            json: true,
            body: issue
        })
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    })
}

/**
 * Get an issue from the chosen repository.
 * @param user {Object} the userdata of the user getting the issue
 * @param issue {String} the id of the issue
 * @returns {Promise} that resolves with the issue or rejects with an error.
 */
function getIssue(user, issue) {
    return new Promise((resolve, reject) => {
        request.get({
            uri: user.preferedRep.url + '/issues/' + issue,
            headers: {
                'Authorization': 'token ' + user.accessToken,
                'User-Agent': config.username
            },
            json: true,
        })
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    })
}

/**
 * Edits an issue on the chosen repository.
*@param user {Object} the userdata of the user editing the issue
 * @param issueID {String} the id of the issue
 * @param issue {Object} an object containing the title and body of the issue..
 * @returns {Promise} that resolves with the issues or rejects with an error.
 */
function editIssue(user, issueID, issue) {
    return new Promise((resolve, reject) => {
        request.patch({
            uri: user.preferedRep.url + '/issues/'+issueID,
            headers: {
                'Authorization': 'token ' + user.accessToken,
                'User-Agent': config.username
            },
            json: true,
            body: issue
        })
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    })
}

/**
 * Locks an issue from the chosen repository.
 * @param user {Object} the userdata of the user locking the issue
 * @param issue {String} the id of the issue
 * @returns {Promise} that resolves with the issue or rejects with an error.
 */
function lockIssue(user, issue) {
    return new Promise((resolve, reject) => {
        request.put({
            uri: user.preferedRep.url + '/issues/' + issue + '/lock',
            headers: {
                'Authorization': 'token ' + user.accessToken,
                'User-Agent': config.username
            },
            json: true,
        })
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    })
}

/**
 * Gets all the comments for a chosen issue.
 * @param user {Object} the userdata of the user getting the comments
 * @param issue {String} the id of the issue to get the comments for.
 * @returns {Promise} that resolves with the comments or rejects with an error.
 */
function getComments(user, issue) {
    return new Promise((resolve, reject) => {
        request.get({
            uri: user.preferedRep.url + '/issues/' + issue + '/comments',
            headers: {
                'Authorization': 'token ' + user.accessToken,
                'User-Agent': config.username
            },
            json: true,
        })
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    })
}

/**
 * Create an issue on the chosen repository.
 * @param user {Object} the userdata of the user adding the comment
 * @param comment {Object} an object containing the body of the comment.
 *  @param issue {String} the id of the issue to create the comment on.
 * @returns {Promise} that resolves with the issues or rejects with an error.
 */
function addComment(user, issue, comment) {
    return new Promise((resolve, reject) => {
        request.post({
            uri: user.preferedRep.url + '/issues/' + issue + '/comments',
            headers: {
                'Authorization': 'token ' + user.accessToken,
                'User-Agent': config.username
            },
            json: true,
            body: comment
        })
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    })
}

/**
 * Deletes a comment from a chosen issue.
 * @param user {Object} the userdata of the user deleting the comment
 * @param commentID {String} the id of the comment to delete.
 * @returns {Promise} that resolves empty or rejects with an error.
 */
function deleteComment(user, commentID) {
    return new Promise((resolve, reject) => {
        request.delete({
            uri: user.preferedRep.url + '/issues/comments/' + commentID,
            headers: {
                'Authorization': 'token ' + user.accessToken,
                'User-Agent': config.username
            },
            json: true,
        })
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    })
}

/**
 * Maps and filters the repositories to a
 * suitable vie model.
 * @param repos {Array} the array of repos to map.
 * @returns {Array} the mapped repos.
 */
function cleanUpRepos(repos) {
    return repos.filter((repo) => {return repo.permissions.admin}).map((repo) => {
            return {
                name: repo.name,
                description: repo.description,
                owner: repo.owner.login,
                url: repo.url,
                link: repo.html_url,
                issues: repo.open_issues_count
            }
    });
}



//Exports.
module.exports = {
    getRepos: getRepos,
    setHook: setHook,
    removeHook: removeHook,
    getIssues: getIssues,
    createIssue: createIssue,
    getIssue: getIssue,
    editIssue: editIssue,
    lockIssue: lockIssue,
    getComments: getComments,
    addComment: addComment,
    deleteComment: deleteComment
};
