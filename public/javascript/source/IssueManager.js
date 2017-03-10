/**
 * Module to send ajax request to the server
 * for managing the issues and the comments.
 */

//Requires.
let ajax = require("./ajax.js");


class IssueManager {
    constructor() {

    }

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

    addIssue({user, title='no title', body=''}) {
        return new Promise((resolve, reject) => {
            ajax.request({url:'/user/'+user+'/issues/', method: 'POST', message:JSON.stringify({title: title, body: body})})
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

    closeIssue({user, issue}) {
        return new Promise((resolve, reject) => {
            ajax.request({url:'/user/'+user+'/issues/'+issue, method: 'PUT'})
                .then((response) => {
                    resolve(response);
                })
                .catch((error) => {
                    reject(error);
                })
        });
    }

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