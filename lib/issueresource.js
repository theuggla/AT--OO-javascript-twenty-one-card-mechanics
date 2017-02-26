/**
 * A module for handling the CRUD-actions with issues against Github..
 */

//Requires.
let githubRequest = require('../lib/githubresource');
let Issue = require('../models/Issue');

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
/**
 * Get a certain object from the database.
 * @param id {String} the id of the object to find.
 * @returns {Promise} that resolves
function getSnippet(id) {
    return new Promise((resolve, reject) => {
        Snippet.findById(id, (error, snippet) => {
            if (error) {
                if (error.name === 'CastError') { //the id didn't exist
                    reject();
                } else {
                    reject(error);
                }
            } else {
                //send back a mapped object
                resolve({
                    title: snippet.title,
                    content: snippet.content,
                    createdAt: snippet.createdAt,
                    tags: snippet.tags,
                    id: snippet._id
                });
            }
        });
    });
}

/**
 * Adds a Snippet to the database.
 * @param data {Object} the data to give the snippet.
 * @returns {Promise} that resolves when the snippet is successfully added.
function addSnippet(data) {
    return new Promise((resolve, reject) => {
        let tags = data.tags.trim();

        let snippet = new Snippet({
            title: data.title,
            content: data.content,
        });

        if (tags.length > 0) { //only add tags if there are any
            snippet.tags = tags.split(/, *);
        }

        snippet.validate()
            .then(() => {
                return snippet.save();
            })
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
    });
}

/**
 * Edits a Snippet already in the database, or creates it if it doesn't exist.
 * @param id {String} the id of the Snippet to edit.
 * @param newData {Object} the data to change.
 * @returns {Promise} that resolves with the updated data of the Snippet when the Snippet is successfully updated.
function editSnippet(id, newData) {
    let tags = newData.tags.trim();
    return new Promise((resolve, reject) => {
        let data = {
            title: newData.title,
            content: newData.content,
            updatedAt: new Date()
        };

        if (tags.length > 0) { //only add tags if there are any
            data.tags = tags.split(/, );
        }

        Snippet.findOneAndUpdate({_id: id}, data, {upset: true, runValidators: true}, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 * Deletes a Snippet from the database.
 * @param id {String} the id of the snippet to delete.
 * @returns {Promise} that resolves when the Snippet has been deleted or if the snippet couldn't be found, or rejects with the error.
function deleteSnippet(id) {
    return new Promise((resolve, reject) => {
        Snippet.findOneAndRemove({_id: id}, (error) => {
            if (error) {
                if (error.name === 'CastError') { //the id didn't exist
                    resolve();
                } else {
                    reject(error);
                }
            } else {
                resolve();
            }
        })
    });
}
*/

//Exports.
module.exports = {
    getAll: getAll,
    createIssue: createIssue,
    getIssue: getIssue,
    editIssue: editIssue,
    lockIssue: lockIssue
};