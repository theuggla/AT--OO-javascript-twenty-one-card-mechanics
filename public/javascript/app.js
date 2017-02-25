/**
 * App runs and sets up a websocket
 * against the server, and manages ajax-calls
 * to handle issues and comments remotely.
 */

let app = {
    /**
     * Connects to the WebSocket server.
     * @returns {Promise} that resolves when the connection is open
     * and rejects with the server response if something went wrong.
     * If a connection is already open, resolves with
     * the socket for that connection.
     */
    connect: function(url)  {
        return new Promise((resolve, reject) => {
            let socket = this.socket;
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
                    //should be using templating but is not, because this is a server side app mostly
                    let response = JSON.parse(event.data);
                    let eventTemplate = document.querySelector('#eventTemplate').content;
                    let happenings = document.querySelector('#happenings');
                    let eventdiv = document.importNode(eventTemplate, true);
                    eventdiv.querySelector('h2').textContent = response.title;
                    eventdiv.querySelector('#eventdata').textContent = response.body;
                    eventdiv.querySelector('#userinfo p').textContent = response.sender.username;
                    eventdiv.querySelector('#userinfo img').src = response.sender.avatar;
                    eventdiv.firstElementChild.classList.add(response.type);
                    happenings.insertBefore(eventdiv, happenings.firstElementChild);
                });

                this.socket = socket;
            }

        });

    }
};

//connect to the socket
app.connect('ws://localhost:8000/')
    .then((result) => {
        console.log('connected');
    })
    .catch((error) => {
        console.log(error);
    });

