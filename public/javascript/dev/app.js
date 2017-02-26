/**
 * App runs and sets up a websocket
 * against the server, and manages ajax-calls
 * to handle issues and comments remotely.
 */

//Requires.
let Socket = require('./WebSocket');
let IssueManager = require("./IssueManager.js");
let ws = new Socket();
let im = new IssueManager();
let formTemplate = require('../../../views/issues/form.handlebars');
let formdiv = document.querySelector('#forms form');

//DOM
let issueView = document.querySelector('#issueview');
let formView = document.querySelector('#forms');
let happenings = document.querySelector('#happenings');

//connect to the socket
ws.connect('ws://localhost:8000/')
    .then((result) => {
        console.log('connected');
    })
    .catch((error) => {
        console.log(error);
    });

//set up event listeners

issueView.addEventListener('click', (event) => {
    event.preventDefault();
    let issue;
    let user = document.querySelector('#topbar').getAttribute('data-username');
    let action = event.target.getAttribute('data-action');
    if (event.path[2].classList.contains('issue')) {
        issue = event.path[2].getAttribute('data-id');
    }


    switch(action) {
        case 'addissue':
            formdiv.innerHTML = formTemplate({action: action});
            happenings.classList.add('hide');
            formView.classList.remove('hide');
            break;
        case 'editissue':
            im.getIssue({user: user, issue: issue})
                .then((result) => {
                    result = JSON.parse(result);
                    result.action = action;
                    formdiv.innerHTML = formTemplate(result);
                    happenings.classList.add('hide');
                    formView.classList.remove('hide');
                });
            break;
        case 'lockissue':
            im.closeIssue({user: user, issue: issue});
            break;
            break;
        case 'viewcomments':
            im.getComments(issue);
            break;
    }

});


formView.addEventListener('click', (event) => {
    event.preventDefault();
    let title;
    let content;
    let issueID;
    let action = event.target.getAttribute('data-action');
    let user = document.querySelector('#topbar').getAttribute('data-username');

    switch(action) {
        case 'addissue':
            title = event.target.form.querySelector('input[name="title"]').value;
            content = event.target.form.querySelector('textarea[name="content"]').value;
            im.addIssue({user:user, title:title, body:content})
                .then(() => {
                    happenings.classList.remove('hide');
                    formView.classList.add('hide');
                });
            break;
        case 'editissue':
            title = event.target.form.querySelector('input[name="title"]').value;
            content = event.target.form.querySelector('textarea[name="content"]').value;
            issueID = event.target.form.querySelector('input[name="issue"]').value;
            im.editIssue({user:user, title:title, body:content, issue: issueID})
                .then(() => {
                    happenings.classList.remove('hide');
                    formView.classList.add('hide');
                });
            break;
        case 'viewcomments':
            im.getComments(issue);
            break;
    }
});
