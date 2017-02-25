/**
 * Module to model a view of an event.
 */

function Event(data) {
    let event = {
        action: data.action
    };

    if (data.comment) {
        event.type = 'comment';
        event.body = data.comment.body;
        event.title = 'comment on ' + data.issue.title;
    } else if (data.issue) {
        event.type = 'issue';
        event.body =  data.issue.body;
        event.title = 'new issue: ' + data.issue.title
    } else {
        return {};
    }

    event.sender = {
        username: data.sender.login,
        avatar: data.sender.avatar_url
    };

    return event;
}

//Exports.
module.exports = Event;