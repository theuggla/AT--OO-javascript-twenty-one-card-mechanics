/**
 * Module that sets up connection
 * to a web socket server
 * and prints received messages.
 */

//Requires.
let eventTemplate = require('../../../views/partials/event.handlebars');


function WebSocket() {

    let socketconnection;
    /**
     * Connects to the WebSocket server.
     * @returns {Promise} that resolves when the connection is open
     * and rejects with the server response if something went wrong.
     * If a connection is already open, resolves with
     * the socket for that connection.
     */
    function connect(url)  {
        return new Promise((resolve, reject) => {
            let socket = socketconnection;
            //check for established connection
            if (socket && socket.readyState && socket.url === url) {
                resolve(socket);
            } else {
                //connects to websocket with the user as a suggested protocol
                let user = document.querySelector('#topbar').getAttribute('data-username');
                socket = new WebSocket(url, user);

                socket.addEventListener('open', () => {
                    resolve(socket);
                });

                socket.addEventListener('error', () => {
                    reject(new Error('could not connect to server'));
                });

                socket.addEventListener('message', (event) => {
                    let response = JSON.parse(event.data);

                    if (response.type) {
                        let happenings = document.querySelector('#happenings');
                        let eventdiv = document.importNode(document.querySelector('#eventTemplate').content.firstElementChild, true);
                        eventdiv.classList.add(response.type);
                        eventdiv.innerHTML = eventTemplate(response);

                        if (happenings.firstElementChild) {
                            happenings.insertBefore(eventdiv, happenings.firstElementChild);
                        } else {
                            happenings.appendChild(eventdiv);
                        }
                    }

                });

                this.socket = socket;
            }
        });
    }

    return connect;
}

module.exports = {
    connect: WebSocket()
};
