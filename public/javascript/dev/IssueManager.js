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

    getComments(issue) {
        console.log('getting comments for ' + issue);
    }

    addComment(issue) {
        console.log('adding comment for' + issue);
    }

    deleteComment(issue, comment) {
        console.log('delete comment ' + comment +' for ' + issue);
    }

    editComment(issue, comment) {
        console.log('editing comment ' + comment +' for ' + issue);
    }
}

//Exports.
module.exports = IssueManager;