(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
let imageGallery = require('./image-gallery.js');
let imageGalleryApp = require('./image-gallery-app.js');

//requires
let Desktop = require("./desktop.js");

//nodes
let mainMenu = document.querySelector("#windowSelector");
let subMenuTemplate = document.querySelector("#subMenu");
let windowSpace = document.querySelector("#openWindows");

//variables
let myDesktop;
let windowManager = Desktop.windowManager(windowSpace);


//set up event handler for sub-menu
let eventHandlerSubMenu = function (event) {
    let type = event.target.getAttribute('data-kind') || event.target.parentNode.getAttribute('data-kind');

    switch (event.target.getAttribute('data-task')) {
        case 'open':
            windowManager.createWindow(type).focus();
            break;
        case 'close':
            windowManager.close(type);
            break;
        case 'minimize':
            windowManager.minimize(type);
            break;
        case 'expand':
            windowManager.expand(type);
            break;
        default:
            break;
    }
    if (event.type === 'click') {
        event.preventDefault();
    }
};

let desktopConfig = {
    space: windowSpace,
    menu: mainMenu,
    windowManager: windowManager,
    subTemplate: subMenuTemplate,
    subHandler: eventHandlerSubMenu
};


//initiate desktop
myDesktop = new Desktop(desktopConfig);




},{"./desktop.js":2,"./draggable-window.js":3,"./expandable-menu-item.js":4,"./image-gallery-app.js":5,"./image-gallery.js":6,"./insta-chat-app.js":7,"./insta-chat.js":8,"./memory-app.js":9,"./memory-game.js":10}],2:[function(require,module,exports){
/**
 * A module for a class desktop.
 * Initiates a web desktop with a menu
 * and windows to open.
 *
 * @author Molly Arhammar
 * @version 1.0
 */


class Desktop {
    /**
     * Initiates the Desktop. Sets up event listeners
     * and adds sub-menu to the main menu items if such are provided.
     * @param desktopConfig {object} with params:
     * menu {[expandable-menu-item]},
     * space: {node} where the desktop windows lives
     * and optional:
     * windowManager: {object} a custom window manager that handles the windows, will otherwise be supplied
     * subTemplate: {document-fragment} a sub-menu to be added to each of the main menu items
     * subHandler {function} an event handler to be applies to the sub menu
     */
    constructor(desktopConfig) {
        let topWindow = 2; //to keep focused window on top

        let mainMenu = desktopConfig.menu;
        let windowSpace = desktopConfig.space;
        let windowManager = desktopConfig.windowManager || Desktop.windowManager(windowSpace); //supply windowManager if there is none
        let subMenuTemplate = desktopConfig.subTemplate;
        let subHandler = desktopConfig.subHandler;


        if (subMenuTemplate) { //there is a submenu
            //add the submenu
            Array.prototype.forEach.call(mainMenu.children, (node) => {
                let subMenu = document.importNode(subMenuTemplate.content, true);
                this.addSubMenu(node, subMenu, subHandler);
            });

            //add event handlers on the sub menu
            addEventListeners(mainMenu, 'click focusout', (event) => {
                let mainMenuItems = mainMenu.querySelectorAll('expandable-menu-item');
                mainMenuItems.forEach((item) => {
                    if ((item !== event.target && item !== event.target.parentElement) && (item.displayingSubMenu)) {
                        item.toggleSubMenu(false);
                    }
                })
            });
        }

        //open new window at double click
        mainMenu.addEventListener('dblclick', (event) => {
            let type = event.target.getAttribute("data-kind") || event.target.parentNode.getAttribute("data-kind");
            if (type) {
                windowManager.createWindow(type).focus();
            }
            event.preventDefault();
        });

        //put focused window on top
        windowSpace.addEventListener('focus', (event) => {
            if (event.target !== windowSpace) {
                event.target.style.zIndex = topWindow;
                topWindow += 1;
            }
        }, true);
    }

    /**
     * @param item {HTMLElement} the expandable-menu-item to add the sub-menu to
     * @param subMenu {HTMLElement} a template of the sub-menu
     * @param eventHandler {function} the event handler to be applied to the sub menu
     */
    addSubMenu(item, subMenu, eventHandler) {
        let label = item.getAttribute('label');

        Array.prototype.forEach.call(subMenu.children, (node) => {
            node.setAttribute('label', label);
        });

        item.appendChild(subMenu);

        item.addEventListener('click', eventHandler);
    }

    /**
     * creates a window manager to handle windows on the desktop.
     * @param windowSpace {HTMLElement} the space where the windows live
     * @returns {{createWindow: createWindow, openWindows: openWindows, expand: expand, minimize: minimize, close: close}} an
     * object with methods to expand, minimize, close all, open new, and get open windows of a certain type.
     */
    static windowManager(windowSpace) {
        //keep track of the window space
        let wm = {
            startX: windowSpace.offsetLeft + 20,
            startY: windowSpace.offsetTop + 20,
            types: 0
        };

        return {
            /**
             * Creates a new window and opens it in the window space.
             * @param type {string} the name of the html-element to create.
             * @returns {HTMLElement} the newly created window
             */
            createWindow: function (type) {
                let aWindow;
                if (!wm[type]) {
                    let linkTemplate = document.querySelector("#linkTemplate");
                    let link = document.importNode(linkTemplate.content.firstElementChild, true);
                    link.href = "/" + type + ".html";
                    document.head.appendChild(link);
                }

                aWindow = document.createElement(type);

                //import pictures for the image gallery
                if (type === 'image-gallery-app') {
                    if (document.querySelector('#pictures')) {
                        aWindow.appendChild(document.importNode(document.querySelector('#pictures').content, true));
                    }
                }

                windowSpace.appendChild(aWindow);
                setupSpace(type, aWindow);

                //keep track of the open windows
                if (wm[type].open) {
                    wm[type].open.push(aWindow);
                } else {
                    wm[type].open = [aWindow];
                }

                return aWindow;
            },
            /**
             * Gets the open windows of a type.
             * @param type {string} the name of the html-element to check for.
             * @returns {[HTMLElement]} a node list of the open windows of the type.
             */
            openWindows: function (type) {
                if (wm[type]) {
                    let result = [];
                    let windows = wm[type].open;
                    //filter out the one's that's been closed since the last time
                    result = windows.filter((w) => {
                        return w.open;
                    });
                    wm[type].open = result;
                    return result;
                } else {
                    return 0; //if no windows are open
                }
            },
            /**
             * Expands all minimized windows of a type.
             * @param type {string} the name of the html-element to expand.
             */
            expand: function (type) {
                let wins = this.openWindows(type);
                if (wins) {
                    wins.forEach((w) => {
                        w.minimized = false;
                    });
                }
            },
            /**
             * Minimizes all open windows of a type.
             * @param type {string} the name of the html-element to minimize.
             */
            minimize: function (type) {
                let wins = this.openWindows(type);
                if (wins) {
                    wins.forEach((w) => {
                        w.minimized = true;
                    });
                }
            },
            /**
             * Closes all open windows of a type.
             * @param type {string} the name of the html-element to close.
             */
            close: function (type) {
                let wins = this.openWindows(type);
                if (wins) {
                    console.log(wins);
                    wins.forEach((w) => {
                        w.close();
                    });
                }
            }
        };

        //helper functions
        // keeps track of the window space so the windows don't all
        //open on top of each other, and doesn't disappear out
        //of the space
        function setupSpace(type, space) {
            let destination = {};
            let x;
            let y;

            if (wm[type]) { //the type already exists
                destination.x = (wm[type].latestCoords.x += 50);  //create a new space to open the window
                destination.y = (wm[type].latestCoords.y += 50);

                if (!(withinBounds(space, windowSpace, destination))) { //check that the space is within bounds
                    x = wm[type].startCoords.x += 5;
                    y = wm[type].startCoords.y += 5;
                    wm[type].latestCoords.x = x;
                    wm[type].latestCoords.y = y;
                } else {
                    x = destination.x;
                    y = destination.y;
                }

            } else { //create a starting point for the windows of this type
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

        //checks if a space is within bounds
        function withinBounds(element, container, coords) {
            let minX = container.offsetLeft;
            let maxX = (minX + container.clientWidth) - (element.getBoundingClientRect().width);
            let minY = container.offsetTop;
            let maxY = (minY + container.clientHeight) - (element.getBoundingClientRect().height);

            return (coords.x <= maxX && coords.x >= minX && coords.y <= maxY && coords.y >= minY);
        }
    }
}


//helper function to add more than one event type for each element and handler
function addEventListeners (element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}

//export
module.exports = Desktop;

},{}],3:[function(require,module,exports){
/*
* A module for a custom HTML element draggable-window to form part of a web component.
* It creates a window that can be moved across the screen, closed and minimized.
* @author Molly Arhammar
* @version 1.0.0
*
*/

class DraggableWindow extends HTMLElement {
    /**
     * Initiates a draggable-window, sets up shadow DOM.
     */
    constructor() {
        super();
        let windowTemplate = document.querySelector('link[href="/draggable-window.html"]').import.querySelector("#windowTemplate"); //shadow DOM import

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
        if (this.open) {
            this.open = false;
            this.minimized = false;
            if (this.parentElement) {
                this.parentNode.removeChild(this);
            } else if (this.parentNode.host && this.parentNode.host.parentNode) { //this is part of a shadow dom
                this.parentNode.host.parentNode.removeChild(this.parentNode.host);
            }
        }
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
        addEventListeners(el, 'focusin mousedown', ((event) => {
            let target = event;
            arrowDrag = true;
            if (event.type === 'mousedown') {
                mouseDrag = true;
                dragoffset.x = target.pageX - el.offsetLeft;
                dragoffset.y = target.pageY - el.offsetTop;
            }
        }));
        addEventListeners(el, 'focusout mouseup', ((event) => {
            if (event.type === 'mouseup') {
                if (mouseDrag) {
                    mouseDrag = false;
                }
            } else {
                arrowDrag = false;
            }
        }));
        addEventListeners(document, 'mousemove keydown', ((event) => {
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

    //initiate a mouse event from the touch
    function touchHandler(event) {
        if (event.target.assignedSlot && event.target.assignedSlot.name === 'title') { //only drag from the title bar on touch, as to not interrupt scrolling
            let touches = event.changedTouches;
            let first = touches[0];
            let type = "";

            switch (event.type) {
                case "touchstart":
                    type = "mousedown";
                    break;
                case "touchmove":
                    type = "mousemove";
                    break;
                case "touchend":
                    type = "mouseup";
                    break;
                default:
                    return;
            }

            //set up the event
            let simulatedEvent = new MouseEvent(type, {
                screenX: first.screenX,
                screenY: first.screenY,
                clientX: first.clientX,
                clientY: first.clientY,
                button: 1,
                bubbles: true

            });

            el.dispatchEvent(simulatedEvent);
        }
    }

    function touchevents() {
        el.addEventListener("touchstart", touchHandler, true);
        document.addEventListener("touchmove", touchHandler, true);
        el.addEventListener("touchend", touchHandler, true);
        document.addEventListener("touchcancel", touchHandler, true);
    }

    events();
    touchevents();
}

//helper function
//adds multiple event listeners with identical handlers
function addEventListeners(element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}

//defines the element
customElements.define('draggable-window', DraggableWindow);

},{}],4:[function(require,module,exports){
/*
 * A module for a custom HTML element expandable-menu-item form part of a web component.
 * It creates an item that when clicked toggles to show or hide sub-items.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

class ExpandableMenuItem extends HTMLElement {
    /**
     * Initiates a draggable-window, sets up shadow DOM.
     */
    constructor() {
        super();
        let menuTemplate = document.querySelector('link[href="/expandable-menu-item.html"]').import.querySelector("#menuItemTemplate"); //shadow DOM import

        //set up shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open"});
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

//helper functions

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
            item.focused = element;
        } else {
            sub.removeAttribute('focused');
        }
    });
}

},{}],5:[function(require,module,exports){
/*
 * A module for a custom HTML element image-gallery-app to form part of a web component.
 * It combined the component image-gallery with the component draggable-window, to
 * make an image gallery in a window with an added menu.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

class ImageGalleryApp extends HTMLElement {
    /**
     * Initiates a gallery-window, sets up shadow DOM.
     */
    constructor() {
        super();
        let galleryWindowTemplate = document.querySelector('link[href="/image-gallery-app.html"]').import.querySelector('#galleryWindowTemplate');

        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = galleryWindowTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

        this.images = [];
    }

    /**
     * Runs when gallery is inserted into the DOM.
     * Sets up event listeners for
     * the menu.
     */
    connectedCallback() {
        let imageGallery = this.shadowRoot.querySelector('image-gallery');
        let aboutspace = this.shadowRoot.querySelector('#about');

        let galleryOption = this.shadowRoot.querySelector('[label="gallery"]');
        let quitOption = this.shadowRoot.querySelector('[label="quit"]');
        let aboutOption = this.shadowRoot.querySelector('[label="about"]');

        this.updateImages();

        //menu event listeners. add separate ones for accessibility reasons with web components.
        quitOption.addEventListener('click', (event) => {
            let target = event.target.focused || event.target.querySelector('[data-task]') || event.target; //shadow DOM accessibility issues
            let task = target.getAttribute('data-task');
            if (task) {
                switch (task) {
                    case 'quit':
                        this.close();
                        break;
                }
            }
        }, true);

        //menu event listener
        galleryOption.addEventListener('click', (event) => {
            let target = event.target.querySelector('[data-task]') || event.target; //shadow DOM accessibility issues
            let task = target.getAttribute('data-task');
            if (task) {
                switch (task) {
                    case 'gallery':
                        aboutspace.classList.add('hide');
                        imageGallery.classList.remove('hide');
                        imageGallery.showThumbnails();
                        break;
                }
            }
        });

        //menu event listener
        aboutOption.addEventListener('click', (event) => {
            let target = event.target.querySelector('[data-task]') || event.target; //shadow DOM accessibility issues
            let task = target.getAttribute('data-task');
            if (task) {
                switch (task) {
                    case 'about':
                        imageGallery.classList.add('hide');
                        aboutspace.classList.remove('hide');
                        break;
                }
            }
        });
    }

    /**
     * Gets all the added images
     * @returns {NodeList} a list of all the image elements that are
     * children of the gallery.
     */
    getImages() {
        return this.querySelectorAll('img');
    }

    /**
     * Gets all the imagedescriptions.
     * @returns {NodeList} a list of all the p elements that are
     * children of the gallery and has a for-attribute.
     */
    getDescriptions() {
        return this.querySelectorAll('p[for]');
    }

    /**
     * Matches descriptions with image-sources via the matching for- and label- attributes
     * on the p and img elements respectively.
     */
    updateImages() {
        let imgTemplate = document.querySelector('link[href="/image-gallery-app.html"]').import.querySelector("#imgTemplate"); //shadow DOM import
        let imageGallery = this.shadowRoot.querySelector('image-gallery');

        this.images = this.images.concat(Array.prototype.slice.call(this.getImages()));
        this.descriptions = this.getDescriptions();

        this.images.forEach((image) => {
            let container = imgTemplate.content.cloneNode(true);
            container.firstElementChild.replaceChild(image, container.firstElementChild.querySelector('img'));
            container.removeChild(container.querySelector('p'));
            imageGallery.appendChild(container);
        });

        Array.prototype.forEach.call(this.descriptions, (description) => {
            imageGallery.appendChild(description);
        });
    }

    /**
     * @returns true if the window containing the app is open.
     */
    get open() {
        return this.shadowRoot.querySelector('draggable-window').open;
    }

    /**
     * @returns true if the window containing the app is minimized.
     */
    get minimized() {
        return this.shadowRoot.querySelector('draggable-window').minimized;
    }

    /**
     * Sets the minimized property of the window containing the app.
     * @param minimize {boolean} whether to minimize
     */
    set minimized(minimize) {
        this.shadowRoot.querySelector('draggable-window').minimized = minimize;
    }

    /**
     * Closes the window containing the app.
     */
    close() {
        this.shadowRoot.querySelector('draggable-window').close();
    }

}


//define the element
customElements.define('image-gallery-app', ImageGalleryApp);

},{}],6:[function(require,module,exports){
/*
 * A module for a custom HTML element image-gallery to form part of a web component.
 * It creates a gallery that displays clickable images as thumbnails.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

class ImageGallery extends HTMLElement {
    /**
     * Initiates a gallery, sets up shadow DOM.
     */
    constructor() {
        super();
        let galleryTemplate = document.querySelector('link[href="/image-gallery-app.html"]').import.querySelector('link[href="/image-gallery.html"]').import.querySelector("#galleryTemplate"); //shadow DOM import

        //setup shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = galleryTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

    }

    /**
     * Runs when gallery is inserted into the DOM.
     * Sets up event listeners and tracks the picture sources.
     */
    connectedCallback() {
        let gallery = this.shadowRoot.querySelector('#gallery');
        let imageDisplay = this.shadowRoot.querySelector('#imageDisplay');
        let localNav = this.shadowRoot.querySelector('#localNav');

        //make array of all the picture sources for traversing
        this.pictureSources = [];
        Array.prototype.forEach.call(this.querySelectorAll('[slot ="picture"'), (a) => {
            if (a.hasAttribute('src') && this.pictureSources.indexOf(a.getAttribute('src')) === -1) {
                this.pictureSources.push(a.getAttribute('src'));
            } else if (a.firstElementChild && a.firstElementChild.hasAttribute('src') && this.pictureSources.indexOf(a.firstElementChild.getAttribute('src')) === -1) {
                this.pictureSources.push(a.firstElementChild.getAttribute('src'));
            }
        });

        gallery.addEventListener('click', (event) => {
            let src = event.target.getAttribute('src') || event.target.firstElementChild.getAttribute('src');

            if (src) {
                gallery.classList.add('hide');
                imageDisplay.classList.remove('hide');
                this.displayPicture(src, imageDisplay);
            }
        });

        localNav.addEventListener('click', (event) => {
                let task = event.target.getAttribute('data-task');
                let currentPicture = imageDisplay.querySelector('img.displayed');
                let currentPictureSrc = currentPicture.getAttribute('src');
                let nextPictureSrc;

               if (this.querySelectorAll('[slot ="picture"').length !== this.pictureSources.length) { //check if more pictures has been added
                    Array.prototype.forEach.call(this.querySelectorAll('[slot ="picture"'), (a) => { //in that case update sourcelist
                        let src = a.getAttribute('src') || a.firstElementChild.getAttribute('src');
                        if (this.pictureSources.indexOf(src) === -1) {
                            this.pictureSources.push(src);
                        }
                    });
                }

                //traverse through the picture sources
                switch (task) {
                    case 'forward':
                        nextPictureSrc = this.pictureSources.indexOf(currentPictureSrc) + 1;
                        if (nextPictureSrc === this.pictureSources.length) {
                            nextPictureSrc = 0;
                        }
                        nextPictureSrc = this.pictureSources[nextPictureSrc];
                        this.displayPicture(nextPictureSrc, imageDisplay);
                        break;
                    case 'back':
                        nextPictureSrc = this.pictureSources.indexOf(currentPictureSrc) - 1;
                        if (nextPictureSrc < 0) {
                            nextPictureSrc = this.pictureSources.length - 1;
                        }
                        nextPictureSrc = this.pictureSources[nextPictureSrc];
                        this.displayPicture(nextPictureSrc, imageDisplay);
                        break;
                    case 'gallery':
                       this.showThumbnails();
                        break;
                }
        });

        //show full image in separate window if clicked
        imageDisplay.querySelector('a.displayed').addEventListener('click', (event) => {
            let src = event.target.src || event.target.href;
            if (src) {
                open(src);
            }
        });

    }

    /**
     * Displays an image with a description. Description has to have
     * a for-attribute that matches the images label-attribute.
     * @param src {string} the source of the picture to display
     * @param destination {HTMLElement} where to display the image.
     */
    displayPicture(src, destination) {
        let display = destination;
        let img = display.querySelector('img.displayed');
        let a = display.querySelector('a.displayed');
        let p = display.querySelector('p#description');

        let current = this.querySelector('[src="' + src + '"]');
        let label = current.getAttribute('label');
        let descriptionFor = "[for='" + label + "']";
        let description = this.querySelector(descriptionFor).textContent;

        img.src = src;
        a.href = src;
        p.textContent = description;
    }

    /**
     * Shows clickable thumbnails of all the images in the gallery.
     */
    showThumbnails() {
        let gallery = this.shadowRoot.querySelector('#gallery');
        let imageDisplay = this.shadowRoot.querySelector('#imageDisplay');

        gallery.classList.remove('hide');
        imageDisplay.classList.add('hide');

    }
}


//defines the element
customElements.define('image-gallery', ImageGallery);

},{}],7:[function(require,module,exports){
/*
 * A module for a custom HTML element insta-chat-app to form part of a web component.
 * It combined the component insta-chat with the component draggable-window, to
 * make a chat in a window with an added menu.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

let InstaChat = require('./insta-chat.js');

class InstaChatApp extends HTMLElement {
    /**
     * Initiates a chat-window, sets up shadow DOM.
     */
    constructor() {
        super();
        let chatWindowTemplate = document.querySelector('link[href="/insta-chat-app.html"]').import.querySelector("#chatWindowTemplate"); //shadow DOM import

        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = chatWindowTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
    }

    /**
     * Runs when chat is inserted into the DOM.
     * Sets up event listeners for
     * the menu, and prints messages
     * saved in local storage if any.
     */
    connectedCallback() {
        //initiate the chat
        let chatspace;

        let namespace = this.shadowRoot.querySelector('#submitName');
        let aboutspace = this.shadowRoot.querySelector('#about');
        let socketspace = this.shadowRoot.querySelector('#chooseSocket');

        let chatoption = this.shadowRoot.querySelector('[label="chat"]');
        let aboutoption = this.shadowRoot.querySelector('[label="about"]');
        let optionoption = this.shadowRoot.querySelector('[label="options"]');

        //check if a socket has already been chosen
        if (localStorage.chatConfig) {
            let config = JSON.parse(localStorage.chatConfig);
            chatspace = new InstaChat(config);

            chatspace.setAttribute('slot', 'content');
            this.shadowRoot.querySelector('draggable-window').appendChild(chatspace);

            //print the last twenty messages from last time
            let messages = chatspace.messageManager.getChatLog().reverse();
            if (messages.length > 0) {
                messages.forEach((message) => {
                    chatspace.print(message);
                });
            }

            //scroll down when window has been rendered
            setTimeout(() => {
                chatspace.shadowRoot.querySelector('#messageWindow').scrollTop = chatspace.shadowRoot.querySelector('#messageWindow').scrollHeight;
            }, 10);

            aboutspace.classList.add('hide');
            socketspace.classList.add('hide');
            namespace.classList.add('hide');
            chatspace.classList.remove('hide');
        } else { //ask for a socket
            aboutspace.classList.add('hide');
            socketspace.classList.remove('hide');
            namespace.classList.add('hide');
        }

        socketspace.querySelector('button').addEventListener('click', (event) => {
            let address = socketspace.querySelector('input#address').value;
            let channel = socketspace.querySelector('input#channel').value;
            let apikey = socketspace.querySelector('input#apikey').value;
            let name = socketspace.querySelector('input#name').value;

            let config = {
                url: address,
                channel: channel,
                key: apikey,
                name: name
            };

            localStorage.chatConfig = JSON.stringify(config);

            chatspace = new InstaChat(config);

            chatspace.setAttribute('slot', 'content');
            this.shadowRoot.querySelector('draggable-window').appendChild(chatspace);

            chatspace.classList.remove('hide');
            namespace.classList.add('hide');
            aboutspace.classList.add('hide');
            socketspace.classList.add('hide');
        });

        namespace.querySelector('button').addEventListener('click', (event) => {
            let name = namespace.querySelector('input').value;
            chatspace.changeConfig({name: name});
            let config = JSON.parse(localStorage.chatConfig);
            config.name = name;
            localStorage.chatConfig = JSON.stringify(config);
            namespace.classList.add('hide');
            aboutspace.classList.add('hide');
            socketspace.classList.add('hide');
            chatspace.classList.remove('hide');
        });

        //event listeners for menu, add separate ones for accessibility reasons
        optionoption.addEventListener('click', (event) => {
            let target = event.target.focused || event.target.querySelector('[data-task]') || event.target;
            let task = target.getAttribute('data-task');
            if (target.getAttribute('data-task')) {
                switch (target.getAttribute('data-task')) {
                    case 'namechange':
                        chatspace.classList.add('hide');
                        aboutspace.classList.add('hide');
                        socketspace.classList.add('hide');
                        namespace.classList.remove('hide');
                        break;
                    case 'socketchange':
                        chatspace.classList.add('hide');
                        aboutspace.classList.add('hide');
                        namespace.classList.add('hide');
                        socketspace.classList.remove('hide');
                        break;
                    case 'quit':
                        this.close();
                        break;
                }
            }
        });

        //avent listener for menu
        aboutoption.addEventListener('click', (event) => {
            let target = event.target.focused || event.target.querySelector('[data-task]') || event.target;
            let task = target.getAttribute('data-task');
            if (target.getAttribute('data-task')) {
                switch (target.getAttribute('data-task')) {
                    case 'about':
                        namespace.classList.add('hide');
                        chatspace.classList.add('hide');
                        socketspace.classList.add('hide');
                        aboutspace.classList.remove('hide');
                        break;
                }
            }
        });

        //event listener for menu
        chatoption.addEventListener('click', (event) => {
            let target = event.target.focused || event.target.querySelector('[data-task]') || event.target;
            let task = target.getAttribute('data-task');
            if (target.getAttribute('data-task')) {
                switch (target.getAttribute('data-task')) {
                    case 'chat':
                        if (chatspace) {
                            chatspace.classList.remove('hide');
                            aboutspace.classList.add('hide');
                            socketspace.classList.add('hide');
                            namespace.classList.add('hide');
                            break;
                        }
                }
            }
        });
    }

    /**
     * Runs when app is removed from the DOM.
     * Closes the window and the web socket.
     */
    disconnectedCallback() {
        this.close();
    }

    /**
     * @returns true if the window containing the app is open.
     */
    get open() {
        return this.shadowRoot.querySelector('draggable-window').open;
    }

    /**
     * @returns true if the window containing the app is minimized.
     */
    get minimized() {
        return this.shadowRoot.querySelector('draggable-window').minimized;
    }

    /**
     * Sets the minimized property of the window containing the app.
     * @param minimize {boolean} whether to minimize
     */
    set minimized(minimize) {
        if (minimize) {
            this.shadowRoot.querySelector('draggable-window').minimized = true;
        } else {
            this.shadowRoot.querySelector('draggable-window').minimized = false;
        }

    }

    /**
     * Closes the window and the web socket.
     */
    close() {
        this.shadowRoot.querySelector('draggable-window').close();
        this.shadowRoot.querySelector('insta-chat').socket.close();
    }
}

//defines the element
customElements.define('insta-chat-app', InstaChatApp);


module.exports = InstaChatApp;

},{"./insta-chat.js":8}],8:[function(require,module,exports){
/*
 * A module for a custom HTML element insta-chat to form part of a web component.
 * It creates a chat connected to a web socket that sends, receives and prints
 * messages.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

class InstaChat extends HTMLElement {
    /**
     * Initiates a chat, sets up shadow DOM.
     * @param config {object} a config object with the websockets url, channel, key and a name for the user
     * @param startMessages {[Object]} messages to print at the start of the chat.
     */
    constructor(config = {}, startMessages) {
        super();
        let chatTemplate = document.querySelector('link[href="/insta-chat-app.html"]').import.querySelector('link[href="/insta-chat.html"]').import.querySelector("#chatTemplate"); //shadow DOM import

        //setup shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = chatTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

        //set config object as this.config
        this.config = {
            url: config.url || '',
            name: config.name || 'severus snape',
            channel: config.channel || '',
            key: config.key || ''
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
            if (socket && socket.readyState && socket.url === this.config.url) {
                resolve(socket);
            } else {
                socket = new WebSocket(this.config.url);

                socket.addEventListener('open', () => {
                    resolve(socket);
                });

                socket.addEventListener('error', (event) => {
                    reject(new Error('could not connect to server'));
                });

                socket.addEventListener('message', (event) => {
                    let response = JSON.parse(event.data);
                    if (response.type === 'message') {
                        this.print(response);
                        this.messageManager.setChatLog(response); //save message in local storage
                    } else if (response.type === 'heartbeat') {
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
        let messageTemplate = document.querySelector('link[href="/insta-chat-app.html"]').import.querySelector('link[href="/insta-chat.html"]').import.querySelector("#messageTemplate"); //message display template

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

                if (storage.unsent) {
                    oldMessages = JSON.parse(storage.unsent);
                } else {
                    oldMessages = [];
                }

                oldMessages.unshift(message);

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

                oldMessages.unshift(message);

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

module.exports = InstaChat;

},{}],9:[function(require,module,exports){
/*
 * A module for a custom HTML element memory-app to form part of a web component.
 * It combines the component memory-game with the component draggable-window, to
 * make a chat in a window with an added menu.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

class MemoryApp extends HTMLElement {
    /**
     * Initiates a memory-window, sets up shadow DOM.
     */
    constructor() {
        super();
        let memoryWindowTemplate = document.querySelector('link[href="/memory-app.html"]').import.querySelector("#memoryWindowTemplate");

        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = memoryWindowTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
    }

    /**
     * Runs when memory-app is inserted into the DOM.
     * Sets up event listeners for
     * the menu and game board size.
     */
    connectedCallback() {
        let gamespace = this.shadowRoot.querySelector('memory-game');
        let highscorespace = this.shadowRoot.querySelector('#highscores');
        let aboutspace = this.shadowRoot.querySelector('#about');

        let game = this.shadowRoot.querySelector('memory-game');
        let gameOptions = this.shadowRoot.querySelector('[label="game"]');
        let highscoresOption = this.shadowRoot.querySelector('[label="highscore"]');
        let aboutOption = this.shadowRoot.querySelector('[label="about"]');

        //menu event listeners, add separate ones for accessibility reasons
        gameOptions.addEventListener('click', (event) => {
            let target = event.target.focused || event.target.querySelector('[data-task]') || event.target; //shadow DOM accessibility issues
            let task = target.getAttribute('data-task');
                if (task) {
                    switch (task) {
                        case 'restart':
                            gamespace.classList.remove('hide');
                            highscorespace.classList.add('hide');
                            aboutspace.classList.add('hide');
                            gamespace.replay();
                            break;
                        case 'new':
                            gamespace.classList.remove('hide');
                            highscorespace.classList.add('hide');
                            aboutspace.classList.add('hide');
                            gamespace.restart();
                            break;
                        case 'quit':
                            this.close();
                            break;
                    }
                }
        }, true);

        //menu event listener
        highscoresOption.addEventListener('click', (event) => {
            let target = event.target.querySelector('[data-task]') || event.target; //shadow DOM accessibility issues
            let task = target.getAttribute('data-task');
            if (task) {
                switch (task) {
                    case 'highscores':
                        game.end();
                        this.updateHighscores(game.result);
                        gamespace.classList.add('hide');
                        highscorespace.classList.remove('hide');
                        aboutspace.classList.add('hide');
                        break;
                }
            }
        });

        //menu event listener
        aboutOption.addEventListener('click', (event) => {
            let target = event.target.querySelector('[data-task]') || event.target; //shadow DOM accessibility issues
            let task = target.getAttribute('data-task');
            if (task) {
                switch (task) {
                    case 'about':
                        gamespace.classList.add('hide');
                        highscorespace.classList.add('hide');
                        aboutspace.classList.remove('hide');
                        break;
                }
            }
        });

        //board size event listener
        this.addEventListener('click', (event) => {
            let target = event.path[0];
            if (target.getAttribute('boardsize')) {
                this.user = this.shadowRoot.querySelector('#intro input').value || 'stranger'; //get the name when board size is chosen
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

    /**
     * Runs when app is removed from the DOM.
     * Closes the window.
     */
    disconnectedCallback() {
        this.close();
    }

    /**
     * Updates highscores by setting them in the local storage
     * and displaying dem.
     * @param result
     */
    updateHighscores(result) {
        let highscoresTemplate = document.querySelector('link[href="/memory-app.html"]').import.querySelector("#highscoresTemplate");

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

                newHighScores = oldHighScores.sort((a, b) => { //sort
                    return a.score - b.score;
                });

                if (newHighScores.length > 5) { //keep the list to 5 scores
                    newHighScores.length = 5;
                }

                this.storage.memoryHighScores = JSON.stringify(newHighScores);
            }
        };

        if (result) { //a new result is present
            let score = (result.turns * result.time) / (this.shadowRoot.querySelector('memory-game').height * this.shadowRoot.querySelector('memory-game').width);
            highscores.setHighScores(this.user, score);
            this.shadowRoot.querySelector('memory-game').result = undefined; //clean the result
        }

        //display the scores
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

    /**
     * @returns true if the window containing the app is open.
     */
    get open() {
        return this.shadowRoot.querySelector('draggable-window').open;
    }

    /**
     * @returns true if the window containing the app is minimized.
     */
    get minimized() {
        return this.shadowRoot.querySelector('draggable-window').minimized;
    }

    /**
     * Sets the minimized property of the window containing the app.
     * @param minimize {boolean} whether to minimize
     */
    set minimized(minimize) {
        this.shadowRoot.querySelector('draggable-window').minimized = minimize;
    }

    /**
     * Removes the node and closes the window.
     */
    close() {
        this.parentNode.removeChild(this);
        this.shadowRoot.querySelector('draggable-window').close();
    }

}

//helper function
//adds multiple event listeners with identical handlers
function addEventListeners(element, events, handler) {
    events.split(' ').forEach(event => element.addEventListener(event, handler));
}

//define the element
customElements.define('memory-app', MemoryApp);

},{}],10:[function(require,module,exports){
/*
 * A module for a custom HTML element memory-game to form part of a web component.
 * It creates a memory game with a timer a a turn-counter. The game is over when
 * all bricks have been paired and stores the total time and turns in a result-variable.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

//requires
let Timer = require('./timer.js');


class MemoryGame extends HTMLElement {
    /**
     * Initiates a memory game, sets up shadow DOM.
     */
    constructor(width, height) {
        super();
        let memoryTemplate = document.querySelector('link[href="/memory-app.html"]').import.querySelector('link[href="/memory-game.html"]').import.querySelector("#memoryTemplate"); //shadow DOM import

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
        let brickTemplate = document.querySelector('link[href="/memory-app.html"]').import.querySelector('link[href="/memory-game.html"]').import.querySelector("#brickTemplate"); //brick template

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
            brick.removeAttribute('hidden');
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
                        img1.parentElement.parentElement.setAttribute('hidden', '');
                        img2.parentElement.parentElement.setAttribute('hidden', '');
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

},{"./timer.js":11}],11:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kcmFnZ2FibGUtd2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9leHBhbmRhYmxlLW1lbnUtaXRlbS5qcyIsImNsaWVudC9zb3VyY2UvanMvaW1hZ2UtZ2FsbGVyeS1hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2ltYWdlLWdhbGxlcnkuanMiLCJjbGllbnQvc291cmNlL2pzL2luc3RhLWNoYXQtYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9pbnN0YS1jaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnktYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnktZ2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGltZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogU3RhcnRpbmcgcG9pbnQgZnByIHRoZSBhcHBsaWNhdGlvbi5cbiAqIFRoZSBhcHBsaWNhdGlvbiB3b3VsZCB3b3JrIGJldHRlciB3aGVuIHVzZWQgd2l0aCBIVFRQMlxuICogZHVlIHRvIHRoZSBmYWN0IHRoYXQgaXQgbWFrZXMgdXNlIG9mIHdlYi1jb21wb25lbnRzLFxuICogYnV0IGl0J3MgYmVlbiBidWlsdCB3aXRoIGJyb3dzZXJpZnkgdG8gd29yayBhcyBhXG4gKiBub3JtYWwgSFRUUDEgYXBwbGljYXRpb24gaW4gbGlldSBvZiB0aGlzLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wXG4gKi9cblxuXG4vL3RvIG1ha2Ugd2ViIGNvbXBvbmVudHMgd29yayB3aXRoIGJyb3dzZXJpZnlcbmxldCB3aW5kb3cgPSByZXF1aXJlKCcuL2RyYWdnYWJsZS13aW5kb3cuanMnKTtcbmxldCBtZW51ID0gcmVxdWlyZShcIi4vZXhwYW5kYWJsZS1tZW51LWl0ZW0uanNcIik7XG5sZXQgbWVtb3J5R2FtZSA9IHJlcXVpcmUoJy4vbWVtb3J5LWdhbWUuanMnKTtcbmxldCBtZW1vcnlBcHAgPSByZXF1aXJlKCcuL21lbW9yeS1hcHAuanMnKTtcbmxldCBpbnN0YUNoYXQ9IHJlcXVpcmUoJy4vaW5zdGEtY2hhdC5qcycpO1xubGV0IGluc3RhQ2hhdEFwcCA9IHJlcXVpcmUoJy4vaW5zdGEtY2hhdC1hcHAuanMnKTtcbmxldCBpbWFnZUdhbGxlcnkgPSByZXF1aXJlKCcuL2ltYWdlLWdhbGxlcnkuanMnKTtcbmxldCBpbWFnZUdhbGxlcnlBcHAgPSByZXF1aXJlKCcuL2ltYWdlLWdhbGxlcnktYXBwLmpzJyk7XG5cbi8vcmVxdWlyZXNcbmxldCBEZXNrdG9wID0gcmVxdWlyZShcIi4vZGVza3RvcC5qc1wiKTtcblxuLy9ub2Rlc1xubGV0IG1haW5NZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dTZWxlY3RvclwiKTtcbmxldCBzdWJNZW51VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N1Yk1lbnVcIik7XG5sZXQgd2luZG93U3BhY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI29wZW5XaW5kb3dzXCIpO1xuXG4vL3ZhcmlhYmxlc1xubGV0IG15RGVza3RvcDtcbmxldCB3aW5kb3dNYW5hZ2VyID0gRGVza3RvcC53aW5kb3dNYW5hZ2VyKHdpbmRvd1NwYWNlKTtcblxuXG4vL3NldCB1cCBldmVudCBoYW5kbGVyIGZvciBzdWItbWVudVxubGV0IGV2ZW50SGFuZGxlclN1Yk1lbnUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBsZXQgdHlwZSA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEta2luZCcpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1raW5kJyk7XG5cbiAgICBzd2l0Y2ggKGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICAgICAgd2luZG93TWFuYWdlci5jcmVhdGVXaW5kb3codHlwZSkuZm9jdXMoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgICAgICB3aW5kb3dNYW5hZ2VyLmNsb3NlKHR5cGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21pbmltaXplJzpcbiAgICAgICAgICAgIHdpbmRvd01hbmFnZXIubWluaW1pemUodHlwZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZXhwYW5kJzpcbiAgICAgICAgICAgIHdpbmRvd01hbmFnZXIuZXhwYW5kKHR5cGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG59O1xuXG5sZXQgZGVza3RvcENvbmZpZyA9IHtcbiAgICBzcGFjZTogd2luZG93U3BhY2UsXG4gICAgbWVudTogbWFpbk1lbnUsXG4gICAgd2luZG93TWFuYWdlcjogd2luZG93TWFuYWdlcixcbiAgICBzdWJUZW1wbGF0ZTogc3ViTWVudVRlbXBsYXRlLFxuICAgIHN1YkhhbmRsZXI6IGV2ZW50SGFuZGxlclN1Yk1lbnVcbn07XG5cblxuLy9pbml0aWF0ZSBkZXNrdG9wXG5teURlc2t0b3AgPSBuZXcgRGVza3RvcChkZXNrdG9wQ29uZmlnKTtcblxuXG5cbiIsIi8qKlxuICogQSBtb2R1bGUgZm9yIGEgY2xhc3MgZGVza3RvcC5cbiAqIEluaXRpYXRlcyBhIHdlYiBkZXNrdG9wIHdpdGggYSBtZW51XG4gKiBhbmQgd2luZG93cyB0byBvcGVuLlxuICpcbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMFxuICovXG5cblxuY2xhc3MgRGVza3RvcCB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIHRoZSBEZXNrdG9wLiBTZXRzIHVwIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqIGFuZCBhZGRzIHN1Yi1tZW51IHRvIHRoZSBtYWluIG1lbnUgaXRlbXMgaWYgc3VjaCBhcmUgcHJvdmlkZWQuXG4gICAgICogQHBhcmFtIGRlc2t0b3BDb25maWcge29iamVjdH0gd2l0aCBwYXJhbXM6XG4gICAgICogbWVudSB7W2V4cGFuZGFibGUtbWVudS1pdGVtXX0sXG4gICAgICogc3BhY2U6IHtub2RlfSB3aGVyZSB0aGUgZGVza3RvcCB3aW5kb3dzIGxpdmVzXG4gICAgICogYW5kIG9wdGlvbmFsOlxuICAgICAqIHdpbmRvd01hbmFnZXI6IHtvYmplY3R9IGEgY3VzdG9tIHdpbmRvdyBtYW5hZ2VyIHRoYXQgaGFuZGxlcyB0aGUgd2luZG93cywgd2lsbCBvdGhlcndpc2UgYmUgc3VwcGxpZWRcbiAgICAgKiBzdWJUZW1wbGF0ZToge2RvY3VtZW50LWZyYWdtZW50fSBhIHN1Yi1tZW51IHRvIGJlIGFkZGVkIHRvIGVhY2ggb2YgdGhlIG1haW4gbWVudSBpdGVtc1xuICAgICAqIHN1YkhhbmRsZXIge2Z1bmN0aW9ufSBhbiBldmVudCBoYW5kbGVyIHRvIGJlIGFwcGxpZXMgdG8gdGhlIHN1YiBtZW51XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZGVza3RvcENvbmZpZykge1xuICAgICAgICBsZXQgdG9wV2luZG93ID0gMjsgLy90byBrZWVwIGZvY3VzZWQgd2luZG93IG9uIHRvcFxuXG4gICAgICAgIGxldCBtYWluTWVudSA9IGRlc2t0b3BDb25maWcubWVudTtcbiAgICAgICAgbGV0IHdpbmRvd1NwYWNlID0gZGVza3RvcENvbmZpZy5zcGFjZTtcbiAgICAgICAgbGV0IHdpbmRvd01hbmFnZXIgPSBkZXNrdG9wQ29uZmlnLndpbmRvd01hbmFnZXIgfHwgRGVza3RvcC53aW5kb3dNYW5hZ2VyKHdpbmRvd1NwYWNlKTsgLy9zdXBwbHkgd2luZG93TWFuYWdlciBpZiB0aGVyZSBpcyBub25lXG4gICAgICAgIGxldCBzdWJNZW51VGVtcGxhdGUgPSBkZXNrdG9wQ29uZmlnLnN1YlRlbXBsYXRlO1xuICAgICAgICBsZXQgc3ViSGFuZGxlciA9IGRlc2t0b3BDb25maWcuc3ViSGFuZGxlcjtcblxuXG4gICAgICAgIGlmIChzdWJNZW51VGVtcGxhdGUpIHsgLy90aGVyZSBpcyBhIHN1Ym1lbnVcbiAgICAgICAgICAgIC8vYWRkIHRoZSBzdWJtZW51XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKG1haW5NZW51LmNoaWxkcmVuLCAobm9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBzdWJNZW51ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShzdWJNZW51VGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRTdWJNZW51KG5vZGUsIHN1Yk1lbnUsIHN1YkhhbmRsZXIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vYWRkIGV2ZW50IGhhbmRsZXJzIG9uIHRoZSBzdWIgbWVudVxuICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMobWFpbk1lbnUsICdjbGljayBmb2N1c291dCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBtYWluTWVudUl0ZW1zID0gbWFpbk1lbnUucXVlcnlTZWxlY3RvckFsbCgnZXhwYW5kYWJsZS1tZW51LWl0ZW0nKTtcbiAgICAgICAgICAgICAgICBtYWluTWVudUl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChpdGVtICE9PSBldmVudC50YXJnZXQgJiYgaXRlbSAhPT0gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQpICYmIChpdGVtLmRpc3BsYXlpbmdTdWJNZW51KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vb3BlbiBuZXcgd2luZG93IGF0IGRvdWJsZSBjbGlja1xuICAgICAgICBtYWluTWVudS5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHR5cGUgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1raW5kXCIpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZShcImRhdGEta2luZFwiKTtcbiAgICAgICAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgd2luZG93TWFuYWdlci5jcmVhdGVXaW5kb3codHlwZSkuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vcHV0IGZvY3VzZWQgd2luZG93IG9uIHRvcFxuICAgICAgICB3aW5kb3dTcGFjZS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gd2luZG93U3BhY2UpIHtcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQuc3R5bGUuekluZGV4ID0gdG9wV2luZG93O1xuICAgICAgICAgICAgICAgIHRvcFdpbmRvdyArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gaXRlbSB7SFRNTEVsZW1lbnR9IHRoZSBleHBhbmRhYmxlLW1lbnUtaXRlbSB0byBhZGQgdGhlIHN1Yi1tZW51IHRvXG4gICAgICogQHBhcmFtIHN1Yk1lbnUge0hUTUxFbGVtZW50fSBhIHRlbXBsYXRlIG9mIHRoZSBzdWItbWVudVxuICAgICAqIEBwYXJhbSBldmVudEhhbmRsZXIge2Z1bmN0aW9ufSB0aGUgZXZlbnQgaGFuZGxlciB0byBiZSBhcHBsaWVkIHRvIHRoZSBzdWIgbWVudVxuICAgICAqL1xuICAgIGFkZFN1Yk1lbnUoaXRlbSwgc3ViTWVudSwgZXZlbnRIYW5kbGVyKSB7XG4gICAgICAgIGxldCBsYWJlbCA9IGl0ZW0uZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoc3ViTWVudS5jaGlsZHJlbiwgKG5vZGUpID0+IHtcbiAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdsYWJlbCcsIGxhYmVsKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChzdWJNZW51KTtcblxuICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnRIYW5kbGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjcmVhdGVzIGEgd2luZG93IG1hbmFnZXIgdG8gaGFuZGxlIHdpbmRvd3Mgb24gdGhlIGRlc2t0b3AuXG4gICAgICogQHBhcmFtIHdpbmRvd1NwYWNlIHtIVE1MRWxlbWVudH0gdGhlIHNwYWNlIHdoZXJlIHRoZSB3aW5kb3dzIGxpdmVcbiAgICAgKiBAcmV0dXJucyB7e2NyZWF0ZVdpbmRvdzogY3JlYXRlV2luZG93LCBvcGVuV2luZG93czogb3BlbldpbmRvd3MsIGV4cGFuZDogZXhwYW5kLCBtaW5pbWl6ZTogbWluaW1pemUsIGNsb3NlOiBjbG9zZX19IGFuXG4gICAgICogb2JqZWN0IHdpdGggbWV0aG9kcyB0byBleHBhbmQsIG1pbmltaXplLCBjbG9zZSBhbGwsIG9wZW4gbmV3LCBhbmQgZ2V0IG9wZW4gd2luZG93cyBvZiBhIGNlcnRhaW4gdHlwZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgd2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSkge1xuICAgICAgICAvL2tlZXAgdHJhY2sgb2YgdGhlIHdpbmRvdyBzcGFjZVxuICAgICAgICBsZXQgd20gPSB7XG4gICAgICAgICAgICBzdGFydFg6IHdpbmRvd1NwYWNlLm9mZnNldExlZnQgKyAyMCxcbiAgICAgICAgICAgIHN0YXJ0WTogd2luZG93U3BhY2Uub2Zmc2V0VG9wICsgMjAsXG4gICAgICAgICAgICB0eXBlczogMFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIENyZWF0ZXMgYSBuZXcgd2luZG93IGFuZCBvcGVucyBpdCBpbiB0aGUgd2luZG93IHNwYWNlLlxuICAgICAgICAgICAgICogQHBhcmFtIHR5cGUge3N0cmluZ30gdGhlIG5hbWUgb2YgdGhlIGh0bWwtZWxlbWVudCB0byBjcmVhdGUuXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRoZSBuZXdseSBjcmVhdGVkIHdpbmRvd1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjcmVhdGVXaW5kb3c6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgbGV0IGFXaW5kb3c7XG4gICAgICAgICAgICAgICAgaWYgKCF3bVt0eXBlXSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbGlua1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNsaW5rVGVtcGxhdGVcIik7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5rID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShsaW5rVGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGxpbmsuaHJlZiA9IFwiL1wiICsgdHlwZSArIFwiLmh0bWxcIjtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhV2luZG93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0eXBlKTtcblxuICAgICAgICAgICAgICAgIC8vaW1wb3J0IHBpY3R1cmVzIGZvciB0aGUgaW1hZ2UgZ2FsbGVyeVxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnaW1hZ2UtZ2FsbGVyeS1hcHAnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGljdHVyZXMnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYVdpbmRvdy5hcHBlbmRDaGlsZChkb2N1bWVudC5pbXBvcnROb2RlKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwaWN0dXJlcycpLmNvbnRlbnQsIHRydWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdpbmRvd1NwYWNlLmFwcGVuZENoaWxkKGFXaW5kb3cpO1xuICAgICAgICAgICAgICAgIHNldHVwU3BhY2UodHlwZSwgYVdpbmRvdyk7XG5cbiAgICAgICAgICAgICAgICAvL2tlZXAgdHJhY2sgb2YgdGhlIG9wZW4gd2luZG93c1xuICAgICAgICAgICAgICAgIGlmICh3bVt0eXBlXS5vcGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4ucHVzaChhV2luZG93KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuID0gW2FXaW5kb3ddO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBhV2luZG93O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogR2V0cyB0aGUgb3BlbiB3aW5kb3dzIG9mIGEgdHlwZS5cbiAgICAgICAgICAgICAqIEBwYXJhbSB0eXBlIHtzdHJpbmd9IHRoZSBuYW1lIG9mIHRoZSBodG1sLWVsZW1lbnQgdG8gY2hlY2sgZm9yLlxuICAgICAgICAgICAgICogQHJldHVybnMge1tIVE1MRWxlbWVudF19IGEgbm9kZSBsaXN0IG9mIHRoZSBvcGVuIHdpbmRvd3Mgb2YgdGhlIHR5cGUuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIG9wZW5XaW5kb3dzOiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgICAgIGlmICh3bVt0eXBlXSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgICAgICAgICAgICAgICAgIGxldCB3aW5kb3dzID0gd21bdHlwZV0ub3BlbjtcbiAgICAgICAgICAgICAgICAgICAgLy9maWx0ZXIgb3V0IHRoZSBvbmUncyB0aGF0J3MgYmVlbiBjbG9zZWQgc2luY2UgdGhlIGxhc3QgdGltZVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB3aW5kb3dzLmZpbHRlcigodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHcub3BlbjtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7IC8vaWYgbm8gd2luZG93cyBhcmUgb3BlblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEV4cGFuZHMgYWxsIG1pbmltaXplZCB3aW5kb3dzIG9mIGEgdHlwZS5cbiAgICAgICAgICAgICAqIEBwYXJhbSB0eXBlIHtzdHJpbmd9IHRoZSBuYW1lIG9mIHRoZSBodG1sLWVsZW1lbnQgdG8gZXhwYW5kLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBleHBhbmQ6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHdpbnMgPSB0aGlzLm9wZW5XaW5kb3dzKHR5cGUpO1xuICAgICAgICAgICAgICAgIGlmICh3aW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdy5taW5pbWl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogTWluaW1pemVzIGFsbCBvcGVuIHdpbmRvd3Mgb2YgYSB0eXBlLlxuICAgICAgICAgICAgICogQHBhcmFtIHR5cGUge3N0cmluZ30gdGhlIG5hbWUgb2YgdGhlIGh0bWwtZWxlbWVudCB0byBtaW5pbWl6ZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgbWluaW1pemU6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHdpbnMgPSB0aGlzLm9wZW5XaW5kb3dzKHR5cGUpO1xuICAgICAgICAgICAgICAgIGlmICh3aW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdy5taW5pbWl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBDbG9zZXMgYWxsIG9wZW4gd2luZG93cyBvZiBhIHR5cGUuXG4gICAgICAgICAgICAgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSB0aGUgbmFtZSBvZiB0aGUgaHRtbC1lbGVtZW50IHRvIGNsb3NlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBsZXQgd2lucyA9IHRoaXMub3BlbldpbmRvd3ModHlwZSk7XG4gICAgICAgICAgICAgICAgaWYgKHdpbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cod2lucyk7XG4gICAgICAgICAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy9oZWxwZXIgZnVuY3Rpb25zXG4gICAgICAgIC8vIGtlZXBzIHRyYWNrIG9mIHRoZSB3aW5kb3cgc3BhY2Ugc28gdGhlIHdpbmRvd3MgZG9uJ3QgYWxsXG4gICAgICAgIC8vb3BlbiBvbiB0b3Agb2YgZWFjaCBvdGhlciwgYW5kIGRvZXNuJ3QgZGlzYXBwZWFyIG91dFxuICAgICAgICAvL29mIHRoZSBzcGFjZVxuICAgICAgICBmdW5jdGlvbiBzZXR1cFNwYWNlKHR5cGUsIHNwYWNlKSB7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7fTtcbiAgICAgICAgICAgIGxldCB4O1xuICAgICAgICAgICAgbGV0IHk7XG5cbiAgICAgICAgICAgIGlmICh3bVt0eXBlXSkgeyAvL3RoZSB0eXBlIGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9ICh3bVt0eXBlXS5sYXRlc3RDb29yZHMueCArPSA1MCk7ICAvL2NyZWF0ZSBhIG5ldyBzcGFjZSB0byBvcGVuIHRoZSB3aW5kb3dcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gKHdtW3R5cGVdLmxhdGVzdENvb3Jkcy55ICs9IDUwKTtcblxuICAgICAgICAgICAgICAgIGlmICghKHdpdGhpbkJvdW5kcyhzcGFjZSwgd2luZG93U3BhY2UsIGRlc3RpbmF0aW9uKSkpIHsgLy9jaGVjayB0aGF0IHRoZSBzcGFjZSBpcyB3aXRoaW4gYm91bmRzXG4gICAgICAgICAgICAgICAgICAgIHggPSB3bVt0eXBlXS5zdGFydENvb3Jkcy54ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgIHkgPSB3bVt0eXBlXS5zdGFydENvb3Jkcy55ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgIHdtW3R5cGVdLmxhdGVzdENvb3Jkcy54ID0geDtcbiAgICAgICAgICAgICAgICAgICAgd21bdHlwZV0ubGF0ZXN0Q29vcmRzLnkgPSB5O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBkZXN0aW5hdGlvbi54O1xuICAgICAgICAgICAgICAgICAgICB5ID0gZGVzdGluYXRpb24ueTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7IC8vY3JlYXRlIGEgc3RhcnRpbmcgcG9pbnQgZm9yIHRoZSB3aW5kb3dzIG9mIHRoaXMgdHlwZVxuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAod20uc3RhcnRYICsgKDYwICogd20udHlwZXMpKTtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gKHdtLnN0YXJ0WSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoISh3aXRoaW5Cb3VuZHMoc3BhY2UsIHdpbmRvd1NwYWNlLCBkZXN0aW5hdGlvbikpKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSB3bS5zdGFydFg7XG4gICAgICAgICAgICAgICAgICAgIHkgPSB3bS5zdGFydFk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgeCA9IGRlc3RpbmF0aW9uLng7XG4gICAgICAgICAgICAgICAgICAgIHkgPSBkZXN0aW5hdGlvbi55O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdtW3R5cGVdID0ge307XG4gICAgICAgICAgICAgICAgd21bdHlwZV0uc3RhcnRDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLmxhdGVzdENvb3JkcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICAgICAgeTogeVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgd20udHlwZXMgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNwYWNlLnRhYkluZGV4ID0gMDtcbiAgICAgICAgICAgIHNwYWNlLnN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XG4gICAgICAgICAgICBzcGFjZS5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vY2hlY2tzIGlmIGEgc3BhY2UgaXMgd2l0aGluIGJvdW5kc1xuICAgICAgICBmdW5jdGlvbiB3aXRoaW5Cb3VuZHMoZWxlbWVudCwgY29udGFpbmVyLCBjb29yZHMpIHtcbiAgICAgICAgICAgIGxldCBtaW5YID0gY29udGFpbmVyLm9mZnNldExlZnQ7XG4gICAgICAgICAgICBsZXQgbWF4WCA9IChtaW5YICsgY29udGFpbmVyLmNsaWVudFdpZHRoKSAtIChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKTtcbiAgICAgICAgICAgIGxldCBtaW5ZID0gY29udGFpbmVyLm9mZnNldFRvcDtcbiAgICAgICAgICAgIGxldCBtYXhZID0gKG1pblkgKyBjb250YWluZXIuY2xpZW50SGVpZ2h0KSAtIChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodCk7XG5cbiAgICAgICAgICAgIHJldHVybiAoY29vcmRzLnggPD0gbWF4WCAmJiBjb29yZHMueCA+PSBtaW5YICYmIGNvb3Jkcy55IDw9IG1heFkgJiYgY29vcmRzLnkgPj0gbWluWSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuLy9oZWxwZXIgZnVuY3Rpb24gdG8gYWRkIG1vcmUgdGhhbiBvbmUgZXZlbnQgdHlwZSBmb3IgZWFjaCBlbGVtZW50IGFuZCBoYW5kbGVyXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyAoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cblxuLy9leHBvcnRcbm1vZHVsZS5leHBvcnRzID0gRGVza3RvcDtcbiIsIi8qXG4qIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgZHJhZ2dhYmxlLXdpbmRvdyB0byBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuKiBJdCBjcmVhdGVzIGEgd2luZG93IHRoYXQgY2FuIGJlIG1vdmVkIGFjcm9zcyB0aGUgc2NyZWVuLCBjbG9zZWQgYW5kIG1pbmltaXplZC5cbiogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuKiBAdmVyc2lvbiAxLjAuMFxuKlxuKi9cblxuY2xhc3MgRHJhZ2dhYmxlV2luZG93IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIGRyYWdnYWJsZS13aW5kb3csIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgbGV0IHdpbmRvd1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2RyYWdnYWJsZS13aW5kb3cuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvd1RlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cbiAgICAgICAgLy9zZXR1cCBzaGFkb3cgZG9tIHN0eWxlc1xuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIiwgZGVsZWdhdGVzRm9jdXM6IHRydWV9KTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gd2luZG93VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgd2hlbiB3aW5kb3cgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWhhdmlvdXIgb2YgdGhlIHdpbmRvdy5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcblxuICAgICAgICAvL3NldCBiZWhhdmlvdXJcbiAgICAgICAgbWFrZURyYWdnYWJsZSh0aGlzLCB0aGlzLnBhcmVudE5vZGUpO1xuXG4gICAgICAgIC8vYWRkIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5jb21wb3NlZFBhdGgoKVswXTsgLy9mb2xsb3cgdGhlIHRyYWlsIHRocm91Z2ggc2hhZG93IERPTVxuICAgICAgICAgICAgbGV0IGlkID0gdGFyZ2V0LmdldEF0dHJpYnV0ZShcImlkXCIpO1xuICAgICAgICAgICAgaWYgKGlkID09PSBcImNsb3NlXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlkID09PSBcIm1pbmltaXplXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1pbmltaXplZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykgeyAvL21ha2Ugd29yayB3aXRoIHRvdWNoIGV2ZW50c1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMub3BlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCB3aGF0IGF0dHJpYnV0ZS1jaGFuZ2VzIHRvIHdhdGNoIGZvciBpbiB0aGUgRE9NLlxuICAgICAqIEByZXR1cm5zIHtbc3RyaW5nXX0gYW4gYXJyYXkgb2YgdGhlIG5hbWVzIG9mIHRoZSBhdHRyaWJ1dGVzIHRvIHdhdGNoLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4gWydvcGVuJ107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2hlcyBmb3IgYXR0cmlidXRlIGNoYW5nZXMgaW4gdGhlIERPTSBhY2NvcmRpbmcgdG8gb2JzZXJ2ZWRBdHRyaWJ1dGVzKClcbiAgICAgKiBAcGFyYW0gbmFtZSB0aGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICogQHBhcmFtIG9sZFZhbHVlIHRoZSBvbGQgdmFsdWVcbiAgICAgKiBAcGFyYW0gbmV3VmFsdWUgdGhlIG5ldyB2YWx1ZVxuICAgICAqL1xuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9wZW4pIHtcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSB3aW5kb3cgaGFzIGF0dHJpYnV0ZSAnb3BlbidcbiAgICAgKi9cbiAgICBnZXQgb3BlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzQXR0cmlidXRlKCdvcGVuJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgJ29wZW4nIGF0dHJpYnV0ZSBvbiB0aGUgd2luZG93LlxuICAgICAqIEBwYXJhbSBvcGVuIHtib29sZWFufSB3aGV0aGVyIHRvIGFkZCBvciByZW1vdmUgdGhlICdvcGVuJyBhdHRyaWJ1dGVcbiAgICAgKi9cbiAgICBzZXQgb3BlbihvcGVuKSB7XG4gICAgICAgIGlmIChvcGVuKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnb3BlbicsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdvcGVuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgd2luZG93IGhhcyBhdHRyaWJ1dGUgJ21pbmltaXplZCdcbiAgICAgKi9cbiAgICBnZXQgbWluaW1pemVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNBdHRyaWJ1dGUoJ21pbmltaXplZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlICdtaW5pbWl6ZWQnIGF0dHJpYnV0ZSBvbiB0aGUgd2luZG93LlxuICAgICAqIEBwYXJhbSBtaW5pbWl6ZSB7Ym9vbGVhbn0gd2hldGhlciB0byBhZGQgb3IgcmVtb3ZlIHRoZSAnbWluaW1pemVkJyBhdHRyaWJ1dGVcbiAgICAgKi9cbiAgICBzZXQgbWluaW1pemVkKG1pbmltaXplKSB7XG4gICAgICAgIGlmIChtaW5pbWl6ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ21pbmltaXplZCcsICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKCdtaW5pbWl6ZWQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlcyB0aGUgd2luZG93LiBSZW1vdmVzIGl0IGZyb20gdGhlIERPTSBhbmQgc2V0cyBhbGwgYXR0cmlidXRlcyB0byBmYWxzZS5cbiAgICAgKi9cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMub3Blbikge1xuICAgICAgICAgICAgdGhpcy5vcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLm1pbmltaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wYXJlbnROb2RlLmhvc3QgJiYgdGhpcy5wYXJlbnROb2RlLmhvc3QucGFyZW50Tm9kZSkgeyAvL3RoaXMgaXMgcGFydCBvZiBhIHNoYWRvdyBkb21cbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUuaG9zdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMucGFyZW50Tm9kZS5ob3N0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufVxuXG4vL2hlbHBlciBmdW5jdGlvblxuLy9tYWtlcyBhbiBlbGVtZW50IGRyYWdnYWJsZSB3aXRoICBtb3VzZSwgYXJyb3dzIGFuZCB0b3VjaFxuZnVuY3Rpb24gbWFrZURyYWdnYWJsZShlbCkge1xuICAgIGxldCBhcnJvd0RyYWc7XG4gICAgbGV0IG1vdXNlRHJhZztcbiAgICBsZXQgZHJhZ29mZnNldCA9IHsgLy90byBtYWtlIHRoZSBkcmFnIG5vdCBqdW1wIGZyb20gdGhlIGNvcm5lclxuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgfTtcblxuICAgIGxldCBldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoZWwsICdmb2N1c2luIG1vdXNlZG93bicsICgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudDtcbiAgICAgICAgICAgIGFycm93RHJhZyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicpIHtcbiAgICAgICAgICAgICAgICBtb3VzZURyYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGRyYWdvZmZzZXQueCA9IHRhcmdldC5wYWdlWCAtIGVsLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgZHJhZ29mZnNldC55ID0gdGFyZ2V0LnBhZ2VZIC0gZWwub2Zmc2V0VG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGVsLCAnZm9jdXNvdXQgbW91c2V1cCcsICgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2V1cCcpIHtcbiAgICAgICAgICAgICAgICBpZiAobW91c2VEcmFnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vdXNlRHJhZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyb3dEcmFnID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoZG9jdW1lbnQsICdtb3VzZW1vdmUga2V5ZG93bicsICgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHt9OyAvL2FzIHRvIG5vdCBrZWVwIHBvbGxpbmcgdGhlIERPTVxuXG4gICAgICAgICAgICBpZiAobW91c2VEcmFnKSB7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9IChldmVudC5wYWdlWSAtIGRyYWdvZmZzZXQueSk7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9IChldmVudC5wYWdlWCAtIGRyYWdvZmZzZXQueCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFycm93RHJhZykge1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSBwYXJzZUludChlbC5zdHlsZS50b3Auc2xpY2UoMCwgLTIpKTtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gcGFyc2VJbnQoZWwuc3R5bGUubGVmdC5zbGljZSgwLCAtMikpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55IC09IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd0xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCAtPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCArPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobW91c2VEcmFnIHx8IGFycm93RHJhZykge1xuICAgICAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSBkZXN0aW5hdGlvbi54ICArIFwicHhcIjtcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS50b3AgPSBkZXN0aW5hdGlvbi55ICArIFwicHhcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgfTtcblxuICAgIC8vaW5pdGlhdGUgYSBtb3VzZSBldmVudCBmcm9tIHRoZSB0b3VjaFxuICAgIGZ1bmN0aW9uIHRvdWNoSGFuZGxlcihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmFzc2lnbmVkU2xvdCAmJiBldmVudC50YXJnZXQuYXNzaWduZWRTbG90Lm5hbWUgPT09ICd0aXRsZScpIHsgLy9vbmx5IGRyYWcgZnJvbSB0aGUgdGl0bGUgYmFyIG9uIHRvdWNoLCBhcyB0byBub3QgaW50ZXJydXB0IHNjcm9sbGluZ1xuICAgICAgICAgICAgbGV0IHRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcztcbiAgICAgICAgICAgIGxldCBmaXJzdCA9IHRvdWNoZXNbMF07XG4gICAgICAgICAgICBsZXQgdHlwZSA9IFwiXCI7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJ0b3VjaHN0YXJ0XCI6XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSBcIm1vdXNlZG93blwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwidG91Y2htb3ZlXCI6XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSBcIm1vdXNlbW92ZVwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwidG91Y2hlbmRcIjpcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9IFwibW91c2V1cFwiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vc2V0IHVwIHRoZSBldmVudFxuICAgICAgICAgICAgbGV0IHNpbXVsYXRlZEV2ZW50ID0gbmV3IE1vdXNlRXZlbnQodHlwZSwge1xuICAgICAgICAgICAgICAgIHNjcmVlblg6IGZpcnN0LnNjcmVlblgsXG4gICAgICAgICAgICAgICAgc2NyZWVuWTogZmlyc3Quc2NyZWVuWSxcbiAgICAgICAgICAgICAgICBjbGllbnRYOiBmaXJzdC5jbGllbnRYLFxuICAgICAgICAgICAgICAgIGNsaWVudFk6IGZpcnN0LmNsaWVudFksXG4gICAgICAgICAgICAgICAgYnV0dG9uOiAxLFxuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWVcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGVsLmRpc3BhdGNoRXZlbnQoc2ltdWxhdGVkRXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG91Y2hldmVudHMoKSB7XG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHRvdWNoSGFuZGxlciwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgdG91Y2hIYW5kbGVyLCB0cnVlKTtcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsIHRvdWNoSGFuZGxlciwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGNhbmNlbFwiLCB0b3VjaEhhbmRsZXIsIHRydWUpO1xuICAgIH1cblxuICAgIGV2ZW50cygpO1xuICAgIHRvdWNoZXZlbnRzKCk7XG59XG5cbi8vaGVscGVyIGZ1bmN0aW9uXG4vL2FkZHMgbXVsdGlwbGUgZXZlbnQgbGlzdGVuZXJzIHdpdGggaWRlbnRpY2FsIGhhbmRsZXJzXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyhlbGVtZW50LCBldmVudHMsIGhhbmRsZXIpIHtcbiAgICBldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGV2ZW50ID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcikpO1xufVxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZHJhZ2dhYmxlLXdpbmRvdycsIERyYWdnYWJsZVdpbmRvdyk7XG4iLCIvKlxuICogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBleHBhbmRhYmxlLW1lbnUtaXRlbSBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuICogSXQgY3JlYXRlcyBhbiBpdGVtIHRoYXQgd2hlbiBjbGlja2VkIHRvZ2dsZXMgdG8gc2hvdyBvciBoaWRlIHN1Yi1pdGVtcy5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICovXG5cbmNsYXNzIEV4cGFuZGFibGVNZW51SXRlbSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBkcmFnZ2FibGUtd2luZG93LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGxldCBtZW51VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvZXhwYW5kYWJsZS1tZW51LWl0ZW0uaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI21lbnVJdGVtVGVtcGxhdGVcIik7IC8vc2hhZG93IERPTSBpbXBvcnRcblxuICAgICAgICAvL3NldCB1cCBzaGFkb3cgZG9tIHN0eWxlc1xuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBtZW51VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIHdpbmRvdyBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogU2V0cyB1cCBldmVudCBsaXN0ZW5lcnMgYW5kIGJlaGF2aW91ciBvZiB0aGUgaXRlbS5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgbWFrZUV4cGFuZGFibGUodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge1tub2RlXX0gYW4gYXJyYXkgb2YgdGhlIHN1Yml0ZW1zIHRoZSBpdGVtIGhhcyBhc3NpZ25lZCBpbiB0aGUgRE9NLlxuICAgICAqIEEgc3ViaXRlbSBjb3VudHMgYXMgYW4gaXRlbSB0aGF0IGhhcyB0aGUgc2xvdCBvZiAnc3ViaXRlbScgYW5kIHRoZSBzYW1lIGxhYmVsXG4gICAgICogYXMgdGhlIGV4cGFuZGFibGUgbWVudSBpdGVtIGl0c2VsZi5cbiAgICAgKi9cbiAgICBnZXQgc3ViTWVudSgpIHtcbiAgICAgICAgbGV0IGxhYmVsID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2xhYmVsJyk7XG4gICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwodGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdbc2xvdD1cInN1Yml0ZW1cIl0nKSwgKG5vZGUpID0+IHtcbiAgICAgICAgICAgIGxldCBub2RlTGFiZWwgPSBub2RlLmdldEF0dHJpYnV0ZSgnbGFiZWwnKTtcbiAgICAgICAgICAgIHJldHVybiBub2RlTGFiZWwgPT09IGxhYmVsO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgaXRlbSBpcyBjdXJyZW50bHkgZGlzcGxheWluZyB0aGUgc3VibWVudS1pdGVtcy5cbiAgICAgKi9cbiAgICBnZXQgZGlzcGxheWluZ1N1Yk1lbnUoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5zdWJNZW51WzBdLmhhc0F0dHJpYnV0ZSgnaGlkZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3dzIG9yIGhpZGVzIHRoZSBzdWJtZW51LWl0ZW1zLlxuICAgICAqIEBwYXJhbSBzaG93IHtib29sZWFufSB3aGV0aGVyIHRvIHNob3cgb3IgaGlkZS5cbiAgICAgKi9cbiAgICB0b2dnbGVTdWJNZW51KHNob3cpIHtcbiAgICAgICAgaWYgKHNob3cpIHtcbiAgICAgICAgICAgIHRoaXMuc3ViTWVudS5mb3JFYWNoKChwb3N0KSA9PiB7XG4gICAgICAgICAgICAgICAgcG9zdC5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdWJNZW51LmZvckVhY2goKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgICBwb3N0LnNldEF0dHJpYnV0ZSgnaGlkZScsICcnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9XG5cbn1cblxuLy9kZWZpbmVzIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2V4cGFuZGFibGUtbWVudS1pdGVtJywgRXhwYW5kYWJsZU1lbnVJdGVtKTtcblxuLy9oZWxwZXIgZnVuY3Rpb24gdG8gbWFrZSB0aGUgaXRlbSBleHBhbmRhYmxlXG4vL3Rha2VzIHRoZSBpdGVtIHRvIGV4cGFuZCBhcyBhIHBhcmFtZXRlclxuZnVuY3Rpb24gbWFrZUV4cGFuZGFibGUoaXRlbSkge1xuICAgIGxldCBuZXh0Rm9jdXMgPSAwO1xuICAgIGxldCBzaG93ID0gZmFsc2U7XG4gICAgbGV0IGFycm93RXhwYW5kO1xuICAgIGxldCBtb3VzZUV4cGFuZDtcblxuICAgIGxldCBldmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGl0ZW0sICdmb2N1c2luIGNsaWNrJywgKChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGFycm93RXhwYW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICBtb3VzZUV4cGFuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNob3cgPSAhc2hvdztcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHNob3cpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhpdGVtLCAna2V5ZG93bicsICgoZXZlbnQpID0+IHsgLy9tYWtlIHRoZSBzdWItaXRlbXMgdHJhdmVyc2FibGUgYnkgcHJlc3NpbmcgdGhlIGFycm93IGtleXNcbiAgICAgICAgICAgICAgICBpZiAoYXJyb3dFeHBhbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXRlbS5kaXNwbGF5aW5nU3ViTWVudSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRGb2N1cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0Rm9jdXMgPCAwIHx8IG5leHRGb2N1cyA+PSBpdGVtLnN1Yk1lbnUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRGb2N1cyA9IGl0ZW0uc3ViTWVudS5sZW5ndGggLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uc3ViTWVudVtuZXh0Rm9jdXNdLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXMoaXRlbSwgaXRlbS5zdWJNZW51W25leHRGb2N1c10pOyAvL21ha2UgaXQgYWNjZXNzaWJsZSB2aWEgY3NzIHZpc3VhbCBjbHVlcyBldmVuIGlmIHRoZSBhY3RpdmUgZWxlbWVudCBpcyBoaWRkZW4gd2l0aGluIHNoYWRvd0RPTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWl0ZW0uZGlzcGxheWluZ1N1Yk1lbnUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0Rm9jdXMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dEZvY3VzID49IGl0ZW0uc3ViTWVudS5sZW5ndGggfHwgbmV4dEZvY3VzIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0Rm9jdXMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnN1Yk1lbnVbbmV4dEZvY3VzXS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzKGl0ZW0sIGl0ZW0uc3ViTWVudVtuZXh0Rm9jdXNdKTsgLy9tYWtlIGl0IGFjY2Vzc2libGUgdmlhIGNzcyB2aXN1YWwgY2x1ZXMgZXZlbiBpZiB0aGUgYWN0aXZlIGVsZW1lbnQgaXMgaGlkZGVuIHdpdGhpbiBzaGFkb3dET01cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgfTtcblxuICAgIGV2ZW50cygpO1xufVxuXG4vL2hlbHBlciBmdW5jdGlvbnNcblxuLy9hZGRzIG11bHRpcGxlIGV2ZW50IGxpc3RlbmVycyB3aXRoIGlkZW50aWNhbCBoYW5kbGVyc1xuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cblxuLy8gQWRkcyBhICdmb2N1c2VkJyBhdHRyaWJ1dGUgdG8gdGhlIGRlc2lyZWQgc3ViaXRlbSBhbmRcbi8vIHJlbW92ZXMgaXQgZnJvbSBvdGhlciBzdWIgaXRlbXMgdG8gaGVscFxuLy8gd2l0aCBhY2Nlc3NpYmlsaXR5IGFuZCBzaGFkb3cgRE9tIHN0eWxpbmcuXG5mdW5jdGlvbiBmb2N1cyhpdGVtLCBlbGVtZW50KSB7XG4gICAgbGV0IHN1YnMgPSBpdGVtLnN1Yk1lbnU7XG4gICAgc3Vicy5mb3JFYWNoKChzdWIpID0+IHtcbiAgICAgICAgaWYgKHN1YiA9PT0gZWxlbWVudCkge1xuICAgICAgICAgICAgc3ViLnNldEF0dHJpYnV0ZSgnZm9jdXNlZCcsICcnKTtcbiAgICAgICAgICAgIGl0ZW0uZm9jdXNlZCA9IGVsZW1lbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdWIucmVtb3ZlQXR0cmlidXRlKCdmb2N1c2VkJyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiIsIi8qXG4gKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGltYWdlLWdhbGxlcnktYXBwIHRvIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjb21iaW5lZCB0aGUgY29tcG9uZW50IGltYWdlLWdhbGxlcnkgd2l0aCB0aGUgY29tcG9uZW50IGRyYWdnYWJsZS13aW5kb3csIHRvXG4gKiBtYWtlIGFuIGltYWdlIGdhbGxlcnkgaW4gYSB3aW5kb3cgd2l0aCBhbiBhZGRlZCBtZW51LlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxuY2xhc3MgSW1hZ2VHYWxsZXJ5QXBwIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIGdhbGxlcnktd2luZG93LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGxldCBnYWxsZXJ5V2luZG93VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW1hZ2UtZ2FsbGVyeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKCcjZ2FsbGVyeVdpbmRvd1RlbXBsYXRlJyk7XG5cbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCJ9KTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gZ2FsbGVyeVdpbmRvd1RlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcblxuICAgICAgICB0aGlzLmltYWdlcyA9IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgd2hlbiBnYWxsZXJ5IGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAgICAgKiBTZXRzIHVwIGV2ZW50IGxpc3RlbmVycyBmb3JcbiAgICAgKiB0aGUgbWVudS5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgbGV0IGltYWdlR2FsbGVyeSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdpbWFnZS1nYWxsZXJ5Jyk7XG4gICAgICAgIGxldCBhYm91dHNwYWNlID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNhYm91dCcpO1xuXG4gICAgICAgIGxldCBnYWxsZXJ5T3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cImdhbGxlcnlcIl0nKTtcbiAgICAgICAgbGV0IHF1aXRPcHRpb24gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwicXVpdFwiXScpO1xuICAgICAgICBsZXQgYWJvdXRPcHRpb24gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwiYWJvdXRcIl0nKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZUltYWdlcygpO1xuXG4gICAgICAgIC8vbWVudSBldmVudCBsaXN0ZW5lcnMuIGFkZCBzZXBhcmF0ZSBvbmVzIGZvciBhY2Nlc3NpYmlsaXR5IHJlYXNvbnMgd2l0aCB3ZWIgY29tcG9uZW50cy5cbiAgICAgICAgcXVpdE9wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldC5mb2N1c2VkIHx8IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10YXNrXScpIHx8IGV2ZW50LnRhcmdldDsgLy9zaGFkb3cgRE9NIGFjY2Vzc2liaWxpdHkgaXNzdWVzXG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhc2spIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncXVpdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIC8vbWVudSBldmVudCBsaXN0ZW5lclxuICAgICAgICBnYWxsZXJ5T3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0OyAvL3NoYWRvdyBET00gYWNjZXNzaWJpbGl0eSBpc3N1ZXNcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdnYWxsZXJ5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VHYWxsZXJ5LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlR2FsbGVyeS5zaG93VGh1bWJuYWlscygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL21lbnUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgYWJvdXRPcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7IC8vc2hhZG93IERPTSBhY2Nlc3NpYmlsaXR5IGlzc3Vlc1xuICAgICAgICAgICAgbGV0IHRhc2sgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Fib3V0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlR2FsbGVyeS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbGwgdGhlIGFkZGVkIGltYWdlc1xuICAgICAqIEByZXR1cm5zIHtOb2RlTGlzdH0gYSBsaXN0IG9mIGFsbCB0aGUgaW1hZ2UgZWxlbWVudHMgdGhhdCBhcmVcbiAgICAgKiBjaGlsZHJlbiBvZiB0aGUgZ2FsbGVyeS5cbiAgICAgKi9cbiAgICBnZXRJbWFnZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZycpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYWxsIHRoZSBpbWFnZWRlc2NyaXB0aW9ucy5cbiAgICAgKiBAcmV0dXJucyB7Tm9kZUxpc3R9IGEgbGlzdCBvZiBhbGwgdGhlIHAgZWxlbWVudHMgdGhhdCBhcmVcbiAgICAgKiBjaGlsZHJlbiBvZiB0aGUgZ2FsbGVyeSBhbmQgaGFzIGEgZm9yLWF0dHJpYnV0ZS5cbiAgICAgKi9cbiAgICBnZXREZXNjcmlwdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ3BbZm9yXScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1hdGNoZXMgZGVzY3JpcHRpb25zIHdpdGggaW1hZ2Utc291cmNlcyB2aWEgdGhlIG1hdGNoaW5nIGZvci0gYW5kIGxhYmVsLSBhdHRyaWJ1dGVzXG4gICAgICogb24gdGhlIHAgYW5kIGltZyBlbGVtZW50cyByZXNwZWN0aXZlbHkuXG4gICAgICovXG4gICAgdXBkYXRlSW1hZ2VzKCkge1xuICAgICAgICBsZXQgaW1nVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW1hZ2UtZ2FsbGVyeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2ltZ1RlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG4gICAgICAgIGxldCBpbWFnZUdhbGxlcnkgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignaW1hZ2UtZ2FsbGVyeScpO1xuXG4gICAgICAgIHRoaXMuaW1hZ2VzID0gdGhpcy5pbWFnZXMuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuZ2V0SW1hZ2VzKCkpKTtcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbnMgPSB0aGlzLmdldERlc2NyaXB0aW9ucygpO1xuXG4gICAgICAgIHRoaXMuaW1hZ2VzLmZvckVhY2goKGltYWdlKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29udGFpbmVyID0gaW1nVGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgICBjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQucmVwbGFjZUNoaWxkKGltYWdlLCBjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQucXVlcnlTZWxlY3RvcignaW1nJykpO1xuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdwJykpO1xuICAgICAgICAgICAgaW1hZ2VHYWxsZXJ5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwodGhpcy5kZXNjcmlwdGlvbnMsIChkZXNjcmlwdGlvbikgPT4ge1xuICAgICAgICAgICAgaW1hZ2VHYWxsZXJ5LmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGNvbnRhaW5pbmcgdGhlIGFwcCBpcyBvcGVuLlxuICAgICAqL1xuICAgIGdldCBvcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5vcGVuO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBjb250YWluaW5nIHRoZSBhcHAgaXMgbWluaW1pemVkLlxuICAgICAqL1xuICAgIGdldCBtaW5pbWl6ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBtaW5pbWl6ZWQgcHJvcGVydHkgb2YgdGhlIHdpbmRvdyBjb250YWluaW5nIHRoZSBhcHAuXG4gICAgICogQHBhcmFtIG1pbmltaXplIHtib29sZWFufSB3aGV0aGVyIHRvIG1pbmltaXplXG4gICAgICovXG4gICAgc2V0IG1pbmltaXplZChtaW5pbWl6ZSkge1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZCA9IG1pbmltaXplO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlcyB0aGUgd2luZG93IGNvbnRhaW5pbmcgdGhlIGFwcC5cbiAgICAgKi9cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5jbG9zZSgpO1xuICAgIH1cblxufVxuXG5cbi8vZGVmaW5lIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2ltYWdlLWdhbGxlcnktYXBwJywgSW1hZ2VHYWxsZXJ5QXBwKTtcbiIsIi8qXG4gKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGltYWdlLWdhbGxlcnkgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiAqIEl0IGNyZWF0ZXMgYSBnYWxsZXJ5IHRoYXQgZGlzcGxheXMgY2xpY2thYmxlIGltYWdlcyBhcyB0aHVtYm5haWxzLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxuY2xhc3MgSW1hZ2VHYWxsZXJ5IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIGdhbGxlcnksIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgbGV0IGdhbGxlcnlUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbWFnZS1nYWxsZXJ5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbWFnZS1nYWxsZXJ5Lmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNnYWxsZXJ5VGVtcGxhdGVcIik7IC8vc2hhZG93IERPTSBpbXBvcnRcblxuICAgICAgICAvL3NldHVwIHNoYWRvdyBkb20gc3R5bGVzXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IGdhbGxlcnlUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gZ2FsbGVyeSBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogU2V0cyB1cCBldmVudCBsaXN0ZW5lcnMgYW5kIHRyYWNrcyB0aGUgcGljdHVyZSBzb3VyY2VzLlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBsZXQgZ2FsbGVyeSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjZ2FsbGVyeScpO1xuICAgICAgICBsZXQgaW1hZ2VEaXNwbGF5ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbWFnZURpc3BsYXknKTtcbiAgICAgICAgbGV0IGxvY2FsTmF2ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNsb2NhbE5hdicpO1xuXG4gICAgICAgIC8vbWFrZSBhcnJheSBvZiBhbGwgdGhlIHBpY3R1cmUgc291cmNlcyBmb3IgdHJhdmVyc2luZ1xuICAgICAgICB0aGlzLnBpY3R1cmVTb3VyY2VzID0gW107XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwodGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdbc2xvdCA9XCJwaWN0dXJlXCInKSwgKGEpID0+IHtcbiAgICAgICAgICAgIGlmIChhLmhhc0F0dHJpYnV0ZSgnc3JjJykgJiYgdGhpcy5waWN0dXJlU291cmNlcy5pbmRleE9mKGEuZ2V0QXR0cmlidXRlKCdzcmMnKSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5waWN0dXJlU291cmNlcy5wdXNoKGEuZ2V0QXR0cmlidXRlKCdzcmMnKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGEuZmlyc3RFbGVtZW50Q2hpbGQgJiYgYS5maXJzdEVsZW1lbnRDaGlsZC5oYXNBdHRyaWJ1dGUoJ3NyYycpICYmIHRoaXMucGljdHVyZVNvdXJjZXMuaW5kZXhPZihhLmZpcnN0RWxlbWVudENoaWxkLmdldEF0dHJpYnV0ZSgnc3JjJykpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGljdHVyZVNvdXJjZXMucHVzaChhLmZpcnN0RWxlbWVudENoaWxkLmdldEF0dHJpYnV0ZSgnc3JjJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBnYWxsZXJ5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgc3JjID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgnc3JjJykgfHwgZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG5cbiAgICAgICAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgICAgICAgICBnYWxsZXJ5LmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICBpbWFnZURpc3BsYXkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheVBpY3R1cmUoc3JjLCBpbWFnZURpc3BsYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsb2NhbE5hdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB0YXNrID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRQaWN0dXJlID0gaW1hZ2VEaXNwbGF5LnF1ZXJ5U2VsZWN0b3IoJ2ltZy5kaXNwbGF5ZWQnKTtcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudFBpY3R1cmVTcmMgPSBjdXJyZW50UGljdHVyZS5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuICAgICAgICAgICAgICAgIGxldCBuZXh0UGljdHVyZVNyYztcblxuICAgICAgICAgICAgICAgaWYgKHRoaXMucXVlcnlTZWxlY3RvckFsbCgnW3Nsb3QgPVwicGljdHVyZVwiJykubGVuZ3RoICE9PSB0aGlzLnBpY3R1cmVTb3VyY2VzLmxlbmd0aCkgeyAvL2NoZWNrIGlmIG1vcmUgcGljdHVyZXMgaGFzIGJlZW4gYWRkZWRcbiAgICAgICAgICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCh0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tzbG90ID1cInBpY3R1cmVcIicpLCAoYSkgPT4geyAvL2luIHRoYXQgY2FzZSB1cGRhdGUgc291cmNlbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNyYyA9IGEuZ2V0QXR0cmlidXRlKCdzcmMnKSB8fCBhLmZpcnN0RWxlbWVudENoaWxkLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5waWN0dXJlU291cmNlcy5pbmRleE9mKHNyYykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waWN0dXJlU291cmNlcy5wdXNoKHNyYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vdHJhdmVyc2UgdGhyb3VnaCB0aGUgcGljdHVyZSBzb3VyY2VzXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2ZvcndhcmQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBpY3R1cmVTcmMgPSB0aGlzLnBpY3R1cmVTb3VyY2VzLmluZGV4T2YoY3VycmVudFBpY3R1cmVTcmMpICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0UGljdHVyZVNyYyA9PT0gdGhpcy5waWN0dXJlU291cmNlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0UGljdHVyZVNyYyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0UGljdHVyZVNyYyA9IHRoaXMucGljdHVyZVNvdXJjZXNbbmV4dFBpY3R1cmVTcmNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5UGljdHVyZShuZXh0UGljdHVyZVNyYywgaW1hZ2VEaXNwbGF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdiYWNrJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQaWN0dXJlU3JjID0gdGhpcy5waWN0dXJlU291cmNlcy5pbmRleE9mKGN1cnJlbnRQaWN0dXJlU3JjKSAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dFBpY3R1cmVTcmMgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBpY3R1cmVTcmMgPSB0aGlzLnBpY3R1cmVTb3VyY2VzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0UGljdHVyZVNyYyA9IHRoaXMucGljdHVyZVNvdXJjZXNbbmV4dFBpY3R1cmVTcmNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5UGljdHVyZShuZXh0UGljdHVyZVNyYywgaW1hZ2VEaXNwbGF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdnYWxsZXJ5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93VGh1bWJuYWlscygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL3Nob3cgZnVsbCBpbWFnZSBpbiBzZXBhcmF0ZSB3aW5kb3cgaWYgY2xpY2tlZFxuICAgICAgICBpbWFnZURpc3BsYXkucXVlcnlTZWxlY3RvcignYS5kaXNwbGF5ZWQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHNyYyA9IGV2ZW50LnRhcmdldC5zcmMgfHwgZXZlbnQudGFyZ2V0LmhyZWY7XG4gICAgICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgICAgICAgb3BlbihzcmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BsYXlzIGFuIGltYWdlIHdpdGggYSBkZXNjcmlwdGlvbi4gRGVzY3JpcHRpb24gaGFzIHRvIGhhdmVcbiAgICAgKiBhIGZvci1hdHRyaWJ1dGUgdGhhdCBtYXRjaGVzIHRoZSBpbWFnZXMgbGFiZWwtYXR0cmlidXRlLlxuICAgICAqIEBwYXJhbSBzcmMge3N0cmluZ30gdGhlIHNvdXJjZSBvZiB0aGUgcGljdHVyZSB0byBkaXNwbGF5XG4gICAgICogQHBhcmFtIGRlc3RpbmF0aW9uIHtIVE1MRWxlbWVudH0gd2hlcmUgdG8gZGlzcGxheSB0aGUgaW1hZ2UuXG4gICAgICovXG4gICAgZGlzcGxheVBpY3R1cmUoc3JjLCBkZXN0aW5hdGlvbikge1xuICAgICAgICBsZXQgZGlzcGxheSA9IGRlc3RpbmF0aW9uO1xuICAgICAgICBsZXQgaW1nID0gZGlzcGxheS5xdWVyeVNlbGVjdG9yKCdpbWcuZGlzcGxheWVkJyk7XG4gICAgICAgIGxldCBhID0gZGlzcGxheS5xdWVyeVNlbGVjdG9yKCdhLmRpc3BsYXllZCcpO1xuICAgICAgICBsZXQgcCA9IGRpc3BsYXkucXVlcnlTZWxlY3RvcigncCNkZXNjcmlwdGlvbicpO1xuXG4gICAgICAgIGxldCBjdXJyZW50ID0gdGhpcy5xdWVyeVNlbGVjdG9yKCdbc3JjPVwiJyArIHNyYyArICdcIl0nKTtcbiAgICAgICAgbGV0IGxhYmVsID0gY3VycmVudC5nZXRBdHRyaWJ1dGUoJ2xhYmVsJyk7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbkZvciA9IFwiW2Zvcj0nXCIgKyBsYWJlbCArIFwiJ11cIjtcbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uID0gdGhpcy5xdWVyeVNlbGVjdG9yKGRlc2NyaXB0aW9uRm9yKS50ZXh0Q29udGVudDtcblxuICAgICAgICBpbWcuc3JjID0gc3JjO1xuICAgICAgICBhLmhyZWYgPSBzcmM7XG4gICAgICAgIHAudGV4dENvbnRlbnQgPSBkZXNjcmlwdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaG93cyBjbGlja2FibGUgdGh1bWJuYWlscyBvZiBhbGwgdGhlIGltYWdlcyBpbiB0aGUgZ2FsbGVyeS5cbiAgICAgKi9cbiAgICBzaG93VGh1bWJuYWlscygpIHtcbiAgICAgICAgbGV0IGdhbGxlcnkgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2dhbGxlcnknKTtcbiAgICAgICAgbGV0IGltYWdlRGlzcGxheSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjaW1hZ2VEaXNwbGF5Jyk7XG5cbiAgICAgICAgZ2FsbGVyeS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIGltYWdlRGlzcGxheS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG5cbiAgICB9XG59XG5cblxuLy9kZWZpbmVzIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2ltYWdlLWdhbGxlcnknLCBJbWFnZUdhbGxlcnkpO1xuIiwiLypcbiAqIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgaW5zdGEtY2hhdC1hcHAgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiAqIEl0IGNvbWJpbmVkIHRoZSBjb21wb25lbnQgaW5zdGEtY2hhdCB3aXRoIHRoZSBjb21wb25lbnQgZHJhZ2dhYmxlLXdpbmRvdywgdG9cbiAqIG1ha2UgYSBjaGF0IGluIGEgd2luZG93IHdpdGggYW4gYWRkZWQgbWVudS5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICovXG5cbmxldCBJbnN0YUNoYXQgPSByZXF1aXJlKCcuL2luc3RhLWNoYXQuanMnKTtcblxuY2xhc3MgSW5zdGFDaGF0QXBwIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIGNoYXQtd2luZG93LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGxldCBjaGF0V2luZG93VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW5zdGEtY2hhdC1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2NoYXRXaW5kb3dUZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxuXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IGNoYXRXaW5kb3dUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIGNoYXQgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGZvclxuICAgICAqIHRoZSBtZW51LCBhbmQgcHJpbnRzIG1lc3NhZ2VzXG4gICAgICogc2F2ZWQgaW4gbG9jYWwgc3RvcmFnZSBpZiBhbnkuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIC8vaW5pdGlhdGUgdGhlIGNoYXRcbiAgICAgICAgbGV0IGNoYXRzcGFjZTtcblxuICAgICAgICBsZXQgbmFtZXNwYWNlID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNzdWJtaXROYW1lJyk7XG4gICAgICAgIGxldCBhYm91dHNwYWNlID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNhYm91dCcpO1xuICAgICAgICBsZXQgc29ja2V0c3BhY2UgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2Nob29zZVNvY2tldCcpO1xuXG4gICAgICAgIGxldCBjaGF0b3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cImNoYXRcIl0nKTtcbiAgICAgICAgbGV0IGFib3V0b3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cImFib3V0XCJdJyk7XG4gICAgICAgIGxldCBvcHRpb25vcHRpb24gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwib3B0aW9uc1wiXScpO1xuXG4gICAgICAgIC8vY2hlY2sgaWYgYSBzb2NrZXQgaGFzIGFscmVhZHkgYmVlbiBjaG9zZW5cbiAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5jaGF0Q29uZmlnKSB7XG4gICAgICAgICAgICBsZXQgY29uZmlnID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuY2hhdENvbmZpZyk7XG4gICAgICAgICAgICBjaGF0c3BhY2UgPSBuZXcgSW5zdGFDaGF0KGNvbmZpZyk7XG5cbiAgICAgICAgICAgIGNoYXRzcGFjZS5zZXRBdHRyaWJ1dGUoJ3Nsb3QnLCAnY29udGVudCcpO1xuICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5hcHBlbmRDaGlsZChjaGF0c3BhY2UpO1xuXG4gICAgICAgICAgICAvL3ByaW50IHRoZSBsYXN0IHR3ZW50eSBtZXNzYWdlcyBmcm9tIGxhc3QgdGltZVxuICAgICAgICAgICAgbGV0IG1lc3NhZ2VzID0gY2hhdHNwYWNlLm1lc3NhZ2VNYW5hZ2VyLmdldENoYXRMb2coKS5yZXZlcnNlKCk7XG4gICAgICAgICAgICBpZiAobWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLmZvckVhY2goKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2hhdHNwYWNlLnByaW50KG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL3Njcm9sbCBkb3duIHdoZW4gd2luZG93IGhhcyBiZWVuIHJlbmRlcmVkXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBjaGF0c3BhY2Uuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjbWVzc2FnZVdpbmRvdycpLnNjcm9sbFRvcCA9IGNoYXRzcGFjZS5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNtZXNzYWdlV2luZG93Jykuc2Nyb2xsSGVpZ2h0O1xuICAgICAgICAgICAgfSwgMTApO1xuXG4gICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgIHNvY2tldHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgIG5hbWVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBjaGF0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICB9IGVsc2UgeyAvL2FzayBmb3IgYSBzb2NrZXRcbiAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgc29ja2V0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgbmFtZXNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNvY2tldHNwYWNlLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgYWRkcmVzcyA9IHNvY2tldHNwYWNlLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0I2FkZHJlc3MnKS52YWx1ZTtcbiAgICAgICAgICAgIGxldCBjaGFubmVsID0gc29ja2V0c3BhY2UucXVlcnlTZWxlY3RvcignaW5wdXQjY2hhbm5lbCcpLnZhbHVlO1xuICAgICAgICAgICAgbGV0IGFwaWtleSA9IHNvY2tldHNwYWNlLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0I2FwaWtleScpLnZhbHVlO1xuICAgICAgICAgICAgbGV0IG5hbWUgPSBzb2NrZXRzcGFjZS5xdWVyeVNlbGVjdG9yKCdpbnB1dCNuYW1lJykudmFsdWU7XG5cbiAgICAgICAgICAgIGxldCBjb25maWcgPSB7XG4gICAgICAgICAgICAgICAgdXJsOiBhZGRyZXNzLFxuICAgICAgICAgICAgICAgIGNoYW5uZWw6IGNoYW5uZWwsXG4gICAgICAgICAgICAgICAga2V5OiBhcGlrZXksXG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmNoYXRDb25maWcgPSBKU09OLnN0cmluZ2lmeShjb25maWcpO1xuXG4gICAgICAgICAgICBjaGF0c3BhY2UgPSBuZXcgSW5zdGFDaGF0KGNvbmZpZyk7XG5cbiAgICAgICAgICAgIGNoYXRzcGFjZS5zZXRBdHRyaWJ1dGUoJ3Nsb3QnLCAnY29udGVudCcpO1xuICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5hcHBlbmRDaGlsZChjaGF0c3BhY2UpO1xuXG4gICAgICAgICAgICBjaGF0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgbmFtZXNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgc29ja2V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB9KTtcblxuICAgICAgICBuYW1lc3BhY2UucXVlcnlTZWxlY3RvcignYnV0dG9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBuYW1lID0gbmFtZXNwYWNlLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykudmFsdWU7XG4gICAgICAgICAgICBjaGF0c3BhY2UuY2hhbmdlQ29uZmlnKHtuYW1lOiBuYW1lfSk7XG4gICAgICAgICAgICBsZXQgY29uZmlnID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuY2hhdENvbmZpZyk7XG4gICAgICAgICAgICBjb25maWcubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UuY2hhdENvbmZpZyA9IEpTT04uc3RyaW5naWZ5KGNvbmZpZyk7XG4gICAgICAgICAgICBuYW1lc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBzb2NrZXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBjaGF0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL2V2ZW50IGxpc3RlbmVycyBmb3IgbWVudSwgYWRkIHNlcGFyYXRlIG9uZXMgZm9yIGFjY2Vzc2liaWxpdHkgcmVhc29uc1xuICAgICAgICBvcHRpb25vcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQuZm9jdXNlZCB8fCBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICduYW1lY2hhbmdlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvY2tldHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnc29ja2V0Y2hhbmdlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb2NrZXRzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncXVpdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vYXZlbnQgbGlzdGVuZXIgZm9yIG1lbnVcbiAgICAgICAgYWJvdXRvcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQuZm9jdXNlZCB8fCBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdhYm91dCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhdHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvY2tldHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL2V2ZW50IGxpc3RlbmVyIGZvciBtZW51XG4gICAgICAgIGNoYXRvcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQuZm9jdXNlZCB8fCBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjaGF0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGF0c3BhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGF0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvY2tldHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIGFwcCBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAgICAgKiBDbG9zZXMgdGhlIHdpbmRvdyBhbmQgdGhlIHdlYiBzb2NrZXQuXG4gICAgICovXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgY29udGFpbmluZyB0aGUgYXBwIGlzIG9wZW4uXG4gICAgICovXG4gICAgZ2V0IG9wZW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm9wZW47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGNvbnRhaW5pbmcgdGhlIGFwcCBpcyBtaW5pbWl6ZWQuXG4gICAgICovXG4gICAgZ2V0IG1pbmltaXplZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93JykubWluaW1pemVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIG1pbmltaXplZCBwcm9wZXJ0eSBvZiB0aGUgd2luZG93IGNvbnRhaW5pbmcgdGhlIGFwcC5cbiAgICAgKiBAcGFyYW0gbWluaW1pemUge2Jvb2xlYW59IHdoZXRoZXIgdG8gbWluaW1pemVcbiAgICAgKi9cbiAgICBzZXQgbWluaW1pemVkKG1pbmltaXplKSB7XG4gICAgICAgIGlmIChtaW5pbWl6ZSkge1xuICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5taW5pbWl6ZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5taW5pbWl6ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2VzIHRoZSB3aW5kb3cgYW5kIHRoZSB3ZWIgc29ja2V0LlxuICAgICAqL1xuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdpbnN0YS1jaGF0Jykuc29ja2V0LmNsb3NlKCk7XG4gICAgfVxufVxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnaW5zdGEtY2hhdC1hcHAnLCBJbnN0YUNoYXRBcHApO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdGFDaGF0QXBwO1xuIiwiLypcbiAqIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgaW5zdGEtY2hhdCB0byBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuICogSXQgY3JlYXRlcyBhIGNoYXQgY29ubmVjdGVkIHRvIGEgd2ViIHNvY2tldCB0aGF0IHNlbmRzLCByZWNlaXZlcyBhbmQgcHJpbnRzXG4gKiBtZXNzYWdlcy5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICovXG5cbmNsYXNzIEluc3RhQ2hhdCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBjaGF0LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICogQHBhcmFtIGNvbmZpZyB7b2JqZWN0fSBhIGNvbmZpZyBvYmplY3Qgd2l0aCB0aGUgd2Vic29ja2V0cyB1cmwsIGNoYW5uZWwsIGtleSBhbmQgYSBuYW1lIGZvciB0aGUgdXNlclxuICAgICAqIEBwYXJhbSBzdGFydE1lc3NhZ2VzIHtbT2JqZWN0XX0gbWVzc2FnZXMgdG8gcHJpbnQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBjaGF0LlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZyA9IHt9LCBzdGFydE1lc3NhZ2VzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGxldCBjaGF0VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW5zdGEtY2hhdC1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW5zdGEtY2hhdC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFRlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cbiAgICAgICAgLy9zZXR1cCBzaGFkb3cgZG9tIHN0eWxlc1xuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBjaGF0VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuXG4gICAgICAgIC8vc2V0IGNvbmZpZyBvYmplY3QgYXMgdGhpcy5jb25maWdcbiAgICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgICAgICB1cmw6IGNvbmZpZy51cmwgfHwgJycsXG4gICAgICAgICAgICBuYW1lOiBjb25maWcubmFtZSB8fCAnc2V2ZXJ1cyBzbmFwZScsXG4gICAgICAgICAgICBjaGFubmVsOiBjb25maWcuY2hhbm5lbCB8fCAnJyxcbiAgICAgICAgICAgIGtleTogY29uZmlnLmtleSB8fCAnJ1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLm1lc3NhZ2VzID0gc3RhcnRNZXNzYWdlcyB8fCBbXTtcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLm9ubGluZUNoZWNrZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgd2hlbiBjaGF0IGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAgICAgKiBDb25uZWN0cyB0byB0aGUgc2VydmVyLCBzZXRzIHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgcHJpbnRzXG4gICAgICogYWxyZWFkeSBzYXZlZCBtZXNzYWdlcyBpZiBhbnkuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIC8vY29ubmVjdFxuICAgICAgICB0aGlzLmNvbm5lY3QoKTtcblxuICAgICAgICAvL3NldCBldmVudCBsaXN0ZW5lciB0byBzZW5kIG1lc3NhZ2Ugb24gZW50ZXJcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNtZXNzYWdlQXJlYScpLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9pZiBtZXNzYWdlcyB0byBwcmludCBhdCBzdGFydCBvZiBjaGF0LCBwcmludCBlYWNoXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZXMuZm9yRWFjaCgobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJpbnQobWVzc2FnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlcyB0aGUgd2ViIHNvY2tldCBjb25uZWN0aW9uIGlmIGNoYXQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00uXG4gICAgICovXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMuc29ja2V0LmNsb3NlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29ubmVjdHMgdG8gdGhlIFdlYlNvY2tldCBzZXJ2ZXIuXG4gICAgICogQHJldHVybnMge1Byb21pc2V9IHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgY29ubmVjdGlvbiBpcyBvcGVuXG4gICAgICogYW5kIHJlamVjdHMgd2l0aCB0aGUgc2VydmVyIHJlc3BvbnNlIGlmIHNvbWV0aGluZyB3ZW50IHdyb25nLlxuICAgICAqIElmIGEgY29ubmVjdGlvbiBpcyBhbHJlYWR5IG9wZW4sIHJlc29sdmVzIHdpdGhcbiAgICAgKiB0aGUgc29ja2V0IGZvciB0aGF0IGNvbm5lY3Rpb24uXG4gICAgICovXG4gICAgY29ubmVjdCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgbGV0IHNvY2tldCA9IHRoaXMuc29ja2V0O1xuXG4gICAgICAgICAgICAvL2NoZWNrIGZvciBlc3RhYmxpc2hlZCBjb25uZWN0aW9uXG4gICAgICAgICAgICBpZiAoc29ja2V0ICYmIHNvY2tldC5yZWFkeVN0YXRlICYmIHNvY2tldC51cmwgPT09IHRoaXMuY29uZmlnLnVybCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoc29ja2V0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh0aGlzLmNvbmZpZy51cmwpO1xuXG4gICAgICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc29ja2V0KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdjb3VsZCBub3QgY29ubmVjdCB0byBzZXJ2ZXInKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByaW50KHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZU1hbmFnZXIuc2V0Q2hhdExvZyhyZXNwb25zZSk7IC8vc2F2ZSBtZXNzYWdlIGluIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS50eXBlID09PSAnaGVhcnRiZWF0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlTWFuYWdlci5nZXRVbnNlbnQoKS5mb3JFYWNoKChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VNYW5hZ2VyLmNsZWFyVW5zZW50KCk7IC8vcHVzaCB1bnNlbnQgbWVzc2FnZXMgd2hlbiB0aGVyZSBpcyBhIGNvbm5lY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyBhIG1lc3NhZ2UgdG8gdGhlIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB7c3RyaW5nfSB0aGUgbWVzc2FnZSB0byBzZW5kLlxuICAgICAqL1xuICAgIHNlbmQobWVzc2FnZSkge1xuXG4gICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgdHlwZTogJ21lc3NhZ2UnLFxuICAgICAgICAgICAgZGF0YTogbWVzc2FnZSxcbiAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLmNvbmZpZy5uYW1lLFxuICAgICAgICAgICAgY2hhbm5lbDogdGhpcy5jb25maWcuY2hhbm5lbCxcbiAgICAgICAgICAgIGtleTogdGhpcy5jb25maWcua2V5XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jb25uZWN0KClcbiAgICAgICAgICAgIC50aGVuKChzb2NrZXQpID0+IHtcbiAgICAgICAgICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgIH0pLmNhdGNoKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlTWFuYWdlci5zZXRVbnNlbnQoZGF0YSk7XG4gICAgICAgICAgICB0aGlzLnByaW50KGRhdGEsIHRydWUpOyAvL3ByaW50IG1lc3NhZ2UgYXMgXCJ1bnNlbnRcIiB0byBtYWtlIGl0IGxvb2sgZGlmZmVyZW50O1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByaW50cyBhIG1lc3NhZ2UuXG4gICAgICogQHBhcmFtIG1lc3NhZ2Uge09iamVjdH0gdGhlIG1lc3NhZ2UgdG8gcHJpbnQuXG4gICAgICogQHBhcmFtIHVuc2VudCB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgbWVzc2FnZSBoYXMgbm90IGJlZW4gc3VjY2Vzc2Z1bGx5IHNlbnRcbiAgICAgKi9cbiAgICBwcmludChtZXNzYWdlLCB1bnNlbnQpIHtcbiAgICAgICAgbGV0IG1lc3NhZ2VUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbnN0YS1jaGF0LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbnN0YS1jaGF0Lmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNtZXNzYWdlVGVtcGxhdGVcIik7IC8vbWVzc2FnZSBkaXNwbGF5IHRlbXBsYXRlXG5cbiAgICAgICAgbGV0IGNoYXRXaW5kb3cgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI21lc3NhZ2VXaW5kb3cnKTtcbiAgICAgICAgbGV0IG1lc3NhZ2VEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKG1lc3NhZ2VUZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yKCcuYXV0aG9yJykudGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGEudXNlcm5hbWUgfHwgbWVzc2FnZS51c2VybmFtZTtcbiAgICAgICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yKCcubWVzc2FnZScpLnRleHRDb250ZW50ID0gbWVzc2FnZS5kYXRhLmRhdGEgfHwgbWVzc2FnZS5kYXRhO1xuXG4gICAgICAgIGlmICh1bnNlbnQpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VEaXYuY2xhc3NMaXN0LmFkZCgndW5zZW50Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGF0V2luZG93LmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpO1xuICAgICAgICBjaGF0V2luZG93LnNjcm9sbFRvcCA9IGNoYXRXaW5kb3cuc2Nyb2xsSGVpZ2h0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gb2JqZWN0IHRvIG1hbmFnZSBtZXNzYWdlcy5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB0aGUgb2JqZWN0LlxuICAgICAqL1xuICAgIGdldCBtZXNzYWdlTWFuYWdlcigpIHtcbiAgICAgICAgICAgIGxldCBzdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgICAgICAgICAgbGV0IGNoYXRMb2cgPSBbXTtcbiAgICAgICAgICAgIGxldCB1bnNlbnQgPSBbXTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZXRyaWV2ZXMgY2hhdCBsb2cgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSB0aGUgLCBvciB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG5vIG1lc3NhZ2VzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdldENoYXRMb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlLmNoYXRMb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhdExvZyA9IEpTT04ucGFyc2Uoc3RvcmFnZS5jaGF0TG9nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY2hhdExvZztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFJldHJpZXZlcyB1bnNlbnQgbWVzc2FnZXMgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSB0aGUgbWVzc2FnZXMsIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbm8gbWVzc2FnZXNcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZ2V0VW5zZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RvcmFnZS51bnNlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdW5zZW50ID0gSlNPTi5wYXJzZShzdG9yYWdlLnVuc2VudCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuc2VudDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHNldHMgdW5zZW50IG1lc3NhZ2VzIGluIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEBwYXJhbSBtZXNzYWdlIHtvYmplY3R9IHRoZSBtZXNzYWdlIG9iamVjdCB0byBzYXZlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNldFVuc2VudDogZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGxldCBvbGRNZXNzYWdlcztcblxuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlLnVuc2VudCkge1xuICAgICAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcyA9IEpTT04ucGFyc2Uoc3RvcmFnZS51bnNlbnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMudW5zaGlmdChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHN0b3JhZ2UudW5zZW50ID0gSlNPTi5zdHJpbmdpZnkob2xkTWVzc2FnZXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQ2xlYXJzIHVuc2VudCBtZXNzYWdlcy5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY2xlYXJVbnNlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbSgndW5zZW50Jyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFNldHMgc2VudCBtZXNzYWdlcyBpbiBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgKiBAcGFyYW0gbWVzc2FnZSB7b2JqZWN0fSB0aGUgbWVzc2FnZSBvYmplY3QgdG8gc2F2ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzZXRDaGF0TG9nOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9sZE1lc3NhZ2VzO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2UuY2hhdExvZykge1xuICAgICAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcyA9IEpTT04ucGFyc2Uoc3RvcmFnZS5jaGF0TG9nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzLnVuc2hpZnQobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAob2xkTWVzc2FnZXMubGVuZ3RoID4gMjApIHsgLy9rZWVwIHRoZSBsaXN0IHRvIDIwIG1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzLmxlbmd0aCA9IDIwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN0b3JhZ2UuY2hhdExvZyA9IEpTT04uc3RyaW5naWZ5KG9sZE1lc3NhZ2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBjb25maWcgZmlsZS5cbiAgICAgKiBAcGFyYW0gY29uZmlnIHtvYmplY3R9IHRoZSBuZXcgdmFsdWVzIGluIGFuIG9iamVjdC5cbiAgICAgKi9cbiAgICBjaGFuZ2VDb25maWcoY29uZmlnKSB7XG4gICAgICAgIHRoaXMuY29uZmlnLm5hbWUgPSBjb25maWcubmFtZSB8fCB0aGlzLmNvbmZpZy5uYW1lO1xuICAgICAgICB0aGlzLmNvbmZpZy51cmwgPSBjb25maWcudXJsfHwgdGhpcy5jb25maWcudXJsO1xuICAgICAgICB0aGlzLmNvbmZpZy5jaGFubmVsID0gY29uZmlnLmNoYW5uZWwgfHwgdGhpcy5jb25maWcuY2hhbm5lbDtcbiAgICAgICAgdGhpcy5jb25maWcua2V5ID0gY29uZmlnLmtleSB8fCB0aGlzLmNvbmZpZy5rZXk7XG4gICAgfVxufVxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnaW5zdGEtY2hhdCcsIEluc3RhQ2hhdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdGFDaGF0O1xuIiwiLypcbiAqIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgbWVtb3J5LWFwcCB0byBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuICogSXQgY29tYmluZXMgdGhlIGNvbXBvbmVudCBtZW1vcnktZ2FtZSB3aXRoIHRoZSBjb21wb25lbnQgZHJhZ2dhYmxlLXdpbmRvdywgdG9cbiAqIG1ha2UgYSBjaGF0IGluIGEgd2luZG93IHdpdGggYW4gYWRkZWQgbWVudS5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICovXG5cbmNsYXNzIE1lbW9yeUFwcCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBtZW1vcnktd2luZG93LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGxldCBtZW1vcnlXaW5kb3dUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlXaW5kb3dUZW1wbGF0ZVwiKTtcblxuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBtZW1vcnlXaW5kb3dUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIG1lbW9yeS1hcHAgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGZvclxuICAgICAqIHRoZSBtZW51IGFuZCBnYW1lIGJvYXJkIHNpemUuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIGxldCBnYW1lc3BhY2UgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKTtcbiAgICAgICAgbGV0IGhpZ2hzY29yZXNwYWNlID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNoaWdoc2NvcmVzJyk7XG4gICAgICAgIGxldCBhYm91dHNwYWNlID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNhYm91dCcpO1xuXG4gICAgICAgIGxldCBnYW1lID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ21lbW9yeS1nYW1lJyk7XG4gICAgICAgIGxldCBnYW1lT3B0aW9ucyA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJnYW1lXCJdJyk7XG4gICAgICAgIGxldCBoaWdoc2NvcmVzT3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cImhpZ2hzY29yZVwiXScpO1xuICAgICAgICBsZXQgYWJvdXRPcHRpb24gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwiYWJvdXRcIl0nKTtcblxuICAgICAgICAvL21lbnUgZXZlbnQgbGlzdGVuZXJzLCBhZGQgc2VwYXJhdGUgb25lcyBmb3IgYWNjZXNzaWJpbGl0eSByZWFzb25zXG4gICAgICAgIGdhbWVPcHRpb25zLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LmZvY3VzZWQgfHwgZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0OyAvL3NoYWRvdyBET00gYWNjZXNzaWJpbGl0eSBpc3N1ZXNcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZXN0YXJ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lc3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZXNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lc3BhY2UucmVwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICduZXcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaHNjb3Jlc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVzcGFjZS5yZXN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdxdWl0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIC8vbWVudSBldmVudCBsaXN0ZW5lclxuICAgICAgICBoaWdoc2NvcmVzT3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0OyAvL3NoYWRvdyBET00gYWNjZXNzaWJpbGl0eSBpc3N1ZXNcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdoaWdoc2NvcmVzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hzY29yZXMoZ2FtZS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZXNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZXNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL21lbnUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgYWJvdXRPcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7IC8vc2hhZG93IERPTSBhY2Nlc3NpYmlsaXR5IGlzc3Vlc1xuICAgICAgICAgICAgbGV0IHRhc2sgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Fib3V0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBoaWdoc2NvcmVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9ib2FyZCBzaXplIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5wYXRoWzBdO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2JvYXJkc2l6ZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51c2VyID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbnRybyBpbnB1dCcpLnZhbHVlIHx8ICdzdHJhbmdlcic7IC8vZ2V0IHRoZSBuYW1lIHdoZW4gYm9hcmQgc2l6ZSBpcyBjaG9zZW5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2JvYXJkc2l6ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzQ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUud2lkdGggPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5oZWlnaHQgPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5kcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc0Mic6XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLndpZHRoID0gNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuaGVpZ2h0ID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnMjQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS53aWR0aCA9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmhlaWdodCA9IDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgd2hlbiBhcHAgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00uXG4gICAgICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIGhpZ2hzY29yZXMgYnkgc2V0dGluZyB0aGVtIGluIHRoZSBsb2NhbCBzdG9yYWdlXG4gICAgICogYW5kIGRpc3BsYXlpbmcgZGVtLlxuICAgICAqIEBwYXJhbSByZXN1bHRcbiAgICAgKi9cbiAgICB1cGRhdGVIaWdoc2NvcmVzKHJlc3VsdCkge1xuICAgICAgICBsZXQgaGlnaHNjb3Jlc1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2hpZ2hzY29yZXNUZW1wbGF0ZVwiKTtcblxuICAgICAgICBsZXQgaGlnaHNjb3JlcyA9IHtcbiAgICAgICAgICAgIHN0b3JhZ2U6IGxvY2FsU3RvcmFnZSxcbiAgICAgICAgICAgIHNjb3JlczogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZXRyaWV2ZXMgaGlnaHNjb3JlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSBoaWdoc2NvcmUtbGlzdCwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBubyBoaWdoc2NvcmVzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdldEhpZ2hTY29yZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdG9yYWdlLm1lbW9yeUhpZ2hTY29yZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29yZXMgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zY29yZXM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBzZXRzIGhpZ2hzY29yZXMgaW4gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICogQHBhcmFtIHVzZXIge3N0cmluZ30gdGhlIHVzZXJzIG5hbWVcbiAgICAgICAgICAgICAqIEBwYXJhbSBuZXdTY29yZSB7bnVtYmVyfSB0aGUgc2NvcmUgdG8gc2V0XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNldEhpZ2hTY29yZXM6IGZ1bmN0aW9uICh1c2VyLCBuZXdTY29yZSkge1xuICAgICAgICAgICAgICAgIGxldCBvbGRIaWdoU2NvcmVzO1xuICAgICAgICAgICAgICAgIGxldCBuZXdIaWdoU2NvcmVzO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEhpZ2hTY29yZXMgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvbGRIaWdoU2NvcmVzID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2xkSGlnaFNjb3Jlcy5wdXNoKHt1c2VyOiB1c2VyLCBzY29yZTogbmV3U2NvcmV9KTtcblxuICAgICAgICAgICAgICAgIG5ld0hpZ2hTY29yZXMgPSBvbGRIaWdoU2NvcmVzLnNvcnQoKGEsIGIpID0+IHsgLy9zb3J0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhLnNjb3JlIC0gYi5zY29yZTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXdIaWdoU2NvcmVzLmxlbmd0aCA+IDUpIHsgLy9rZWVwIHRoZSBsaXN0IHRvIDUgc2NvcmVzXG4gICAgICAgICAgICAgICAgICAgIG5ld0hpZ2hTY29yZXMubGVuZ3RoID0gNTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnN0b3JhZ2UubWVtb3J5SGlnaFNjb3JlcyA9IEpTT04uc3RyaW5naWZ5KG5ld0hpZ2hTY29yZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChyZXN1bHQpIHsgLy9hIG5ldyByZXN1bHQgaXMgcHJlc2VudFxuICAgICAgICAgICAgbGV0IHNjb3JlID0gKHJlc3VsdC50dXJucyAqIHJlc3VsdC50aW1lKSAvICh0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKS5oZWlnaHQgKiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKS53aWR0aCk7XG4gICAgICAgICAgICBoaWdoc2NvcmVzLnNldEhpZ2hTY29yZXModGhpcy51c2VyLCBzY29yZSk7XG4gICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKS5yZXN1bHQgPSB1bmRlZmluZWQ7IC8vY2xlYW4gdGhlIHJlc3VsdFxuICAgICAgICB9XG5cbiAgICAgICAgLy9kaXNwbGF5IHRoZSBzY29yZXNcbiAgICAgICAgbGV0IHNjb3JlcyA9IGhpZ2hzY29yZXMuZ2V0SGlnaFNjb3JlcygpO1xuICAgICAgICBsZXQgaGlnaHNjb3JlRGlzcGxheSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjaGlnaHNjb3JlRGlzcGxheScpO1xuICAgICAgICBsZXQgb2xkTGlzdCA9IGhpZ2hzY29yZURpc3BsYXkucXVlcnlTZWxlY3RvcigndWwnKTtcbiAgICAgICAgbGV0IGxpc3QgPSBkb2N1bWVudC5pbXBvcnROb2RlKGhpZ2hzY29yZXNUZW1wbGF0ZS5jb250ZW50LnF1ZXJ5U2VsZWN0b3IoXCJ1bFwiKSwgdHJ1ZSk7XG4gICAgICAgIGxldCBlbnRyeTtcblxuICAgICAgICBpZiAoc2NvcmVzKSB7XG4gICAgICAgICAgICBzY29yZXMuZm9yRWFjaCgoc2NvcmUpID0+IHtcbiAgICAgICAgICAgICAgICBlbnRyeSA9IGRvY3VtZW50LmltcG9ydE5vZGUoKGxpc3QucXVlcnlTZWxlY3RvcihcImxpXCIpKSk7XG4gICAgICAgICAgICAgICAgZW50cnkudGV4dENvbnRlbnQgPSBzY29yZS51c2VyICsgXCI6IFwiICsgc2NvcmUuc2NvcmU7XG4gICAgICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChlbnRyeSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVudHJ5ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSgobGlzdC5xdWVyeVNlbGVjdG9yKFwibGlcIikpKTtcbiAgICAgICAgICAgIGVudHJ5LnRleHRDb250ZW50ID0gXCItXCI7XG4gICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKGVudHJ5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb2xkTGlzdCkgeyAvL2lmIHNjb3JlcyBoYXZlIGFscmVhZHkgYmVlbiBkaXNwbGF5ZWQsIHJlcGxhY2UgdGhlbVxuICAgICAgICAgICAgaGlnaHNjb3JlRGlzcGxheS5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhpZ2hzY29yZURpc3BsYXkucmVwbGFjZUNoaWxkKGxpc3QsIG9sZExpc3QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGNvbnRhaW5pbmcgdGhlIGFwcCBpcyBvcGVuLlxuICAgICAqL1xuICAgIGdldCBvcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5vcGVuO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBjb250YWluaW5nIHRoZSBhcHAgaXMgbWluaW1pemVkLlxuICAgICAqL1xuICAgIGdldCBtaW5pbWl6ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBtaW5pbWl6ZWQgcHJvcGVydHkgb2YgdGhlIHdpbmRvdyBjb250YWluaW5nIHRoZSBhcHAuXG4gICAgICogQHBhcmFtIG1pbmltaXplIHtib29sZWFufSB3aGV0aGVyIHRvIG1pbmltaXplXG4gICAgICovXG4gICAgc2V0IG1pbmltaXplZChtaW5pbWl6ZSkge1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZCA9IG1pbmltaXplO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIG5vZGUgYW5kIGNsb3NlcyB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93JykuY2xvc2UoKTtcbiAgICB9XG5cbn1cblxuLy9oZWxwZXIgZnVuY3Rpb25cbi8vYWRkcyBtdWx0aXBsZSBldmVudCBsaXN0ZW5lcnMgd2l0aCBpZGVudGljYWwgaGFuZGxlcnNcbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzKGVsZW1lbnQsIGV2ZW50cywgaGFuZGxlcikge1xuICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSk7XG59XG5cbi8vZGVmaW5lIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ21lbW9yeS1hcHAnLCBNZW1vcnlBcHApO1xuIiwiLypcbiAqIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgbWVtb3J5LWdhbWUgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiAqIEl0IGNyZWF0ZXMgYSBtZW1vcnkgZ2FtZSB3aXRoIGEgdGltZXIgYSBhIHR1cm4tY291bnRlci4gVGhlIGdhbWUgaXMgb3ZlciB3aGVuXG4gKiBhbGwgYnJpY2tzIGhhdmUgYmVlbiBwYWlyZWQgYW5kIHN0b3JlcyB0aGUgdG90YWwgdGltZSBhbmQgdHVybnMgaW4gYSByZXN1bHQtdmFyaWFibGUuXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICpcbiAqL1xuXG4vL3JlcXVpcmVzXG5sZXQgVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyLmpzJyk7XG5cblxuY2xhc3MgTWVtb3J5R2FtZSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBtZW1vcnkgZ2FtZSwgc2V0cyB1cCBzaGFkb3cgRE9NLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgbGV0IG1lbW9yeVRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWdhbWUuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeVRlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cbiAgICAgICAgLy9zZXR1cCBzaGFkb3cgZG9tIHN0eWxlc1xuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBtZW1vcnlUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICAgICAgLy9zZXQgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkYXRhLXdpZHRoJywgd2lkdGggfHwgdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2lkdGgnKSB8fCA0KTtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0JywgaGVpZ2h0IHx8IHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcpICB8fCA0KTtcblxuICAgICAgICAvL3NldCByZWZlcmVuY2VzXG4gICAgICAgIHRoaXMuc2V0ID0gW107XG4gICAgICAgIHRoaXMudGltZXIgPSBuZXcgVGltZXIoMCk7XG4gICAgICAgIHRoaXMuZ2FtZVBsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudGltZXNwYW4gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiN0aW1lc3BhblwiKTtcbiAgICAgICAgdGhpcy50dXJuc3BhbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI3R1cm5zcGFuXCIpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIG1lbW9yeSBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgYW5kIHJlbmRlcnMgYSBib2FyZCB3aXRoIGJyaWNrcy5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbnRybyBidXR0b24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZHJhdygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSB3aWR0aCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzXG4gICAgICovXG4gICAgZ2V0IHdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2lkdGgnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB3aWR0aCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzLlxuICAgICAqIEBwYXJhbSBuZXdWYWwge3N0cmluZ30gdGhlIG5ldyB3aWR0aCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzXG4gICAgICovXG4gICAgc2V0IHdpZHRoKG5ld1ZhbCkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnZGF0YS13aWR0aCcsIG5ld1ZhbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIGhlaWdodCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzXG4gICAgICovXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGhlaWdodCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzLlxuICAgICAqIEBwYXJhbSBuZXdWYWwge3N0cmluZ30gdGhlIG5ldyBoZWlnaHQgb2YgdGhlIGJvYXJkIGluIGJyaWNrc1xuICAgICAqL1xuICAgIHNldCBoZWlnaHQobmV3VmFsKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcsIG5ld1ZhbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2h1ZmZsZXMgdGhlIGJyaWNrcyB1c2luZyBGaXNoZXItWWF0ZXMgYWxnb3JpdGhtLlxuICAgICAqL1xuICAgIHNodWZmbGUoKSB7XG4gICAgICAgIGxldCB0aGVTZXQgPSB0aGlzLnNldDtcbiAgICAgICAgZm9yIChsZXQgaSA9ICh0aGVTZXQubGVuZ3RoIC0gMSk7IGkgPiAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgIGxldCBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSk7XG4gICAgICAgICAgICBsZXQgaU9sZCA9IHRoZVNldFtpXTtcbiAgICAgICAgICAgIHRoZVNldFtpXSA9IHRoZVNldFtqXTtcbiAgICAgICAgICAgIHRoZVNldFtqXSA9IGlPbGQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQgPSB0aGVTZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgYnJpY2tzIHRvIHRoZSBib2FyZCBhbmQgcmVuZGVycyB0aGVtIGluIHRoZSBET00uXG4gICAgICovXG4gICAgZHJhdygpIHtcbiAgICAgICAgbGV0IGJyaWNrVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktZ2FtZS5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjYnJpY2tUZW1wbGF0ZVwiKTsgLy9icmljayB0ZW1wbGF0ZVxuXG4gICAgICAgIGxldCBicmljaztcbiAgICAgICAgbGV0IG1hdGNoO1xuICAgICAgICBsZXQgcGFpcnMgPSBNYXRoLnJvdW5kKCh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQpKSAvIDI7XG4gICAgICAgIHRoaXMuc2V0ID0gW107XG4gICAgICAgIGxldCBvbGRCcmlja3MgPSB0aGlzLmNoaWxkcmVuO1xuXG4gICAgICAgIC8vcmVtb3ZlIG9sZCBicmlja3MgaWYgYW55XG4gICAgICAgIGZvciAobGV0IGkgPSBvbGRCcmlja3MubGVuZ3RoIC0xOyBpID49IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgbGV0IGJyaWNrID0gb2xkQnJpY2tzW2ldO1xuICAgICAgICAgICAgaWYgKGJyaWNrLmdldEF0dHJpYnV0ZSgnc2xvdCcpID09PSAnYnJpY2snKSB7XG4gICAgICAgICAgICAgICAgYnJpY2sucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChicmljayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL2luaXRpYXRlIGJyaWNrc1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBwYWlyczsgaSArPSAxKSB7XG4gICAgICAgICAgICBicmljayA9IG5ldyBCcmljayhpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0LnB1c2goYnJpY2spO1xuICAgICAgICAgICAgbWF0Y2ggPSBicmljay5jbG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5zZXQucHVzaChtYXRjaCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRoZVNldCA9IHRoaXMuc2V0O1xuXG4gICAgICAgIC8vcHV0IHRoZW0gaW4gdGhlIGRvbVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoZVNldC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgbGV0IGJyaWNrRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShicmlja1RlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICAgICAgbGV0IGltZyA9IGJyaWNrRGl2LnF1ZXJ5U2VsZWN0b3IoXCJpbWdcIik7XG4gICAgICAgICAgICBsZXQgYnJpY2sgPSB0aGVTZXRbaV07XG4gICAgICAgICAgICBpbWcuc3JjID0gJy9pbWFnZS9tZW1vcnktYnJpY2stJyArIGJyaWNrLmRyYXcoKSArICcucG5nJztcbiAgICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJicmlja051bWJlclwiLCBpKTtcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kQ2hpbGQoYnJpY2tEaXYpO1xuXG4gICAgICAgICAgICBpZiAoKGkgKyAxKSAlIHRoaXMud2lkdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgYnIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIik7XG4gICAgICAgICAgICAgICAgYnIuc2V0QXR0cmlidXRlKCdzbG90JywgJ2JyaWNrJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChicik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydHMgYSBnYW1lLCBwbGF5cyBpdCB0aHJvdWdoLCBzYXZlcyB0aGUgcmVzdWx0IGFuZFxuICAgICAqIHRoZW4gZGlzcGxheXMgdGhlIG91dHJvLlxuICAgICAqL1xuICAgIHBsYXkoKSB7XG4gICAgICAgIHRoaXMuc2h1ZmZsZSgpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI21haW5cIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMudGltZXIuc3RhcnQoMCk7XG4gICAgICAgIHRoaXMudGltZXIuZGlzcGxheSh0aGlzLnRpbWVzcGFuKTtcbiAgICAgICAgcGxheUdhbWUodGhpcy5zZXQsIHRoaXMpXG4gICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnRpbWUgPSB0aGlzLnRpbWVyLnN0b3AoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblwiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cm9cIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzdGFydHMgdGhlIGdhbWUgd2l0aCB0aGUgc2FtZSBzaXplIG9mIGJvYXJkIHdpdGhvdXQgcmUtcmVuZGVyaW5nXG4gICAgICovXG4gICAgcmVwbGF5KCkge1xuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI2ludHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblwiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI291dHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBnYW1lIGFuZCB0aGVuIGxldHMgdGhlIHVzZXIgY2hvb3NlIGEgbmV3IGdhbWUgc2l6ZSBhbmRcbiAgICAgKiB1c2VyIG5hbWUsIHJlLXJlbmRlcmluZyB0aGUgYm9hcmQuXG4gICAgICovXG4gICAgcmVzdGFydCgpIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI21haW5cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBnYW1lIHRvIG1ha2UgaXQgcGxheWFibGUgYWdhaW4uIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzXG4gICAgICogYW5kIHR1cm5zIHRoZSBicmlja3Mgb3Zlci5cbiAgICAgKi9cbiAgICByZXNldCgpIHtcbiAgICAgICAgbGV0IGJyaWNrcyA9IHRoaXMucXVlcnlTZWxlY3RvckFsbCgnW3Nsb3Q9XCJicmlja1wiXScpO1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGJyaWNrcywgKGJyaWNrKSA9PiB7XG4gICAgICAgICAgICBicmljay5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICAgICAgICAgICAgbGV0IGltZyA9IGJyaWNrLnF1ZXJ5U2VsZWN0b3IoXCJpbWdcIik7XG4gICAgICAgICAgICBpZiAoaW1nKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJyaWNrTnVtYmVyID0gaW1nLmdldEF0dHJpYnV0ZShcImJyaWNrTnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldFticmlja051bWJlcl0uZHJhdygpICE9PSAwKSB7IC8vdHVybiB0aGUgYnJpY2sgb3ZlciBpZiBpdCdzIG5vdCB0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgaW1nLnNyYyA9ICcvaW1hZ2UvbWVtb3J5LWJyaWNrLScgKyB0aGlzLnNldFticmlja051bWJlcl0udHVybigpICsgJy5wbmcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGltZXNwYW4udGV4dENvbnRlbnQgPSAnJztcbiAgICAgICAgdGhpcy50dXJuc3Bhbi50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgICB0aGlzLnRpbWVyLnN0b3AoKTsgLy9tYWtlIHN1cmUgdGltZXIgaXMgc3RvcHBlZFxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2JvYXJkJykucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZ2FtZVBsYXkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuZHMgdGhlIGdhbWUgYW5kIGRpc3BsYXlzIHRoZSBvdXRyby5cbiAgICAgKi9cbiAgICBlbmQoKSB7XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjaW50cm9cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNtYWluXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cm9cIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgIH1cbn1cblxuLy9kZWZpbmVzIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ21lbW9yeS1nYW1lJywgTWVtb3J5R2FtZSk7XG5cblxuLyoqXG4gKiBBIGNsYXNzIEJyaWNrIHRvIGdvIHdpdGggdGhlIG1lbW9yeSBnYW1lLlxuICovXG5jbGFzcyBCcmljayB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIHRoZSBCcmljayB3aXRoIGEgdmFsdWUgYW5kIHBsYWNlcyBpdCBmYWNlZG93bi5cbiAgICAgKiBAcGFyYW0gbnVtYmVyIHtudW1iZXJ9IHRoZSB2YWx1ZSB0byBpbml0aWF0ZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihudW1iZXIpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IG51bWJlcjtcbiAgICAgICAgdGhpcy5mYWNlZG93biA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHVybnMgdGhlIGJyaWNrIGFuZCByZXR1cm5zIHRoZSB2YWx1ZSBhZnRlciB0aGUgdHVybi5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgdmFsdWUgb2YgdGhlIGJyaWNrIGlmIGl0J3MgZmFjZXVwLCBvdGhlcndpc2UgMC5cbiAgICAgKi9cbiAgICB0dXJuKCkge1xuICAgICAgICB0aGlzLmZhY2Vkb3duID0gISh0aGlzLmZhY2Vkb3duKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhdygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byBicmlja3MuXG4gICAgICogQHBhcmFtIG90aGVyIHtCcmlja30gdGhlIEJyaWNrIHRvIGNvbXBhcmUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGJyaWNrcyB2YWx1ZXMgYXJlIGVxdWFsLlxuICAgICAqL1xuICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICByZXR1cm4gKG90aGVyIGluc3RhbmNlb2YgQnJpY2spICYmICh0aGlzLnZhbHVlID09PSBvdGhlci52YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvbmVzIHRoZSBicmljay5cbiAgICAgKiBAcmV0dXJucyB7QnJpY2t9IHRoZSBjbG9uZS5cbiAgICAgKi9cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCcmljayh0aGlzLnZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgYnJpY2sncyB2YWx1ZSwgb3IgMCBpZiBpdCBpcyBmYWNlIGRvd24uXG4gICAgICovXG4gICAgZHJhdygpIHtcbiAgICAgICAgaWYgKHRoaXMuZmFjZWRvd24pIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHNldHMgdXAgdGhlIGdhbWVwbGF5LiBBZGRzIGFuZCByZW1vdmVzIGV2ZW50LWxpc3RlbmVycyBzbyB0aGF0IHRoZSBzYW1lIGdhbWUgY2FuIGJlIHJlc2V0LlxuICogQHBhcmFtIHNldCBbe0JyaWNrXX0gdGhlIHNldCBvZiBicmlja3MgdG8gcGxheSB3aXRoLlxuICogQHBhcmFtIGdhbWUge25vZGV9IHRoZSBzcGFjZSB0byBwbGF5XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgcmVzdWx0IG9mIHRoZSBnYW1lIHdoZW4gdGhlIGdhbWUgaGFzIGJlZW4gcGxheWVkLlxuICovXG5mdW5jdGlvbiBwbGF5R2FtZShzZXQsIGdhbWUpIHtcbiAgICBsZXQgdHVybnMgPSAwO1xuICAgIGxldCBicmlja3MgPSBwYXJzZUludChnYW1lLndpZHRoKSAqIHBhcnNlSW50KGdhbWUuaGVpZ2h0KTtcbiAgICBsZXQgYm9hcmQgPSBnYW1lLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2JvYXJkJyk7XG4gICAgbGV0IGJyaWNrc0xlZnQgPSBicmlja3M7XG4gICAgbGV0IGNob2ljZTE7XG4gICAgbGV0IGNob2ljZTI7XG4gICAgbGV0IGltZzE7XG4gICAgbGV0IGltZzI7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBnYW1lLmdhbWVQbGF5ID0gZnVuY3Rpb24oZXZlbnQpIHsgLy9leHBvc2UgdGhlIHJlZmVyZW5jZSBzbyB0aGUgZXZlbnQgbGlzdGVuZXIgY2FuIGJlIHJlbW92ZWQgZnJvbSBvdXRzaWRlIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgaWYgKCFjaG9pY2UyKSB7IC8vaWYgdHdvIGJyaWNrcyBhcmUgbm90IHR1cm5lZFxuICAgICAgICAgICAgICAgIGxldCBpbWcgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcihcImltZ1wiKSB8fCBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgbGV0IGJyaWNrTnVtYmVyID0gaW1nLmdldEF0dHJpYnV0ZShcImJyaWNrTnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIGlmICghYnJpY2tOdW1iZXIpIHsgLy90YXJnZXQgaXMgbm90IGEgYnJpY2tcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBicmljayA9IHNldFticmlja051bWJlcl07XG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9ICcvaW1hZ2UvJyArIGJyaWNrLnR1cm4oKSArICcucG5nJztcblxuICAgICAgICAgICAgICAgIGlmICghY2hvaWNlMSkgeyAvL2ZpcnN0IGJyaWNrIHRvIGJlIHR1cm5lZFxuICAgICAgICAgICAgICAgICAgICBpbWcxID0gaW1nO1xuICAgICAgICAgICAgICAgICAgICBjaG9pY2UxID0gYnJpY2s7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy9zZWNvbmQgYnJpY2sgdG8gYmUgdHVybmVkXG4gICAgICAgICAgICAgICAgICAgIGltZzIgPSBpbWc7XG4gICAgICAgICAgICAgICAgICAgIGNob2ljZTIgPSBicmljaztcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hvaWNlMS5lcXVhbHMoY2hvaWNlMikgJiYgaW1nMS5nZXRBdHRyaWJ1dGUoJ2JyaWNrTnVtYmVyJykgIT09IGltZzIuZ2V0QXR0cmlidXRlKCdicmlja051bWJlcicpKSB7IC8vdGhlIHR3byBicmlja3MgYXJlIGVxdWFsIGJ1dCBub3QgdGhlIHNhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzEucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nMi5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nMSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyaWNrc0xlZnQgLT0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChicmlja3NMZWZ0ID09PSAwKSB7IC8vYWxsIGJyaWNrcyBhcmUgdHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7dHVybnM6IHR1cm5zfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vYnJpY2tzIGFyZSBub3QgdGhlIHNhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZzEuc3JjID0gJy9pbWFnZS8nICsgY2hvaWNlMS50dXJuKCkgKyAnLnBuZyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nMi5zcmMgPSAnL2ltYWdlLycgKyBjaG9pY2UyLnR1cm4oKSArICcucG5nJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdHVybnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgZ2FtZS50dXJuc3Bhbi50ZXh0Q29udGVudCA9IHR1cm5zO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnYW1lLmdhbWVQbGF5KTtcblxuICAgIH0pO1xuXG59XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgVGltZXIuXG4gKlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqL1xuXG5jbGFzcyBUaW1lciB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIGEgVGltZXIuXG4gICAgICogQHBhcmFtIHN0YXJ0VGltZSB7bnVtYmVyfSB3aGVyZSB0byBzdGFydCBjb3VudGluZy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzdGFydFRpbWUgPSAwKSB7XG4gICAgICAgIHRoaXMuY291bnQgPSBzdGFydFRpbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge251bWJlcn0gdGhlIGNvdW50XG4gICAgICovXG4gICAgZ2V0IHRpbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHRpbWUgb24gdGhlIHRpbWVyLlxuICAgICAqIEBwYXJhbSBuZXdUaW1lIHtudW1iZXJ9IHRoZSBuZXcgdGltZVxuICAgICAqL1xuICAgIHNldCB0aW1lKG5ld1RpbWUpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IG5ld1RpbWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHN0YXJ0cyB0aGUgdGltZXIuIGluY3JlbWVudHMgdGltZSBldmVyeSAxMDAgbWlsbGlzZWNvbmRzLlxuICAgICAqIEBwYXJhbSB0aW1lIHtudW1iZXJ9IHdoYXQgbnVtYmVyIHRvIHN0YXJ0IGl0IG9uLlxuICAgICAqL1xuICAgIHN0YXJ0KHRpbWUgPSB0aGlzLnRpbWUpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IHRpbWU7XG4gICAgICAgIHRoaXMudGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvdW50ICs9IDEwMDtcbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc3RhcnRzIHRoZSB0aW1lci4gZGVjcmVtZW50cyB0aW1lIGV2ZXJ5IDEwMCBtaWxsaXNlY29uZHMuXG4gICAgICogQHBhcmFtIHRpbWUge251bWJlcn0gd2hhdCBudW1iZXIgdG8gc3RhcnQgaXQgb24uXG4gICAgICovXG4gICAgY291bnRkb3duKHRpbWUpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IHRpbWUgfHwgdGhpcy5jb3VudDtcbiAgICAgICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY291bnQgLT0gMTAwO1xuICAgICAgICB9LCAxMDApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBzdG9wcyB0aGUgVGltZXIuXG4gICAgICogQHJldHVybnMgdGhlIGNvdW50LlxuICAgICAqL1xuICAgIHN0b3AoKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5kaXNwbGF5SW50ZXJ2YWwpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3VudDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgYSByb3VuZGVkIHZhbHVlIG9mIHRoZSBjb3VudCBvZiB0aGUgdGltZXJcbiAgICAgKiB0byB0aGUgZGVzaXJlZCBwcmVjaXNpb24sIGF0IGFuIGludGVydmFsLlxuICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbiB7bm9kZX0gd2hlcmUgdG8gbWFrZSB0aGUgZGlzcGxheVxuICAgICAqIEBwYXJhbSBpbnRlcnZhbCB7bnVtYmVyfSB0aGUgaW50ZXJ2YWwgdG8gbWFrZSB0aGUgZGlzcGxheSBpbiwgaW4gbWlsbGlzZWNvbmRzXG4gICAgICogQHBhcmFtIHByZWNpc2lvbiB7bnVtYmVyfXRoZSBudW1iZXIgdG8gZGl2aWRlIHRoZSBkaXNwbGF5ZWQgbWlsbGlzZWNvbmRzIGJ5XG4gICAgICogQHJldHVybnMgdGhlIGludGVydmFsLlxuICAgICAqXG4gICAgICovXG4gICAgZGlzcGxheShkZXN0aW5hdGlvbiwgaW50ZXJ2YWwgPSAxMDAsIHByZWNpc2lvbiA9IDEwMDApIHtcbiAgICAgICAgdGhpcy5kaXNwbGF5SW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCggKCk9PiB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi50ZXh0Q29udGVudCA9IE1hdGgucm91bmQodGhpcy5jb3VudCAvIHByZWNpc2lvbik7XG4gICAgICAgIH0sIGludGVydmFsKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheUludGVydmFsO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcbiJdfQ==
