/**
 * A module to handle requests against
 * the Github API.
 */

//Requires.
let request = require('request-promise-native');
let config = require('../config/configs');

/**
 * Get the user's repositories.
 * @returns a Promise that resolves with the repositories
 * or rejects with the error.
 */
function getRepos() {
    return new Promise((resolve, reject) => {
        if(!process.env.ACCESS_TOKEN) {
            console.log('no token');
            return reject()
        }
        request.get({
            uri: 'https://api.github.com/user/repos',
            headers: {
                'User-Agent': config.username,
                'Authorization': 'token ' + process.env.ACCESS_TOKEN
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
 * @param username {String} the username of the user requesting the repo
 * @param repo {String} the api url to set the hook on
 * @returns a Promise that resolves when the hook is done
 * or rejects with the error.
 */
function setHook(username, repo) {
    return new Promise((resolve, reject) => {
        console.log('in the hooksetter');
        if (!process.env.ACCESS_TOKEN) {
            console.log('no token');
            return reject()
        }
        request.post({
            uri: repo + '/hooks',
            headers: {
                'Authorization': 'token ' + process.env.ACCESS_TOKEN,
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
                    url: config.hookurl + '/user/' + username + '/githook',
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
 * @param username {String} the username of the user removing the hook
 * @param repo {String} the api url to remove the hook from
 * @returns a Promise that resolves when the hook is done
 * or rejects with the error.
 */
function removeHook(username, repo) {
    return new Promise((resolve, reject) => {
        request.get({
            //get the hooks to delete
            uri: repo + '/hooks',
            headers: {
                'Authorization': 'token ' + process.env.ACCESS_TOKEN,
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
                    if (hook.config.url === config.siteurl + '/user/' + username + '/githook') {
                        return request.delete({
                            uri: hook.url,
                            headers: {
                                'Authorization': 'token ' + process.env.ACCESS_TOKEN,
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
 * @param repo {String} the url to the repo to get the issues for.
 * @returns {Promise} that resolves with the issues or rejects with an error.
 */
function getIssues(repo) {
    return new Promise((resolve, reject) => {
        request.get({
            uri: repo + '/issues?sort=updated',
            headers: {
                'Authorization': 'token ' + process.env.ACCESS_TOKEN,
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
 * @param repo {String} the url to the repo to create the issue on.
 * @param issue {Object} an object containing the title and body of the issue..
 * @returns {Promise} that resolves with the issues or rejects with an error.
 */
function createIssue(repo, issue) {
    return new Promise((resolve, reject) => {
        request.post({
            uri: repo + '/issues',
            headers: {
                'Authorization': 'token ' + process.env.ACCESS_TOKEN,
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
 * @param repo {String} the url to the repo to create the issue on.
 * @param issue {String} the id of the issue
 * @returns {Promise} that resolves with the issue or rejects with an error.
 */
function getIssue(repo, issue) {
    return new Promise((resolve, reject) => {
        request.get({
            uri: repo + '/issues/' + issue,
            headers: {
                'Authorization': 'token ' + process.env.ACCESS_TOKEN,
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
 * @param repo {String} the url to the repo to create the issue on.
 * @param issueID {String} the id of the issue
 * @param issue {Object} an object containing the title and body of the issue..
 * @returns {Promise} that resolves with the issues or rejects with an error.
 */
function editIssue(repo, issueID, issue) {
    return new Promise((resolve, reject) => {
        request.patch({
            uri: repo + '/issues/'+issueID,
            headers: {
                'Authorization': 'token ' + process.env.ACCESS_TOKEN,
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
 * @param repo {String} the url to the repo to lock the issue on.
 * @param issue {String} the id of the issue
 * @returns {Promise} that resolves with the issue or rejects with an error.
 */
function lockIssue(repo, issue) {
    return new Promise((resolve, reject) => {
        request.put({
            uri: repo + '/issues/' + issue + '/lock',
            headers: {
                'Authorization': 'token ' + process.env.ACCESS_TOKEN,
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
    lockIssue: lockIssue
};
