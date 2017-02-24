/**
 * A module for handling the user-actions against the database.
 */

//Requires.
let User = require('../models/User');

/**
 * Adds or finds a User in the database.
 * Criteria for finding is that data.id matches the github id in the database.
 * @param data {Object} the id, username and /optional/ link to avatar and
 * github profile of the user.
 * @returns {Promise} that resolves with the user if the user is successfully found or added,
 * or rejects with the error.
 */
function findOrAdd(data) {
    return new Promise((resolve, reject) => {
        User.find({githubid: data.id})
            .then((result) => {

                //if the user already exists, return
                if (result.length > 0) {
                    return resolve(result[0]);
                }

                //create the user
                let user = new User({
                    githubid: data.id,
                    username: data.username,
                    avatar: data.photos[0].value,
                    profileUrl: data.profileUrl
                });

                //validate
                user.save()
                    .then(() => {
                        //return the user
                        resolve(user);
                    })
                    .catch((error) => {
                         //if validation failed, reject with why
                        if (error.name === 'ValidationError') {
                            let errorkeys = Object.keys(error.errors);
                            let errorMessages = errorkeys.map((key) => {
                               return error.errors[key].message;
                            });
                            reject(new Error(errorMessages.join(' and ')));
                        } else {
                            //if something else failed, reject with error
                            reject(error);
                        }

                    });
            });
    });
}

/**
 * Deletes a user from the database.
 */
function deleteUser(username) {
    return new Promise((resolve, reject) => {
        User.findOneAndRemove({username: username}, (error) => {
            if (error) {
                if (error.name === 'CastError') { //the username didn't exist
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

//Exports.
module.exports = {
    findOrAdd: findOrAdd,
    delete: deleteUser
};