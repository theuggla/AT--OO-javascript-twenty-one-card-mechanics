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


//requires
let desktop = require("./desktop.js");


},{"./desktop.js":3,"./draggable-window.js":4,"./expandable-menu-item.js":5,"./memory-app.js":6,"./memory-game.js":7}],3:[function(require,module,exports){
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
                    oldHighScores = JSON.parse(this.storage.memoryHighScores);
                } else {
                    oldHighScores = [];
                }

                oldHighScores.push({user: user, score: newScore});

                newHighScores = oldHighScores.sort((a, b) => {
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

},{}],7:[function(require,module,exports){
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

},{"./timer.js":8}],8:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvV2luZG93TWFuYWdlci5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kcmFnZ2FibGUtd2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9leHBhbmRhYmxlLW1lbnUtaXRlbS5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5LWFwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVtb3J5LWdhbWUuanMiLCJjbGllbnQvc291cmNlL2pzL3RpbWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gV2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSkge1xuICAgIGxldCB3bSA9IHt9O1xuXG4gICAgY2xhc3MgV2luZG93TWFuYWdlciB7XG5cbiAgICAgICAgY29uc3RydWN0b3Iod2luZG93U3BhY2UpIHtcbiAgICAgICAgICAgIHdtLnN0YXJ0WCA9IHdpbmRvd1NwYWNlLm9mZnNldExlZnQgKyAyMDtcbiAgICAgICAgICAgIHdtLnN0YXJ0WSA9IHdpbmRvd1NwYWNlLm9mZnNldFRvcCArIDIwO1xuICAgICAgICAgICAgd20udHlwZXMgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlV2luZG93KHR5cGUpIHtcbiAgICAgICAgICAgIGxldCBhV2luZG93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRyYWdnYWJsZS13aW5kb3dcIik7XG5cbiAgICAgICAgLyptYWtlIHRlbXBsYXRlLCBpZiBubyB3aW5kb3dzIG9wZW4gb2Yga2luZCBldGNcbiAgICAgICAgIGxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG4gICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcImltcG9ydFwiKTtcbiAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcIi9kcmFnZ2FibGUtd2luZG93Lmh0bWxcIik7XG4gICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICAgZXZlbnQudGFyZ2V0LnNldEF0dHJpYnV0ZShcImxhYmVsXCIsIHR5cGUpOyovXG5cbiAgICAgICAgICAgIHdpbmRvd1NwYWNlLmFwcGVuZENoaWxkKGFXaW5kb3cpO1xuICAgICAgICAgICAgc2V0dXBTcGFjZSh0eXBlLCBhV2luZG93KTtcblxuICAgICAgICAgICAgaWYgKHdtW3R5cGVdLm9wZW4pIHtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuLnB1c2goYVdpbmRvdyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4gPSBbYVdpbmRvd107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhV2luZG93O1xuICAgICAgICB9XG5cbiAgICAgICAgb3Blbih0eXBlKSB7XG4gICAgICAgICAgICBpZiAod21bdHlwZV0pIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgICAgICAgICAgbGV0IHdpbmRvd3MgPSB3bVt0eXBlXS5vcGVuO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHdpbmRvd3MuZmlsdGVyKCAodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdy5vcGVuO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBleHBhbmQodHlwZSkge1xuICAgICAgICAgICAgbGV0IHdpbnMgPSB0aGlzLm9wZW4odHlwZSk7XG4gICAgICAgICAgICBpZiAod2lucykge1xuICAgICAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB3Lm1pbmltaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbWluaW1pemUodHlwZSkge1xuICAgICAgICAgICAgbGV0IHdpbnMgPSB0aGlzLm9wZW4odHlwZSk7XG4gICAgICAgICAgICBpZiAod2lucykge1xuICAgICAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB3Lm1pbmltaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGNsb3NlKHR5cGUpIHtcbiAgICAgICAgICAgIGxldCB3aW5zID0gdGhpcy5vcGVuKHR5cGUpO1xuICAgICAgICAgICAgaWYgKHdpbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh3aW5zKTtcbiAgICAgICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBXaW5kb3dNYW5hZ2VyKHdpbmRvd1NwYWNlKTtcblxuICAgIC8vaGVscGVyIGZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIHNldHVwU3BhY2UodHlwZSwgc3BhY2UpIHtcbiAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge307XG4gICAgICAgIGxldCB4O1xuICAgICAgICBsZXQgeTtcblxuICAgICAgICBpZiAod21bdHlwZV0pIHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAod21bdHlwZV0ubGF0ZXN0Q29vcmRzLnggKz0gNTApO1xuICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9ICh3bVt0eXBlXS5sYXRlc3RDb29yZHMueSArPSA1MCk7XG5cbiAgICAgICAgICAgIGlmICghKHdpdGhpbkJvdW5kcyhzcGFjZSwgd2luZG93U3BhY2UsIGRlc3RpbmF0aW9uKSkpIHtcbiAgICAgICAgICAgICAgICB4ID0gd21bdHlwZV0uc3RhcnRDb29yZHMueCArPSA1O1xuICAgICAgICAgICAgICAgIHkgPSB3bVt0eXBlXS5zdGFydENvb3Jkcy55ICs9IDU7XG4gICAgICAgICAgICAgICAgd21bdHlwZV0ubGF0ZXN0Q29vcmRzLnggPSB4O1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLmxhdGVzdENvb3Jkcy55ID0geTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgeCA9IGRlc3RpbmF0aW9uLng7XG4gICAgICAgICAgICAgICAgeSA9IGRlc3RpbmF0aW9uLnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAod20uc3RhcnRYICsgKDYwICogd20udHlwZXMpKTtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAod20uc3RhcnRZKTtcblxuICAgICAgICAgICAgaWYgKCEod2l0aGluQm91bmRzKHNwYWNlLCB3aW5kb3dTcGFjZSwgZGVzdGluYXRpb24pKSkge1xuICAgICAgICAgICAgICAgIHggPSB3bS5zdGFydFg7XG4gICAgICAgICAgICAgICAgeSA9IHdtLnN0YXJ0WTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgeCA9IGRlc3RpbmF0aW9uLng7XG4gICAgICAgICAgICAgICAgeSA9IGRlc3RpbmF0aW9uLnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdtW3R5cGVdID0ge307XG4gICAgICAgICAgICB3bVt0eXBlXS5zdGFydENvb3JkcyA9IHtcbiAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3bVt0eXBlXS5sYXRlc3RDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd20udHlwZXMgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBzcGFjZS50YWJJbmRleCA9IDA7XG4gICAgICAgIHNwYWNlLnN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XG4gICAgICAgIHNwYWNlLnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdpdGhpbkJvdW5kcyhlbGVtZW50LCBjb250YWluZXIsIGNvb3Jkcykge1xuICAgICAgICBsZXQgbWluWCA9IGNvbnRhaW5lci5vZmZzZXRMZWZ0O1xuICAgICAgICBsZXQgbWF4WCA9IChtaW5YICsgY29udGFpbmVyLmNsaWVudFdpZHRoKSAtIChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKTtcbiAgICAgICAgbGV0IG1pblkgPSBjb250YWluZXIub2Zmc2V0VG9wO1xuICAgICAgICBsZXQgbWF4WSA9IChtaW5ZICsgY29udGFpbmVyLmNsaWVudEhlaWdodCkgLSAoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xuXG4gICAgICAgIHJldHVybiAoY29vcmRzLnggPD0gbWF4WCAmJiBjb29yZHMueCA+PSBtaW5YICYmIGNvb3Jkcy55IDw9IG1heFkgJiYgY29vcmRzLnkgPj0gbWluWSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdpbmRvd01hbmFnZXI7XG5cbiIsIi8qKlxuICogU3RhcnRpbmcgcG9pbnQgZnByIHRoZSBhcHBsaWNhdGlvbi5cbiAqIFRoZSBhcHBsaWNhdGlvbiB3b3VsZCB3b3JrIGJldHRlciB3aGVuIHVzZWQgd2l0aCBIVFRQMlxuICogZHVlIHRvIHRoZSBmYWN0IHRoYXQgaXQgbWFrZXMgdXNlIG9mIHdlYi1jb21wb25lbnRzLFxuICogYnV0IGl0J3MgYmVlbiBidWlsdCB3aXRoIGJyb3dzZXJpZnkgdG8gd29yayBhcyBhXG4gKiBub3JtYWwgSFRUUDEgYXBwbGljYXRpb24gaW4gbGlldSBvZiB0aGlzLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wXG4gKi9cblxuXG4vL3RvIG1ha2Ugd2ViIGNvbXBvbmVudHMgd29yayB3aXRoIGJyb3dzZXJpZnlcbmxldCB3aW5kb3cgPSByZXF1aXJlKCcuL2RyYWdnYWJsZS13aW5kb3cuanMnKTtcbmxldCBtZW51ID0gcmVxdWlyZShcIi4vZXhwYW5kYWJsZS1tZW51LWl0ZW0uanNcIik7XG5sZXQgbWVtb3J5R2FtZSA9IHJlcXVpcmUoJy4vbWVtb3J5LWdhbWUuanMnKTtcbmxldCBtZW1vcnlBcHAgPSByZXF1aXJlKCcuL21lbW9yeS1hcHAuanMnKTtcblxuXG4vL3JlcXVpcmVzXG5sZXQgZGVza3RvcCA9IHJlcXVpcmUoXCIuL2Rlc2t0b3AuanNcIik7XG5cbiIsIi8vcmVxdWlyZXNcbmxldCBXaW5kb3dNYW5hZ2VyID0gcmVxdWlyZShcIi4vV2luZG93TWFuYWdlci5qc1wiKTtcblxuXG4vL25vZGVzXG5sZXQgbWFpbk1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvd1NlbGVjdG9yXCIpO1xubGV0IHdpbmRvd1NwYWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNvcGVuV2luZG93c1wiKTtcbmxldCBzdWJNZW51VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N1Yk1lbnVcIik7XG5cbi8vdmFyaWFibGVzXG5sZXQgV00gPSBXaW5kb3dNYW5hZ2VyKHdpbmRvd1NwYWNlKTtcbmxldCB0b3AgPSAxO1xuXG5BcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG1haW5NZW51LmNoaWxkcmVuLCAobm9kZSkgPT4ge1xuICAgIGFkZFN1Yk1lbnUobm9kZSk7XG59KTtcblxubWFpbk1lbnUuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBsZXQgdHlwZSA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWtpbmRcIikgfHwgZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1raW5kXCIpO1xuICAgIGlmICh0eXBlKSB7XG4gICAgICAgIFdNLmNyZWF0ZVdpbmRvdyh0eXBlKS5mb2N1cygpO1xuICAgIH1cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG5cbmFkZEV2ZW50TGlzdGVuZXJzKG1haW5NZW51LCAnY2xpY2sgZm9jdXNvdXQnLCAoZXZlbnQpID0+IHtcbiAgICBsZXQgbWFpbk1lbnVJdGVtcyA9IG1haW5NZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJ2V4cGFuZGFibGUtbWVudS1pdGVtJyk7XG4gICAgbWFpbk1lbnVJdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGlmICgoaXRlbSAhPT0gZXZlbnQudGFyZ2V0ICYmIGl0ZW0gIT09IGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50KSAmJiAoaXRlbS5kaXNwbGF5aW5nU3ViTWVudSkpIHtcbiAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudShmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbndpbmRvd1NwYWNlLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQudGFyZ2V0LnN0eWxlLnpJbmRleCA9IHRvcDtcbiAgICB0b3AgKz0gMTtcbn0sIHRydWUpO1xuXG5mdW5jdGlvbiBhZGRTdWJNZW51KGl0ZW0pIHtcbiAgICBsZXQgaW5zdGFuY2UgPSBkb2N1bWVudC5pbXBvcnROb2RlKHN1Yk1lbnVUZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBsZXQgbGFiZWwgPSBpdGVtLmdldEF0dHJpYnV0ZSgnbGFiZWwnKTtcblxuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoaW5zdGFuY2UuY2hpbGRyZW4sIChub2RlKSA9PiB7XG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdsYWJlbCcsIGxhYmVsKTtcbiAgICB9KTtcblxuICAgIGl0ZW0uYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuXG4gICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICBjYXNlICdvcGVuJzpcbiAgICAgICAgICAgICAgICBXTS5jcmVhdGVXaW5kb3cobGFiZWwpLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgICAgICAgICAgV00uY2xvc2UobGFiZWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbWluaW1pemUnOlxuICAgICAgICAgICAgICAgIFdNLm1pbmltaXplKGxhYmVsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2V4cGFuZCc6XG4gICAgICAgICAgICAgICAgV00uZXhwYW5kKGxhYmVsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMgKGVsZW1lbnQsIGV2ZW50cywgaGFuZGxlcikge1xuICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSk7XG59XG4iLCIvKlxuKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGRyYWdnYWJsZS13aW5kb3cgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiogSXQgY3JlYXRlcyBhIHdpbmRvdyB0aGF0IGNhbiBiZSBtb3ZlZCBhY3Jvc3MgdGhlIHNjcmVlbiwgY2xvc2VkIGFuZCBtaW5pbWl6ZWQuXG4qIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiogQHZlcnNpb24gMS4wLjBcbipcbiovXG5cblxubGV0IHdpbmRvd1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2RyYWdnYWJsZS13aW5kb3cuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvd1RlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cbmNsYXNzIERyYWdnYWJsZVdpbmRvdyBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBkcmFnZ2FibGUtd2luZG93LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgLy9zZXR1cCBzaGFkb3cgZG9tIHN0eWxlc1xuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIiwgZGVsZWdhdGVzRm9jdXM6IHRydWV9KTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gd2luZG93VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgd2hlbiB3aW5kb3cgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWhhdmlvdXIgb2YgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcblxuICAgICAgICAvL3NldCBiZWhhdmlvdXJcbiAgICAgICAgbWFrZURyYWdnYWJsZSh0aGlzLCB0aGlzLnBhcmVudE5vZGUpO1xuXG4gICAgICAgIC8vYWRkIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5jb21wb3NlZFBhdGgoKVswXTsgLy9mb2xsb3cgdGhlIHRyYWlsIHRocm91Z2ggc2hhZG93IERPTVxuICAgICAgICAgICAgbGV0IGlkID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShcImlkXCIpO1xuICAgICAgICAgICAgaWYgKGlkID09PSBcImNsb3NlXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlkID09PSBcIm1pbmltaXplXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1pbmltaXplZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykgeyAvL21ha2Ugd29yayB3aXRoIHRvdWNoIGV2ZW50c1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMub3BlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCB3aGF0IGF0dHJpYnV0ZS1jaGFuZ2VzIHRvIHdhdGNoIGZvciBpbiB0aGUgRE9NLlxuICAgICAqIEByZXR1cm5zIHtbc3RyaW5nXX0gYW4gYXJyYXkgb2YgdGhlIG5hbWVzIG9mIHRoZSBhdHRyaWJ1dGVzIHRvIHdhdGNoLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4gWydvcGVuJ107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2hlcyBmb3IgYXR0cmlidXRlIGNoYW5nZXMgaW4gdGhlIERPTSBhY2NvcmRpbmcgdG8gb2JzZXJ2ZWRBdHRyaWJ1dGVzKClcbiAgICAgKiBAcGFyYW0gbmFtZSB0aGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICogQHBhcmFtIG9sZFZhbHVlIHRoZSBvbGQgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgdGhlIG5ldyB2YWx1ZVxuICAgICAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wZW4pIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSB3aW5kb3cgaGFzIGF0dHJpYnV0ZSAnb3BlbidcbiAgICAgKi9cbiAgICBnZXQgb3BlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzQXR0cmlidXRlKCdvcGVuJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgJ29wZW4nIGF0dHJpYnV0ZSBvbiB0aGUgd2luZG93LlxuICAgICAqIEBwYXJhbSBvcGVuIHtib29sZWFufSB3aGV0aGVyIHRvIGFkZCBvciByZW1vdmUgdGhlICdvcGVuJyBhdHRyaWJ1dGVcbiAgICAgKi9cbiAgICBzZXQgb3BlbihvcGVuKSB7XG4gICAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnb3BlbicsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdvcGVuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgd2luZG93IGhhcyBhdHRyaWJ1dGUgJ21pbmltaXplZCdcbiAgICAgKi9cbiAgICBnZXQgbWluaW1pemVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNBdHRyaWJ1dGUoJ21pbmltaXplZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlICdtaW5pbWl6ZWQnIGF0dHJpYnV0ZSBvbiB0aGUgd2luZG93LlxuICAgICAqIEBwYXJhbSBtaW5pbWl6ZSB7Ym9vbGVhbn0gd2hldGhlciB0byBhZGQgb3IgcmVtb3ZlIHRoZSAnbWluaW1pemVkJyBhdHRyaWJ1dGVcbiAgICAgKi9cbiAgICBzZXQgbWluaW1pemVkKG1pbmltaXplKSB7XG4gICAgICAgIGlmIChtaW5pbWl6ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ21pbmltaXplZCcsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdtaW5pbWl6ZWQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlcyB0aGUgd2luZG93LiBSZW1vdmVzIGl0IGZyb20gdGhlIERPTSBhbmQgc2V0cyBhbGwgYXR0cmlidXRlcyB0byBmYWxzZS5cbiAgICAgKi9cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgICAgIHRoaXMubWluaW1pemVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG5cbn1cblxuLy9oZWxwZXIgZnVuY3Rpb25cbi8vbWFrZXMgYW4gZWxlbWVudCBkcmFnZ2FibGUgd2l0aCAgbW91c2UsIGFycm93cyBhbmQgdG91Y2hcbmZ1bmN0aW9uIG1ha2VEcmFnZ2FibGUoZWwpIHtcbiAgICBsZXQgYXJyb3dEcmFnO1xuICAgIGxldCBtb3VzZURyYWc7XG4gICAgbGV0IGRyYWdvZmZzZXQgPSB7IC8vdG8gbWFrZSB0aGUgZHJhZyBub3QganVtcCBmcm9tIHRoZSBjb3JuZXJcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBsZXQgZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGVsLCAnZm9jdXNpbiBtb3VzZWRvd24gdG91Y2htb3ZlJywgKChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRhcmdldDtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAndG91Y2htb3ZlJykge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IGV2ZW50LnRhcmdldFRvdWNoZXNbMF07IC8vbWFrZSB3b3JrIHdpdGggdG91Y2ggZXZlbnRcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gZXZlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhcnJvd0RyYWcgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nIHx8IGV2ZW50LnR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG4gICAgICAgICAgICAgICAgbW91c2VEcmFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkcmFnb2Zmc2V0LnggPSB0YXJnZXQucGFnZVggLSBlbC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGRyYWdvZmZzZXQueSA9IHRhcmdldC5wYWdlWSAtIGVsLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhlbCwgJ2ZvY3Vzb3V0IG1vdXNldXAnLCAoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZXVwJykge1xuICAgICAgICAgICAgICAgIGlmIChtb3VzZURyYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgbW91c2VEcmFnID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcnJvd0RyYWcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhkb2N1bWVudCwgJ21vdXNlbW92ZSBrZXlkb3duIHRvdWNobW92ZScsICgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHt9OyAvL2FzIHRvIG5vdCBrZWVwIHBvbGxpbmcgdGhlIERPTVxuXG4gICAgICAgICAgICBpZiAobW91c2VEcmFnKSB7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9IChldmVudC5wYWdlWSAtIGRyYWdvZmZzZXQueSk7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9IChldmVudC5wYWdlWCAtIGRyYWdvZmZzZXQueCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFycm93RHJhZykge1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSBwYXJzZUludChlbC5zdHlsZS50b3Auc2xpY2UoMCwgLTIpKTtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gcGFyc2VJbnQoZWwuc3R5bGUubGVmdC5zbGljZSgwLCAtMikpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55IC09IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd0xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCAtPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCArPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobW91c2VEcmFnIHx8IGFycm93RHJhZykge1xuICAgICAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBkZXN0aW5hdGlvbi54ICArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBkZXN0aW5hdGlvbi55ICArIFwicHhcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgfTtcblxuICAgIGV2ZW50cygpO1xufVxuXG4vL2hlbHBlciBmdW5jdGlvblxuLy9hZGRzIG11bHRpcGxlIGV2ZW50IGxpc3RlbmVycyB3aXRoIGlkZW50aWNhbCBoYW5kbGVyc1xuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cblxuLy9kZWZpbmVzIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2RyYWdnYWJsZS13aW5kb3cnLCBEcmFnZ2FibGVXaW5kb3cpO1xuIiwiLypcbiAqIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgZXhwYW5kYWJsZS1tZW51LWl0ZW0gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiAqIEl0IGNyZWF0ZXMgYW4gaXRlbSB0aGF0IHdoZW4gY2xpY2tlZCB0b2dnbGVzIHRvIHNob3cgb3IgaGlkZSBzdWItaXRlbXMuXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICpcbiAqL1xuXG5sZXQgbWVudVRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2V4cGFuZGFibGUtbWVudS1pdGVtLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNtZW51SXRlbVRlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cblxuY2xhc3MgRXhwYW5kYWJsZU1lbnVJdGVtIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIGRyYWdnYWJsZS13aW5kb3csIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvL3NldCB1cCBzaGFkb3cgZG9tIHN0eWxlc1xuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIiwgZGVsZWdhdGVzRm9jdXM6IFwidHJ1ZVwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IG1lbnVUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gd2luZG93IGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAgICAgKiBTZXRzIHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVoYXZpb3VyIG9mIHRoZSBpdGVtLlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBtYWtlRXhwYW5kYWJsZSh0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7W25vZGVdfSBhbiBhcnJheSBvZiB0aGUgc3ViaXRlbXMgdGhlIGl0ZW0gaGFzIGFzc2lnbmVkIGluIHRoZSBET00uXG4gICAgICogQSBzdWJpdGVtIGNvdW50cyBhcyBhbiBpdGVtIHRoYXQgaGFzIHRoZSBzbG90IG9mICdzdWJpdGVtJyBhbmQgdGhlIHNhbWUgbGFiZWxcbiAgICAgKiBhcyB0aGUgZXhwYW5kYWJsZSBtZW51IGl0ZW0gaXRzZWxmLlxuICAgICAqL1xuICAgIGdldCBzdWJNZW51KCkge1xuICAgICAgICBsZXQgbGFiZWwgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbGFiZWwnKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbCh0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tzbG90PVwic3ViaXRlbVwiXScpLCAobm9kZSkgPT4ge1xuICAgICAgICAgICAgbGV0IG5vZGVMYWJlbCA9IG5vZGUuZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGVMYWJlbCA9PT0gbGFiZWw7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBkaXNwbGF5aW5nIHRoZSBzdWJtZW51LWl0ZW1zLlxuICAgICAqL1xuICAgIGdldCBkaXNwbGF5aW5nU3ViTWVudSgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLnN1Yk1lbnVbMF0uaGFzQXR0cmlidXRlKCdoaWRlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2hvd3Mgb3IgaGlkZXMgdGhlIHN1Ym1lbnUtaXRlbXMuXG4gICAgICogQHBhcmFtIHNob3cge2Jvb2xlYW59IHdoZXRoZXIgdG8gc2hvdyBvciBoaWRlLlxuICAgICAqL1xuICAgIHRvZ2dsZVN1Yk1lbnUoc2hvdykge1xuICAgICAgICBpZiAoc2hvdykge1xuICAgICAgICAgICAgdGhpcy5zdWJNZW51LmZvckVhY2goKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgICBwb3N0LnJlbW92ZUF0dHJpYnV0ZSgnaGlkZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN1Yk1lbnUuZm9yRWFjaCgocG9zdCkgPT4ge1xuICAgICAgICAgICAgICAgIHBvc3Quc2V0QXR0cmlidXRlKCdoaWRlJywgJycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH1cblxufVxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZXhwYW5kYWJsZS1tZW51LWl0ZW0nLCBFeHBhbmRhYmxlTWVudUl0ZW0pO1xuXG4vL2hlbHBlciBmdW5jdGlvbiB0byBtYWtlIHRoZSBpdGVtIGV4cGFuZGFibGVcbi8vdGFrZXMgdGhlIGl0ZW0gdG8gZXhwYW5kIGFzIGEgcGFyYW1ldGVyXG5mdW5jdGlvbiBtYWtlRXhwYW5kYWJsZShpdGVtKSB7XG4gICAgbGV0IG5leHRGb2N1cyA9IDA7XG4gICAgbGV0IHNob3cgPSBmYWxzZTtcbiAgICBsZXQgYXJyb3dFeHBhbmQ7XG4gICAgbGV0IG1vdXNlRXhwYW5kO1xuXG4gICAgbGV0IGV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoaXRlbSwgJ2ZvY3VzaW4gY2xpY2snLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgYXJyb3dFeHBhbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vdXNlRXhwYW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2hvdyA9ICFzaG93O1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUoc2hvdyk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHRydWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGl0ZW0sICdrZXlkb3duJywgKChldmVudCkgPT4geyAvL21ha2UgdGhlIHN1Yi1pdGVtcyB0cmF2ZXJzYWJsZSBieSBwcmVzc2luZyB0aGUgYXJyb3cga2V5c1xuICAgICAgICAgICAgICAgIGlmIChhcnJvd0V4cGFuZCkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dSaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdGVtLmRpc3BsYXlpbmdTdWJNZW51KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEZvY3VzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRGb2N1cyA8IDAgfHwgbmV4dEZvY3VzID49IGl0ZW0uc3ViTWVudS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEZvY3VzID0gaXRlbS5zdWJNZW51Lmxlbmd0aCAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5zdWJNZW51W25leHRGb2N1c10uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2N1cyhpdGVtLCBpdGVtLnN1Yk1lbnVbbmV4dEZvY3VzXSk7IC8vbWFrZSBpdCBhY2Nlc3NpYmxlIHZpYSBjc3MgdmlzdWFsIGNsdWVzIGV2ZW4gaWYgdGhlIGFjdGl2ZSBlbGVtZW50IGlzIGhpZGRlbiB3aXRoaW4gc2hhZG93RE9NXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXRlbS5kaXNwbGF5aW5nU3ViTWVudSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRGb2N1cyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0Rm9jdXMgPj0gaXRlbS5zdWJNZW51Lmxlbmd0aCB8fCBuZXh0Rm9jdXMgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRGb2N1cyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uc3ViTWVudVtuZXh0Rm9jdXNdLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXMoaXRlbSwgaXRlbS5zdWJNZW51W25leHRGb2N1c10pOyAvL21ha2UgaXQgYWNjZXNzaWJsZSB2aWEgY3NzIHZpc3VhbCBjbHVlcyBldmVuIGlmIHRoZSBhY3RpdmUgZWxlbWVudCBpcyBoaWRkZW4gd2l0aGluIHNoYWRvd0RPTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgZXZlbnRzKCk7XG59XG5cbi8vaGVscGVyIGZ1bmN0aW9uXG4vL2FkZHMgbXVsdGlwbGUgZXZlbnQgbGlzdGVuZXJzIHdpdGggaWRlbnRpY2FsIGhhbmRsZXJzXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyhlbGVtZW50LCBldmVudHMsIGhhbmRsZXIpIHtcbiAgICBldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGV2ZW50ID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcikpO1xufVxuXG4vLyBBZGRzIGEgJ2ZvY3VzZWQnIGF0dHJpYnV0ZSB0byB0aGUgZGVzaXJlZCBzdWJpdGVtIGFuZFxuLy8gcmVtb3ZlcyBpdCBmcm9tIG90aGVyIHN1YiBpdGVtcyB0byBoZWxwXG4vLyB3aXRoIGFjY2Vzc2liaWxpdHkgYW5kIHNoYWRvdyBET20gc3R5bGluZy5cbmZ1bmN0aW9uIGZvY3VzKGl0ZW0sIGVsZW1lbnQpIHtcbiAgICBsZXQgc3VicyA9IGl0ZW0uc3ViTWVudTtcbiAgICBzdWJzLmZvckVhY2goKHN1YikgPT4ge1xuICAgICAgICBpZiAoc3ViID09PSBlbGVtZW50KSB7XG4gICAgICAgICAgICBzdWIuc2V0QXR0cmlidXRlKCdmb2N1c2VkJywgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3ViLnJlbW92ZUF0dHJpYnV0ZSgnZm9jdXNlZCcpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCJsZXQgbWVtb3J5V2luZG93VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5V2luZG93VGVtcGxhdGVcIik7XG5sZXQgaGlnaHNjb3Jlc1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2hpZ2hzY29yZXNUZW1wbGF0ZVwiKTtcblxuY2xhc3MgTWVtb3J5QXBwIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IG1lbW9yeVdpbmRvd1RlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgbGV0IGdhbWUgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnBhdGhbMF07XG4gICAgICAgICAgICBpZiAodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJykpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3Jlc3RhcnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ21lbW9yeS1nYW1lJykucmVwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbmV3JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdtZW1vcnktZ2FtZScpLnJlc3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdxdWl0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdoaWdoc2NvcmVzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlIaWdoc2NvcmVzKGdhbWUucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LmdldEF0dHJpYnV0ZSgnYm9hcmRzaXplJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVzZXIgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2ludHJvIGlucHV0JykudmFsdWUgfHwgJ3N0cmFuZ2VyJztcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2JvYXJkc2l6ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzQ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUud2lkdGggPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5oZWlnaHQgPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5kcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc0Mic6XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLndpZHRoID0gNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuaGVpZ2h0ID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnMjQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS53aWR0aCA9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmhlaWdodCA9IDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIGRpc3BsYXlIaWdoc2NvcmVzKHJlc3VsdCkge1xuICAgICAgICBsZXQgaGlnaHNjb3JlcyA9IHtcbiAgICAgICAgICAgIHN0b3JhZ2U6IGxvY2FsU3RvcmFnZSxcbiAgICAgICAgICAgIHNjb3JlczogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZXRyaWV2ZXMgaGlnaHNjb3JlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSBoaWdoc2NvcmUtbGlzdCwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBubyBoaWdoc2NvcmVzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdldEhpZ2hTY29yZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdG9yYWdlLm1lbW9yeUhpZ2hTY29yZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29yZXMgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zY29yZXM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBzZXRzIGhpZ2hzY29yZXMgaW4gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICogQHBhcmFtIHVzZXIge3N0cmluZ30gdGhlIHVzZXJzIG5hbWVcbiAgICAgICAgICAgICAqIEBwYXJhbSBuZXdTY29yZSB7bnVtYmVyfSB0aGUgc2NvcmUgdG8gc2V0XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNldEhpZ2hTY29yZXM6IGZ1bmN0aW9uICh1c2VyLCBuZXdTY29yZSkge1xuICAgICAgICAgICAgICAgIGxldCBvbGRIaWdoU2NvcmVzO1xuICAgICAgICAgICAgICAgIGxldCBuZXdIaWdoU2NvcmVzO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEhpZ2hTY29yZXMgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvbGRIaWdoU2NvcmVzID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2xkSGlnaFNjb3Jlcy5wdXNoKHt1c2VyOiB1c2VyLCBzY29yZTogbmV3U2NvcmV9KTtcblxuICAgICAgICAgICAgICAgIG5ld0hpZ2hTY29yZXMgPSBvbGRIaWdoU2NvcmVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEuc2NvcmUgLSBiLnNjb3JlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKG5ld0hpZ2hTY29yZXMubGVuZ3RoID4gNSkgeyAvL2tlZXAgdGhlIGxpc3QgdG8gNSBzY29yZXNcbiAgICAgICAgICAgICAgICAgICAgbmV3SGlnaFNjb3Jlcy5sZW5ndGggPSA1O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzID0gSlNPTi5zdHJpbmdpZnkobmV3SGlnaFNjb3Jlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgbGV0IHNjb3JlID0gKHJlc3VsdC50dXJucyAqIHJlc3VsdC50aW1lKSAvICh0aGlzLmhlaWdodCAqIHRoaXMud2lkdGgpO1xuICAgICAgICAgICAgaGlnaHNjb3Jlcy5zZXRIaWdoU2NvcmVzKHRoaXMudXNlciwgcmVzdWx0LnR1cm5zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzY29yZXMgPSBoaWdoc2NvcmVzLmdldEhpZ2hTY29yZXMoKTtcbiAgICAgICAgbGV0IGhpZ2hzY29yZURpc3BsYXkgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2hpZ2hzY29yZURpc3BsYXknKTtcbiAgICAgICAgbGV0IG9sZExpc3QgPSBoaWdoc2NvcmVEaXNwbGF5LnF1ZXJ5U2VsZWN0b3IoJ3VsJyk7XG4gICAgICAgIGxldCBsaXN0ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShoaWdoc2NvcmVzVGVtcGxhdGUuY29udGVudC5xdWVyeVNlbGVjdG9yKFwidWxcIiksIHRydWUpO1xuICAgICAgICBsZXQgZW50cnk7XG5cbiAgICAgICAgaWYgKHNjb3Jlcykge1xuICAgICAgICAgICAgc2NvcmVzLmZvckVhY2goKHNjb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgZW50cnkgPSBkb2N1bWVudC5pbXBvcnROb2RlKChsaXN0LnF1ZXJ5U2VsZWN0b3IoXCJsaVwiKSkpO1xuICAgICAgICAgICAgICAgIGVudHJ5LnRleHRDb250ZW50ID0gc2NvcmUudXNlciArIFwiOiBcIiArIHNjb3JlLnNjb3JlO1xuICAgICAgICAgICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQoZW50cnkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbnRyeSA9IGRvY3VtZW50LmltcG9ydE5vZGUoKGxpc3QucXVlcnlTZWxlY3RvcihcImxpXCIpKSk7XG4gICAgICAgICAgICBlbnRyeS50ZXh0Q29udGVudCA9IFwiLVwiO1xuICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChlbnRyeSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9sZExpc3QpIHsgLy9pZiBzY29yZXMgaGF2ZSBhbHJlYWR5IGJlZW4gZGlzcGxheWVkLCByZXBsYWNlIHRoZW1cbiAgICAgICAgICAgIGhpZ2hzY29yZURpc3BsYXkuYXBwZW5kQ2hpbGQobGlzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaWdoc2NvcmVEaXNwbGF5LnJlcGxhY2VDaGlsZChsaXN0LCBvbGRMaXN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLmNsb3NlKCk7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG5cbn1cblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdtZW1vcnktYXBwJywgTWVtb3J5QXBwKTtcbiIsIi8qXG4gKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IG1lbW9yeS1nYW1lIHRvIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjcmVhdGVzIGEgbWVtb3J5IGdhbWUgd2l0aCBhIHRpbWVyIGEgYSB0dXJuLWNvdW50ZXIuIFRoZSBnYW1lIGlzIG92ZXIgd2hlblxuICogYWxsIGJyaWNrcyBoYXZlIGJlZW4gcGFpcmVkIGFuZCBzdG9yZXMgdGhlIHRvdGFsIHRpbWUgYW5kIHR1cm5zIGluIGEgcmVzdWx0LXZhcmlhYmxlLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxubGV0IG1lbW9yeVRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWdhbWUuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeVRlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5sZXQgYnJpY2tUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1nYW1lLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNicmlja1RlbXBsYXRlXCIpOyAvL2JyaWNrIHRlbXBsYXRlXG5cbi8vcmVxdWlyZXNcbmxldCBUaW1lciA9IHJlcXVpcmUoJy4vdGltZXIuanMnKTtcblxuXG5jbGFzcyBNZW1vcnlHYW1lIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIG1lbW9yeSBnYW1lLCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8vc2V0dXAgc2hhZG93IGRvbSBzdHlsZXNcbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCJ9KTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gbWVtb3J5VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuXG4gICAgICAgIC8vc2V0IHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlc1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnZGF0YS13aWR0aCcsIHdpZHRoIHx8IHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLXdpZHRoJykgfHwgNCk7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcsIGhlaWdodCB8fCB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS1oZWlnaHQnKSAgfHwgNCk7XG5cbiAgICAgICAgLy9zZXQgcmVmZXJlbmNlc1xuICAgICAgICB0aGlzLnNldCA9IFtdO1xuICAgICAgICB0aGlzLnRpbWVyID0gbmV3IFRpbWVyKDApO1xuICAgICAgICB0aGlzLmdhbWVQbGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnRpbWVzcGFuID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjdGltZXNwYW5cIik7XG4gICAgICAgIHRoaXMudHVybnNwYW4gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiN0dXJuc3BhblwiKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgd2hlbiBtZW1vcnkgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIGFuZCByZW5kZXJzIGEgYm9hcmQgd2l0aCBicmlja3MuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjb3V0cm8gYnV0dG9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzdGFydCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2ludHJvIGJ1dHRvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXkoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIHdpZHRoIG9mIHRoZSBib2FyZCBpbiBicmlja3NcbiAgICAgKi9cbiAgICBnZXQgd2lkdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS13aWR0aCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHdpZHRoIG9mIHRoZSBib2FyZCBpbiBicmlja3MuXG4gICAgICogQHBhcmFtIG5ld1ZhbCB7c3RyaW5nfSB0aGUgbmV3IHdpZHRoIG9mIHRoZSBib2FyZCBpbiBicmlja3NcbiAgICAgKi9cbiAgICBzZXQgd2lkdGgobmV3VmFsKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkYXRhLXdpZHRoJywgbmV3VmFsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgaGVpZ2h0IG9mIHRoZSBib2FyZCBpbiBicmlja3NcbiAgICAgKi9cbiAgICBnZXQgaGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0Jyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgaGVpZ2h0IG9mIHRoZSBib2FyZCBpbiBicmlja3MuXG4gICAgICogQHBhcmFtIG5ld1ZhbCB7c3RyaW5nfSB0aGUgbmV3IGhlaWdodCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzXG4gICAgICovXG4gICAgc2V0IGhlaWdodChuZXdWYWwpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0JywgbmV3VmFsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaHVmZmxlcyB0aGUgYnJpY2tzIHVzaW5nIEZpc2hlci1ZYXRlcyBhbGdvcml0aG0uXG4gICAgICovXG4gICAgc2h1ZmZsZSgpIHtcbiAgICAgICAgbGV0IHRoZVNldCA9IHRoaXMuc2V0O1xuICAgICAgICBmb3IgKGxldCBpID0gKHRoZVNldC5sZW5ndGggLSAxKTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgbGV0IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKTtcbiAgICAgICAgICAgIGxldCBpT2xkID0gdGhlU2V0W2ldO1xuICAgICAgICAgICAgdGhlU2V0W2ldID0gdGhlU2V0W2pdO1xuICAgICAgICAgICAgdGhlU2V0W2pdID0gaU9sZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCA9IHRoZVNldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBicmlja3MgdG8gdGhlIGJvYXJkIGFuZCByZW5kZXJzIHRoZW0gaW4gdGhlIERPTS5cbiAgICAgKi9cbiAgICBkcmF3KCkge1xuICAgICAgICBsZXQgYnJpY2s7XG4gICAgICAgIGxldCBtYXRjaDtcbiAgICAgICAgbGV0IHBhaXJzID0gTWF0aC5yb3VuZCgodGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0KSkgLyAyO1xuICAgICAgICB0aGlzLnNldCA9IFtdO1xuICAgICAgICBsZXQgb2xkQnJpY2tzID0gdGhpcy5jaGlsZHJlbjtcblxuICAgICAgICAvL3JlbW92ZSBvbGQgYnJpY2tzIGlmIGFueVxuICAgICAgICBmb3IgKGxldCBpID0gb2xkQnJpY2tzLmxlbmd0aCAtMTsgaSA+PSAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgIGxldCBicmljayA9IG9sZEJyaWNrc1tpXTtcbiAgICAgICAgICAgIGlmIChicmljay5nZXRBdHRyaWJ1dGUoJ3Nsb3QnKSA9PT0gJ2JyaWNrJykge1xuICAgICAgICAgICAgICAgIGJyaWNrLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYnJpY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9pbml0aWF0ZSBicmlja3NcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gcGFpcnM7IGkgKz0gMSkge1xuICAgICAgICAgICAgYnJpY2sgPSBuZXcgQnJpY2soaSk7XG4gICAgICAgICAgICB0aGlzLnNldC5wdXNoKGJyaWNrKTtcbiAgICAgICAgICAgIG1hdGNoID0gYnJpY2suY2xvbmUoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0LnB1c2gobWF0Y2gpO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0aGVTZXQgPSB0aGlzLnNldDtcblxuICAgICAgICAvL3B1dCB0aGVtIGluIHRoZSBkb21cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGVTZXQubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGxldCBicmlja0RpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUoYnJpY2tUZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgICAgIGxldCBpbWcgPSBicmlja0Rpdi5xdWVyeVNlbGVjdG9yKFwiaW1nXCIpO1xuICAgICAgICAgICAgbGV0IGJyaWNrID0gdGhlU2V0W2ldO1xuICAgICAgICAgICAgaW1nLnNyYyA9ICcvaW1hZ2UvbWVtb3J5LWJyaWNrLScgKyBicmljay5kcmF3KCkgKyAnLnBuZyc7XG4gICAgICAgICAgICBpbWcuc2V0QXR0cmlidXRlKFwiYnJpY2tOdW1iZXJcIiwgaSk7XG4gICAgICAgICAgICB0aGlzLmFwcGVuZENoaWxkKGJyaWNrRGl2KTtcblxuICAgICAgICAgICAgaWYgKChpICsgMSkgJSB0aGlzLndpZHRoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJyXCIpO1xuICAgICAgICAgICAgICAgIGJyLnNldEF0dHJpYnV0ZSgnc2xvdCcsICdicmljaycpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kQ2hpbGQoYnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnRzIGEgZ2FtZSwgcGxheXMgaXQgdGhyb3VnaCwgc2F2ZXMgdGhlIHJlc3VsdCBhbmRcbiAgICAgKiB0aGVuIGRpc3BsYXlzIHRoZSBvdXRyby5cbiAgICAgKi9cbiAgICBwbGF5KCkge1xuICAgICAgICB0aGlzLnNodWZmbGUoKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjaW50cm9cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNtYWluXCIpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cm9cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnRpbWVyLnN0YXJ0KDApO1xuICAgICAgICB0aGlzLnRpbWVyLmRpc3BsYXkodGhpcy50aW1lc3Bhbik7XG4gICAgICAgIHBsYXlHYW1lKHRoaXMuc2V0LCB0aGlzKVxuICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aW1lID0gdGhpcy50aW1lci5zdG9wKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjaW50cm9cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI21haW5cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI291dHJvXCIpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc3RhcnRzIHRoZSBnYW1lIHdpdGggdGhlIHNhbWUgc2l6ZSBvZiBib2FyZCB3aXRob3V0IHJlLXJlbmRlcmluZ1xuICAgICAqL1xuICAgIHJlcGxheSgpIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI21haW5cIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMucGxheSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB0aGUgZ2FtZSBhbmQgdGhlbiBsZXRzIHRoZSB1c2VyIGNob29zZSBhIG5ldyBnYW1lIHNpemUgYW5kXG4gICAgICogdXNlciBuYW1lLCByZS1yZW5kZXJpbmcgdGhlIGJvYXJkLlxuICAgICAqL1xuICAgIHJlc3RhcnQoKSB7XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjaW50cm9cIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNtYWluXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cm9cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB0aGUgZ2FtZSB0byBtYWtlIGl0IHBsYXlhYmxlIGFnYWluLiBSZW1vdmVzIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqIGFuZCB0dXJucyB0aGUgYnJpY2tzIG92ZXIuXG4gICAgICovXG4gICAgcmVzZXQoKSB7XG4gICAgICAgIGxldCBicmlja3MgPSB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tzbG90PVwiYnJpY2tcIl0nKTtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChicmlja3MsIChicmljaykgPT4ge1xuICAgICAgICAgICAgYnJpY2suY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgbGV0IGltZyA9IGJyaWNrLnF1ZXJ5U2VsZWN0b3IoXCJpbWdcIik7XG4gICAgICAgICAgICBpZiAoaW1nKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJyaWNrTnVtYmVyID0gaW1nLmdldEF0dHJpYnV0ZShcImJyaWNrTnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldFticmlja051bWJlcl0uZHJhdygpICE9PSAwKSB7IC8vdHVybiB0aGUgYnJpY2sgb3ZlciBpZiBpdCdzIG5vdCB0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgaW1nLnNyYyA9ICcvaW1hZ2UvbWVtb3J5LWJyaWNrLScgKyB0aGlzLnNldFticmlja051bWJlcl0udHVybigpICsgJy5wbmcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGltZXNwYW4udGV4dENvbnRlbnQgPSAnJztcbiAgICAgICAgdGhpcy50dXJuc3Bhbi50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgICB0aGlzLnRpbWVyLnN0b3AoKTsgLy9tYWtlIHN1cmUgdGltZXIgaXMgc3RvcHBlZFxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2JvYXJkJykucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZ2FtZVBsYXkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuZHMgdGhlIGdhbWUgYW5kIGRpc3BsYXlzIHRoZSBvdXRyby5cbiAgICAgKi9cbiAgICBlbmQoKSB7XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjaW50cm9cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNtYWluXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cm9cIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgIH1cbn1cblxuLy9kZWZpbmVzIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ21lbW9yeS1nYW1lJywgTWVtb3J5R2FtZSk7XG5cblxuLyoqXG4gKiBBIGNsYXNzIEJyaWNrIHRvIGdvIHdpdGggdGhlIG1lbW9yeSBnYW1lLlxuICovXG5jbGFzcyBCcmljayB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIHRoZSBCcmljayB3aXRoIGEgdmFsdWUgYW5kIHBsYWNlcyBpdCBmYWNlZG93bi5cbiAgICAgKiBAcGFyYW0gbnVtYmVyIHtudW1iZXJ9IHRoZSB2YWx1ZSB0byBpbml0aWF0ZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihudW1iZXIpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IG51bWJlcjtcbiAgICAgICAgdGhpcy5mYWNlZG93biA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHVybnMgdGhlIGJyaWNrIGFuZCByZXR1cm5zIHRoZSB2YWx1ZSBhZnRlciB0aGUgdHVybi5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgdmFsdWUgb2YgdGhlIGJyaWNrIGlmIGl0J3MgZmFjZXVwLCBvdGhlcndpc2UgMC5cbiAgICAgKi9cbiAgICB0dXJuKCkge1xuICAgICAgICB0aGlzLmZhY2Vkb3duID0gISh0aGlzLmZhY2Vkb3duKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhdygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byBicmlja3MuXG4gICAgICogQHBhcmFtIG90aGVyIHtCcmlja30gdGhlIEJyaWNrIHRvIGNvbXBhcmUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGJyaWNrcyB2YWx1ZXMgYXJlIGVxdWFsLlxuICAgICAqL1xuICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICByZXR1cm4gKG90aGVyIGluc3RhbmNlb2YgQnJpY2spICYmICh0aGlzLnZhbHVlID09PSBvdGhlci52YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvbmVzIHRoZSBicmljay5cbiAgICAgKiBAcmV0dXJucyB7QnJpY2t9IHRoZSBjbG9uZS5cbiAgICAgKi9cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCcmljayh0aGlzLnZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgYnJpY2sncyB2YWx1ZSwgb3IgMCBpZiBpdCBpcyBmYWNlIGRvd24uXG4gICAgICovXG4gICAgZHJhdygpIHtcbiAgICAgICAgaWYgKHRoaXMuZmFjZWRvd24pIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHNldHMgdXAgdGhlIGdhbWVwbGF5LiBBZGRzIGFuZCByZW1vdmVzIGV2ZW50LWxpc3RlbmVycyBzbyB0aGF0IHRoZSBzYW1lIGdhbWUgY2FuIGJlIHJlc2V0LlxuICogQHBhcmFtIHNldCBbe0JyaWNrXX0gdGhlIHNldCBvZiBicmlja3MgdG8gcGxheSB3aXRoLlxuICogQHBhcmFtIGdhbWUge25vZGV9IHRoZSBzcGFjZSB0byBwbGF5XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgcmVzdWx0IG9mIHRoZSBnYW1lIHdoZW4gdGhlIGdhbWUgaGFzIGJlZW4gcGxheWVkLlxuICovXG5mdW5jdGlvbiBwbGF5R2FtZShzZXQsIGdhbWUpIHtcbiAgICBsZXQgdHVybnMgPSAwO1xuICAgIGxldCBicmlja3MgPSBwYXJzZUludChnYW1lLndpZHRoKSAqIHBhcnNlSW50KGdhbWUuaGVpZ2h0KTtcbiAgICBsZXQgYm9hcmQgPSBnYW1lLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2JvYXJkJyk7XG4gICAgbGV0IGJyaWNrc0xlZnQgPSBicmlja3M7XG4gICAgbGV0IGNob2ljZTE7XG4gICAgbGV0IGNob2ljZTI7XG4gICAgbGV0IGltZzE7XG4gICAgbGV0IGltZzI7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBnYW1lLmdhbWVQbGF5ID0gZnVuY3Rpb24oZXZlbnQpIHsgLy9leHBvc2UgdGhlIHJlZmVyZW5jZSBzbyB0aGUgZXZlbnQgbGlzdGVuZXIgY2FuIGJlIHJlbW92ZWQgZnJvbSBvdXRzaWRlIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgaWYgKCFjaG9pY2UyKSB7IC8vaWYgdHdvIGJyaWNrcyBhcmUgbm90IHR1cm5lZFxuICAgICAgICAgICAgICAgIGxldCBpbWcgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcihcImltZ1wiKSB8fCBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgbGV0IGJyaWNrTnVtYmVyID0gaW1nLmdldEF0dHJpYnV0ZShcImJyaWNrTnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIGlmICghYnJpY2tOdW1iZXIpIHsgLy90YXJnZXQgaXMgbm90IGEgYnJpY2tcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBicmljayA9IHNldFticmlja051bWJlcl07XG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9ICcvaW1hZ2UvJyArIGJyaWNrLnR1cm4oKSArICcucG5nJztcblxuICAgICAgICAgICAgICAgIGlmICghY2hvaWNlMSkgeyAvL2ZpcnN0IGJyaWNrIHRvIGJlIHR1cm5lZFxuICAgICAgICAgICAgICAgICAgICBpbWcxID0gaW1nO1xuICAgICAgICAgICAgICAgICAgICBjaG9pY2UxID0gYnJpY2s7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy9zZWNvbmQgYnJpY2sgdG8gYmUgdHVybmVkXG4gICAgICAgICAgICAgICAgICAgIGltZzIgPSBpbWc7XG4gICAgICAgICAgICAgICAgICAgIGNob2ljZTIgPSBicmljaztcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hvaWNlMS5lcXVhbHMoY2hvaWNlMikgJiYgaW1nMS5nZXRBdHRyaWJ1dGUoJ2JyaWNrTnVtYmVyJykgIT09IGltZzIuZ2V0QXR0cmlidXRlKCdicmlja051bWJlcicpKSB7IC8vdGhlIHR3byBicmlja3MgYXJlIGVxdWFsIGJ1dCBub3QgdGhlIHNhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzEucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nMi5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nMSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyaWNrc0xlZnQgLT0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChicmlja3NMZWZ0ID09PSAwKSB7IC8vYWxsIGJyaWNrcyBhcmUgdHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7dHVybnM6IHR1cm5zfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vYnJpY2tzIGFyZSBub3QgdGhlIHNhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZzEuc3JjID0gJy9pbWFnZS8nICsgY2hvaWNlMS50dXJuKCkgKyAnLnBuZyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nMi5zcmMgPSAnL2ltYWdlLycgKyBjaG9pY2UyLnR1cm4oKSArICcucG5nJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdHVybnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgZ2FtZS50dXJuc3Bhbi50ZXh0Q29udGVudCA9IHR1cm5zO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnYW1lLmdhbWVQbGF5KTtcblxuICAgIH0pO1xuXG59XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgVGltZXIuXG4gKlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqL1xuXG5jbGFzcyBUaW1lciB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIGEgVGltZXIuXG4gICAgICogQHBhcmFtIHN0YXJ0VGltZSB7bnVtYmVyfSB3aGVyZSB0byBzdGFydCBjb3VudGluZy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzdGFydFRpbWUgPSAwKSB7XG4gICAgICAgIHRoaXMuY291bnQgPSBzdGFydFRpbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge251bWJlcn0gdGhlIGNvdW50XG4gICAgICovXG4gICAgZ2V0IHRpbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHRpbWUgb24gdGhlIHRpbWVyLlxuICAgICAqIEBwYXJhbSBuZXdUaW1lIHtudW1iZXJ9IHRoZSBuZXcgdGltZVxuICAgICAqL1xuICAgIHNldCB0aW1lKG5ld1RpbWUpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IG5ld1RpbWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHN0YXJ0cyB0aGUgdGltZXIuIGluY3JlbWVudHMgdGltZSBldmVyeSAxMDAgbWlsbGlzZWNvbmRzLlxuICAgICAqIEBwYXJhbSB0aW1lIHtudW1iZXJ9IHdoYXQgbnVtYmVyIHRvIHN0YXJ0IGl0IG9uLlxuICAgICAqL1xuICAgIHN0YXJ0KHRpbWUgPSB0aGlzLnRpbWUpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IHRpbWU7XG4gICAgICAgIHRoaXMudGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvdW50ICs9IDEwMDtcbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc3RhcnRzIHRoZSB0aW1lci4gZGVjcmVtZW50cyB0aW1lIGV2ZXJ5IDEwMCBtaWxsaXNlY29uZHMuXG4gICAgICogQHBhcmFtIHRpbWUge251bWJlcn0gd2hhdCBudW1iZXIgdG8gc3RhcnQgaXQgb24uXG4gICAgICovXG4gICAgY291bnRkb3duKHRpbWUpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IHRpbWUgfHwgdGhpcy5jb3VudDtcbiAgICAgICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY291bnQgLT0gMTAwO1xuICAgICAgICB9LCAxMDApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBzdG9wcyB0aGUgVGltZXIuXG4gICAgICogQHJldHVybnMgdGhlIGNvdW50LlxuICAgICAqL1xuICAgIHN0b3AoKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5kaXNwbGF5SW50ZXJ2YWwpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3VudDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgYSByb3VuZGVkIHZhbHVlIG9mIHRoZSBjb3VudCBvZiB0aGUgdGltZXJcbiAgICAgKiB0byB0aGUgZGVzaXJlZCBwcmVjaXNpb24sIGF0IGFuIGludGVydmFsLlxuICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbiB7bm9kZX0gd2hlcmUgdG8gbWFrZSB0aGUgZGlzcGxheVxuICAgICAqIEBwYXJhbSBpbnRlcnZhbCB7bnVtYmVyfSB0aGUgaW50ZXJ2YWwgdG8gbWFrZSB0aGUgZGlzcGxheSBpbiwgaW4gbWlsbGlzZWNvbmRzXG4gICAgICogQHBhcmFtIHByZWNpc2lvbiB7bnVtYmVyfXRoZSBudW1iZXIgdG8gZGl2aWRlIHRoZSBkaXNwbGF5ZWQgbWlsbGlzZWNvbmRzIGJ5XG4gICAgICogQHJldHVybnMgdGhlIGludGVydmFsLlxuICAgICAqXG4gICAgICovXG4gICAgZGlzcGxheShkZXN0aW5hdGlvbiwgaW50ZXJ2YWwgPSAxMDAsIHByZWNpc2lvbiA9IDEwMDApIHtcbiAgICAgICAgdGhpcy5kaXNwbGF5SW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCggKCk9PiB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi50ZXh0Q29udGVudCA9IE1hdGgucm91bmQodGhpcy5jb3VudCAvIHByZWNpc2lvbik7XG4gICAgICAgIH0sIGludGVydmFsKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheUludGVydmFsO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcbiJdfQ==
