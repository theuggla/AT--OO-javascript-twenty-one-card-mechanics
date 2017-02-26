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
    let action = event.target.getAttribute('data-action');
    if (event.path[2].classList.contains('issue')) {
        issue = event.path[2].getAttribute('data-id');
    }

    happenings.classList.add('hide');
    formView.classList.remove('hide');

    switch(action) {
        case 'addissue':
            formdiv.innerHTML = formTemplate({action: action, issue: issue});
            break;
        case 'editissue':
            im.getIssue(issue);
            break;
        case 'closeissue':
            im.closeIssue(issue);
            break;
        case 'viewcomments':
            im.getComments(issue);
            break;
    }

});


formView.addEventListener('click', (event) => {
    event.preventDefault();
    let action = event.target.getAttribute('data-action');
    let user = document.querySelector('#topbar').getAttribute('data-username');

    switch(action) {
        case 'addissue':
            let title = event.target.form.querySelector('input[name="title"]').value;
            let content = event.target.form.querySelector('textarea[name="content"]').value;
            im.addIssue({user:user, title:title, body:content})
                .then(() => {
                    happenings.classList.remove('hide');
                    formView.classList.add('hide');
                });
            break;
        case 'editissue':
            im.editIssue(issue);
            break;
        case 'closeissue':
            im.closeIssue(issue);
            break;
        case 'viewcomments':
            im.getComments(issue);
            break;
    }
});
