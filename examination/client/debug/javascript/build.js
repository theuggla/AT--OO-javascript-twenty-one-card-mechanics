(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function WindowManager(windowSpace) {
    let wm = {};

    class WindowManager {

        constructor(windowSpace) {
            wm.startX = windowSpace.offsetLeft + 20;
            wm.startY = windowSpace.offsetTop + 20;
            wm.types = 0;
        }

        createWindow(type) {
            let aWindow = document.createElement("draggable-window");

        /*make template, if no windows open of kind etc
         let link = document.createElement("link");
         link.setAttribute("rel", "import");
         link.setAttribute("href", "/draggable-window.html");
         document.head.appendChild(link);
         event.target.setAttribute("label", type);*/

            windowSpace.appendChild(aWindow);
            setupSpace(type, aWindow);

            if (wm[type].open) {
                wm[type].open.push(aWindow);
            } else {
                wm[type].open = [aWindow];
            }

            return aWindow;
        }

        open(type) {
            if (wm[type]) {
                let result = [];
                let windows = wm[type].open;
                result = windows.filter( (w) => {
                    return w.open;
                });
                wm[type].open = result;
                return result;
            } else {
                return 0;
            }
        }

        expand(type) {
            let wins = this.open(type);
            if (wins) {
                wins.forEach((w) => {
                    w.minimized = false;
                });
            }
        }

        minimize(type) {
            let wins = this.open(type);
            if (wins) {
                wins.forEach((w) => {
                    w.minimized = true;
                });
            }

        }

        close(type) {
            let wins = this.open(type);
            if (wins) {
                console.log(wins);
                wins.forEach((w) => {
                    w.close();
                });
            }
        }
    }

    return new WindowManager(windowSpace);

    //helper functions
    function setupSpace(type, space) {
        let destination = {};
        let x;
        let y;

        if (wm[type]) {
            destination.x = (wm[type].latestCoords.x += 50);
            destination.y = (wm[type].latestCoords.y += 50);

            if (!(withinBounds(space, windowSpace, destination))) {
                x = wm[type].startCoords.x += 5;
                y = wm[type].startCoords.y += 5;
                wm[type].latestCoords.x = x;
                wm[type].latestCoords.y = y;
            } else {
                x = destination.x;
                y = destination.y;
            }

        } else {
            destination.x = (wm.startX + (60 * wm.types));
            destination.y = (wm.startY);

            if (!(withinBounds(space, windowSpace, destination))) {
                x = wm.startX;
                y = wm.startY;
            } else {
                x = destination.x;
                y = destination.y;
            }

            wm[type] = {};
            wm[type].startCoords = {
                x: x,
                y: y
            };
            wm[type].latestCoords = {
                x: x,
                y: y
            };
            wm.types += 1;
        }
        space.tabIndex = 0;
        space.style.top = y + "px";
        space.style.left = x + "px";
    }

    function withinBounds(element, container, coords) {
        let minX = container.offsetLeft;
        let maxX = (minX + container.clientWidth) - (element.getBoundingClientRect().width);
        let minY = container.offsetTop;
        let maxY = (minY + container.clientHeight) - (element.getBoundingClientRect().height);

        return (coords.x <= maxX && coords.x >= minX && coords.y <= maxY && coords.y >= minY);
    }
}

module.exports = WindowManager;


},{}],2:[function(require,module,exports){
/**
 * Starting point fpr the application.
 * The application would work better when used with HTTP2
 * due to the fact that it makes use of web-components,
 * but it's been built with browserify to work as a
 * normal HTTP1 application in lieu of this.
 * @author Molly Arhammar
 * @version 1.0
 */


//to make web components work with browserify
let window = require('./draggable-window.js');
let menu = require("./expandable-menu-item.js");
let memoryGame = require('./memory-game.js');
let memoryApp = require('./memory-app.js');
let instaChat= require('./insta-chat.js');
let instaChatApp = require('./insta-chat-app.js');

//requires
let desktop = require("./desktop.js");


},{"./desktop.js":3,"./draggable-window.js":4,"./expandable-menu-item.js":5,"./insta-chat-app.js":6,"./insta-chat.js":7,"./memory-app.js":8,"./memory-game.js":9}],3:[function(require,module,exports){
//requires
let WindowManager = require("./WindowManager.js");


//nodes
let mainMenu = document.querySelector("#windowSelector");
let windowSpace = document.querySelector("#openWindows");
let subMenuTemplate = document.querySelector("#subMenu");

//variables
let WM = WindowManager(windowSpace);
let top = 1;

Array.prototype.forEach.call(mainMenu.children, (node) => {
    addSubMenu(node);
});

mainMenu.addEventListener('dblclick', (event) => {
    let type = event.target.getAttribute("data-kind") || event.target.parentNode.getAttribute("data-kind");
    if (type) {
        WM.createWindow(type).focus();
    }
    event.preventDefault();
});

addEventListeners(mainMenu, 'click focusout', (event) => {
    let mainMenuItems = mainMenu.querySelectorAll('expandable-menu-item');
    mainMenuItems.forEach((item) => {
        if ((item !== event.target && item !== event.target.parentElement) && (item.displayingSubMenu)) {
            item.toggleSubMenu(false);
        }
    })
});

windowSpace.addEventListener('focus', (event) => {
    event.target.style.zIndex = top;
    top += 1;
}, true);

function addSubMenu(item) {
    let instance = document.importNode(subMenuTemplate.content, true);
    let label = item.getAttribute('label');

    Array.prototype.forEach.call(instance.children, (node) => {
        node.setAttribute('label', label);
    });

    item.appendChild(instance);

    item.addEventListener('click', (event) => {
        switch (event.target.getAttribute('data-task')) {
            case 'open':
                WM.createWindow(label).focus();
                break;
            case 'close':
                WM.close(label);
                break;
            case 'minimize':
                WM.minimize(label);
                break;
            case 'expand':
                WM.expand(label);
                break;
            default:
                break;
        }
        if (event.type === 'click') {
            event.preventDefault();
        }
    });
}

function addEventListeners (element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}

},{"./WindowManager.js":1}],4:[function(require,module,exports){
/*
* A module for a custom HTML element draggable-window to form part of a web component.
* It creates a window that can be moved across the screen, closed and minimized.
* @author Molly Arhammar
* @version 1.0.0
*
*/


let windowTemplate = document.querySelector('link[href="/draggable-window.html"]').import.querySelector("#windowTemplate"); //shadow DOM import

class DraggableWindow extends HTMLElement {
    /**
     * Initiates a draggable-window, sets up shadow DOM.
     */
    constructor() {
        super();

        //setup shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open", delegatesFocus: true});
        let instance = windowTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
    }

    /**
     * Runs when window is inserted into the DOM.
     * Sets up event listeners and behaviour of the window.
     */
    connectedCallback() {

        //set behaviour
        makeDraggable(this, this.parentNode);

        //add event listeners
        this.addEventListener("click", (event) => {
            let target = event.composedPath()[0]; //follow the trail through shadow DOM
            let id = target.getAttribute("id");
            if (id === "close") {
                this.close();
            } else if (id === "minimize") {
                this.minimized = true;
            }
            if (event.type === 'click') { //make work with touch events
                event.preventDefault();
            }
        });

        this.open = true;
    }

    /**
     * Sets up what attribute-changes to watch for in the DOM.
     * @returns {[string]} an array of the names of the attributes to watch.
     */
    static get observedAttributes() {
        return ['open'];
    }

    /**
     * Watches for attribute changes in the DOM according to observedAttributes()
     * @param name the name of the attribute
     * @param oldValue the old value
     * @param newValue the new value
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.open) {
            this.close();
        }
    }

    /**
     * @returns {boolean} true if the window has attribute 'open'
     */
    get open() {
        return this.hasAttribute('open');
    }

    /**
     * Sets the 'open' attribute on the window.
     * @param open {boolean} whether to add or remove the 'open' attribute
     */
    set open(open) {
        if (open) {
            this.setAttribute('open', '');
        } else {
            this.removeAttribute('open');
        }
    }

    /**
     * @returns {boolean} true if the window has attribute 'minimized'
     */
    get minimized() {
        return this.hasAttribute('minimized');
    }

    /**
     * Sets the 'minimized' attribute on the window.
     * @param minimize {boolean} whether to add or remove the 'minimized' attribute
     */
    set minimized(minimize) {
        if (minimize) {
            this.setAttribute('minimized', '');
        } else {
            this.removeAttribute('minimized');
        }
    }

    /**
     * Closes the window. Removes it from the DOM and sets all attributes to false.
     */
    close() {
        this.open = false;
        this.minimized = false;
        this.parentNode.removeChild(this);
    }

}

//helper function
//makes an element draggable with  mouse, arrows and touch
function makeDraggable(el) {
    let arrowDrag;
    let mouseDrag;
    let dragoffset = { //to make the drag not jump from the corner
        x: 0,
        y: 0
    };

    let events = function() {
        addEventListeners(el, 'focusin mousedown touchmove', ((event) => {
            let target;
            if (event.type === 'touchmove') {
                target = event.targetTouches[0]; //make work with touch event
            } else {
                target = event;
            }
            arrowDrag = true;
            if (event.type === 'mousedown' || event.type === 'touchmove') {
                mouseDrag = true;
                dragoffset.x = target.pageX - el.offsetLeft;
                dragoffset.y = target.pageY - el.offsetTop;
            }
        }));
        addEventListeners(el, 'focusout mouseup', (() => {
            if (event.type === 'mouseup') {
                if (mouseDrag) {
                    mouseDrag = false;
                }
            } else {
                arrowDrag = false;
            }
        }));
        addEventListeners(document, 'mousemove keydown touchmove', ((event) => {
            let destination = {}; //as to not keep polling the DOM

            if (mouseDrag) {
                destination.y = (event.pageY - dragoffset.y);
                destination.x = (event.pageX - dragoffset.x);
            } else if (arrowDrag) {
                destination.y = parseInt(el.style.top.slice(0, -2));
                destination.x = parseInt(el.style.left.slice(0, -2));

                switch (event.key) {
                    case 'ArrowUp':
                        destination.y -= 5;
                        break;
                    case 'ArrowDown':
                        destination.y += 5;
                        break;
                    case 'ArrowLeft':
                        destination.x -= 5;
                        break;
                    case 'ArrowRight':
                        destination.x += 5;
                        break;
                }
            }

            if (mouseDrag || arrowDrag) {
                el.style.left = destination.x  + "px";
                el.style.top = destination.y  + "px";
            }

        }));
    };

    events();
}

//helper function
//adds multiple event listeners with identical handlers
function addEventListeners(element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}

//defines the element
customElements.define('draggable-window', DraggableWindow);

},{}],5:[function(require,module,exports){
/*
 * A module for a custom HTML element expandable-menu-item form part of a web component.
 * It creates an item that when clicked toggles to show or hide sub-items.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

let menuTemplate = document.querySelector('link[href="/expandable-menu-item.html"]').import.querySelector("#menuItemTemplate"); //shadow DOM import


class ExpandableMenuItem extends HTMLElement {
    /**
     * Initiates a draggable-window, sets up shadow DOM.
     */
    constructor() {
        super();

        //set up shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open", delegatesFocus: "true"});
        let instance = menuTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

    }

    /**
     * Runs when window is inserted into the DOM.
     * Sets up event listeners and behaviour of the item.
     */
    connectedCallback() {
        makeExpandable(this);
    }

    /**
     * @returns {[node]} an array of the subitems the item has assigned in the DOM.
     * A subitem counts as an item that has the slot of 'subitem' and the same label
     * as the expandable menu item itself.
     */
    get subMenu() {
        let label = this.getAttribute('label');
        return Array.prototype.filter.call(this.querySelectorAll('[slot="subitem"]'), (node) => {
            let nodeLabel = node.getAttribute('label');
            return nodeLabel === label;
        });
    }

    /**
     * @returns {boolean} true if the item is currently displaying the submenu-items.
     */
    get displayingSubMenu() {
        return !this.subMenu[0].hasAttribute('hide');
    }

    /**
     * Shows or hides the submenu-items.
     * @param show {boolean} whether to show or hide.
     */
    toggleSubMenu(show) {
        if (show) {
            this.subMenu.forEach((post) => {
                post.removeAttribute('hide');
            });
        } else {
            this.subMenu.forEach((post) => {
                post.setAttribute('hide', '');
            });
        }

    }

}

//defines the element
customElements.define('expandable-menu-item', ExpandableMenuItem);

//helper function to make the item expandable
//takes the item to expand as a parameter
function makeExpandable(item) {
    let nextFocus = 0;
    let show = false;
    let arrowExpand;
    let mouseExpand;

    let events = function () {
        addEventListeners(item, 'focusin click', ((event) => {
                arrowExpand = true;
                if (event.type === 'click') {
                    mouseExpand = true;
                    show = !show;
                    item.toggleSubMenu(show);
                    event.preventDefault();
                } else {
                    item.toggleSubMenu(true);
                }

        }));
        addEventListeners(item, 'keydown', ((event) => { //make the sub-items traversable by pressing the arrow keys
                if (arrowExpand) {
                    switch (event.key) {
                        case 'ArrowRight':
                            item.toggleSubMenu(true);
                            break;
                        case 'ArrowLeft':
                            item.toggleSubMenu(false);
                            break;
                        case 'ArrowUp':
                            if (!item.displayingSubMenu) {
                                item.toggleSubMenu(true);
                            }
                            nextFocus -= 1;
                            if (nextFocus < 0 || nextFocus >= item.subMenu.length) {
                                nextFocus = item.subMenu.length -1;
                            }
                            item.subMenu[nextFocus].focus();
                            focus(item, item.subMenu[nextFocus]); //make it accessible via css visual clues even if the active element is hidden within shadowDOM
                            break;
                        case 'ArrowDown':
                            if (!item.displayingSubMenu) {
                                item.toggleSubMenu(true);
                            }
                            nextFocus += 1;
                            if (nextFocus >= item.subMenu.length || nextFocus < 0) {
                                nextFocus = 0;
                            }
                            item.subMenu[nextFocus].focus();
                            focus(item, item.subMenu[nextFocus]); //make it accessible via css visual clues even if the active element is hidden within shadowDOM
                            break;
                    }
                }

        }));
    };

    events();
}

//helper function
//adds multiple event listeners with identical handlers
function addEventListeners(element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}

// Adds a 'focused' attribute to the desired subitem and
// removes it from other sub items to help
// with accessibility and shadow DOm styling.
function focus(item, element) {
    let subs = item.subMenu;
    subs.forEach((sub) => {
        if (sub === element) {
            sub.setAttribute('focused', '');
        } else {
            sub.removeAttribute('focused');
        }
    });
}

},{}],6:[function(require,module,exports){
let chatWindowTemplate = document.querySelector('link[href="/insta-chat-app.html"]').import.querySelector("#chatWindowTemplate");

class InstaChatApp extends HTMLElement {
    constructor() {
        super();

        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = chatWindowTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
    }

    connectedCallback() {
        if (!localStorage.chatName) {
            //be om namn
        } else {
            //display input, hide chat. bara adda en hide - class
            //chat.setcofig (name = newname)
        }

        //event.listener - meny -> name
        //display input, hide chat. bara adda en hide - class
        //chat.setcofig (name = newname)
        //event listener meny - about
        //display about, hide chat. bara adda en hide - class
        //sen gör samma på memory med about och highscore
    }

    disconnectedCallback() {
        //close
        //sen gör samma på memory app
    }

    close() {
        //draggable window close
        //websocket close
    }
}

customElements.define('insta-chat-app', InstaChatApp);

},{}],7:[function(require,module,exports){
/*
 * A module for a custom HTML element insta-chat to form part of a web component.
 * It creates a chat connected to a web socket that sends, receives and prints
 * messages.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

let chatTemplate = document.querySelector('link[href="/insta-chat-app.html"]').import.querySelector('link[href="/insta-chat.html"]').import.querySelector("#chatTemplate"); //shadow DOM import
let messageTemplate = document.querySelector('link[href="/insta-chat-app.html"]').import.querySelector('link[href="/insta-chat.html"]').import.querySelector("#messageTemplate"); //message display template

class InstaChat extends HTMLElement {
    /**
     * Initiates a chat, sets up shadow DOM.
     * @param config {object} a config object with the websockets url, channel, key and a name for the user
     * @param startMessages {[Object]} messages to print at the start of the chat.
     */
    constructor(config = {}, startMessages) {
        super();

        //setup shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = chatTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

        //set config object as this.config
        this.config = {
            url: config.url || 'ws:vhost3.lnu.se:20080/socket/',
            name: config.name || 'severus snape',
            channel: config.channel || '',
            key: config.key || 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
        };
        this.messages = startMessages || [];
        this.socket = null;
        this.onlineChecker = null;
    }

    /**
     * Runs when chat is inserted into the DOM.
     * Connects to the server, sets up event listeners and prints
     * already saved messages if any.
     */
    connectedCallback() {
        //connect
        this.connect();

        //set event listener to send message on enter
        this.shadowRoot.querySelector('#messageArea').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.send(event.target.value);
                event.target.value = '';
                event.preventDefault();
            }
        });

        //if messages to print at start of chat, print each
        if (this.messages.length > 0) {
            this.messages.forEach((message) => {
                this.print(message);
            });
        }
    }

    /**
     * Closes the web socket connection if chat is removed from the DOM.
     */
    disconnectedCallback() {
        this.socket.close();
    }

    /**
     * Connects to the WebSocket server.
     * @returns {Promise} that resolves when the connection is open
     * and rejects with the server response if something went wrong.
     * If a connection is already open, resolves with
     * the socket for that connection.
     */
    connect() {
        return new Promise((resolve, reject) => {

            let socket = this.socket;

            //check for established connection
            if (socket && socket.readyState) {
                resolve(socket);
            } else {
                socket = new WebSocket(this.config.url);

                socket.addEventListener('open', () => {
                    this.resetOnlineChecker();
                    resolve(socket);
                });

                socket.addEventListener('error', (event) => {
                    reject(new Error('could not connect to server'));
                });

                socket.addEventListener('message', (event) => {
                    let response = JSON.parse(event.data);
                    console.log(response);
                    if (response.type === 'message') {
                        this.print(response);
                        this.messageManager.setChatLog(response); //save message in local storage
                    } else if (response.type === 'heartbeat') {
                        console.log('heartbeat');
                        this.resetOnlineChecker(); //reset for every heartbeat
                        this.messageManager.getUnsent().forEach((message) => {
                            this.send(message);
                        });
                        this.messageManager.clearUnsent(); //push unsent messages when there is a connection
                    }
                });

                this.socket = socket;
            }

        });

    }

    /**
     * Sends a message to the server.
     * @param message {string} the message to send.
     */
    send(message) {

        let data = {
            type: 'message',
            data: message,
            username: this.config.name,
            channel: this.config.channel,
            key: this.config.key
        };

        this.connect()
            .then((socket) => {
                socket.send(JSON.stringify(data));
        }).catch((response) => {
            this.messageManager.setUnsent(data);
            this.print(data, true); //print message as "unsent" to make it look different;
        });

    }

    /**
     * Prints a message.
     * @param message {Object} the message to print.
     * @param unsent {boolean} true if the message has not been successfully sent
     */
    print(message, unsent) {
        let chatWindow = this.shadowRoot.querySelector('#messageWindow');
        let messageDiv = document.importNode(messageTemplate.content.firstElementChild, true);
        messageDiv.querySelector('.author').textContent = message.data.username || message.username;
        messageDiv.querySelector('.message').textContent = message.data.data || message.data;

        if (unsent) {
            messageDiv.classList.add('unsent');
        }

        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    /**
     * Clears and sets a new timeout to make sure server is still connected.
     * If connection is lost and then regained, prints all unsent messages.
     */
    resetOnlineChecker() {
        clearTimeout(this.onlineChecker);

        this.onlineChecker = setTimeout(() => {
            //TODO: something here
        }, 60000);
    }

    /**
     * Returns an object to manage messages.
     * @returns {object} the object.
     */
    get messageManager() {
            let storage = localStorage;
            let chatLog = [];
            let unsent = [];

        return {
            /**
             * Retrieves chat log from local storage
             * @returns {Object} the , or undefined if there are no messages
             */
            getChatLog: function() {
                if (storage.chatLog) {
                    chatLog = JSON.parse(storage.chatLog);
                }

                return chatLog;
            },
            /**
             * Retrieves unsent messages from local storage
             * @returns {Object} the messages, or undefined if there are no messages
             */
            getUnsent: function() {
                if (storage.unsent) {
                    unsent = JSON.parse(storage.unsent);
                }

                return unsent;
            },
            /**
             * sets unsent messages in local storage
             * @param message {object} the message object to save
             */
            setUnsent: function(message) {
                let oldMessages;

                debugger;
                if (storage.unsent) {
                    oldMessages = JSON.parse(storage.unsent);
                } else {
                    oldMessages = [];
                }

                oldMessages.push(message);

                storage.unsent = JSON.stringify(oldMessages);
            },
            /**
             * Clears unsent messages.
             */
            clearUnsent: function() {
                storage.removeItem('unsent');
            },

            /**
             * Sets sent messages in local storage
             * @param message {object} the message object to save
             */
            setChatLog: function(message) {
                let oldMessages;

                if (storage.chatLog) {
                    oldMessages = JSON.parse(storage.chatLog);
                } else {
                    oldMessages = [];
                }

                oldMessages.push(message);

                if (oldMessages.length > 20) { //keep the list to 20 messages
                    oldMessages.length = 20;
                }

                storage.chatLog = JSON.stringify(oldMessages);
            }
        };
    }

    /**
     * Updates the config file.
     * @param config {object} the new values in an object.
     */
    changeConfig(config) {
        this.config.name = config.name || this.config.name;
        this.config.url = config.url|| this.config.url;
        this.config.channel = config.channel || this.config.channel;
        this.config.key = config.key || this.config.key;
    }
}

//defines the element
customElements.define('insta-chat', InstaChat);


},{}],8:[function(require,module,exports){
let memoryWindowTemplate = document.querySelector('link[href="/memory-app.html"]').import.querySelector("#memoryWindowTemplate");
let highscoresTemplate = document.querySelector('link[href="/memory-app.html"]').import.querySelector("#highscoresTemplate");

class MemoryApp extends HTMLElement {
    constructor() {
        super();

        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = memoryWindowTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
    }

    connectedCallback() {
        let game = this.shadowRoot.querySelector('memory-game');
        this.addEventListener('click', (event) => {
            let target = event.path[0];
            if (target.getAttribute('data-task')) {
                switch (target.getAttribute('data-task')) {
                    case 'restart':
                        this.shadowRoot.querySelector('memory-game').replay();
                        break;
                    case 'new':
                        this.shadowRoot.querySelector('memory-game').restart();
                        break;
                    case 'quit':
                        this.close();
                        break;
                    case 'highscores':
                        game.end();
                        this.displayHighscores(game.result);
                        break;
                }
            } else if (target.getAttribute('boardsize')) {
                this.user = this.shadowRoot.querySelector('#intro input').value || 'stranger';
                switch (target.getAttribute('boardsize')) {
                    case '44':
                        game.width = 4;
                        game.height = 4;
                        game.draw();
                        game.play();
                        break;
                    case '42':
                        game.width = 4;
                        game.height = 2;
                        game.draw();
                        game.play();
                        break;
                    case '24':
                        game.width = 2;
                        game.height = 4;
                        game.draw();
                        game.play();
                        break;
                }
            }
        });

    }

    displayHighscores(result) {
        let highscores = {
            storage: localStorage,
            scores: undefined,
            /**
             * Retrieves highscores from local storage
             * @returns {Object} the highscore-list, or undefined if there are no highscores
             */
            getHighScores: function () {
                if (this.storage.memoryHighScores) {
                    this.scores = JSON.parse(this.storage.memoryHighScores);
                }

                return this.scores;
            },
            /**
             * sets highscores in local storage
             * @param user {string} the users name
             * @param newScore {number} the score to set
             */
            setHighScores: function (user, newScore) {
                let oldHighScores;
                let newHighScores;

                if (this.storage.memoryHighScores) {
                    oldMessages = JSON.parse(this.storage.memoryHighScores);
                } else {
                    oldMessages = [];
                }

                oldMessages.push({user: user, score: newScore});

                newHighScores = oldMessages.sort((a, b) => {
                    return a.score - b.score;
                });

                if (newHighScores.length > 5) { //keep the list to 5 scores
                    newHighScores.length = 5;
                }

                this.storage.memoryHighScores = JSON.stringify(newHighScores);
            }
        };

        if (result) {
            let score = (result.turns * result.time) / (this.height * this.width);
            highscores.setHighScores(this.user, result.turns);
        }

        let scores = highscores.getHighScores();
        let highscoreDisplay = this.shadowRoot.querySelector('#highscoreDisplay');
        let oldList = highscoreDisplay.querySelector('ul');
        let list = document.importNode(highscoresTemplate.content.querySelector("ul"), true);
        let entry;

        if (scores) {
            scores.forEach((score) => {
                entry = document.importNode((list.querySelector("li")));
                entry.textContent = score.user + ": " + score.score;
                list.appendChild(entry);
            });
        } else {
            entry = document.importNode((list.querySelector("li")));
            entry.textContent = "-";
            list.appendChild(entry);
        }

        if (!oldList) { //if scores have already been displayed, replace them
            highscoreDisplay.appendChild(list);
        } else {
            highscoreDisplay.replaceChild(list, oldList);
        }
    }

    close() {
        this.shadowRoot.querySelector('draggable-window').close();
        this.parentNode.removeChild(this);
    }

}

customElements.define('memory-app', MemoryApp);

},{}],9:[function(require,module,exports){
/*
 * A module for a custom HTML element memory-game to form part of a web component.
 * It creates a memory game with a timer a a turn-counter. The game is over when
 * all bricks have been paired and stores the total time and turns in a result-variable.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

let memoryTemplate = document.querySelector('link[href="/memory-app.html"]').import.querySelector('link[href="/memory-game.html"]').import.querySelector("#memoryTemplate"); //shadow DOM import
let brickTemplate = document.querySelector('link[href="/memory-app.html"]').import.querySelector('link[href="/memory-game.html"]').import.querySelector("#brickTemplate"); //brick template

//requires
let Timer = require('./timer.js');


class MemoryGame extends HTMLElement {
    /**
     * Initiates a memory game, sets up shadow DOM.
     */
    constructor(width, height) {
        super();

        //setup shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = memoryTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

        //set width and height attributes
        this.setAttribute('data-width', width || this.getAttribute('data-width') || 4);
        this.setAttribute('data-height', height || this.getAttribute('data-height')  || 4);

        //set references
        this.set = [];
        this.timer = new Timer(0);
        this.gamePlay = undefined;
        this.timespan = this.shadowRoot.querySelector("#timespan");
        this.turnspan = this.shadowRoot.querySelector("#turnspan");

    }

    /**
     * Runs when memory is inserted into the DOM.
     * Adds event listeners and renders a board with bricks.
     */
    connectedCallback() {
        this.shadowRoot.querySelector('#outro button').addEventListener('click', (event) => {
            this.restart();
        });

        this.shadowRoot.querySelector('#intro button').addEventListener('click', (event) => {
            this.play();
        });

        this.draw();
    }

    /**
     * @returns {string} the width of the board in bricks
     */
    get width() {
        return this.getAttribute('data-width');
    }

    /**
     * Sets the width of the board in bricks.
     * @param newVal {string} the new width of the board in bricks
     */
    set width(newVal) {
        this.setAttribute('data-width', newVal);
    }

    /**
     * @returns {string} the height of the board in bricks
     */
    get height() {
        return this.getAttribute('data-height');
    }

    /**
     * Sets the height of the board in bricks.
     * @param newVal {string} the new height of the board in bricks
     */
    set height(newVal) {
        this.setAttribute('data-height', newVal);
    }

    /**
     * Shuffles the bricks using Fisher-Yates algorithm.
     */
    shuffle() {
        let theSet = this.set;
        for (let i = (theSet.length - 1); i > 0; i -= 1) {
            let j = Math.floor(Math.random() * i);
            let iOld = theSet[i];
            theSet[i] = theSet[j];
            theSet[j] = iOld;
        }
        this.set = theSet;
    }

    /**
     * Adds the bricks to the board and renders them in the DOM.
     */
    draw() {
        let brick;
        let match;
        let pairs = Math.round((this.width * this.height)) / 2;
        this.set = [];
        let oldBricks = this.children;

        //remove old bricks if any
        for (let i = oldBricks.length -1; i >= 0; i -= 1) {
            let brick = oldBricks[i];
            if (brick.getAttribute('slot') === 'brick') {
                brick.parentNode.removeChild(brick);
            }
        }

        //initiate bricks
        for (let i = 1; i <= pairs; i += 1) {
            brick = new Brick(i);
            this.set.push(brick);
            match = brick.clone();
            this.set.push(match);
        }
        let theSet = this.set;

        //put them in the dom
        for (let i = 0; i < theSet.length; i += 1) {
            let brickDiv = document.importNode(brickTemplate.content, true);
            let img = brickDiv.querySelector("img");
            let brick = theSet[i];
            img.src = '/image/memory-brick-' + brick.draw() + '.png';
            img.setAttribute("brickNumber", i);
            this.appendChild(brickDiv);

            if ((i + 1) % this.width === 0) {
                let br = document.createElement("br");
                br.setAttribute('slot', 'brick');
                this.appendChild(br);
            }
        }
    }

    /**
     * Starts a game, plays it through, saves the result and
     * then displays the outro.
     */
    play() {
        this.shuffle();
        this.shadowRoot.querySelector("#intro").classList.add('hide');
        this.shadowRoot.querySelector("#main").classList.remove('hide');
        this.shadowRoot.querySelector("#outro").classList.add('hide');
        this.timer.start(0);
        this.timer.display(this.timespan);
        playGame(this.set, this)
            .then((result) => {
                result.time = this.timer.stop();
                this.result = result;
                this.shadowRoot.querySelector("#intro").classList.add('hide');
                this.shadowRoot.querySelector("#main").classList.add('hide');
                this.shadowRoot.querySelector("#outro").classList.remove('hide');
            });
    }

    /**
     * Restarts the game with the same size of board without re-rendering
     */
    replay() {
        this.reset();
        this.shadowRoot.querySelector("#intro").classList.add('hide');
        this.shadowRoot.querySelector("#main").classList.remove('hide');
        this.shadowRoot.querySelector("#outro").classList.add('hide');
        this.play();
    }

    /**
     * Resets the game and then lets the user choose a new game size and
     * user name, re-rendering the board.
     */
    restart() {
        this.reset();
        this.shadowRoot.querySelector("#intro").classList.remove('hide');
        this.shadowRoot.querySelector("#main").classList.add('hide');
        this.shadowRoot.querySelector("#outro").classList.add('hide');
    }

    /**
     * Resets the game to make it playable again. Removes event listeners
     * and turns the bricks over.
     */
    reset() {
        let bricks = this.querySelectorAll('[slot="brick"]');
        Array.prototype.forEach.call(bricks, (brick) => {
            brick.classList.remove('hide');
            let img = brick.querySelector("img");
            if (img) {
                let brickNumber = img.getAttribute("brickNumber");
                if (this.set[brickNumber].draw() !== 0) { //turn the brick over if it's not turned
                    img.src = '/image/memory-brick-' + this.set[brickNumber].turn() + '.png';
                }
            }
        });
        this.timespan.textContent = '';
        this.turnspan.textContent = '';
        this.timer.stop(); //make sure timer is stopped
        this.shadowRoot.querySelector('#board').removeEventListener("click", this.gamePlay);
    }

    /**
     * Ends the game and displays the outro.
     */
    end() {
        this.reset();
        this.shadowRoot.querySelector("#intro").classList.add('hide');
        this.shadowRoot.querySelector("#main").classList.add('hide');
        this.shadowRoot.querySelector("#outro").classList.remove('hide');
    }
}

//defines the element
customElements.define('memory-game', MemoryGame);


/**
 * A class Brick to go with the memory game.
 */
class Brick {
    /**
     * Initiates the Brick with a value and places it facedown.
     * @param number {number} the value to initiate.
     */
    constructor(number) {
        this.value = number;
        this.facedown = true;
    }

    /**
     * Turns the brick and returns the value after the turn.
     * @returns {number} the value of the brick if it's faceup, otherwise 0.
     */
    turn() {
        this.facedown = !(this.facedown);
        return this.draw();
    }

    /**
     * Compares two bricks.
     * @param other {Brick} the Brick to compare.
     * @returns {boolean} true if the bricks values are equal.
     */
    equals(other) {
        return (other instanceof Brick) && (this.value === other.value);
    }

    /**
     * Clones the brick.
     * @returns {Brick} the clone.
     */
    clone() {
        return new Brick(this.value);
    }

    /**
     * @returns {number} the brick's value, or 0 if it is face down.
     */
    draw() {
        if (this.facedown) {
            return 0;
        } else {
            return this.value;
        }
    }
}

/**
 * A function that sets up the gameplay. Adds and removes event-listeners so that the same game can be reset.
 * @param set [{Brick]} the set of bricks to play with.
 * @param game {node} the space to play
 * @returns {Promise} a promise that resolves with the result of the game when the game has been played.
 */
function playGame(set, game) {
    let turns = 0;
    let bricks = parseInt(game.width) * parseInt(game.height);
    let board = game.shadowRoot.querySelector('#board');
    let bricksLeft = bricks;
    let choice1;
    let choice2;
    let img1;
    let img2;

    return new Promise((resolve, reject) => {
        game.gamePlay = function(event) { //expose the reference so the event listener can be removed from outside the function
            if (!choice2) { //if two bricks are not turned
                let img = event.target.querySelector("img") || event.target;
                let brickNumber = img.getAttribute("brickNumber");
                if (!brickNumber) { //target is not a brick
                    return;
                }

                let brick = set[brickNumber];
                img.src = '/image/' + brick.turn() + '.png';

                if (!choice1) { //first brick to be turned
                    img1 = img;
                    choice1 = brick;
                } else { //second brick to be turned
                    img2 = img;
                    choice2 = brick;

                    if (choice1.equals(choice2) && img1.getAttribute('brickNumber') !== img2.getAttribute('brickNumber')) { //the two bricks are equal but not the same
                        img1.parentElement.parentElement.classList.add("hide");
                        img2.parentElement.parentElement.classList.add("hide");
                        choice1 = "";
                        choice2 = "";
                        img1 = "";
                        img2 = "";
                        bricksLeft -= 2;
                        if (bricksLeft === 0) { //all bricks are turned
                            resolve({turns: turns});
                        }
                    } else { //bricks are not the same
                        setTimeout(() => {
                            img1.src = '/image/' + choice1.turn() + '.png';
                            img2.src = '/image/' + choice2.turn() + '.png';
                            choice1 = "";
                            choice2 = "";
                            img1 = "";
                            img2 = "";
                        }, 1000);
                    }

                    turns += 1;
                    game.turnspan.textContent = turns;
                }

            }
            event.preventDefault();

        };

        board.addEventListener("click", game.gamePlay);

    });

}

},{"./timer.js":10}],10:[function(require,module,exports){
/**
 * Module for Timer.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

class Timer {
    /**
     * Initiates a Timer.
     * @param startTime {number} where to start counting.
     */
    constructor(startTime = 0) {
        this.count = startTime;
    }

    /**
     * @returns {number} the count
     */
    get time() {
        return this.count;
    }

    /**
     * Sets the time on the timer.
     * @param newTime {number} the new time
     */
    set time(newTime) {
        this.count = newTime;
    }
    /**
     * starts the timer. increments time every 100 milliseconds.
     * @param time {number} what number to start it on.
     */
    start(time = this.time) {
        this.count = time;
        this.timer = setInterval(() => {
            this.count += 100;
        }, 100);
    }
    /**
     * starts the timer. decrements time every 100 milliseconds.
     * @param time {number} what number to start it on.
     */
    countdown(time) {
        this.count = time || this.count;
        this.timer = setInterval(() => {
            this.count -= 100;
        }, 100);
    }
    /**
     * stops the Timer.
     * @returns the count.
     */
    stop() {
        clearInterval(this.timer);
        clearInterval(this.displayInterval);
        return this.count;
    }
    /**
     * Displays a rounded value of the count of the timer
     * to the desired precision, at an interval.
     * @param destination {node} where to make the display
     * @param interval {number} the interval to make the display in, in milliseconds
     * @param precision {number}the number to divide the displayed milliseconds by
     * @returns the interval.
     *
     */
    display(destination, interval = 100, precision = 1000) {
        this.displayInterval = setInterval( ()=> {
            destination.textContent = Math.round(this.count / precision);
        }, interval);
        return this.displayInterval;
    }
}

module.exports = Timer;

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvV2luZG93TWFuYWdlci5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kcmFnZ2FibGUtd2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9leHBhbmRhYmxlLW1lbnUtaXRlbS5qcyIsImNsaWVudC9zb3VyY2UvanMvaW5zdGEtY2hhdC1hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2luc3RhLWNoYXQuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS1hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS1nYW1lLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90aW1lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gV2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSkge1xuICAgIGxldCB3bSA9IHt9O1xuXG4gICAgY2xhc3MgV2luZG93TWFuYWdlciB7XG5cbiAgICAgICAgY29uc3RydWN0b3Iod2luZG93U3BhY2UpIHtcbiAgICAgICAgICAgIHdtLnN0YXJ0WCA9IHdpbmRvd1NwYWNlLm9mZnNldExlZnQgKyAyMDtcbiAgICAgICAgICAgIHdtLnN0YXJ0WSA9IHdpbmRvd1NwYWNlLm9mZnNldFRvcCArIDIwO1xuICAgICAgICAgICAgd20udHlwZXMgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlV2luZG93KHR5cGUpIHtcbiAgICAgICAgICAgIGxldCBhV2luZG93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRyYWdnYWJsZS13aW5kb3dcIik7XG5cbiAgICAgICAgLyptYWtlIHRlbXBsYXRlLCBpZiBubyB3aW5kb3dzIG9wZW4gb2Yga2luZCBldGNcbiAgICAgICAgIGxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG4gICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcImltcG9ydFwiKTtcbiAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcIi9kcmFnZ2FibGUtd2luZG93Lmh0bWxcIik7XG4gICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICAgZXZlbnQudGFyZ2V0LnNldEF0dHJpYnV0ZShcImxhYmVsXCIsIHR5cGUpOyovXG5cbiAgICAgICAgICAgIHdpbmRvd1NwYWNlLmFwcGVuZENoaWxkKGFXaW5kb3cpO1xuICAgICAgICAgICAgc2V0dXBTcGFjZSh0eXBlLCBhV2luZG93KTtcblxuICAgICAgICAgICAgaWYgKHdtW3R5cGVdLm9wZW4pIHtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuLnB1c2goYVdpbmRvdyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4gPSBbYVdpbmRvd107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhV2luZG93O1xuICAgICAgICB9XG5cbiAgICAgICAgb3Blbih0eXBlKSB7XG4gICAgICAgICAgICBpZiAod21bdHlwZV0pIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgICAgICAgICAgbGV0IHdpbmRvd3MgPSB3bVt0eXBlXS5vcGVuO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHdpbmRvd3MuZmlsdGVyKCAodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdy5vcGVuO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBleHBhbmQodHlwZSkge1xuICAgICAgICAgICAgbGV0IHdpbnMgPSB0aGlzLm9wZW4odHlwZSk7XG4gICAgICAgICAgICBpZiAod2lucykge1xuICAgICAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB3Lm1pbmltaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbWluaW1pemUodHlwZSkge1xuICAgICAgICAgICAgbGV0IHdpbnMgPSB0aGlzLm9wZW4odHlwZSk7XG4gICAgICAgICAgICBpZiAod2lucykge1xuICAgICAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB3Lm1pbmltaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGNsb3NlKHR5cGUpIHtcbiAgICAgICAgICAgIGxldCB3aW5zID0gdGhpcy5vcGVuKHR5cGUpO1xuICAgICAgICAgICAgaWYgKHdpbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh3aW5zKTtcbiAgICAgICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBXaW5kb3dNYW5hZ2VyKHdpbmRvd1NwYWNlKTtcblxuICAgIC8vaGVscGVyIGZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIHNldHVwU3BhY2UodHlwZSwgc3BhY2UpIHtcbiAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge307XG4gICAgICAgIGxldCB4O1xuICAgICAgICBsZXQgeTtcblxuICAgICAgICBpZiAod21bdHlwZV0pIHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAod21bdHlwZV0ubGF0ZXN0Q29vcmRzLnggKz0gNTApO1xuICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9ICh3bVt0eXBlXS5sYXRlc3RDb29yZHMueSArPSA1MCk7XG5cbiAgICAgICAgICAgIGlmICghKHdpdGhpbkJvdW5kcyhzcGFjZSwgd2luZG93U3BhY2UsIGRlc3RpbmF0aW9uKSkpIHtcbiAgICAgICAgICAgICAgICB4ID0gd21bdHlwZV0uc3RhcnRDb29yZHMueCArPSA1O1xuICAgICAgICAgICAgICAgIHkgPSB3bVt0eXBlXS5zdGFydENvb3Jkcy55ICs9IDU7XG4gICAgICAgICAgICAgICAgd21bdHlwZV0ubGF0ZXN0Q29vcmRzLnggPSB4O1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLmxhdGVzdENvb3Jkcy55ID0geTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgeCA9IGRlc3RpbmF0aW9uLng7XG4gICAgICAgICAgICAgICAgeSA9IGRlc3RpbmF0aW9uLnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAod20uc3RhcnRYICsgKDYwICogd20udHlwZXMpKTtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAod20uc3RhcnRZKTtcblxuICAgICAgICAgICAgaWYgKCEod2l0aGluQm91bmRzKHNwYWNlLCB3aW5kb3dTcGFjZSwgZGVzdGluYXRpb24pKSkge1xuICAgICAgICAgICAgICAgIHggPSB3bS5zdGFydFg7XG4gICAgICAgICAgICAgICAgeSA9IHdtLnN0YXJ0WTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgeCA9IGRlc3RpbmF0aW9uLng7XG4gICAgICAgICAgICAgICAgeSA9IGRlc3RpbmF0aW9uLnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdtW3R5cGVdID0ge307XG4gICAgICAgICAgICB3bVt0eXBlXS5zdGFydENvb3JkcyA9IHtcbiAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3bVt0eXBlXS5sYXRlc3RDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd20udHlwZXMgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBzcGFjZS50YWJJbmRleCA9IDA7XG4gICAgICAgIHNwYWNlLnN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XG4gICAgICAgIHNwYWNlLnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdpdGhpbkJvdW5kcyhlbGVtZW50LCBjb250YWluZXIsIGNvb3Jkcykge1xuICAgICAgICBsZXQgbWluWCA9IGNvbnRhaW5lci5vZmZzZXRMZWZ0O1xuICAgICAgICBsZXQgbWF4WCA9IChtaW5YICsgY29udGFpbmVyLmNsaWVudFdpZHRoKSAtIChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKTtcbiAgICAgICAgbGV0IG1pblkgPSBjb250YWluZXIub2Zmc2V0VG9wO1xuICAgICAgICBsZXQgbWF4WSA9IChtaW5ZICsgY29udGFpbmVyLmNsaWVudEhlaWdodCkgLSAoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xuXG4gICAgICAgIHJldHVybiAoY29vcmRzLnggPD0gbWF4WCAmJiBjb29yZHMueCA+PSBtaW5YICYmIGNvb3Jkcy55IDw9IG1heFkgJiYgY29vcmRzLnkgPj0gbWluWSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdpbmRvd01hbmFnZXI7XG5cbiIsIi8qKlxuICogU3RhcnRpbmcgcG9pbnQgZnByIHRoZSBhcHBsaWNhdGlvbi5cbiAqIFRoZSBhcHBsaWNhdGlvbiB3b3VsZCB3b3JrIGJldHRlciB3aGVuIHVzZWQgd2l0aCBIVFRQMlxuICogZHVlIHRvIHRoZSBmYWN0IHRoYXQgaXQgbWFrZXMgdXNlIG9mIHdlYi1jb21wb25lbnRzLFxuICogYnV0IGl0J3MgYmVlbiBidWlsdCB3aXRoIGJyb3dzZXJpZnkgdG8gd29yayBhcyBhXG4gKiBub3JtYWwgSFRUUDEgYXBwbGljYXRpb24gaW4gbGlldSBvZiB0aGlzLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wXG4gKi9cblxuXG4vL3RvIG1ha2Ugd2ViIGNvbXBvbmVudHMgd29yayB3aXRoIGJyb3dzZXJpZnlcbmxldCB3aW5kb3cgPSByZXF1aXJlKCcuL2RyYWdnYWJsZS13aW5kb3cuanMnKTtcbmxldCBtZW51ID0gcmVxdWlyZShcIi4vZXhwYW5kYWJsZS1tZW51LWl0ZW0uanNcIik7XG5sZXQgbWVtb3J5R2FtZSA9IHJlcXVpcmUoJy4vbWVtb3J5LWdhbWUuanMnKTtcbmxldCBtZW1vcnlBcHAgPSByZXF1aXJlKCcuL21lbW9yeS1hcHAuanMnKTtcbmxldCBpbnN0YUNoYXQ9IHJlcXVpcmUoJy4vaW5zdGEtY2hhdC5qcycpO1xubGV0IGluc3RhQ2hhdEFwcCA9IHJlcXVpcmUoJy4vaW5zdGEtY2hhdC1hcHAuanMnKTtcblxuLy9yZXF1aXJlc1xubGV0IGRlc2t0b3AgPSByZXF1aXJlKFwiLi9kZXNrdG9wLmpzXCIpO1xuXG4iLCIvL3JlcXVpcmVzXG5sZXQgV2luZG93TWFuYWdlciA9IHJlcXVpcmUoXCIuL1dpbmRvd01hbmFnZXIuanNcIik7XG5cblxuLy9ub2Rlc1xubGV0IG1haW5NZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dTZWxlY3RvclwiKTtcbmxldCB3aW5kb3dTcGFjZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjb3BlbldpbmRvd3NcIik7XG5sZXQgc3ViTWVudVRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdWJNZW51XCIpO1xuXG4vL3ZhcmlhYmxlc1xubGV0IFdNID0gV2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSk7XG5sZXQgdG9wID0gMTtcblxuQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChtYWluTWVudS5jaGlsZHJlbiwgKG5vZGUpID0+IHtcbiAgICBhZGRTdWJNZW51KG5vZGUpO1xufSk7XG5cbm1haW5NZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2RibGNsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgbGV0IHR5cGUgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1raW5kXCIpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZShcImRhdGEta2luZFwiKTtcbiAgICBpZiAodHlwZSkge1xuICAgICAgICBXTS5jcmVhdGVXaW5kb3codHlwZSkuZm9jdXMoKTtcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn0pO1xuXG5hZGRFdmVudExpc3RlbmVycyhtYWluTWVudSwgJ2NsaWNrIGZvY3Vzb3V0JywgKGV2ZW50KSA9PiB7XG4gICAgbGV0IG1haW5NZW51SXRlbXMgPSBtYWluTWVudS5xdWVyeVNlbGVjdG9yQWxsKCdleHBhbmRhYmxlLW1lbnUtaXRlbScpO1xuICAgIG1haW5NZW51SXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBpZiAoKGl0ZW0gIT09IGV2ZW50LnRhcmdldCAmJiBpdGVtICE9PSBldmVudC50YXJnZXQucGFyZW50RWxlbWVudCkgJiYgKGl0ZW0uZGlzcGxheWluZ1N1Yk1lbnUpKSB7XG4gICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG53aW5kb3dTcGFjZS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIChldmVudCkgPT4ge1xuICAgIGV2ZW50LnRhcmdldC5zdHlsZS56SW5kZXggPSB0b3A7XG4gICAgdG9wICs9IDE7XG59LCB0cnVlKTtcblxuZnVuY3Rpb24gYWRkU3ViTWVudShpdGVtKSB7XG4gICAgbGV0IGluc3RhbmNlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShzdWJNZW51VGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgbGV0IGxhYmVsID0gaXRlbS5nZXRBdHRyaWJ1dGUoJ2xhYmVsJyk7XG5cbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGluc3RhbmNlLmNoaWxkcmVuLCAobm9kZSkgPT4ge1xuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZSgnbGFiZWwnLCBsYWJlbCk7XG4gICAgfSk7XG5cbiAgICBpdGVtLmFwcGVuZENoaWxkKGluc3RhbmNlKTtcblxuICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgc3dpdGNoIChldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgY2FzZSAnb3Blbic6XG4gICAgICAgICAgICAgICAgV00uY3JlYXRlV2luZG93KGxhYmVsKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICAgICAgICAgIFdNLmNsb3NlKGxhYmVsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21pbmltaXplJzpcbiAgICAgICAgICAgICAgICBXTS5taW5pbWl6ZShsYWJlbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdleHBhbmQnOlxuICAgICAgICAgICAgICAgIFdNLmV4cGFuZChsYWJlbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzIChlbGVtZW50LCBldmVudHMsIGhhbmRsZXIpIHtcbiAgICBldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGV2ZW50ID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcikpO1xufVxuIiwiLypcbiogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBkcmFnZ2FibGUtd2luZG93IHRvIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4qIEl0IGNyZWF0ZXMgYSB3aW5kb3cgdGhhdCBjYW4gYmUgbW92ZWQgYWNyb3NzIHRoZSBzY3JlZW4sIGNsb3NlZCBhbmQgbWluaW1pemVkLlxuKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4qIEB2ZXJzaW9uIDEuMC4wXG4qXG4qL1xuXG5cbmxldCB3aW5kb3dUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9kcmFnZ2FibGUtd2luZG93Lmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dUZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxuXG5jbGFzcyBEcmFnZ2FibGVXaW5kb3cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIGEgZHJhZ2dhYmxlLXdpbmRvdywgc2V0cyB1cCBzaGFkb3cgRE9NLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8vc2V0dXAgc2hhZG93IGRvbSBzdHlsZXNcbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCIsIGRlbGVnYXRlc0ZvY3VzOiB0cnVlfSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHdpbmRvd1RlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gd2luZG93IGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAgICAgKiBTZXRzIHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVoYXZpb3VyIG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG5cbiAgICAgICAgLy9zZXQgYmVoYXZpb3VyXG4gICAgICAgIG1ha2VEcmFnZ2FibGUodGhpcywgdGhpcy5wYXJlbnROb2RlKTtcblxuICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQuY29tcG9zZWRQYXRoKClbMF07IC8vZm9sbG93IHRoZSB0cmFpbCB0aHJvdWdoIHNoYWRvdyBET01cbiAgICAgICAgICAgIGxldCBpZCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgICAgICAgICAgIGlmIChpZCA9PT0gXCJjbG9zZVwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpZCA9PT0gXCJtaW5pbWl6ZVwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHsgLy9tYWtlIHdvcmsgd2l0aCB0b3VjaCBldmVudHNcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgd2hhdCBhdHRyaWJ1dGUtY2hhbmdlcyB0byB3YXRjaCBmb3IgaW4gdGhlIERPTS5cbiAgICAgKiBAcmV0dXJucyB7W3N0cmluZ119IGFuIGFycmF5IG9mIHRoZSBuYW1lcyBvZiB0aGUgYXR0cmlidXRlcyB0byB3YXRjaC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgICAgcmV0dXJuIFsnb3BlbiddO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoZXMgZm9yIGF0dHJpYnV0ZSBjaGFuZ2VzIGluIHRoZSBET00gYWNjb3JkaW5nIHRvIG9ic2VydmVkQXR0cmlidXRlcygpXG4gICAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSB0aGUgb2xkIHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlIHRoZSBuZXcgdmFsdWVcbiAgICAgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sobmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5vcGVuKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgd2luZG93IGhhcyBhdHRyaWJ1dGUgJ29wZW4nXG4gICAgICovXG4gICAgZ2V0IG9wZW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc0F0dHJpYnV0ZSgnb3BlbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlICdvcGVuJyBhdHRyaWJ1dGUgb24gdGhlIHdpbmRvdy5cbiAgICAgKiBAcGFyYW0gb3BlbiB7Ym9vbGVhbn0gd2hldGhlciB0byBhZGQgb3IgcmVtb3ZlIHRoZSAnb3BlbicgYXR0cmlidXRlXG4gICAgICovXG4gICAgc2V0IG9wZW4ob3Blbikge1xuICAgICAgICBpZiAob3Blbikge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ29wZW4nLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnb3BlbicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHdpbmRvdyBoYXMgYXR0cmlidXRlICdtaW5pbWl6ZWQnXG4gICAgICovXG4gICAgZ2V0IG1pbmltaXplZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzQXR0cmlidXRlKCdtaW5pbWl6ZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSAnbWluaW1pemVkJyBhdHRyaWJ1dGUgb24gdGhlIHdpbmRvdy5cbiAgICAgKiBAcGFyYW0gbWluaW1pemUge2Jvb2xlYW59IHdoZXRoZXIgdG8gYWRkIG9yIHJlbW92ZSB0aGUgJ21pbmltaXplZCcgYXR0cmlidXRlXG4gICAgICovXG4gICAgc2V0IG1pbmltaXplZChtaW5pbWl6ZSkge1xuICAgICAgICBpZiAobWluaW1pemUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdtaW5pbWl6ZWQnLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnbWluaW1pemVkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZXMgdGhlIHdpbmRvdy4gUmVtb3ZlcyBpdCBmcm9tIHRoZSBET00gYW5kIHNldHMgYWxsIGF0dHJpYnV0ZXMgdG8gZmFsc2UuXG4gICAgICovXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgfVxuXG59XG5cbi8vaGVscGVyIGZ1bmN0aW9uXG4vL21ha2VzIGFuIGVsZW1lbnQgZHJhZ2dhYmxlIHdpdGggIG1vdXNlLCBhcnJvd3MgYW5kIHRvdWNoXG5mdW5jdGlvbiBtYWtlRHJhZ2dhYmxlKGVsKSB7XG4gICAgbGV0IGFycm93RHJhZztcbiAgICBsZXQgbW91c2VEcmFnO1xuICAgIGxldCBkcmFnb2Zmc2V0ID0geyAvL3RvIG1ha2UgdGhlIGRyYWcgbm90IGp1bXAgZnJvbSB0aGUgY29ybmVyXG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9O1xuXG4gICAgbGV0IGV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhlbCwgJ2ZvY3VzaW4gbW91c2Vkb3duIHRvdWNobW92ZScsICgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQ7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ3RvdWNobW92ZScpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBldmVudC50YXJnZXRUb3VjaGVzWzBdOyAvL21ha2Ugd29yayB3aXRoIHRvdWNoIGV2ZW50XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IGV2ZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJyb3dEcmFnID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyB8fCBldmVudC50eXBlID09PSAndG91Y2htb3ZlJykge1xuICAgICAgICAgICAgICAgIG1vdXNlRHJhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgZHJhZ29mZnNldC54ID0gdGFyZ2V0LnBhZ2VYIC0gZWwub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBkcmFnb2Zmc2V0LnkgPSB0YXJnZXQucGFnZVkgLSBlbC5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoZWwsICdmb2N1c291dCBtb3VzZXVwJywgKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2V1cCcpIHtcbiAgICAgICAgICAgICAgICBpZiAobW91c2VEcmFnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vdXNlRHJhZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyb3dEcmFnID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoZG9jdW1lbnQsICdtb3VzZW1vdmUga2V5ZG93biB0b3VjaG1vdmUnLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7fTsgLy9hcyB0byBub3Qga2VlcCBwb2xsaW5nIHRoZSBET01cblxuICAgICAgICAgICAgaWYgKG1vdXNlRHJhZykge1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAoZXZlbnQucGFnZVkgLSBkcmFnb2Zmc2V0LnkpO1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAoZXZlbnQucGFnZVggLSBkcmFnb2Zmc2V0LngpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhcnJvd0RyYWcpIHtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gcGFyc2VJbnQoZWwuc3R5bGUudG9wLnNsaWNlKDAsIC0yKSk7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9IHBhcnNlSW50KGVsLnN0eWxlLmxlZnQuc2xpY2UoMCwgLTIpKTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSAtPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggLT0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1vdXNlRHJhZyB8fCBhcnJvd0RyYWcpIHtcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gZGVzdGluYXRpb24ueCAgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gZGVzdGluYXRpb24ueSAgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIH07XG5cbiAgICBldmVudHMoKTtcbn1cblxuLy9oZWxwZXIgZnVuY3Rpb25cbi8vYWRkcyBtdWx0aXBsZSBldmVudCBsaXN0ZW5lcnMgd2l0aCBpZGVudGljYWwgaGFuZGxlcnNcbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzKGVsZW1lbnQsIGV2ZW50cywgaGFuZGxlcikge1xuICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSk7XG59XG5cbi8vZGVmaW5lcyB0aGUgZWxlbWVudFxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdkcmFnZ2FibGUtd2luZG93JywgRHJhZ2dhYmxlV2luZG93KTtcbiIsIi8qXG4gKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGV4cGFuZGFibGUtbWVudS1pdGVtIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjcmVhdGVzIGFuIGl0ZW0gdGhhdCB3aGVuIGNsaWNrZWQgdG9nZ2xlcyB0byBzaG93IG9yIGhpZGUgc3ViLWl0ZW1zLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxubGV0IG1lbnVUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9leHBhbmRhYmxlLW1lbnUtaXRlbS5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudUl0ZW1UZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxuXG5cbmNsYXNzIEV4cGFuZGFibGVNZW51SXRlbSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBkcmFnZ2FibGUtd2luZG93LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgLy9zZXQgdXAgc2hhZG93IGRvbSBzdHlsZXNcbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCIsIGRlbGVnYXRlc0ZvY3VzOiBcInRydWVcIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBtZW51VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIHdpbmRvdyBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogU2V0cyB1cCBldmVudCBsaXN0ZW5lcnMgYW5kIGJlaGF2aW91ciBvZiB0aGUgaXRlbS5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgbWFrZUV4cGFuZGFibGUodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge1tub2RlXX0gYW4gYXJyYXkgb2YgdGhlIHN1Yml0ZW1zIHRoZSBpdGVtIGhhcyBhc3NpZ25lZCBpbiB0aGUgRE9NLlxuICAgICAqIEEgc3ViaXRlbSBjb3VudHMgYXMgYW4gaXRlbSB0aGF0IGhhcyB0aGUgc2xvdCBvZiAnc3ViaXRlbScgYW5kIHRoZSBzYW1lIGxhYmVsXG4gICAgICogYXMgdGhlIGV4cGFuZGFibGUgbWVudSBpdGVtIGl0c2VsZi5cbiAgICAgKi9cbiAgICBnZXQgc3ViTWVudSgpIHtcbiAgICAgICAgbGV0IGxhYmVsID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2xhYmVsJyk7XG4gICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwodGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdbc2xvdD1cInN1Yml0ZW1cIl0nKSwgKG5vZGUpID0+IHtcbiAgICAgICAgICAgIGxldCBub2RlTGFiZWwgPSBub2RlLmdldEF0dHJpYnV0ZSgnbGFiZWwnKTtcbiAgICAgICAgICAgIHJldHVybiBub2RlTGFiZWwgPT09IGxhYmVsO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgaXRlbSBpcyBjdXJyZW50bHkgZGlzcGxheWluZyB0aGUgc3VibWVudS1pdGVtcy5cbiAgICAgKi9cbiAgICBnZXQgZGlzcGxheWluZ1N1Yk1lbnUoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5zdWJNZW51WzBdLmhhc0F0dHJpYnV0ZSgnaGlkZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3dzIG9yIGhpZGVzIHRoZSBzdWJtZW51LWl0ZW1zLlxuICAgICAqIEBwYXJhbSBzaG93IHtib29sZWFufSB3aGV0aGVyIHRvIHNob3cgb3IgaGlkZS5cbiAgICAgKi9cbiAgICB0b2dnbGVTdWJNZW51KHNob3cpIHtcbiAgICAgICAgaWYgKHNob3cpIHtcbiAgICAgICAgICAgIHRoaXMuc3ViTWVudS5mb3JFYWNoKChwb3N0KSA9PiB7XG4gICAgICAgICAgICAgICAgcG9zdC5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdWJNZW51LmZvckVhY2goKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgICBwb3N0LnNldEF0dHJpYnV0ZSgnaGlkZScsICcnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9XG5cbn1cblxuLy9kZWZpbmVzIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2V4cGFuZGFibGUtbWVudS1pdGVtJywgRXhwYW5kYWJsZU1lbnVJdGVtKTtcblxuLy9oZWxwZXIgZnVuY3Rpb24gdG8gbWFrZSB0aGUgaXRlbSBleHBhbmRhYmxlXG4vL3Rha2VzIHRoZSBpdGVtIHRvIGV4cGFuZCBhcyBhIHBhcmFtZXRlclxuZnVuY3Rpb24gbWFrZUV4cGFuZGFibGUoaXRlbSkge1xuICAgIGxldCBuZXh0Rm9jdXMgPSAwO1xuICAgIGxldCBzaG93ID0gZmFsc2U7XG4gICAgbGV0IGFycm93RXhwYW5kO1xuICAgIGxldCBtb3VzZUV4cGFuZDtcblxuICAgIGxldCBldmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGl0ZW0sICdmb2N1c2luIGNsaWNrJywgKChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGFycm93RXhwYW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICBtb3VzZUV4cGFuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNob3cgPSAhc2hvdztcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHNob3cpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhpdGVtLCAna2V5ZG93bicsICgoZXZlbnQpID0+IHsgLy9tYWtlIHRoZSBzdWItaXRlbXMgdHJhdmVyc2FibGUgYnkgcHJlc3NpbmcgdGhlIGFycm93IGtleXNcbiAgICAgICAgICAgICAgICBpZiAoYXJyb3dFeHBhbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXRlbS5kaXNwbGF5aW5nU3ViTWVudSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRGb2N1cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0Rm9jdXMgPCAwIHx8IG5leHRGb2N1cyA+PSBpdGVtLnN1Yk1lbnUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRGb2N1cyA9IGl0ZW0uc3ViTWVudS5sZW5ndGggLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uc3ViTWVudVtuZXh0Rm9jdXNdLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXMoaXRlbSwgaXRlbS5zdWJNZW51W25leHRGb2N1c10pOyAvL21ha2UgaXQgYWNjZXNzaWJsZSB2aWEgY3NzIHZpc3VhbCBjbHVlcyBldmVuIGlmIHRoZSBhY3RpdmUgZWxlbWVudCBpcyBoaWRkZW4gd2l0aGluIHNoYWRvd0RPTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWl0ZW0uZGlzcGxheWluZ1N1Yk1lbnUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0Rm9jdXMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dEZvY3VzID49IGl0ZW0uc3ViTWVudS5sZW5ndGggfHwgbmV4dEZvY3VzIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0Rm9jdXMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnN1Yk1lbnVbbmV4dEZvY3VzXS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzKGl0ZW0sIGl0ZW0uc3ViTWVudVtuZXh0Rm9jdXNdKTsgLy9tYWtlIGl0IGFjY2Vzc2libGUgdmlhIGNzcyB2aXN1YWwgY2x1ZXMgZXZlbiBpZiB0aGUgYWN0aXZlIGVsZW1lbnQgaXMgaGlkZGVuIHdpdGhpbiBzaGFkb3dET01cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgfTtcblxuICAgIGV2ZW50cygpO1xufVxuXG4vL2hlbHBlciBmdW5jdGlvblxuLy9hZGRzIG11bHRpcGxlIGV2ZW50IGxpc3RlbmVycyB3aXRoIGlkZW50aWNhbCBoYW5kbGVyc1xuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cblxuLy8gQWRkcyBhICdmb2N1c2VkJyBhdHRyaWJ1dGUgdG8gdGhlIGRlc2lyZWQgc3ViaXRlbSBhbmRcbi8vIHJlbW92ZXMgaXQgZnJvbSBvdGhlciBzdWIgaXRlbXMgdG8gaGVscFxuLy8gd2l0aCBhY2Nlc3NpYmlsaXR5IGFuZCBzaGFkb3cgRE9tIHN0eWxpbmcuXG5mdW5jdGlvbiBmb2N1cyhpdGVtLCBlbGVtZW50KSB7XG4gICAgbGV0IHN1YnMgPSBpdGVtLnN1Yk1lbnU7XG4gICAgc3Vicy5mb3JFYWNoKChzdWIpID0+IHtcbiAgICAgICAgaWYgKHN1YiA9PT0gZWxlbWVudCkge1xuICAgICAgICAgICAgc3ViLnNldEF0dHJpYnV0ZSgnZm9jdXNlZCcsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1Yi5yZW1vdmVBdHRyaWJ1dGUoJ2ZvY3VzZWQnKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuIiwibGV0IGNoYXRXaW5kb3dUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbnN0YS1jaGF0LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFdpbmRvd1RlbXBsYXRlXCIpO1xuXG5jbGFzcyBJbnN0YUNoYXRBcHAgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCJ9KTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gY2hhdFdpbmRvd1RlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgaWYgKCFsb2NhbFN0b3JhZ2UuY2hhdE5hbWUpIHtcbiAgICAgICAgICAgIC8vYmUgb20gbmFtblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9kaXNwbGF5IGlucHV0LCBoaWRlIGNoYXQuIGJhcmEgYWRkYSBlbiBoaWRlIC0gY2xhc3NcbiAgICAgICAgICAgIC8vY2hhdC5zZXRjb2ZpZyAobmFtZSA9IG5ld25hbWUpXG4gICAgICAgIH1cblxuICAgICAgICAvL2V2ZW50Lmxpc3RlbmVyIC0gbWVueSAtPiBuYW1lXG4gICAgICAgIC8vZGlzcGxheSBpbnB1dCwgaGlkZSBjaGF0LiBiYXJhIGFkZGEgZW4gaGlkZSAtIGNsYXNzXG4gICAgICAgIC8vY2hhdC5zZXRjb2ZpZyAobmFtZSA9IG5ld25hbWUpXG4gICAgICAgIC8vZXZlbnQgbGlzdGVuZXIgbWVueSAtIGFib3V0XG4gICAgICAgIC8vZGlzcGxheSBhYm91dCwgaGlkZSBjaGF0LiBiYXJhIGFkZGEgZW4gaGlkZSAtIGNsYXNzXG4gICAgICAgIC8vc2VuIGfDtnIgc2FtbWEgcMOlIG1lbW9yeSBtZWQgYWJvdXQgb2NoIGhpZ2hzY29yZVxuICAgIH1cblxuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAvL2Nsb3NlXG4gICAgICAgIC8vc2VuIGfDtnIgc2FtbWEgcMOlIG1lbW9yeSBhcHBcbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgLy9kcmFnZ2FibGUgd2luZG93IGNsb3NlXG4gICAgICAgIC8vd2Vic29ja2V0IGNsb3NlXG4gICAgfVxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2luc3RhLWNoYXQtYXBwJywgSW5zdGFDaGF0QXBwKTtcbiIsIi8qXG4gKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGluc3RhLWNoYXQgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiAqIEl0IGNyZWF0ZXMgYSBjaGF0IGNvbm5lY3RlZCB0byBhIHdlYiBzb2NrZXQgdGhhdCBzZW5kcywgcmVjZWl2ZXMgYW5kIHByaW50c1xuICogbWVzc2FnZXMuXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICpcbiAqL1xuXG5sZXQgY2hhdFRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2luc3RhLWNoYXQtYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2luc3RhLWNoYXQuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2NoYXRUZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxubGV0IG1lc3NhZ2VUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbnN0YS1jaGF0LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbnN0YS1jaGF0Lmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNtZXNzYWdlVGVtcGxhdGVcIik7IC8vbWVzc2FnZSBkaXNwbGF5IHRlbXBsYXRlXG5cbmNsYXNzIEluc3RhQ2hhdCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBjaGF0LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICogQHBhcmFtIGNvbmZpZyB7b2JqZWN0fSBhIGNvbmZpZyBvYmplY3Qgd2l0aCB0aGUgd2Vic29ja2V0cyB1cmwsIGNoYW5uZWwsIGtleSBhbmQgYSBuYW1lIGZvciB0aGUgdXNlclxuICAgICAqIEBwYXJhbSBzdGFydE1lc3NhZ2VzIHtbT2JqZWN0XX0gbWVzc2FnZXMgdG8gcHJpbnQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBjaGF0LlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZyA9IHt9LCBzdGFydE1lc3NhZ2VzKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgLy9zZXR1cCBzaGFkb3cgZG9tIHN0eWxlc1xuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBjaGF0VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuXG4gICAgICAgIC8vc2V0IGNvbmZpZyBvYmplY3QgYXMgdGhpcy5jb25maWdcbiAgICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgICAgICB1cmw6IGNvbmZpZy51cmwgfHwgJ3dzOnZob3N0My5sbnUuc2U6MjAwODAvc29ja2V0LycsXG4gICAgICAgICAgICBuYW1lOiBjb25maWcubmFtZSB8fCAnc2V2ZXJ1cyBzbmFwZScsXG4gICAgICAgICAgICBjaGFubmVsOiBjb25maWcuY2hhbm5lbCB8fCAnJyxcbiAgICAgICAgICAgIGtleTogY29uZmlnLmtleSB8fCAnZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmQnXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubWVzc2FnZXMgPSBzdGFydE1lc3NhZ2VzIHx8IFtdO1xuICAgICAgICB0aGlzLnNvY2tldCA9IG51bGw7XG4gICAgICAgIHRoaXMub25saW5lQ2hlY2tlciA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIGNoYXQgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIENvbm5lY3RzIHRvIHRoZSBzZXJ2ZXIsIHNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBwcmludHNcbiAgICAgKiBhbHJlYWR5IHNhdmVkIG1lc3NhZ2VzIGlmIGFueS5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgLy9jb25uZWN0XG4gICAgICAgIHRoaXMuY29ubmVjdCgpO1xuXG4gICAgICAgIC8vc2V0IGV2ZW50IGxpc3RlbmVyIHRvIHNlbmQgbWVzc2FnZSBvbiBlbnRlclxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI21lc3NhZ2VBcmVhJykuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL2lmIG1lc3NhZ2VzIHRvIHByaW50IGF0IHN0YXJ0IG9mIGNoYXQsIHByaW50IGVhY2hcbiAgICAgICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlcy5mb3JFYWNoKChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmludChtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2VzIHRoZSB3ZWIgc29ja2V0IGNvbm5lY3Rpb24gaWYgY2hhdCBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAgICAgKi9cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25uZWN0cyB0byB0aGUgV2ViU29ja2V0IHNlcnZlci5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBjb25uZWN0aW9uIGlzIG9wZW5cbiAgICAgKiBhbmQgcmVqZWN0cyB3aXRoIHRoZSBzZXJ2ZXIgcmVzcG9uc2UgaWYgc29tZXRoaW5nIHdlbnQgd3JvbmcuXG4gICAgICogSWYgYSBjb25uZWN0aW9uIGlzIGFscmVhZHkgb3BlbiwgcmVzb2x2ZXMgd2l0aFxuICAgICAqIHRoZSBzb2NrZXQgZm9yIHRoYXQgY29ubmVjdGlvbi5cbiAgICAgKi9cbiAgICBjb25uZWN0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICBsZXQgc29ja2V0ID0gdGhpcy5zb2NrZXQ7XG5cbiAgICAgICAgICAgIC8vY2hlY2sgZm9yIGVzdGFibGlzaGVkIGNvbm5lY3Rpb25cbiAgICAgICAgICAgIGlmIChzb2NrZXQgJiYgc29ja2V0LnJlYWR5U3RhdGUpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHNvY2tldCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQodGhpcy5jb25maWcudXJsKTtcblxuICAgICAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0T25saW5lQ2hlY2tlcigpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNvY2tldCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignY291bGQgbm90IGNvbm5lY3QgdG8gc2VydmVyJykpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByaW50KHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZU1hbmFnZXIuc2V0Q2hhdExvZyhyZXNwb25zZSk7IC8vc2F2ZSBtZXNzYWdlIGluIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS50eXBlID09PSAnaGVhcnRiZWF0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2hlYXJ0YmVhdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldE9ubGluZUNoZWNrZXIoKTsgLy9yZXNldCBmb3IgZXZlcnkgaGVhcnRiZWF0XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VNYW5hZ2VyLmdldFVuc2VudCgpLmZvckVhY2goKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmQobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZU1hbmFnZXIuY2xlYXJVbnNlbnQoKTsgLy9wdXNoIHVuc2VudCBtZXNzYWdlcyB3aGVuIHRoZXJlIGlzIGEgY29ubmVjdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIGEgbWVzc2FnZSB0byB0aGUgc2VydmVyLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHtzdHJpbmd9IHRoZSBtZXNzYWdlIHRvIHNlbmQuXG4gICAgICovXG4gICAgc2VuZChtZXNzYWdlKSB7XG5cbiAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICAgICAgICBkYXRhOiBtZXNzYWdlLFxuICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMuY29uZmlnLm5hbWUsXG4gICAgICAgICAgICBjaGFubmVsOiB0aGlzLmNvbmZpZy5jaGFubmVsLFxuICAgICAgICAgICAga2V5OiB0aGlzLmNvbmZpZy5rZXlcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNvbm5lY3QoKVxuICAgICAgICAgICAgLnRoZW4oKHNvY2tldCkgPT4ge1xuICAgICAgICAgICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgfSkuY2F0Y2goKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VNYW5hZ2VyLnNldFVuc2VudChkYXRhKTtcbiAgICAgICAgICAgIHRoaXMucHJpbnQoZGF0YSwgdHJ1ZSk7IC8vcHJpbnQgbWVzc2FnZSBhcyBcInVuc2VudFwiIHRvIG1ha2UgaXQgbG9vayBkaWZmZXJlbnQ7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJpbnRzIGEgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB7T2JqZWN0fSB0aGUgbWVzc2FnZSB0byBwcmludC5cbiAgICAgKiBAcGFyYW0gdW5zZW50IHtib29sZWFufSB0cnVlIGlmIHRoZSBtZXNzYWdlIGhhcyBub3QgYmVlbiBzdWNjZXNzZnVsbHkgc2VudFxuICAgICAqL1xuICAgIHByaW50KG1lc3NhZ2UsIHVuc2VudCkge1xuICAgICAgICBsZXQgY2hhdFdpbmRvdyA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjbWVzc2FnZVdpbmRvdycpO1xuICAgICAgICBsZXQgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUobWVzc2FnZVRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgICAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3IoJy5hdXRob3InKS50ZXh0Q29udGVudCA9IG1lc3NhZ2UuZGF0YS51c2VybmFtZSB8fCBtZXNzYWdlLnVzZXJuYW1lO1xuICAgICAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3IoJy5tZXNzYWdlJykudGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGEuZGF0YSB8fCBtZXNzYWdlLmRhdGE7XG5cbiAgICAgICAgaWYgKHVuc2VudCkge1xuICAgICAgICAgICAgbWVzc2FnZURpdi5jbGFzc0xpc3QuYWRkKCd1bnNlbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXRXaW5kb3cuYXBwZW5kQ2hpbGQobWVzc2FnZURpdik7XG4gICAgICAgIGNoYXRXaW5kb3cuc2Nyb2xsVG9wID0gY2hhdFdpbmRvdy5zY3JvbGxIZWlnaHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIGFuZCBzZXRzIGEgbmV3IHRpbWVvdXQgdG8gbWFrZSBzdXJlIHNlcnZlciBpcyBzdGlsbCBjb25uZWN0ZWQuXG4gICAgICogSWYgY29ubmVjdGlvbiBpcyBsb3N0IGFuZCB0aGVuIHJlZ2FpbmVkLCBwcmludHMgYWxsIHVuc2VudCBtZXNzYWdlcy5cbiAgICAgKi9cbiAgICByZXNldE9ubGluZUNoZWNrZXIoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLm9ubGluZUNoZWNrZXIpO1xuXG4gICAgICAgIHRoaXMub25saW5lQ2hlY2tlciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgLy9UT0RPOiBzb21ldGhpbmcgaGVyZVxuICAgICAgICB9LCA2MDAwMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBvYmplY3QgdG8gbWFuYWdlIG1lc3NhZ2VzLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZSBvYmplY3QuXG4gICAgICovXG4gICAgZ2V0IG1lc3NhZ2VNYW5hZ2VyKCkge1xuICAgICAgICAgICAgbGV0IHN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XG4gICAgICAgICAgICBsZXQgY2hhdExvZyA9IFtdO1xuICAgICAgICAgICAgbGV0IHVuc2VudCA9IFtdO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFJldHJpZXZlcyBjaGF0IGxvZyBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSAsIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbm8gbWVzc2FnZXNcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZ2V0Q2hhdExvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2UuY2hhdExvZykge1xuICAgICAgICAgICAgICAgICAgICBjaGF0TG9nID0gSlNPTi5wYXJzZShzdG9yYWdlLmNoYXRMb2cpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBjaGF0TG9nO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUmV0cmlldmVzIHVuc2VudCBtZXNzYWdlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSBtZXNzYWdlcywgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBubyBtZXNzYWdlc1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBnZXRVbnNlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlLnVuc2VudCkge1xuICAgICAgICAgICAgICAgICAgICB1bnNlbnQgPSBKU09OLnBhcnNlKHN0b3JhZ2UudW5zZW50KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5zZW50O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogc2V0cyB1bnNlbnQgbWVzc2FnZXMgaW4gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICogQHBhcmFtIG1lc3NhZ2Uge29iamVjdH0gdGhlIG1lc3NhZ2Ugb2JqZWN0IHRvIHNhdmVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2V0VW5zZW50OiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9sZE1lc3NhZ2VzO1xuXG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2UudW5zZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzID0gSlNPTi5wYXJzZShzdG9yYWdlLnVuc2VudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgc3RvcmFnZS51bnNlbnQgPSBKU09OLnN0cmluZ2lmeShvbGRNZXNzYWdlcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBDbGVhcnMgdW5zZW50IG1lc3NhZ2VzLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjbGVhclVuc2VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3RvcmFnZS5yZW1vdmVJdGVtKCd1bnNlbnQnKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogU2V0cyBzZW50IG1lc3NhZ2VzIGluIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEBwYXJhbSBtZXNzYWdlIHtvYmplY3R9IHRoZSBtZXNzYWdlIG9iamVjdCB0byBzYXZlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNldENoYXRMb2c6IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBsZXQgb2xkTWVzc2FnZXM7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RvcmFnZS5jaGF0TG9nKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzID0gSlNPTi5wYXJzZShzdG9yYWdlLmNoYXRMb2cpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMucHVzaChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIGlmIChvbGRNZXNzYWdlcy5sZW5ndGggPiAyMCkgeyAvL2tlZXAgdGhlIGxpc3QgdG8gMjAgbWVzc2FnZXNcbiAgICAgICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMubGVuZ3RoID0gMjA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3RvcmFnZS5jaGF0TG9nID0gSlNPTi5zdHJpbmdpZnkob2xkTWVzc2FnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGNvbmZpZyBmaWxlLlxuICAgICAqIEBwYXJhbSBjb25maWcge29iamVjdH0gdGhlIG5ldyB2YWx1ZXMgaW4gYW4gb2JqZWN0LlxuICAgICAqL1xuICAgIGNoYW5nZUNvbmZpZyhjb25maWcpIHtcbiAgICAgICAgdGhpcy5jb25maWcubmFtZSA9IGNvbmZpZy5uYW1lIHx8IHRoaXMuY29uZmlnLm5hbWU7XG4gICAgICAgIHRoaXMuY29uZmlnLnVybCA9IGNvbmZpZy51cmx8fCB0aGlzLmNvbmZpZy51cmw7XG4gICAgICAgIHRoaXMuY29uZmlnLmNoYW5uZWwgPSBjb25maWcuY2hhbm5lbCB8fCB0aGlzLmNvbmZpZy5jaGFubmVsO1xuICAgICAgICB0aGlzLmNvbmZpZy5rZXkgPSBjb25maWcua2V5IHx8IHRoaXMuY29uZmlnLmtleTtcbiAgICB9XG59XG5cbi8vZGVmaW5lcyB0aGUgZWxlbWVudFxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdpbnN0YS1jaGF0JywgSW5zdGFDaGF0KTtcblxuIiwibGV0IG1lbW9yeVdpbmRvd1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeVdpbmRvd1RlbXBsYXRlXCIpO1xubGV0IGhpZ2hzY29yZXNUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNoaWdoc2NvcmVzVGVtcGxhdGVcIik7XG5cbmNsYXNzIE1lbW9yeUFwcCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBtZW1vcnlXaW5kb3dUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIGxldCBnYW1lID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ21lbW9yeS1nYW1lJyk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5wYXRoWzBdO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdyZXN0YXJ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdtZW1vcnktZ2FtZScpLnJlcGxheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ25ldyc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKS5yZXN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncXVpdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaGlnaHNjb3Jlcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmVuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5SGlnaHNjb3JlcyhnYW1lLnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2JvYXJkc2l6ZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51c2VyID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbnRybyBpbnB1dCcpLnZhbHVlIHx8ICdzdHJhbmdlcic7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdib2FyZHNpemUnKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc0NCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLndpZHRoID0gNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuaGVpZ2h0ID0gNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnNDInOlxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS53aWR0aCA9IDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmhlaWdodCA9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzI0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUud2lkdGggPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5oZWlnaHQgPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5kcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBkaXNwbGF5SGlnaHNjb3JlcyhyZXN1bHQpIHtcbiAgICAgICAgbGV0IGhpZ2hzY29yZXMgPSB7XG4gICAgICAgICAgICBzdG9yYWdlOiBsb2NhbFN0b3JhZ2UsXG4gICAgICAgICAgICBzY29yZXM6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUmV0cmlldmVzIGhpZ2hzY29yZXMgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSB0aGUgaGlnaHNjb3JlLWxpc3QsIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbm8gaGlnaHNjb3Jlc1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBnZXRIaWdoU2NvcmVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcmVzID0gSlNPTi5wYXJzZSh0aGlzLnN0b3JhZ2UubWVtb3J5SGlnaFNjb3Jlcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2NvcmVzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogc2V0cyBoaWdoc2NvcmVzIGluIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEBwYXJhbSB1c2VyIHtzdHJpbmd9IHRoZSB1c2VycyBuYW1lXG4gICAgICAgICAgICAgKiBAcGFyYW0gbmV3U2NvcmUge251bWJlcn0gdGhlIHNjb3JlIHRvIHNldFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzZXRIaWdoU2NvcmVzOiBmdW5jdGlvbiAodXNlciwgbmV3U2NvcmUpIHtcbiAgICAgICAgICAgICAgICBsZXQgb2xkSGlnaFNjb3JlcztcbiAgICAgICAgICAgICAgICBsZXQgbmV3SGlnaFNjb3JlcztcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0b3JhZ2UubWVtb3J5SGlnaFNjb3Jlcykge1xuICAgICAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcyA9IEpTT04ucGFyc2UodGhpcy5zdG9yYWdlLm1lbW9yeUhpZ2hTY29yZXMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMucHVzaCh7dXNlcjogdXNlciwgc2NvcmU6IG5ld1Njb3JlfSk7XG5cbiAgICAgICAgICAgICAgICBuZXdIaWdoU2NvcmVzID0gb2xkTWVzc2FnZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5zY29yZSAtIGIuc2NvcmU7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobmV3SGlnaFNjb3Jlcy5sZW5ndGggPiA1KSB7IC8va2VlcCB0aGUgbGlzdCB0byA1IHNjb3Jlc1xuICAgICAgICAgICAgICAgICAgICBuZXdIaWdoU2NvcmVzLmxlbmd0aCA9IDU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9yYWdlLm1lbW9yeUhpZ2hTY29yZXMgPSBKU09OLnN0cmluZ2lmeShuZXdIaWdoU2NvcmVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICBsZXQgc2NvcmUgPSAocmVzdWx0LnR1cm5zICogcmVzdWx0LnRpbWUpIC8gKHRoaXMuaGVpZ2h0ICogdGhpcy53aWR0aCk7XG4gICAgICAgICAgICBoaWdoc2NvcmVzLnNldEhpZ2hTY29yZXModGhpcy51c2VyLCByZXN1bHQudHVybnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNjb3JlcyA9IGhpZ2hzY29yZXMuZ2V0SGlnaFNjb3JlcygpO1xuICAgICAgICBsZXQgaGlnaHNjb3JlRGlzcGxheSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjaGlnaHNjb3JlRGlzcGxheScpO1xuICAgICAgICBsZXQgb2xkTGlzdCA9IGhpZ2hzY29yZURpc3BsYXkucXVlcnlTZWxlY3RvcigndWwnKTtcbiAgICAgICAgbGV0IGxpc3QgPSBkb2N1bWVudC5pbXBvcnROb2RlKGhpZ2hzY29yZXNUZW1wbGF0ZS5jb250ZW50LnF1ZXJ5U2VsZWN0b3IoXCJ1bFwiKSwgdHJ1ZSk7XG4gICAgICAgIGxldCBlbnRyeTtcblxuICAgICAgICBpZiAoc2NvcmVzKSB7XG4gICAgICAgICAgICBzY29yZXMuZm9yRWFjaCgoc2NvcmUpID0+IHtcbiAgICAgICAgICAgICAgICBlbnRyeSA9IGRvY3VtZW50LmltcG9ydE5vZGUoKGxpc3QucXVlcnlTZWxlY3RvcihcImxpXCIpKSk7XG4gICAgICAgICAgICAgICAgZW50cnkudGV4dENvbnRlbnQgPSBzY29yZS51c2VyICsgXCI6IFwiICsgc2NvcmUuc2NvcmU7XG4gICAgICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChlbnRyeSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVudHJ5ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSgobGlzdC5xdWVyeVNlbGVjdG9yKFwibGlcIikpKTtcbiAgICAgICAgICAgIGVudHJ5LnRleHRDb250ZW50ID0gXCItXCI7XG4gICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKGVudHJ5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb2xkTGlzdCkgeyAvL2lmIHNjb3JlcyBoYXZlIGFscmVhZHkgYmVlbiBkaXNwbGF5ZWQsIHJlcGxhY2UgdGhlbVxuICAgICAgICAgICAgaGlnaHNjb3JlRGlzcGxheS5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhpZ2hzY29yZURpc3BsYXkucmVwbGFjZUNoaWxkKGxpc3QsIG9sZExpc3QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93JykuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgIH1cblxufVxuXG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ21lbW9yeS1hcHAnLCBNZW1vcnlBcHApO1xuIiwiLypcbiAqIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgbWVtb3J5LWdhbWUgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiAqIEl0IGNyZWF0ZXMgYSBtZW1vcnkgZ2FtZSB3aXRoIGEgdGltZXIgYSBhIHR1cm4tY291bnRlci4gVGhlIGdhbWUgaXMgb3ZlciB3aGVuXG4gKiBhbGwgYnJpY2tzIGhhdmUgYmVlbiBwYWlyZWQgYW5kIHN0b3JlcyB0aGUgdG90YWwgdGltZSBhbmQgdHVybnMgaW4gYSByZXN1bHQtdmFyaWFibGUuXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICpcbiAqL1xuXG5sZXQgbWVtb3J5VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktZ2FtZS5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5VGVtcGxhdGVcIik7IC8vc2hhZG93IERPTSBpbXBvcnRcbmxldCBicmlja1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWdhbWUuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2JyaWNrVGVtcGxhdGVcIik7IC8vYnJpY2sgdGVtcGxhdGVcblxuLy9yZXF1aXJlc1xubGV0IFRpbWVyID0gcmVxdWlyZSgnLi90aW1lci5qcycpO1xuXG5cbmNsYXNzIE1lbW9yeUdhbWUgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIGEgbWVtb3J5IGdhbWUsIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgLy9zZXR1cCBzaGFkb3cgZG9tIHN0eWxlc1xuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBtZW1vcnlUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICAgICAgLy9zZXQgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkYXRhLXdpZHRoJywgd2lkdGggfHwgdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2lkdGgnKSB8fCA0KTtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0JywgaGVpZ2h0IHx8IHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcpICB8fCA0KTtcblxuICAgICAgICAvL3NldCByZWZlcmVuY2VzXG4gICAgICAgIHRoaXMuc2V0ID0gW107XG4gICAgICAgIHRoaXMudGltZXIgPSBuZXcgVGltZXIoMCk7XG4gICAgICAgIHRoaXMuZ2FtZVBsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudGltZXNwYW4gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiN0aW1lc3BhblwiKTtcbiAgICAgICAgdGhpcy50dXJuc3BhbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI3R1cm5zcGFuXCIpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIG1lbW9yeSBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgYW5kIHJlbmRlcnMgYSBib2FyZCB3aXRoIGJyaWNrcy5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNvdXRybyBidXR0b24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXN0YXJ0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjaW50cm8gYnV0dG9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGxheSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgd2lkdGggb2YgdGhlIGJvYXJkIGluIGJyaWNrc1xuICAgICAqL1xuICAgIGdldCB3aWR0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLXdpZHRoJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgd2lkdGggb2YgdGhlIGJvYXJkIGluIGJyaWNrcy5cbiAgICAgKiBAcGFyYW0gbmV3VmFsIHtzdHJpbmd9IHRoZSBuZXcgd2lkdGggb2YgdGhlIGJvYXJkIGluIGJyaWNrc1xuICAgICAqL1xuICAgIHNldCB3aWR0aChuZXdWYWwpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2lkdGgnLCBuZXdWYWwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBoZWlnaHQgb2YgdGhlIGJvYXJkIGluIGJyaWNrc1xuICAgICAqL1xuICAgIGdldCBoZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS1oZWlnaHQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBoZWlnaHQgb2YgdGhlIGJvYXJkIGluIGJyaWNrcy5cbiAgICAgKiBAcGFyYW0gbmV3VmFsIHtzdHJpbmd9IHRoZSBuZXcgaGVpZ2h0IG9mIHRoZSBib2FyZCBpbiBicmlja3NcbiAgICAgKi9cbiAgICBzZXQgaGVpZ2h0KG5ld1ZhbCkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnZGF0YS1oZWlnaHQnLCBuZXdWYWwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNodWZmbGVzIHRoZSBicmlja3MgdXNpbmcgRmlzaGVyLVlhdGVzIGFsZ29yaXRobS5cbiAgICAgKi9cbiAgICBzaHVmZmxlKCkge1xuICAgICAgICBsZXQgdGhlU2V0ID0gdGhpcy5zZXQ7XG4gICAgICAgIGZvciAobGV0IGkgPSAodGhlU2V0Lmxlbmd0aCAtIDEpOyBpID4gMDsgaSAtPSAxKSB7XG4gICAgICAgICAgICBsZXQgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpO1xuICAgICAgICAgICAgbGV0IGlPbGQgPSB0aGVTZXRbaV07XG4gICAgICAgICAgICB0aGVTZXRbaV0gPSB0aGVTZXRbal07XG4gICAgICAgICAgICB0aGVTZXRbal0gPSBpT2xkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0ID0gdGhlU2V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIGJyaWNrcyB0byB0aGUgYm9hcmQgYW5kIHJlbmRlcnMgdGhlbSBpbiB0aGUgRE9NLlxuICAgICAqL1xuICAgIGRyYXcoKSB7XG4gICAgICAgIGxldCBicmljaztcbiAgICAgICAgbGV0IG1hdGNoO1xuICAgICAgICBsZXQgcGFpcnMgPSBNYXRoLnJvdW5kKCh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQpKSAvIDI7XG4gICAgICAgIHRoaXMuc2V0ID0gW107XG4gICAgICAgIGxldCBvbGRCcmlja3MgPSB0aGlzLmNoaWxkcmVuO1xuXG4gICAgICAgIC8vcmVtb3ZlIG9sZCBicmlja3MgaWYgYW55XG4gICAgICAgIGZvciAobGV0IGkgPSBvbGRCcmlja3MubGVuZ3RoIC0xOyBpID49IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgbGV0IGJyaWNrID0gb2xkQnJpY2tzW2ldO1xuICAgICAgICAgICAgaWYgKGJyaWNrLmdldEF0dHJpYnV0ZSgnc2xvdCcpID09PSAnYnJpY2snKSB7XG4gICAgICAgICAgICAgICAgYnJpY2sucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChicmljayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL2luaXRpYXRlIGJyaWNrc1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBwYWlyczsgaSArPSAxKSB7XG4gICAgICAgICAgICBicmljayA9IG5ldyBCcmljayhpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0LnB1c2goYnJpY2spO1xuICAgICAgICAgICAgbWF0Y2ggPSBicmljay5jbG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5zZXQucHVzaChtYXRjaCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRoZVNldCA9IHRoaXMuc2V0O1xuXG4gICAgICAgIC8vcHV0IHRoZW0gaW4gdGhlIGRvbVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoZVNldC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgbGV0IGJyaWNrRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShicmlja1RlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICAgICAgbGV0IGltZyA9IGJyaWNrRGl2LnF1ZXJ5U2VsZWN0b3IoXCJpbWdcIik7XG4gICAgICAgICAgICBsZXQgYnJpY2sgPSB0aGVTZXRbaV07XG4gICAgICAgICAgICBpbWcuc3JjID0gJy9pbWFnZS9tZW1vcnktYnJpY2stJyArIGJyaWNrLmRyYXcoKSArICcucG5nJztcbiAgICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJicmlja051bWJlclwiLCBpKTtcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kQ2hpbGQoYnJpY2tEaXYpO1xuXG4gICAgICAgICAgICBpZiAoKGkgKyAxKSAlIHRoaXMud2lkdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgYnIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIik7XG4gICAgICAgICAgICAgICAgYnIuc2V0QXR0cmlidXRlKCdzbG90JywgJ2JyaWNrJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChicik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydHMgYSBnYW1lLCBwbGF5cyBpdCB0aHJvdWdoLCBzYXZlcyB0aGUgcmVzdWx0IGFuZFxuICAgICAqIHRoZW4gZGlzcGxheXMgdGhlIG91dHJvLlxuICAgICAqL1xuICAgIHBsYXkoKSB7XG4gICAgICAgIHRoaXMuc2h1ZmZsZSgpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI21haW5cIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMudGltZXIuc3RhcnQoMCk7XG4gICAgICAgIHRoaXMudGltZXIuZGlzcGxheSh0aGlzLnRpbWVzcGFuKTtcbiAgICAgICAgcGxheUdhbWUodGhpcy5zZXQsIHRoaXMpXG4gICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnRpbWUgPSB0aGlzLnRpbWVyLnN0b3AoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblwiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cm9cIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzdGFydHMgdGhlIGdhbWUgd2l0aCB0aGUgc2FtZSBzaXplIG9mIGJvYXJkIHdpdGhvdXQgcmUtcmVuZGVyaW5nXG4gICAgICovXG4gICAgcmVwbGF5KCkge1xuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI2ludHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblwiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI291dHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBnYW1lIGFuZCB0aGVuIGxldHMgdGhlIHVzZXIgY2hvb3NlIGEgbmV3IGdhbWUgc2l6ZSBhbmRcbiAgICAgKiB1c2VyIG5hbWUsIHJlLXJlbmRlcmluZyB0aGUgYm9hcmQuXG4gICAgICovXG4gICAgcmVzdGFydCgpIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI21haW5cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBnYW1lIHRvIG1ha2UgaXQgcGxheWFibGUgYWdhaW4uIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzXG4gICAgICogYW5kIHR1cm5zIHRoZSBicmlja3Mgb3Zlci5cbiAgICAgKi9cbiAgICByZXNldCgpIHtcbiAgICAgICAgbGV0IGJyaWNrcyA9IHRoaXMucXVlcnlTZWxlY3RvckFsbCgnW3Nsb3Q9XCJicmlja1wiXScpO1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGJyaWNrcywgKGJyaWNrKSA9PiB7XG4gICAgICAgICAgICBicmljay5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICBsZXQgaW1nID0gYnJpY2sucXVlcnlTZWxlY3RvcihcImltZ1wiKTtcbiAgICAgICAgICAgIGlmIChpbWcpIHtcbiAgICAgICAgICAgICAgICBsZXQgYnJpY2tOdW1iZXIgPSBpbWcuZ2V0QXR0cmlidXRlKFwiYnJpY2tOdW1iZXJcIik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2V0W2JyaWNrTnVtYmVyXS5kcmF3KCkgIT09IDApIHsgLy90dXJuIHRoZSBicmljayBvdmVyIGlmIGl0J3Mgbm90IHR1cm5lZFxuICAgICAgICAgICAgICAgICAgICBpbWcuc3JjID0gJy9pbWFnZS9tZW1vcnktYnJpY2stJyArIHRoaXMuc2V0W2JyaWNrTnVtYmVyXS50dXJuKCkgKyAnLnBuZyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50aW1lc3Bhbi50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgICB0aGlzLnR1cm5zcGFuLnRleHRDb250ZW50ID0gJyc7XG4gICAgICAgIHRoaXMudGltZXIuc3RvcCgpOyAvL21ha2Ugc3VyZSB0aW1lciBpcyBzdG9wcGVkXG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjYm9hcmQnKS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5nYW1lUGxheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5kcyB0aGUgZ2FtZSBhbmQgZGlzcGxheXMgdGhlIG91dHJvLlxuICAgICAqL1xuICAgIGVuZCgpIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI21haW5cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgfVxufVxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbWVtb3J5LWdhbWUnLCBNZW1vcnlHYW1lKTtcblxuXG4vKipcbiAqIEEgY2xhc3MgQnJpY2sgdG8gZ28gd2l0aCB0aGUgbWVtb3J5IGdhbWUuXG4gKi9cbmNsYXNzIEJyaWNrIHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgdGhlIEJyaWNrIHdpdGggYSB2YWx1ZSBhbmQgcGxhY2VzIGl0IGZhY2Vkb3duLlxuICAgICAqIEBwYXJhbSBudW1iZXIge251bWJlcn0gdGhlIHZhbHVlIHRvIGluaXRpYXRlLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG51bWJlcikge1xuICAgICAgICB0aGlzLnZhbHVlID0gbnVtYmVyO1xuICAgICAgICB0aGlzLmZhY2Vkb3duID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUdXJucyB0aGUgYnJpY2sgYW5kIHJldHVybnMgdGhlIHZhbHVlIGFmdGVyIHRoZSB0dXJuLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSB2YWx1ZSBvZiB0aGUgYnJpY2sgaWYgaXQncyBmYWNldXAsIG90aGVyd2lzZSAwLlxuICAgICAqL1xuICAgIHR1cm4oKSB7XG4gICAgICAgIHRoaXMuZmFjZWRvd24gPSAhKHRoaXMuZmFjZWRvd24pO1xuICAgICAgICByZXR1cm4gdGhpcy5kcmF3KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIGJyaWNrcy5cbiAgICAgKiBAcGFyYW0gb3RoZXIge0JyaWNrfSB0aGUgQnJpY2sgdG8gY29tcGFyZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgYnJpY2tzIHZhbHVlcyBhcmUgZXF1YWwuXG4gICAgICovXG4gICAgZXF1YWxzKG90aGVyKSB7XG4gICAgICAgIHJldHVybiAob3RoZXIgaW5zdGFuY2VvZiBCcmljaykgJiYgKHRoaXMudmFsdWUgPT09IG90aGVyLnZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9uZXMgdGhlIGJyaWNrLlxuICAgICAqIEByZXR1cm5zIHtCcmlja30gdGhlIGNsb25lLlxuICAgICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gbmV3IEJyaWNrKHRoaXMudmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBicmljaydzIHZhbHVlLCBvciAwIGlmIGl0IGlzIGZhY2UgZG93bi5cbiAgICAgKi9cbiAgICBkcmF3KCkge1xuICAgICAgICBpZiAodGhpcy5mYWNlZG93bikge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgc2V0cyB1cCB0aGUgZ2FtZXBsYXkuIEFkZHMgYW5kIHJlbW92ZXMgZXZlbnQtbGlzdGVuZXJzIHNvIHRoYXQgdGhlIHNhbWUgZ2FtZSBjYW4gYmUgcmVzZXQuXG4gKiBAcGFyYW0gc2V0IFt7QnJpY2tdfSB0aGUgc2V0IG9mIGJyaWNrcyB0byBwbGF5IHdpdGguXG4gKiBAcGFyYW0gZ2FtZSB7bm9kZX0gdGhlIHNwYWNlIHRvIHBsYXlcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSByZXN1bHQgb2YgdGhlIGdhbWUgd2hlbiB0aGUgZ2FtZSBoYXMgYmVlbiBwbGF5ZWQuXG4gKi9cbmZ1bmN0aW9uIHBsYXlHYW1lKHNldCwgZ2FtZSkge1xuICAgIGxldCB0dXJucyA9IDA7XG4gICAgbGV0IGJyaWNrcyA9IHBhcnNlSW50KGdhbWUud2lkdGgpICogcGFyc2VJbnQoZ2FtZS5oZWlnaHQpO1xuICAgIGxldCBib2FyZCA9IGdhbWUuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjYm9hcmQnKTtcbiAgICBsZXQgYnJpY2tzTGVmdCA9IGJyaWNrcztcbiAgICBsZXQgY2hvaWNlMTtcbiAgICBsZXQgY2hvaWNlMjtcbiAgICBsZXQgaW1nMTtcbiAgICBsZXQgaW1nMjtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGdhbWUuZ2FtZVBsYXkgPSBmdW5jdGlvbihldmVudCkgeyAvL2V4cG9zZSB0aGUgcmVmZXJlbmNlIHNvIHRoZSBldmVudCBsaXN0ZW5lciBjYW4gYmUgcmVtb3ZlZCBmcm9tIG91dHNpZGUgdGhlIGZ1bmN0aW9uXG4gICAgICAgICAgICBpZiAoIWNob2ljZTIpIHsgLy9pZiB0d28gYnJpY2tzIGFyZSBub3QgdHVybmVkXG4gICAgICAgICAgICAgICAgbGV0IGltZyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yKFwiaW1nXCIpIHx8IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgICAgICBsZXQgYnJpY2tOdW1iZXIgPSBpbWcuZ2V0QXR0cmlidXRlKFwiYnJpY2tOdW1iZXJcIik7XG4gICAgICAgICAgICAgICAgaWYgKCFicmlja051bWJlcikgeyAvL3RhcmdldCBpcyBub3QgYSBicmlja1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGJyaWNrID0gc2V0W2JyaWNrTnVtYmVyXTtcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gJy9pbWFnZS8nICsgYnJpY2sudHVybigpICsgJy5wbmcnO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFjaG9pY2UxKSB7IC8vZmlyc3QgYnJpY2sgdG8gYmUgdHVybmVkXG4gICAgICAgICAgICAgICAgICAgIGltZzEgPSBpbWc7XG4gICAgICAgICAgICAgICAgICAgIGNob2ljZTEgPSBicmljaztcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvL3NlY29uZCBicmljayB0byBiZSB0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgaW1nMiA9IGltZztcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlMiA9IGJyaWNrO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaG9pY2UxLmVxdWFscyhjaG9pY2UyKSAmJiBpbWcxLmdldEF0dHJpYnV0ZSgnYnJpY2tOdW1iZXInKSAhPT0gaW1nMi5nZXRBdHRyaWJ1dGUoJ2JyaWNrTnVtYmVyJykpIHsgLy90aGUgdHdvIGJyaWNrcyBhcmUgZXF1YWwgYnV0IG5vdCB0aGUgc2FtZVxuICAgICAgICAgICAgICAgICAgICAgICAgaW1nMS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcyLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTEgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hvaWNlMiA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJpY2tzTGVmdCAtPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJyaWNrc0xlZnQgPT09IDApIHsgLy9hbGwgYnJpY2tzIGFyZSB0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHt0dXJuczogdHVybnN9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy9icmlja3MgYXJlIG5vdCB0aGUgc2FtZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nMS5zcmMgPSAnL2ltYWdlLycgKyBjaG9pY2UxLnR1cm4oKSArICcucG5nJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcyLnNyYyA9ICcvaW1hZ2UvJyArIGNob2ljZTIudHVybigpICsgJy5wbmcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTEgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZzEgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZzIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0dXJucyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBnYW1lLnR1cm5zcGFuLnRleHRDb250ZW50ID0gdHVybnM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdhbWUuZ2FtZVBsYXkpO1xuXG4gICAgfSk7XG5cbn1cbiIsIi8qKlxuICogTW9kdWxlIGZvciBUaW1lci5cbiAqXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG5cbmNsYXNzIFRpbWVyIHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBUaW1lci5cbiAgICAgKiBAcGFyYW0gc3RhcnRUaW1lIHtudW1iZXJ9IHdoZXJlIHRvIHN0YXJ0IGNvdW50aW5nLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN0YXJ0VGltZSA9IDApIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IHN0YXJ0VGltZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgY291bnRcbiAgICAgKi9cbiAgICBnZXQgdGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY291bnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdGltZSBvbiB0aGUgdGltZXIuXG4gICAgICogQHBhcmFtIG5ld1RpbWUge251bWJlcn0gdGhlIG5ldyB0aW1lXG4gICAgICovXG4gICAgc2V0IHRpbWUobmV3VGltZSkge1xuICAgICAgICB0aGlzLmNvdW50ID0gbmV3VGltZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc3RhcnRzIHRoZSB0aW1lci4gaW5jcmVtZW50cyB0aW1lIGV2ZXJ5IDEwMCBtaWxsaXNlY29uZHMuXG4gICAgICogQHBhcmFtIHRpbWUge251bWJlcn0gd2hhdCBudW1iZXIgdG8gc3RhcnQgaXQgb24uXG4gICAgICovXG4gICAgc3RhcnQodGltZSA9IHRoaXMudGltZSkge1xuICAgICAgICB0aGlzLmNvdW50ID0gdGltZTtcbiAgICAgICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY291bnQgKz0gMTAwO1xuICAgICAgICB9LCAxMDApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBzdGFydHMgdGhlIHRpbWVyLiBkZWNyZW1lbnRzIHRpbWUgZXZlcnkgMTAwIG1pbGxpc2Vjb25kcy5cbiAgICAgKiBAcGFyYW0gdGltZSB7bnVtYmVyfSB3aGF0IG51bWJlciB0byBzdGFydCBpdCBvbi5cbiAgICAgKi9cbiAgICBjb3VudGRvd24odGltZSkge1xuICAgICAgICB0aGlzLmNvdW50ID0gdGltZSB8fCB0aGlzLmNvdW50O1xuICAgICAgICB0aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb3VudCAtPSAxMDA7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHN0b3BzIHRoZSBUaW1lci5cbiAgICAgKiBAcmV0dXJucyB0aGUgY291bnQuXG4gICAgICovXG4gICAgc3RvcCgpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmRpc3BsYXlJbnRlcnZhbCk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEaXNwbGF5cyBhIHJvdW5kZWQgdmFsdWUgb2YgdGhlIGNvdW50IG9mIHRoZSB0aW1lclxuICAgICAqIHRvIHRoZSBkZXNpcmVkIHByZWNpc2lvbiwgYXQgYW4gaW50ZXJ2YWwuXG4gICAgICogQHBhcmFtIGRlc3RpbmF0aW9uIHtub2RlfSB3aGVyZSB0byBtYWtlIHRoZSBkaXNwbGF5XG4gICAgICogQHBhcmFtIGludGVydmFsIHtudW1iZXJ9IHRoZSBpbnRlcnZhbCB0byBtYWtlIHRoZSBkaXNwbGF5IGluLCBpbiBtaWxsaXNlY29uZHNcbiAgICAgKiBAcGFyYW0gcHJlY2lzaW9uIHtudW1iZXJ9dGhlIG51bWJlciB0byBkaXZpZGUgdGhlIGRpc3BsYXllZCBtaWxsaXNlY29uZHMgYnlcbiAgICAgKiBAcmV0dXJucyB0aGUgaW50ZXJ2YWwuXG4gICAgICpcbiAgICAgKi9cbiAgICBkaXNwbGF5KGRlc3RpbmF0aW9uLCBpbnRlcnZhbCA9IDEwMCwgcHJlY2lzaW9uID0gMTAwMCkge1xuICAgICAgICB0aGlzLmRpc3BsYXlJbnRlcnZhbCA9IHNldEludGVydmFsKCAoKT0+IHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZCh0aGlzLmNvdW50IC8gcHJlY2lzaW9uKTtcbiAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICByZXR1cm4gdGhpcy5kaXNwbGF5SW50ZXJ2YWw7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xuIl19
