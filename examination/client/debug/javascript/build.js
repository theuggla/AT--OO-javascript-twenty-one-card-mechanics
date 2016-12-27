(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
*
*/


function makeDraggable(el, container) {
    let arrowDrag;
    let mouseDrag;
    let dragoffset = {
        x: 0,
        y: 0
    };

    let events = function() {
        addEventListeners(el, 'focusin mousedown', (function(event) {
            arrowDrag = true;
            if (event.type === 'mousedown') {
                mouseDrag = true;
                dragoffset.x = event.pageX - el.offsetLeft;
                dragoffset.y = event.pageY - el.offsetTop;
            }
        }));
        addEventListeners(el, 'focusout mouseup', (function() {
            if (event.type === 'mouseup') {
                if (mouseDrag) {
                    mouseDrag = false;
                }
            } else {
                arrowDrag = false;
            }
        }));
        addEventListeners(document, 'mousemove keydown', ((event) => {
            let destination = {};

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
                el.style.left = withinBounds(el, container, destination) ? destination.x  + "px" : el.style.left;
                el.style.top = withinBounds(el, container, destination) ? destination.y  + "px" : el.style.top + "px";
            }

        }));
    };

    el.style.position = "absolute";
    events();
}

function addEventListeners(element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}

function withinBounds(element, container, coords) {
    let minX = container.offsetLeft;
    let maxX = (minX + container.clientWidth) - element.getBoundingClientRect().width;
    let minY = container.offsetTop;
    let maxY = (minY + container.clientHeight) - element.getBoundingClientRect().height;

    return (coords.x <= maxX && coords.x >= minX && coords.y <= maxY && coords.y >= minY);
}

//exports
module.exports = {
    makeDraggable: makeDraggable,
    addEventListeners: addEventListeners,
    withinBounds: withinBounds
};

},{}],2:[function(require,module,exports){
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


},{}],3:[function(require,module,exports){
//to make web components work with browserify
let window = require('./draggable-window.js');
let menu = require("./expandable-menu-item.js");
let memoryGame = require('./memory-game.js');
let memoryApp = require('./memory-app.js');


//requires
let desktop = require("./desktop.js");


document.addEventListener('keydown', (event) => {
    console.log(document.activeElement.shadowRoot.activeElement);
});

},{"./desktop.js":4,"./draggable-window.js":5,"./expandable-menu-item.js":6,"./memory-app.js":7,"./memory-game.js":9}],4:[function(require,module,exports){
//requires
let u = require("./HTMLUtil.js");
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
            debugger;
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

},{"./HTMLUtil.js":1,"./WindowManager.js":2}],5:[function(require,module,exports){
let windowTemplate = document.querySelector('link[href="/draggable-window.html"]').import.querySelector("#windowTemplate");

class DraggableWindow extends HTMLElement {
    constructor(type) {
        super();

        //setup shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open", delegatesFocus: true});
        let instance = windowTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
    }

    connectedCallback() {

        //set behaviour
        makeDraggable(this, this.parentNode);

        //add event listeners
        this.addEventListener("click", (event) => {
            let target = event.composedPath()[0];
            let id = target.getAttribute("id");
            if (id === "close") {
                debugger;
                this.close();
            } else if (id === "minimize") {
                this.minimized = true;
            }
            if (event.type === 'click') {
                event.preventDefault();
            }
        });

        this.open = true;
    }

    get open() {
        return this.hasAttribute('open');
    }

    set open(open) {
        if (open) {
            this.setAttribute('open', '');
        } else {
            this.removeAttribute('open');
        }
    }

    get minimized() {
        return this.hasAttribute('minimized');
    }

    set minimized(minimize) {
        if (minimize) {
            this.setAttribute('minimized', '');
        } else {
            this.removeAttribute('minimized');
        }
    }

    close() {
        this.open = false;
        this.minimized = false;
        this.parentNode.removeChild(this);
    }

}

function makeDraggable(el, container) {
    let arrowDrag;
    let mouseDrag;
    let dragoffset = {
        x: 0,
        y: 0
    };

    let events = function() {
        addEventListeners(el, 'focusin mousedown touchmove', (function(event) {
            let target;
            if (event.type === 'touchmove') {
                target = event.targetTouches[0];
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
        addEventListeners(el, 'focusout mouseup', (function() {
            if (event.type === 'mouseup') {
                if (mouseDrag) {
                    mouseDrag = false;
                }
            } else {
                arrowDrag = false;
            }
        }));
        addEventListeners(document, 'mousemove keydown touchmove', ((event) => {
            let destination = {};

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

    el.style.position = "absolute";
    events();
}

customElements.define('draggable-window', DraggableWindow);

    function addEventListeners(element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}

},{}],6:[function(require,module,exports){
let menuTemplate = document.querySelector('link[href="/expandable-menu-item.html"]').import.querySelector("#menuItemTemplate");

customElements.define('expandable-menu-item', class extends HTMLElement {
    constructor() {
        super();

        //set up shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = menuTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

    }

    connectedCallback() {
        makeExpandable(this);
    }

    get subMenu() {
        let label = this.getAttribute('label');
        return Array.prototype.filter.call(this.querySelectorAll('[slot="subitem"]'), (node) => {
            let nodeLabel = node.getAttribute('label');
            return nodeLabel === label;
        });
    }

    get displayingSubMenu() {
        return !this.subMenu[0].hasAttribute('hide');
    }

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

});


function makeExpandable(item) {
    let nextFocus = 0;
    let show = false;
    let arrowExpand;
    let mouseExpand;

    let events = function () {
        addEventListeners(item, 'focusin click', ((event) => {
            console.log(document.activeElement);
            item.firstElementChild.focus();
            console.log(document.activeElement);
                arrowExpand = true;

                if (event.type === 'click') {
                    mouseExpand = true;
                    show = !show;
                    event.preventDefault();
                }

                item.toggleSubMenu(show);
        }));
        addEventListeners(item, 'keydown', ((event) => {
            item.focus();
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
                            if (nextFocus < 0) {
                                nextFocus = 3;
                            }
                            item.subMenu[nextFocus].focus();
                            break;
                        case 'ArrowDown':
                            if (!item.displayingSubMenu) {
                                item.toggleSubMenu(true);
                            }
                            nextFocus += 1;
                            if (nextFocus > 3) {
                                nextFocus = 0;
                            }
                            item.subMenu[nextFocus].focus();
                            console.log(document.activeElement.shadowRoot.activeElement);
                            break;
                    }
                }

        }));
    };

    events();
}

function addEventListeners(element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}

},{}],7:[function(require,module,exports){
let memoryWindowTemplate = document.querySelector('link[href="/memory-app.html"]').import.querySelector("#memoryWindowTemplate");

class MemoryApp extends HTMLElement {
    constructor() {
        super();

        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = memoryWindowTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
    }
}

customElements.define('memory-app', MemoryApp);

},{}],8:[function(require,module,exports){
class Brick {
    constructor(number) {
        this.value = number;
        this.facedown = true;
    }

    turn() {
        this.facedown = !(this.facedown);
        return this.draw();
    }

    equals(other) {
        return (other instanceof Brick) && (this.value === other.value);
    }

    clone() {
        return new Brick(this.value);
    }

    draw() {
        if (this.facedown) {
            return "/image/0.png";
        } else {
            return "/image/" + this.value + ".png";
        }
    }
}

module.exports = Brick;

},{}],9:[function(require,module,exports){
let memoryTemplate = document.querySelector('link[href="/memory-game.html"]').import.querySelector("#memoryTemplate");
let brickTemplate = document.querySelector('link[href="/memory-game.html"]').import.querySelector("#brickTemplate");

let Brick = require("./memory-bricks.js");
let Timer = require('./timer.js');

class MemoryGame extends HTMLElement {
    constructor(width, height) {
        super();

        //setup shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = memoryTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

        //set width and height attributes
        this.setAttribute('data-width', width || this.getAttribute('data-width') || 4);
        this.setAttribute('data-height', height || this.getAttribute('data-height')  || 4);
        this.set = [];
        this.timer = new Timer(0);
        this.timespan = this.shadowRoot.querySelector("#time");
        this.turnspan = this.shadowRoot.querySelector("#turns");

    }

    connectedCallback() {
        //set height and width
        this.height = this.getAttribute('data-height') || this.height;
        this.width = this.getAttribute('data-width') || this.width;

        //initiate bricks
        let brick;
        let match;
        let pairs = (this.width * this.height) / 2;

        for (let i = 1; i <= pairs; i += 1) {
            brick = new Brick(i);
            this.set.push(brick);
            match = brick.clone();
            this.set.push(match);
        }

        this.shuffle();
        this.draw();
        getGamePlay(this.set, this);
        this.timer.start(); //maybe move this to start function
        this.timer.display(this.timespan);
    }

    get width() {
        return this.getAttribute('data-width');
    }

    set width(newVal) {
        this.setAttribute('data-width', newVal);
    }

    get height() {
        return this.getAttribute('data-height');
    }

    set height(newVal) {
        this.setAttribute('data-height', newVal);
    }

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

    draw() {
        let theSet = this.set;

        for (let i = 0; i < theSet.length; i += 1) {
            let brickDiv = document.importNode(brickTemplate.content, true);
            let img = brickDiv.querySelector("img");
            let brick = theSet[i];
            img.src = brick.draw();
            img.setAttribute("brickNumber", i);
            this.appendChild(brickDiv);

            if ((i + 1) % this.width === 0) {
                let br = document.createElement("br");
                br.setAttribute('slot', 'brick');
                this.appendChild(br);
            }
        }
    }
}

customElements.define('memory-game', MemoryGame);

    function getGamePlay(board, destination) {

    let bricks = destination.querySelectorAll("a");
    let bricksLeft = bricks.length;
    let turns = 0;
    let choice1;
    let choice2;
    let img1;
    let img2;

    destination.addEventListener("click", function(event) {
        if (!choice2) {
            let img = event.target.querySelector("img") || event.target;
            let brickNumber = img.getAttribute("brickNumber");
            let brick = board[brickNumber];
            img.src = brick.turn();

            if (!choice1) {
                img1 = img;
                choice1 = brick;
            } else {
                img2 = img;
                choice2 = brick;

                if (choice1.equals(choice2) && img1.getAttribute('brickNumber') !== img2.getAttribute('brickNumber')) {
                    img1.parentElement.parentElement.classList.add("hide");
                    img2.parentElement.parentElement.classList.add("hide");
                    choice1 = "";
                    choice2 = "";
                    img1 = "";
                    img2 = "";
                    bricksLeft -= 2;
                    if (bricksLeft === 0) {
                        this.timer.stop();
                    }
                } else {
                    setTimeout(function () {
                        img1.src = choice1.turn();
                        img2.src = choice2.turn();
                        choice1 = "";
                        choice2 = "";
                        img1 = "";
                        img2 = "";
                    }, 1000);
                }

                turns += 1;
                this.turnspan.textContent = turns;
            }

        }
        event.preventDefault();

    });

}

},{"./memory-bricks.js":8,"./timer.js":10}],10:[function(require,module,exports){
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
     * @returns the count
     */
    get time() {
        return this.count;
    }
    /**
     * starts the timer. increments time every 100 milliseconds.
     * @param time {number} what number to start it on.
     */
    start(time) {
        this.count = time || this.count;
        this.timer = setInterval(() => {
            this.count += 100;
        }, 100);
    }
    /**
     * starts the timer. decrements time every 100 milliseconds.
     * @param time {number} what number to start it on.
     */
    countdown(time) {
        count = time || this.count;
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
        return setInterval( ()=> {
            destination.textContent = Math.round(this.time / precision);
        }, interval);
    }
}

module.exports = Timer;

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvSFRNTFV0aWwuanMiLCJjbGllbnQvc291cmNlL2pzL1dpbmRvd01hbmFnZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvZGVza3RvcC5qcyIsImNsaWVudC9zb3VyY2UvanMvZHJhZ2dhYmxlLXdpbmRvdy5qcyIsImNsaWVudC9zb3VyY2UvanMvZXhwYW5kYWJsZS1tZW51LWl0ZW0uanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS1hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS1icmlja3MuanMiLCJjbGllbnQvc291cmNlL2pzL21lbW9yeS1nYW1lLmpzIiwiY2xpZW50L3NvdXJjZS9qcy90aW1lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4qXG4qL1xuXG5cbmZ1bmN0aW9uIG1ha2VEcmFnZ2FibGUoZWwsIGNvbnRhaW5lcikge1xuICAgIGxldCBhcnJvd0RyYWc7XG4gICAgbGV0IG1vdXNlRHJhZztcbiAgICBsZXQgZHJhZ29mZnNldCA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBsZXQgZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGVsLCAnZm9jdXNpbiBtb3VzZWRvd24nLCAoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGFycm93RHJhZyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicpIHtcbiAgICAgICAgICAgICAgICBtb3VzZURyYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGRyYWdvZmZzZXQueCA9IGV2ZW50LnBhZ2VYIC0gZWwub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBkcmFnb2Zmc2V0LnkgPSBldmVudC5wYWdlWSAtIGVsLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhlbCwgJ2ZvY3Vzb3V0IG1vdXNldXAnLCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNldXAnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vdXNlRHJhZykge1xuICAgICAgICAgICAgICAgICAgICBtb3VzZURyYWcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFycm93RHJhZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGRvY3VtZW50LCAnbW91c2Vtb3ZlIGtleWRvd24nLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7fTtcblxuICAgICAgICAgICAgaWYgKG1vdXNlRHJhZykge1xuICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gKGV2ZW50LnBhZ2VZIC0gZHJhZ29mZnNldC55KTtcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9IChldmVudC5wYWdlWCAtIGRyYWdvZmZzZXQueCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFycm93RHJhZykge1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSBwYXJzZUludChlbC5zdHlsZS50b3Auc2xpY2UoMCwgLTIpKTtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gcGFyc2VJbnQoZWwuc3R5bGUubGVmdC5zbGljZSgwLCAtMikpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55IC09IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd0xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCAtPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCArPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobW91c2VEcmFnIHx8IGFycm93RHJhZykge1xuICAgICAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSB3aXRoaW5Cb3VuZHMoZWwsIGNvbnRhaW5lciwgZGVzdGluYXRpb24pID8gZGVzdGluYXRpb24ueCAgKyBcInB4XCIgOiBlbC5zdHlsZS5sZWZ0O1xuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IHdpdGhpbkJvdW5kcyhlbCwgY29udGFpbmVyLCBkZXN0aW5hdGlvbikgPyBkZXN0aW5hdGlvbi55ICArIFwicHhcIiA6IGVsLnN0eWxlLnRvcCArIFwicHhcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgfTtcblxuICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgIGV2ZW50cygpO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyhlbGVtZW50LCBldmVudHMsIGhhbmRsZXIpIHtcbiAgICBldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGV2ZW50ID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcikpO1xufVxuXG5mdW5jdGlvbiB3aXRoaW5Cb3VuZHMoZWxlbWVudCwgY29udGFpbmVyLCBjb29yZHMpIHtcbiAgICBsZXQgbWluWCA9IGNvbnRhaW5lci5vZmZzZXRMZWZ0O1xuICAgIGxldCBtYXhYID0gKG1pblggKyBjb250YWluZXIuY2xpZW50V2lkdGgpIC0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICBsZXQgbWluWSA9IGNvbnRhaW5lci5vZmZzZXRUb3A7XG4gICAgbGV0IG1heFkgPSAobWluWSArIGNvbnRhaW5lci5jbGllbnRIZWlnaHQpIC0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG5cbiAgICByZXR1cm4gKGNvb3Jkcy54IDw9IG1heFggJiYgY29vcmRzLnggPj0gbWluWCAmJiBjb29yZHMueSA8PSBtYXhZICYmIGNvb3Jkcy55ID49IG1pblkpO1xufVxuXG4vL2V4cG9ydHNcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1ha2VEcmFnZ2FibGU6IG1ha2VEcmFnZ2FibGUsXG4gICAgYWRkRXZlbnRMaXN0ZW5lcnM6IGFkZEV2ZW50TGlzdGVuZXJzLFxuICAgIHdpdGhpbkJvdW5kczogd2l0aGluQm91bmRzXG59O1xuIiwiZnVuY3Rpb24gV2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSkge1xuICAgIGxldCB3bSA9IHt9O1xuXG4gICAgY2xhc3MgV2luZG93TWFuYWdlciB7XG5cbiAgICAgICAgY29uc3RydWN0b3Iod2luZG93U3BhY2UpIHtcbiAgICAgICAgICAgIHdtLnN0YXJ0WCA9IHdpbmRvd1NwYWNlLm9mZnNldExlZnQgKyAyMDtcbiAgICAgICAgICAgIHdtLnN0YXJ0WSA9IHdpbmRvd1NwYWNlLm9mZnNldFRvcCArIDIwO1xuICAgICAgICAgICAgd20udHlwZXMgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlV2luZG93KHR5cGUpIHtcbiAgICAgICAgICAgIGxldCBhV2luZG93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRyYWdnYWJsZS13aW5kb3dcIik7XG5cbiAgICAgICAgLyptYWtlIHRlbXBsYXRlLCBpZiBubyB3aW5kb3dzIG9wZW4gb2Yga2luZCBldGNcbiAgICAgICAgIGxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG4gICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcImltcG9ydFwiKTtcbiAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcIi9kcmFnZ2FibGUtd2luZG93Lmh0bWxcIik7XG4gICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICAgZXZlbnQudGFyZ2V0LnNldEF0dHJpYnV0ZShcImxhYmVsXCIsIHR5cGUpOyovXG5cbiAgICAgICAgICAgIHdpbmRvd1NwYWNlLmFwcGVuZENoaWxkKGFXaW5kb3cpO1xuICAgICAgICAgICAgc2V0dXBTcGFjZSh0eXBlLCBhV2luZG93KTtcblxuICAgICAgICAgICAgaWYgKHdtW3R5cGVdLm9wZW4pIHtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuLnB1c2goYVdpbmRvdyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4gPSBbYVdpbmRvd107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhV2luZG93O1xuICAgICAgICB9XG5cbiAgICAgICAgb3Blbih0eXBlKSB7XG4gICAgICAgICAgICBpZiAod21bdHlwZV0pIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgICAgICAgICAgbGV0IHdpbmRvd3MgPSB3bVt0eXBlXS5vcGVuO1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHdpbmRvd3MuZmlsdGVyKCAodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdy5vcGVuO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBleHBhbmQodHlwZSkge1xuICAgICAgICAgICAgbGV0IHdpbnMgPSB0aGlzLm9wZW4odHlwZSk7XG4gICAgICAgICAgICBpZiAod2lucykge1xuICAgICAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB3Lm1pbmltaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbWluaW1pemUodHlwZSkge1xuICAgICAgICAgICAgbGV0IHdpbnMgPSB0aGlzLm9wZW4odHlwZSk7XG4gICAgICAgICAgICBpZiAod2lucykge1xuICAgICAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICB3Lm1pbmltaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGNsb3NlKHR5cGUpIHtcbiAgICAgICAgICAgIGxldCB3aW5zID0gdGhpcy5vcGVuKHR5cGUpO1xuICAgICAgICAgICAgaWYgKHdpbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh3aW5zKTtcbiAgICAgICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBXaW5kb3dNYW5hZ2VyKHdpbmRvd1NwYWNlKTtcblxuICAgIC8vaGVscGVyIGZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIHNldHVwU3BhY2UodHlwZSwgc3BhY2UpIHtcbiAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge307XG4gICAgICAgIGxldCB4O1xuICAgICAgICBsZXQgeTtcblxuICAgICAgICBpZiAod21bdHlwZV0pIHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAod21bdHlwZV0ubGF0ZXN0Q29vcmRzLnggKz0gNTApO1xuICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9ICh3bVt0eXBlXS5sYXRlc3RDb29yZHMueSArPSA1MCk7XG5cbiAgICAgICAgICAgIGlmICghKHdpdGhpbkJvdW5kcyhzcGFjZSwgd2luZG93U3BhY2UsIGRlc3RpbmF0aW9uKSkpIHtcbiAgICAgICAgICAgICAgICB4ID0gd21bdHlwZV0uc3RhcnRDb29yZHMueCArPSA1O1xuICAgICAgICAgICAgICAgIHkgPSB3bVt0eXBlXS5zdGFydENvb3Jkcy55ICs9IDU7XG4gICAgICAgICAgICAgICAgd21bdHlwZV0ubGF0ZXN0Q29vcmRzLnggPSB4O1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLmxhdGVzdENvb3Jkcy55ID0geTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgeCA9IGRlc3RpbmF0aW9uLng7XG4gICAgICAgICAgICAgICAgeSA9IGRlc3RpbmF0aW9uLnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAod20uc3RhcnRYICsgKDYwICogd20udHlwZXMpKTtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAod20uc3RhcnRZKTtcblxuICAgICAgICAgICAgaWYgKCEod2l0aGluQm91bmRzKHNwYWNlLCB3aW5kb3dTcGFjZSwgZGVzdGluYXRpb24pKSkge1xuICAgICAgICAgICAgICAgIHggPSB3bS5zdGFydFg7XG4gICAgICAgICAgICAgICAgeSA9IHdtLnN0YXJ0WTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgeCA9IGRlc3RpbmF0aW9uLng7XG4gICAgICAgICAgICAgICAgeSA9IGRlc3RpbmF0aW9uLnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdtW3R5cGVdID0ge307XG4gICAgICAgICAgICB3bVt0eXBlXS5zdGFydENvb3JkcyA9IHtcbiAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB3bVt0eXBlXS5sYXRlc3RDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd20udHlwZXMgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBzcGFjZS50YWJJbmRleCA9IDA7XG4gICAgICAgIHNwYWNlLnN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XG4gICAgICAgIHNwYWNlLnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdpdGhpbkJvdW5kcyhlbGVtZW50LCBjb250YWluZXIsIGNvb3Jkcykge1xuICAgICAgICBsZXQgbWluWCA9IGNvbnRhaW5lci5vZmZzZXRMZWZ0O1xuICAgICAgICBsZXQgbWF4WCA9IChtaW5YICsgY29udGFpbmVyLmNsaWVudFdpZHRoKSAtIChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKTtcbiAgICAgICAgbGV0IG1pblkgPSBjb250YWluZXIub2Zmc2V0VG9wO1xuICAgICAgICBsZXQgbWF4WSA9IChtaW5ZICsgY29udGFpbmVyLmNsaWVudEhlaWdodCkgLSAoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xuXG4gICAgICAgIHJldHVybiAoY29vcmRzLnggPD0gbWF4WCAmJiBjb29yZHMueCA+PSBtaW5YICYmIGNvb3Jkcy55IDw9IG1heFkgJiYgY29vcmRzLnkgPj0gbWluWSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdpbmRvd01hbmFnZXI7XG5cbiIsIi8vdG8gbWFrZSB3ZWIgY29tcG9uZW50cyB3b3JrIHdpdGggYnJvd3NlcmlmeVxubGV0IHdpbmRvdyA9IHJlcXVpcmUoJy4vZHJhZ2dhYmxlLXdpbmRvdy5qcycpO1xubGV0IG1lbnUgPSByZXF1aXJlKFwiLi9leHBhbmRhYmxlLW1lbnUtaXRlbS5qc1wiKTtcbmxldCBtZW1vcnlHYW1lID0gcmVxdWlyZSgnLi9tZW1vcnktZ2FtZS5qcycpO1xubGV0IG1lbW9yeUFwcCA9IHJlcXVpcmUoJy4vbWVtb3J5LWFwcC5qcycpO1xuXG5cbi8vcmVxdWlyZXNcbmxldCBkZXNrdG9wID0gcmVxdWlyZShcIi4vZGVza3RvcC5qc1wiKTtcblxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5sb2coZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5zaGFkb3dSb290LmFjdGl2ZUVsZW1lbnQpO1xufSk7XG4iLCIvL3JlcXVpcmVzXG5sZXQgdSA9IHJlcXVpcmUoXCIuL0hUTUxVdGlsLmpzXCIpO1xubGV0IFdpbmRvd01hbmFnZXIgPSByZXF1aXJlKFwiLi9XaW5kb3dNYW5hZ2VyLmpzXCIpO1xuXG5cbi8vbm9kZXNcbmxldCBtYWluTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93U2VsZWN0b3JcIik7XG5sZXQgd2luZG93U3BhY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI29wZW5XaW5kb3dzXCIpO1xubGV0IHN1Yk1lbnVUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3ViTWVudVwiKTtcblxuLy92YXJpYWJsZXNcbmxldCBXTSA9IFdpbmRvd01hbmFnZXIod2luZG93U3BhY2UpO1xubGV0IHRvcCA9IDE7XG5cbkFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobWFpbk1lbnUuY2hpbGRyZW4sIChub2RlKSA9PiB7XG4gICAgYWRkU3ViTWVudShub2RlKTtcbn0pO1xuXG5tYWluTWVudS5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIChldmVudCkgPT4ge1xuICAgIGxldCB0eXBlID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEta2luZFwiKSB8fCBldmVudC50YXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLWtpbmRcIik7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgICAgV00uY3JlYXRlV2luZG93KHR5cGUpLmZvY3VzKCk7XG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59KTtcblxuYWRkRXZlbnRMaXN0ZW5lcnMobWFpbk1lbnUsICdjbGljayBmb2N1c291dCcsIChldmVudCkgPT4ge1xuICAgIGxldCBtYWluTWVudUl0ZW1zID0gbWFpbk1lbnUucXVlcnlTZWxlY3RvckFsbCgnZXhwYW5kYWJsZS1tZW51LWl0ZW0nKTtcbiAgICBtYWluTWVudUl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKChpdGVtICE9PSBldmVudC50YXJnZXQgJiYgaXRlbSAhPT0gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQpICYmIChpdGVtLmRpc3BsYXlpbmdTdWJNZW51KSkge1xuICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG53aW5kb3dTcGFjZS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIChldmVudCkgPT4ge1xuICAgIGV2ZW50LnRhcmdldC5zdHlsZS56SW5kZXggPSB0b3A7XG4gICAgdG9wICs9IDE7XG59LCB0cnVlKTtcblxuZnVuY3Rpb24gYWRkU3ViTWVudShpdGVtKSB7XG4gICAgbGV0IGluc3RhbmNlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShzdWJNZW51VGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgbGV0IGxhYmVsID0gaXRlbS5nZXRBdHRyaWJ1dGUoJ2xhYmVsJyk7XG5cbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGluc3RhbmNlLmNoaWxkcmVuLCAobm9kZSkgPT4ge1xuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZSgnbGFiZWwnLCBsYWJlbCk7XG4gICAgfSk7XG5cbiAgICBpdGVtLmFwcGVuZENoaWxkKGluc3RhbmNlKTtcblxuICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgc3dpdGNoIChldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgY2FzZSAnb3Blbic6XG4gICAgICAgICAgICAgICAgV00uY3JlYXRlV2luZG93KGxhYmVsKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICAgICAgICAgIFdNLmNsb3NlKGxhYmVsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21pbmltaXplJzpcbiAgICAgICAgICAgICAgICBXTS5taW5pbWl6ZShsYWJlbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdleHBhbmQnOlxuICAgICAgICAgICAgICAgIFdNLmV4cGFuZChsYWJlbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudC50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzIChlbGVtZW50LCBldmVudHMsIGhhbmRsZXIpIHtcbiAgICBldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGV2ZW50ID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcikpO1xufVxuIiwibGV0IHdpbmRvd1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2RyYWdnYWJsZS13aW5kb3cuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvd1RlbXBsYXRlXCIpO1xuXG5jbGFzcyBEcmFnZ2FibGVXaW5kb3cgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IodHlwZSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8vc2V0dXAgc2hhZG93IGRvbSBzdHlsZXNcbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCIsIGRlbGVnYXRlc0ZvY3VzOiB0cnVlfSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHdpbmRvd1RlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcblxuICAgICAgICAvL3NldCBiZWhhdmlvdXJcbiAgICAgICAgbWFrZURyYWdnYWJsZSh0aGlzLCB0aGlzLnBhcmVudE5vZGUpO1xuXG4gICAgICAgIC8vYWRkIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5jb21wb3NlZFBhdGgoKVswXTtcbiAgICAgICAgICAgIGxldCBpZCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgICAgICAgICAgIGlmIChpZCA9PT0gXCJjbG9zZVwiKSB7XG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpZCA9PT0gXCJtaW5pbWl6ZVwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIGdldCBvcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNBdHRyaWJ1dGUoJ29wZW4nKTtcbiAgICB9XG5cbiAgICBzZXQgb3BlbihvcGVuKSB7XG4gICAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnb3BlbicsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdvcGVuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgbWluaW1pemVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNBdHRyaWJ1dGUoJ21pbmltaXplZCcpO1xuICAgIH1cblxuICAgIHNldCBtaW5pbWl6ZWQobWluaW1pemUpIHtcbiAgICAgICAgaWYgKG1pbmltaXplKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnbWluaW1pemVkJywgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ21pbmltaXplZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgfVxuXG59XG5cbmZ1bmN0aW9uIG1ha2VEcmFnZ2FibGUoZWwsIGNvbnRhaW5lcikge1xuICAgIGxldCBhcnJvd0RyYWc7XG4gICAgbGV0IG1vdXNlRHJhZztcbiAgICBsZXQgZHJhZ29mZnNldCA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBsZXQgZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGVsLCAnZm9jdXNpbiBtb3VzZWRvd24gdG91Y2htb3ZlJywgKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0O1xuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gZXZlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhcnJvd0RyYWcgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nIHx8IGV2ZW50LnR5cGUgPT09ICd0b3VjaG1vdmUnKSB7XG4gICAgICAgICAgICAgICAgbW91c2VEcmFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkcmFnb2Zmc2V0LnggPSB0YXJnZXQucGFnZVggLSBlbC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGRyYWdvZmZzZXQueSA9IHRhcmdldC5wYWdlWSAtIGVsLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhlbCwgJ2ZvY3Vzb3V0IG1vdXNldXAnLCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNldXAnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vdXNlRHJhZykge1xuICAgICAgICAgICAgICAgICAgICBtb3VzZURyYWcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFycm93RHJhZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGRvY3VtZW50LCAnbW91c2Vtb3ZlIGtleWRvd24gdG91Y2htb3ZlJywgKChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge307XG5cbiAgICAgICAgICAgIGlmIChtb3VzZURyYWcpIHtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gKGV2ZW50LnBhZ2VZIC0gZHJhZ29mZnNldC55KTtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gKGV2ZW50LnBhZ2VYIC0gZHJhZ29mZnNldC54KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJyb3dEcmFnKSB7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9IHBhcnNlSW50KGVsLnN0eWxlLnRvcC5zbGljZSgwLCAtMikpO1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSBwYXJzZUludChlbC5zdHlsZS5sZWZ0LnNsaWNlKDAsIC0yKSk7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgLT0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSArPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54IC09IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dSaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtb3VzZURyYWcgfHwgYXJyb3dEcmFnKSB7XG4gICAgICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IGRlc3RpbmF0aW9uLnggICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IGRlc3RpbmF0aW9uLnkgICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgZWwuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgZXZlbnRzKCk7XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZHJhZ2dhYmxlLXdpbmRvdycsIERyYWdnYWJsZVdpbmRvdyk7XG5cbiAgICBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyhlbGVtZW50LCBldmVudHMsIGhhbmRsZXIpIHtcbiAgICBldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGV2ZW50ID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcikpO1xufVxuIiwibGV0IG1lbnVUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9leHBhbmRhYmxlLW1lbnUtaXRlbS5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudUl0ZW1UZW1wbGF0ZVwiKTtcblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdleHBhbmRhYmxlLW1lbnUtaXRlbScsIGNsYXNzIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8vc2V0IHVwIHNoYWRvdyBkb20gc3R5bGVzXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IG1lbnVUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgbWFrZUV4cGFuZGFibGUodGhpcyk7XG4gICAgfVxuXG4gICAgZ2V0IHN1Yk1lbnUoKSB7XG4gICAgICAgIGxldCBsYWJlbCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKHRoaXMucXVlcnlTZWxlY3RvckFsbCgnW3Nsb3Q9XCJzdWJpdGVtXCJdJyksIChub2RlKSA9PiB7XG4gICAgICAgICAgICBsZXQgbm9kZUxhYmVsID0gbm9kZS5nZXRBdHRyaWJ1dGUoJ2xhYmVsJyk7XG4gICAgICAgICAgICByZXR1cm4gbm9kZUxhYmVsID09PSBsYWJlbDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IGRpc3BsYXlpbmdTdWJNZW51KCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuc3ViTWVudVswXS5oYXNBdHRyaWJ1dGUoJ2hpZGUnKTtcbiAgICB9XG5cbiAgICB0b2dnbGVTdWJNZW51KHNob3cpIHtcbiAgICAgICAgaWYgKHNob3cpIHtcbiAgICAgICAgICAgIHRoaXMuc3ViTWVudS5mb3JFYWNoKChwb3N0KSA9PiB7XG4gICAgICAgICAgICAgICAgcG9zdC5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdWJNZW51LmZvckVhY2goKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgICBwb3N0LnNldEF0dHJpYnV0ZSgnaGlkZScsICcnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9XG5cbn0pO1xuXG5cbmZ1bmN0aW9uIG1ha2VFeHBhbmRhYmxlKGl0ZW0pIHtcbiAgICBsZXQgbmV4dEZvY3VzID0gMDtcbiAgICBsZXQgc2hvdyA9IGZhbHNlO1xuICAgIGxldCBhcnJvd0V4cGFuZDtcbiAgICBsZXQgbW91c2VFeHBhbmQ7XG5cbiAgICBsZXQgZXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhpdGVtLCAnZm9jdXNpbiBjbGljaycsICgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgICAgICAgaXRlbS5maXJzdEVsZW1lbnRDaGlsZC5mb2N1cygpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgYXJyb3dFeHBhbmQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHtcbiAgICAgICAgICAgICAgICAgICAgbW91c2VFeHBhbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBzaG93ID0gIXNob3c7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHNob3cpO1xuICAgICAgICB9KSk7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGl0ZW0sICdrZXlkb3duJywgKChldmVudCkgPT4ge1xuICAgICAgICAgICAgaXRlbS5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGlmIChhcnJvd0V4cGFuZCkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dSaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdGVtLmRpc3BsYXlpbmdTdWJNZW51KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEZvY3VzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRGb2N1cyA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEZvY3VzID0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5zdWJNZW51W25leHRGb2N1c10uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdGVtLmRpc3BsYXlpbmdTdWJNZW51KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEZvY3VzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRGb2N1cyA+IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEZvY3VzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5zdWJNZW51W25leHRGb2N1c10uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5hY3RpdmVFbGVtZW50LnNoYWRvd1Jvb3QuYWN0aXZlRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIH07XG5cbiAgICBldmVudHMoKTtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cbiIsImxldCBtZW1vcnlXaW5kb3dUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlXaW5kb3dUZW1wbGF0ZVwiKTtcblxuY2xhc3MgTWVtb3J5QXBwIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IG1lbW9yeVdpbmRvd1RlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcbiAgICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbWVtb3J5LWFwcCcsIE1lbW9yeUFwcCk7XG4iLCJjbGFzcyBCcmljayB7XG4gICAgY29uc3RydWN0b3IobnVtYmVyKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSBudW1iZXI7XG4gICAgICAgIHRoaXMuZmFjZWRvd24gPSB0cnVlO1xuICAgIH1cblxuICAgIHR1cm4oKSB7XG4gICAgICAgIHRoaXMuZmFjZWRvd24gPSAhKHRoaXMuZmFjZWRvd24pO1xuICAgICAgICByZXR1cm4gdGhpcy5kcmF3KCk7XG4gICAgfVxuXG4gICAgZXF1YWxzKG90aGVyKSB7XG4gICAgICAgIHJldHVybiAob3RoZXIgaW5zdGFuY2VvZiBCcmljaykgJiYgKHRoaXMudmFsdWUgPT09IG90aGVyLnZhbHVlKTtcbiAgICB9XG5cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCcmljayh0aGlzLnZhbHVlKTtcbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICBpZiAodGhpcy5mYWNlZG93bikge1xuICAgICAgICAgICAgcmV0dXJuIFwiL2ltYWdlLzAucG5nXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gXCIvaW1hZ2UvXCIgKyB0aGlzLnZhbHVlICsgXCIucG5nXCI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQnJpY2s7XG4iLCJsZXQgbWVtb3J5VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWdhbWUuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeVRlbXBsYXRlXCIpO1xubGV0IGJyaWNrVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWdhbWUuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2JyaWNrVGVtcGxhdGVcIik7XG5cbmxldCBCcmljayA9IHJlcXVpcmUoXCIuL21lbW9yeS1icmlja3MuanNcIik7XG5sZXQgVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyLmpzJyk7XG5cbmNsYXNzIE1lbW9yeUdhbWUgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3Iod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8vc2V0dXAgc2hhZG93IGRvbSBzdHlsZXNcbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCJ9KTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gbWVtb3J5VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuXG4gICAgICAgIC8vc2V0IHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlc1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnZGF0YS13aWR0aCcsIHdpZHRoIHx8IHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLXdpZHRoJykgfHwgNCk7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcsIGhlaWdodCB8fCB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS1oZWlnaHQnKSAgfHwgNCk7XG4gICAgICAgIHRoaXMuc2V0ID0gW107XG4gICAgICAgIHRoaXMudGltZXIgPSBuZXcgVGltZXIoMCk7XG4gICAgICAgIHRoaXMudGltZXNwYW4gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiN0aW1lXCIpO1xuICAgICAgICB0aGlzLnR1cm5zcGFuID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjdHVybnNcIik7XG5cbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgLy9zZXQgaGVpZ2h0IGFuZCB3aWR0aFxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcpIHx8IHRoaXMuaGVpZ2h0O1xuICAgICAgICB0aGlzLndpZHRoID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2lkdGgnKSB8fCB0aGlzLndpZHRoO1xuXG4gICAgICAgIC8vaW5pdGlhdGUgYnJpY2tzXG4gICAgICAgIGxldCBicmljaztcbiAgICAgICAgbGV0IG1hdGNoO1xuICAgICAgICBsZXQgcGFpcnMgPSAodGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0KSAvIDI7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gcGFpcnM7IGkgKz0gMSkge1xuICAgICAgICAgICAgYnJpY2sgPSBuZXcgQnJpY2soaSk7XG4gICAgICAgICAgICB0aGlzLnNldC5wdXNoKGJyaWNrKTtcbiAgICAgICAgICAgIG1hdGNoID0gYnJpY2suY2xvbmUoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0LnB1c2gobWF0Y2gpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaHVmZmxlKCk7XG4gICAgICAgIHRoaXMuZHJhdygpO1xuICAgICAgICBnZXRHYW1lUGxheSh0aGlzLnNldCwgdGhpcyk7XG4gICAgICAgIHRoaXMudGltZXIuc3RhcnQoKTsgLy9tYXliZSBtb3ZlIHRoaXMgdG8gc3RhcnQgZnVuY3Rpb25cbiAgICAgICAgdGhpcy50aW1lci5kaXNwbGF5KHRoaXMudGltZXNwYW4pO1xuICAgIH1cblxuICAgIGdldCB3aWR0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLXdpZHRoJyk7XG4gICAgfVxuXG4gICAgc2V0IHdpZHRoKG5ld1ZhbCkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnZGF0YS13aWR0aCcsIG5ld1ZhbCk7XG4gICAgfVxuXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcpO1xuICAgIH1cblxuICAgIHNldCBoZWlnaHQobmV3VmFsKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcsIG5ld1ZhbCk7XG4gICAgfVxuXG4gICAgc2h1ZmZsZSgpIHtcbiAgICAgICAgbGV0IHRoZVNldCA9IHRoaXMuc2V0O1xuICAgICAgICBmb3IgKGxldCBpID0gKHRoZVNldC5sZW5ndGggLSAxKTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgbGV0IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKTtcbiAgICAgICAgICAgIGxldCBpT2xkID0gdGhlU2V0W2ldO1xuICAgICAgICAgICAgdGhlU2V0W2ldID0gdGhlU2V0W2pdO1xuICAgICAgICAgICAgdGhlU2V0W2pdID0gaU9sZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCA9IHRoZVNldDtcbiAgICB9XG5cbiAgICBkcmF3KCkge1xuICAgICAgICBsZXQgdGhlU2V0ID0gdGhpcy5zZXQ7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGVTZXQubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGxldCBicmlja0RpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUoYnJpY2tUZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgICAgIGxldCBpbWcgPSBicmlja0Rpdi5xdWVyeVNlbGVjdG9yKFwiaW1nXCIpO1xuICAgICAgICAgICAgbGV0IGJyaWNrID0gdGhlU2V0W2ldO1xuICAgICAgICAgICAgaW1nLnNyYyA9IGJyaWNrLmRyYXcoKTtcbiAgICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJicmlja051bWJlclwiLCBpKTtcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kQ2hpbGQoYnJpY2tEaXYpO1xuXG4gICAgICAgICAgICBpZiAoKGkgKyAxKSAlIHRoaXMud2lkdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgYnIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIik7XG4gICAgICAgICAgICAgICAgYnIuc2V0QXR0cmlidXRlKCdzbG90JywgJ2JyaWNrJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChicik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbWVtb3J5LWdhbWUnLCBNZW1vcnlHYW1lKTtcblxuICAgIGZ1bmN0aW9uIGdldEdhbWVQbGF5KGJvYXJkLCBkZXN0aW5hdGlvbikge1xuXG4gICAgbGV0IGJyaWNrcyA9IGRlc3RpbmF0aW9uLnF1ZXJ5U2VsZWN0b3JBbGwoXCJhXCIpO1xuICAgIGxldCBicmlja3NMZWZ0ID0gYnJpY2tzLmxlbmd0aDtcbiAgICBsZXQgdHVybnMgPSAwO1xuICAgIGxldCBjaG9pY2UxO1xuICAgIGxldCBjaG9pY2UyO1xuICAgIGxldCBpbWcxO1xuICAgIGxldCBpbWcyO1xuXG4gICAgZGVzdGluYXRpb24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmICghY2hvaWNlMikge1xuICAgICAgICAgICAgbGV0IGltZyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yKFwiaW1nXCIpIHx8IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGxldCBicmlja051bWJlciA9IGltZy5nZXRBdHRyaWJ1dGUoXCJicmlja051bWJlclwiKTtcbiAgICAgICAgICAgIGxldCBicmljayA9IGJvYXJkW2JyaWNrTnVtYmVyXTtcbiAgICAgICAgICAgIGltZy5zcmMgPSBicmljay50dXJuKCk7XG5cbiAgICAgICAgICAgIGlmICghY2hvaWNlMSkge1xuICAgICAgICAgICAgICAgIGltZzEgPSBpbWc7XG4gICAgICAgICAgICAgICAgY2hvaWNlMSA9IGJyaWNrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbWcyID0gaW1nO1xuICAgICAgICAgICAgICAgIGNob2ljZTIgPSBicmljaztcblxuICAgICAgICAgICAgICAgIGlmIChjaG9pY2UxLmVxdWFscyhjaG9pY2UyKSAmJiBpbWcxLmdldEF0dHJpYnV0ZSgnYnJpY2tOdW1iZXInKSAhPT0gaW1nMi5nZXRBdHRyaWJ1dGUoJ2JyaWNrTnVtYmVyJykpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1nMS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XG4gICAgICAgICAgICAgICAgICAgIGltZzIucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuICAgICAgICAgICAgICAgICAgICBjaG9pY2UxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlMiA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIGltZzEgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICBpbWcyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJpY2tzTGVmdCAtPSAyO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYnJpY2tzTGVmdCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lci5zdG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzEuc3JjID0gY2hvaWNlMS50dXJuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcyLnNyYyA9IGNob2ljZTIudHVybigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hvaWNlMSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzEgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nMiA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHR1cm5zICs9IDE7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuc3Bhbi50ZXh0Q29udGVudCA9IHR1cm5zO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIH0pO1xuXG59XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgVGltZXIuXG4gKlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqL1xuXG5jbGFzcyBUaW1lciB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIGEgVGltZXIuXG4gICAgICogQHBhcmFtIHN0YXJ0VGltZSB7bnVtYmVyfSB3aGVyZSB0byBzdGFydCBjb3VudGluZy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzdGFydFRpbWUgPSAwKSB7XG4gICAgICAgIHRoaXMuY291bnQgPSBzdGFydFRpbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMgdGhlIGNvdW50XG4gICAgICovXG4gICAgZ2V0IHRpbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBzdGFydHMgdGhlIHRpbWVyLiBpbmNyZW1lbnRzIHRpbWUgZXZlcnkgMTAwIG1pbGxpc2Vjb25kcy5cbiAgICAgKiBAcGFyYW0gdGltZSB7bnVtYmVyfSB3aGF0IG51bWJlciB0byBzdGFydCBpdCBvbi5cbiAgICAgKi9cbiAgICBzdGFydCh0aW1lKSB7XG4gICAgICAgIHRoaXMuY291bnQgPSB0aW1lIHx8IHRoaXMuY291bnQ7XG4gICAgICAgIHRoaXMudGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvdW50ICs9IDEwMDtcbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc3RhcnRzIHRoZSB0aW1lci4gZGVjcmVtZW50cyB0aW1lIGV2ZXJ5IDEwMCBtaWxsaXNlY29uZHMuXG4gICAgICogQHBhcmFtIHRpbWUge251bWJlcn0gd2hhdCBudW1iZXIgdG8gc3RhcnQgaXQgb24uXG4gICAgICovXG4gICAgY291bnRkb3duKHRpbWUpIHtcbiAgICAgICAgY291bnQgPSB0aW1lIHx8IHRoaXMuY291bnQ7XG4gICAgICAgIHRoaXMudGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvdW50IC09IDEwMDtcbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc3RvcHMgdGhlIFRpbWVyLlxuICAgICAqIEByZXR1cm5zIHRoZSBjb3VudC5cbiAgICAgKi9cbiAgICBzdG9wKCkge1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMudGltZXIpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3VudDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgYSByb3VuZGVkIHZhbHVlIG9mIHRoZSBjb3VudCBvZiB0aGUgdGltZXJcbiAgICAgKiB0byB0aGUgZGVzaXJlZCBwcmVjaXNpb24sIGF0IGFuIGludGVydmFsLlxuICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbiB7bm9kZX0gd2hlcmUgdG8gbWFrZSB0aGUgZGlzcGxheVxuICAgICAqIEBwYXJhbSBpbnRlcnZhbCB7bnVtYmVyfSB0aGUgaW50ZXJ2YWwgdG8gbWFrZSB0aGUgZGlzcGxheSBpbiwgaW4gbWlsbGlzZWNvbmRzXG4gICAgICogQHBhcmFtIHByZWNpc2lvbiB7bnVtYmVyfXRoZSBudW1iZXIgdG8gZGl2aWRlIHRoZSBkaXNwbGF5ZWQgbWlsbGlzZWNvbmRzIGJ5XG4gICAgICogQHJldHVybnMgdGhlIGludGVydmFsLlxuICAgICAqXG4gICAgICovXG4gICAgZGlzcGxheShkZXN0aW5hdGlvbiwgaW50ZXJ2YWwgPSAxMDAsIHByZWNpc2lvbiA9IDEwMDApIHtcbiAgICAgICAgcmV0dXJuIHNldEludGVydmFsKCAoKT0+IHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZCh0aGlzLnRpbWUgLyBwcmVjaXNpb24pO1xuICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xuIl19
