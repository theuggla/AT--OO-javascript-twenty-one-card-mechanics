/**
 * Module for ajax-requests.
 *
 * @author Molly Arhammar
 * @version 1.0
 */


/**
 * @param url {string} where to sent the request
 * @param method {string} the HTML-request method
 * @param type {string} the type of request
 * @param message the message to send
 * @returns {Promise}
 */
function request({url = "", method = "GET", type = "application/json", message}) {
    return new Promise(function(resolve, reject) {
        let req = new XMLHttpRequest();

        req.addEventListener("load", () => {
            if (req.status >= 400) {
                reject(req.status);
            } else {
                resolve(req.response);
            }
        });

        req.open(method, url);
        req.setRequestHeader("Content-type", type);
        req.send(message);
    });
}

function get(config) {
    config.method = "GET";
    return request(config);
}

function post(config) {
    config.method = "POST";
    return request(config);
}


//Exports.
module.exports.request = request;
module.exports.get = get;
module.exports.post = post;
