/**
 * Module to send ajax request to the server
 * for managing the issues and the comments.
 */

//Requires.
let ajax = require("./ajax.js");


class IssueManager {
    /**
     * Gets an issue via the server.
     * @param user {String} the username
     * @param issue {String} the issue id
     * @returns {Promise} that resolves with the issue or rejects with an error
     */
    getIssue({user, issue}) {
        return new Promise((resolve, reject) => {
            ajax.request({url:'/user/'+user+'/issues/'+issue})
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

    /**
     * Adds an issue via the server.
     * @param user {String} the username
     * @param title {String} the issue title
     * @param body {String} the issue body
     * @returns {Promise} that resolves when the issue is added or rejects with an error
     */
    addIssue({user, title='no title', body=''}) {
        return new Promise((resolve, reject) => {
            ajax.request({url:'/user/'+user+'/issues/', method: 'POST', message:JSON.stringify({title: title, body: body})})
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

    /**
     * Edits an issue via the server.
     * @param user {String} the username
     * @param title {String} the new issue title
     * @param body {String} the new issue body
     * @param issue {String} the issue id
     * @returns {Promise} that resolves with the issue or rejects with an error
     */
    editIssue({user, title, body, issue}) {
        return new Promise((resolve, reject) => {
            ajax.request({url:'/user/'+user+'/issues/'+issue, method: 'PATCH', message:JSON.stringify({title: title, body: body})})
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

    /**
     * Gets the comments for an issue via the server.
     * @param user {String} the username
     * @param issue {String} the issue id
     * @returns {Promise} that resolves with the comments or rejects with an error
     */
    getComments({user, issue}) {
        return new Promise((resolve, reject) => {
            ajax.request({url:'/user/'+user+'/issues/'+issue+'/comments'})
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

    /**
     * Adds a comment on an issue via the server.
     * @param user {String} the username
     * @param issue {String} the issue id
     * @param body {String} the comment body
     * @returns {Promise} that resolves with the comment or rejects with an error
     */
    addComment({user, issue, body=''}) {
        return new Promise((resolve, reject) => {
            ajax.request({url:'/user/'+user+'/issues/'+issue+'/comments', method: 'POST', message:JSON.stringify({body: body})})
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

    /**
     * Gets an issue from the server.
     * @param user {String} the username
     * @param issue {String} the issue id
     * @param comment {String} the comment id
     * @returns {Promise} that resolves when comment is deleted or rejects with an error
     */
    deleteComment({user, issue, comment}) {
        return new Promise((resolve, reject) => {
            ajax.request({url:'/user/'+user+'/issues/'+issue+'/comments/'+comment, method: 'DELETE'})
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }
}

//Exports.
module.exports = IssueManager;