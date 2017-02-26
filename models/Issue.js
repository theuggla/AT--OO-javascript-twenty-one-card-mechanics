/**
 * Module to model a view of an issue.
 */

function Issue(data) {
    return {
        title: data.title,
            user: {
        username: data.user.login,
            avatar: data.user.avatar_url
    },
        state: data.state,
            body: data.body,
        comments: data.comments,
        id: data.id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
}

//Exports.
module.exports = Issue;