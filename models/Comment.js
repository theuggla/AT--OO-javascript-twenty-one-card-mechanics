/**
 * Module to model a view of a comment.
 */

function Comment(data) {
    return {
        user: {
            username: data.user.login,
            avatar: data.user.avatar_url
        },
        body: data.body,
        id: data.id,
        issue: data.issue,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
}

//Exports.
module.exports = Comment;
