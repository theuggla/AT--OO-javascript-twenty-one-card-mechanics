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
     *
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
                /*if (!wm[type]) {
                    let linkTemplate = document.querySelector("#linkTemplate");
                    let link = document.importNode(linkTemplate.content.firstElementChild, true);
                    link.href = "/" + type + ".html";
                    document.head.appendChild(link);
                }*/


                let aWindow = document.createElement(type);

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
        let galleryWindowTemplate = document.querySelector('link[href="/image-gallery-app.html"]').import.querySelector("#galleryWindowTemplate"); //shadow DOM import


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
        let chatspace = document.createElement('insta-chat');
        chatspace.setAttribute('slot', 'content');
        chatspace.classList.add('hide');
        this.shadowRoot.querySelector('draggable-window').appendChild(chatspace);


        let namespace = this.shadowRoot.querySelector('#submitName');
        let aboutspace = this.shadowRoot.querySelector('#about');

        let chatoption = this.shadowRoot.querySelector('[label="chat"]');
        let aboutoption = this.shadowRoot.querySelector('[label="about"]');
        let optionoption = this.shadowRoot.querySelector('[label="options"]');

        //check if a name has already been choosen
        if (localStorage.chatName) {
            let name = JSON.parse(localStorage.chatName);
            chatspace.changeConfig({name: name});
            namespace.classList.add('hide');
            aboutspace.classList.add('hide');
            chatspace.classList.remove('hide');
        } else { //ask for a name
            chatspace.classList.add('hide');
            aboutspace.classList.add('hide');
            namespace.classList.remove('hide');
        }

        namespace.querySelector('button').addEventListener('click', (event) => {
            let name = namespace.querySelector('input').value;
            chatspace.changeConfig({name: name});
            localStorage.chatName = JSON.stringify(name);
            namespace.classList.add('hide');
            aboutspace.classList.add('hide');
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
                        namespace.classList.remove('hide');
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
                        chatspace.classList.remove('hide');
                        aboutspace.classList.add('hide');
                        namespace.classList.add('hide');
                        break;
                }
            }
        });

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

},{}],8:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kcmFnZ2FibGUtd2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9leHBhbmRhYmxlLW1lbnUtaXRlbS5qcyIsImNsaWVudC9zb3VyY2UvanMvaW1hZ2UtZ2FsbGVyeS1hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2ltYWdlLWdhbGxlcnkuanMiLCJjbGllbnQvc291cmNlL2pzL2luc3RhLWNoYXQtYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9pbnN0YS1jaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnktYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnktZ2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGltZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIFN0YXJ0aW5nIHBvaW50IGZwciB0aGUgYXBwbGljYXRpb24uXG4gKiBUaGUgYXBwbGljYXRpb24gd291bGQgd29yayBiZXR0ZXIgd2hlbiB1c2VkIHdpdGggSFRUUDJcbiAqIGR1ZSB0byB0aGUgZmFjdCB0aGF0IGl0IG1ha2VzIHVzZSBvZiB3ZWItY29tcG9uZW50cyxcbiAqIGJ1dCBpdCdzIGJlZW4gYnVpbHQgd2l0aCBicm93c2VyaWZ5IHRvIHdvcmsgYXMgYVxuICogbm9ybWFsIEhUVFAxIGFwcGxpY2F0aW9uIGluIGxpZXUgb2YgdGhpcy5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMFxuICovXG5cblxuLy90byBtYWtlIHdlYiBjb21wb25lbnRzIHdvcmsgd2l0aCBicm93c2VyaWZ5XG5sZXQgd2luZG93ID0gcmVxdWlyZSgnLi9kcmFnZ2FibGUtd2luZG93LmpzJyk7XG5sZXQgbWVudSA9IHJlcXVpcmUoXCIuL2V4cGFuZGFibGUtbWVudS1pdGVtLmpzXCIpO1xubGV0IG1lbW9yeUdhbWUgPSByZXF1aXJlKCcuL21lbW9yeS1nYW1lLmpzJyk7XG5sZXQgbWVtb3J5QXBwID0gcmVxdWlyZSgnLi9tZW1vcnktYXBwLmpzJyk7XG5sZXQgaW5zdGFDaGF0PSByZXF1aXJlKCcuL2luc3RhLWNoYXQuanMnKTtcbmxldCBpbnN0YUNoYXRBcHAgPSByZXF1aXJlKCcuL2luc3RhLWNoYXQtYXBwLmpzJyk7XG5sZXQgaW1hZ2VHYWxsZXJ5ID0gcmVxdWlyZSgnLi9pbWFnZS1nYWxsZXJ5LmpzJyk7XG5sZXQgaW1hZ2VHYWxsZXJ5QXBwID0gcmVxdWlyZSgnLi9pbWFnZS1nYWxsZXJ5LWFwcC5qcycpO1xuXG4vL3JlcXVpcmVzXG5sZXQgRGVza3RvcCA9IHJlcXVpcmUoXCIuL2Rlc2t0b3AuanNcIik7XG5cbi8vbm9kZXNcbmxldCBtYWluTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93U2VsZWN0b3JcIik7XG5sZXQgc3ViTWVudVRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdWJNZW51XCIpO1xubGV0IHdpbmRvd1NwYWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNvcGVuV2luZG93c1wiKTtcblxuLy92YXJpYWJsZXNcbmxldCBteURlc2t0b3A7XG5sZXQgd2luZG93TWFuYWdlciA9IERlc2t0b3Aud2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSk7XG5cblxuLy9zZXQgdXAgZXZlbnQgaGFuZGxlciBmb3Igc3ViLW1lbnVcbmxldCBldmVudEhhbmRsZXJTdWJNZW51ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgbGV0IHR5cGUgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWtpbmQnKSB8fCBldmVudC50YXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEta2luZCcpO1xuXG4gICAgc3dpdGNoIChldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICBjYXNlICdvcGVuJzpcbiAgICAgICAgICAgIHdpbmRvd01hbmFnZXIuY3JlYXRlV2luZG93KHR5cGUpLmZvY3VzKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICAgICAgd2luZG93TWFuYWdlci5jbG9zZSh0eXBlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtaW5pbWl6ZSc6XG4gICAgICAgICAgICB3aW5kb3dNYW5hZ2VyLm1pbmltaXplKHR5cGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2V4cGFuZCc6XG4gICAgICAgICAgICB3aW5kb3dNYW5hZ2VyLmV4cGFuZCh0eXBlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChldmVudC50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxufTtcblxubGV0IGRlc2t0b3BDb25maWcgPSB7XG4gICAgc3BhY2U6IHdpbmRvd1NwYWNlLFxuICAgIG1lbnU6IG1haW5NZW51LFxuICAgIHdpbmRvd01hbmFnZXI6IHdpbmRvd01hbmFnZXIsXG4gICAgc3ViVGVtcGxhdGU6IHN1Yk1lbnVUZW1wbGF0ZSxcbiAgICBzdWJIYW5kbGVyOiBldmVudEhhbmRsZXJTdWJNZW51XG59O1xuXG5cbi8vaW5pdGlhdGUgZGVza3RvcFxubXlEZXNrdG9wID0gbmV3IERlc2t0b3AoZGVza3RvcENvbmZpZyk7XG5cblxuXG4iLCIvKipcbiAqIEEgbW9kdWxlIGZvciBhIGNsYXNzIGRlc2t0b3AuXG4gKiBJbml0aWF0ZXMgYSB3ZWIgZGVza3RvcCB3aXRoIGEgbWVudVxuICogYW5kIHdpbmRvd3MgdG8gb3Blbi5cbiAqXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjBcbiAqL1xuXG5cbmNsYXNzIERlc2t0b3Age1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyB0aGUgRGVza3RvcC4gU2V0cyB1cCBldmVudCBsaXN0ZW5lcnNcbiAgICAgKiBhbmQgYWRkcyBzdWItbWVudSB0byB0aGUgbWFpbiBtZW51IGl0ZW1zIGlmIHN1Y2ggYXJlIHByb3ZpZGVkLlxuICAgICAqIEBwYXJhbSBkZXNrdG9wQ29uZmlnIHtvYmplY3R9IHdpdGggcGFyYW1zOlxuICAgICAqIG1lbnUge1tleHBhbmRhYmxlLW1lbnUtaXRlbV19LFxuICAgICAqIHNwYWNlOiB7bm9kZX0gd2hlcmUgdGhlIGRlc2t0b3Agd2luZG93cyBsaXZlc1xuICAgICAqIGFuZCBvcHRpb25hbDpcbiAgICAgKiB3aW5kb3dNYW5hZ2VyOiB7b2JqZWN0fSBhIGN1c3RvbSB3aW5kb3cgbWFuYWdlciB0aGF0IGhhbmRsZXMgdGhlIHdpbmRvd3MsIHdpbGwgb3RoZXJ3aXNlIGJlIHN1cHBsaWVkXG4gICAgICogc3ViVGVtcGxhdGU6IHtkb2N1bWVudC1mcmFnbWVudH0gYSBzdWItbWVudSB0byBiZSBhZGRlZCB0byBlYWNoIG9mIHRoZSBtYWluIG1lbnUgaXRlbXNcbiAgICAgKiBzdWJIYW5kbGVyIHtmdW5jdGlvbn0gYW4gZXZlbnQgaGFuZGxlciB0byBiZSBhcHBsaWVzIHRvIHRoZSBzdWIgbWVudVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGRlc2t0b3BDb25maWcpIHtcbiAgICAgICAgbGV0IHRvcFdpbmRvdyA9IDI7IC8vdG8ga2VlcCBmb2N1c2VkIHdpbmRvdyBvbiB0b3BcblxuICAgICAgICBsZXQgbWFpbk1lbnUgPSBkZXNrdG9wQ29uZmlnLm1lbnU7XG4gICAgICAgIGxldCB3aW5kb3dTcGFjZSA9IGRlc2t0b3BDb25maWcuc3BhY2U7XG4gICAgICAgIGxldCB3aW5kb3dNYW5hZ2VyID0gZGVza3RvcENvbmZpZy53aW5kb3dNYW5hZ2VyIHx8IERlc2t0b3Aud2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSk7IC8vc3VwcGx5IHdpbmRvd01hbmFnZXIgaWYgdGhlcmUgaXMgbm9uZVxuICAgICAgICBsZXQgc3ViTWVudVRlbXBsYXRlID0gZGVza3RvcENvbmZpZy5zdWJUZW1wbGF0ZTtcbiAgICAgICAgbGV0IHN1YkhhbmRsZXIgPSBkZXNrdG9wQ29uZmlnLnN1YkhhbmRsZXI7XG5cblxuICAgICAgICBpZiAoc3ViTWVudVRlbXBsYXRlKSB7IC8vdGhlcmUgaXMgYSBzdWJtZW51XG4gICAgICAgICAgICAvL2FkZCB0aGUgc3VibWVudVxuICAgICAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChtYWluTWVudS5jaGlsZHJlbiwgKG5vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgc3ViTWVudSA9IGRvY3VtZW50LmltcG9ydE5vZGUoc3ViTWVudVRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkU3ViTWVudShub2RlLCBzdWJNZW51LCBzdWJIYW5kbGVyKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL2FkZCBldmVudCBoYW5kbGVycyBvbiB0aGUgc3ViIG1lbnVcbiAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKG1haW5NZW51LCAnY2xpY2sgZm9jdXNvdXQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgbWFpbk1lbnVJdGVtcyA9IG1haW5NZW51LnF1ZXJ5U2VsZWN0b3JBbGwoJ2V4cGFuZGFibGUtbWVudS1pdGVtJyk7XG4gICAgICAgICAgICAgICAgbWFpbk1lbnVJdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoaXRlbSAhPT0gZXZlbnQudGFyZ2V0ICYmIGl0ZW0gIT09IGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50KSAmJiAoaXRlbS5kaXNwbGF5aW5nU3ViTWVudSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL29wZW4gbmV3IHdpbmRvdyBhdCBkb3VibGUgY2xpY2tcbiAgICAgICAgbWFpbk1lbnUuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0eXBlID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEta2luZFwiKSB8fCBldmVudC50YXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLWtpbmRcIik7XG4gICAgICAgICAgICBpZiAodHlwZSkge1xuICAgICAgICAgICAgICAgIHdpbmRvd01hbmFnZXIuY3JlYXRlV2luZG93KHR5cGUpLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL3B1dCBmb2N1c2VkIHdpbmRvdyBvbiB0b3BcbiAgICAgICAgd2luZG93U3BhY2UuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQgIT09IHdpbmRvd1NwYWNlKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnN0eWxlLnpJbmRleCA9IHRvcFdpbmRvdztcbiAgICAgICAgICAgICAgICB0b3BXaW5kb3cgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaXRlbSB7SFRNTEVsZW1lbnR9IHRoZSBleHBhbmRhYmxlLW1lbnUtaXRlbSB0byBhZGQgdGhlIHN1Yi1tZW51IHRvXG4gICAgICogQHBhcmFtIHN1Yk1lbnUge0hUTUxFbGVtZW50fSBhIHRlbXBsYXRlIG9mIHRoZSBzdWItbWVudVxuICAgICAqIEBwYXJhbSBldmVudEhhbmRsZXIge2Z1bmN0aW9ufSB0aGUgZXZlbnQgaGFuZGxlciB0byBiZSBhcHBsaWVkIHRvIHRoZSBzdWIgbWVudVxuICAgICAqL1xuICAgIGFkZFN1Yk1lbnUoaXRlbSwgc3ViTWVudSwgZXZlbnRIYW5kbGVyKSB7XG4gICAgICAgIGxldCBsYWJlbCA9IGl0ZW0uZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoc3ViTWVudS5jaGlsZHJlbiwgKG5vZGUpID0+IHtcbiAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdsYWJlbCcsIGxhYmVsKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChzdWJNZW51KTtcblxuICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnRIYW5kbGVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjcmVhdGVzIGEgd2luZG93IG1hbmFnZXIgdG8gaGFuZGxlIHdpbmRvd3Mgb24gdGhlIGRlc2t0b3AuXG4gICAgICogQHBhcmFtIHdpbmRvd1NwYWNlIHtIVE1MRWxlbWVudH0gdGhlIHNwYWNlIHdoZXJlIHRoZSB3aW5kb3dzIGxpdmVcbiAgICAgKiBAcmV0dXJucyB7e2NyZWF0ZVdpbmRvdzogY3JlYXRlV2luZG93LCBvcGVuV2luZG93czogb3BlbldpbmRvd3MsIGV4cGFuZDogZXhwYW5kLCBtaW5pbWl6ZTogbWluaW1pemUsIGNsb3NlOiBjbG9zZX19IGFuXG4gICAgICogb2JqZWN0IHdpdGggbWV0aG9kcyB0byBleHBhbmQsIG1pbmltaXplLCBjbG9zZSBhbGwsIG9wZW4gbmV3LCBhbmQgZ2V0IG9wZW4gd2luZG93cyBvZiBhIGNlcnRhaW4gdHlwZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgd2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSkge1xuICAgICAgICAvL2tlZXAgdHJhY2sgb2YgdGhlIHdpbmRvdyBzcGFjZVxuICAgICAgICBsZXQgd20gPSB7XG4gICAgICAgICAgICBzdGFydFg6IHdpbmRvd1NwYWNlLm9mZnNldExlZnQgKyAyMCxcbiAgICAgICAgICAgIHN0YXJ0WTogd2luZG93U3BhY2Uub2Zmc2V0VG9wICsgMjAsXG4gICAgICAgICAgICB0eXBlczogMFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIENyZWF0ZXMgYSBuZXcgd2luZG93IGFuZCBvcGVucyBpdCBpbiB0aGUgd2luZG93IHNwYWNlLlxuICAgICAgICAgICAgICogQHBhcmFtIHR5cGUge3N0cmluZ30gdGhlIG5hbWUgb2YgdGhlIGh0bWwtZWxlbWVudCB0byBjcmVhdGUuXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHRoZSBuZXdseSBjcmVhdGVkIHdpbmRvd1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjcmVhdGVXaW5kb3c6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgLyppZiAoIXdtW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5rVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2xpbmtUZW1wbGF0ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmsgPSBkb2N1bWVudC5pbXBvcnROb2RlKGxpbmtUZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgbGluay5ocmVmID0gXCIvXCIgKyB0eXBlICsgXCIuaHRtbFwiO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICAgICAgICAgIH0qL1xuXG5cbiAgICAgICAgICAgICAgICBsZXQgYVdpbmRvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XG5cbiAgICAgICAgICAgICAgICAvL2ltcG9ydCBwaWN0dXJlcyBmb3IgdGhlIGltYWdlIGdhbGxlcnlcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2ltYWdlLWdhbGxlcnktYXBwJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BpY3R1cmVzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFXaW5kb3cuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGljdHVyZXMnKS5jb250ZW50LCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aW5kb3dTcGFjZS5hcHBlbmRDaGlsZChhV2luZG93KTtcbiAgICAgICAgICAgICAgICBzZXR1cFNwYWNlKHR5cGUsIGFXaW5kb3cpO1xuXG4gICAgICAgICAgICAgICAgLy9rZWVwIHRyYWNrIG9mIHRoZSBvcGVuIHdpbmRvd3NcbiAgICAgICAgICAgICAgICBpZiAod21bdHlwZV0ub3Blbikge1xuICAgICAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuLnB1c2goYVdpbmRvdyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgd21bdHlwZV0ub3BlbiA9IFthV2luZG93XTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gYVdpbmRvdztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdldHMgdGhlIG9wZW4gd2luZG93cyBvZiBhIHR5cGUuXG4gICAgICAgICAgICAgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSB0aGUgbmFtZSBvZiB0aGUgaHRtbC1lbGVtZW50IHRvIGNoZWNrIGZvci5cbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtbSFRNTEVsZW1lbnRdfSBhIG5vZGUgbGlzdCBvZiB0aGUgb3BlbiB3aW5kb3dzIG9mIHRoZSB0eXBlLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBvcGVuV2luZG93czogZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAod21bdHlwZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgd2luZG93cyA9IHdtW3R5cGVdLm9wZW47XG4gICAgICAgICAgICAgICAgICAgIC8vZmlsdGVyIG91dCB0aGUgb25lJ3MgdGhhdCdzIGJlZW4gY2xvc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWVcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gd2luZG93cy5maWx0ZXIoKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3Lm9wZW47XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwOyAvL2lmIG5vIHdpbmRvd3MgYXJlIG9wZW5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBFeHBhbmRzIGFsbCBtaW5pbWl6ZWQgd2luZG93cyBvZiBhIHR5cGUuXG4gICAgICAgICAgICAgKiBAcGFyYW0gdHlwZSB7c3RyaW5nfSB0aGUgbmFtZSBvZiB0aGUgaHRtbC1lbGVtZW50IHRvIGV4cGFuZC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZXhwYW5kOiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgICAgIGxldCB3aW5zID0gdGhpcy5vcGVuV2luZG93cyh0eXBlKTtcbiAgICAgICAgICAgICAgICBpZiAod2lucykge1xuICAgICAgICAgICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHcubWluaW1pemVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE1pbmltaXplcyBhbGwgb3BlbiB3aW5kb3dzIG9mIGEgdHlwZS5cbiAgICAgICAgICAgICAqIEBwYXJhbSB0eXBlIHtzdHJpbmd9IHRoZSBuYW1lIG9mIHRoZSBodG1sLWVsZW1lbnQgdG8gbWluaW1pemUuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIG1pbmltaXplOiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgICAgIGxldCB3aW5zID0gdGhpcy5vcGVuV2luZG93cyh0eXBlKTtcbiAgICAgICAgICAgICAgICBpZiAod2lucykge1xuICAgICAgICAgICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHcubWluaW1pemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQ2xvc2VzIGFsbCBvcGVuIHdpbmRvd3Mgb2YgYSB0eXBlLlxuICAgICAgICAgICAgICogQHBhcmFtIHR5cGUge3N0cmluZ30gdGhlIG5hbWUgb2YgdGhlIGh0bWwtZWxlbWVudCB0byBjbG9zZS5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHdpbnMgPSB0aGlzLm9wZW5XaW5kb3dzKHR5cGUpO1xuICAgICAgICAgICAgICAgIGlmICh3aW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHdpbnMpO1xuICAgICAgICAgICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHcuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vaGVscGVyIGZ1bmN0aW9uc1xuICAgICAgICAvLyBrZWVwcyB0cmFjayBvZiB0aGUgd2luZG93IHNwYWNlIHNvIHRoZSB3aW5kb3dzIGRvbid0IGFsbFxuICAgICAgICAvL29wZW4gb24gdG9wIG9mIGVhY2ggb3RoZXIsIGFuZCBkb2Vzbid0IGRpc2FwcGVhciBvdXRcbiAgICAgICAgLy9vZiB0aGUgc3BhY2VcbiAgICAgICAgZnVuY3Rpb24gc2V0dXBTcGFjZSh0eXBlLCBzcGFjZSkge1xuICAgICAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge307XG4gICAgICAgICAgICBsZXQgeDtcbiAgICAgICAgICAgIGxldCB5O1xuXG4gICAgICAgICAgICBpZiAod21bdHlwZV0pIHsgLy90aGUgdHlwZSBhbHJlYWR5IGV4aXN0c1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAod21bdHlwZV0ubGF0ZXN0Q29vcmRzLnggKz0gNTApOyAgLy9jcmVhdGUgYSBuZXcgc3BhY2UgdG8gb3BlbiB0aGUgd2luZG93XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9ICh3bVt0eXBlXS5sYXRlc3RDb29yZHMueSArPSA1MCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoISh3aXRoaW5Cb3VuZHMoc3BhY2UsIHdpbmRvd1NwYWNlLCBkZXN0aW5hdGlvbikpKSB7IC8vY2hlY2sgdGhhdCB0aGUgc3BhY2UgaXMgd2l0aGluIGJvdW5kc1xuICAgICAgICAgICAgICAgICAgICB4ID0gd21bdHlwZV0uc3RhcnRDb29yZHMueCArPSA1O1xuICAgICAgICAgICAgICAgICAgICB5ID0gd21bdHlwZV0uc3RhcnRDb29yZHMueSArPSA1O1xuICAgICAgICAgICAgICAgICAgICB3bVt0eXBlXS5sYXRlc3RDb29yZHMueCA9IHg7XG4gICAgICAgICAgICAgICAgICAgIHdtW3R5cGVdLmxhdGVzdENvb3Jkcy55ID0geTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB4ID0gZGVzdGluYXRpb24ueDtcbiAgICAgICAgICAgICAgICAgICAgeSA9IGRlc3RpbmF0aW9uLnk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgeyAvL2NyZWF0ZSBhIHN0YXJ0aW5nIHBvaW50IGZvciB0aGUgd2luZG93cyBvZiB0aGlzIHR5cGVcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gKHdtLnN0YXJ0WCArICg2MCAqIHdtLnR5cGVzKSk7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9ICh3bS5zdGFydFkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCEod2l0aGluQm91bmRzKHNwYWNlLCB3aW5kb3dTcGFjZSwgZGVzdGluYXRpb24pKSkge1xuICAgICAgICAgICAgICAgICAgICB4ID0gd20uc3RhcnRYO1xuICAgICAgICAgICAgICAgICAgICB5ID0gd20uc3RhcnRZO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBkZXN0aW5hdGlvbi54O1xuICAgICAgICAgICAgICAgICAgICB5ID0gZGVzdGluYXRpb24ueTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3bVt0eXBlXSA9IHt9O1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLnN0YXJ0Q29vcmRzID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5sYXRlc3RDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IHlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHdtLnR5cGVzICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzcGFjZS50YWJJbmRleCA9IDA7XG4gICAgICAgICAgICBzcGFjZS5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xuICAgICAgICAgICAgc3BhY2Uuc3R5bGUubGVmdCA9IHggKyBcInB4XCI7XG4gICAgICAgIH1cblxuICAgICAgICAvL2NoZWNrcyBpZiBhIHNwYWNlIGlzIHdpdGhpbiBib3VuZHNcbiAgICAgICAgZnVuY3Rpb24gd2l0aGluQm91bmRzKGVsZW1lbnQsIGNvbnRhaW5lciwgY29vcmRzKSB7XG4gICAgICAgICAgICBsZXQgbWluWCA9IGNvbnRhaW5lci5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgbGV0IG1heFggPSAobWluWCArIGNvbnRhaW5lci5jbGllbnRXaWR0aCkgLSAoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCk7XG4gICAgICAgICAgICBsZXQgbWluWSA9IGNvbnRhaW5lci5vZmZzZXRUb3A7XG4gICAgICAgICAgICBsZXQgbWF4WSA9IChtaW5ZICsgY29udGFpbmVyLmNsaWVudEhlaWdodCkgLSAoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xuXG4gICAgICAgICAgICByZXR1cm4gKGNvb3Jkcy54IDw9IG1heFggJiYgY29vcmRzLnggPj0gbWluWCAmJiBjb29yZHMueSA8PSBtYXhZICYmIGNvb3Jkcy55ID49IG1pblkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8vaGVscGVyIGZ1bmN0aW9uIHRvIGFkZCBtb3JlIHRoYW4gb25lIGV2ZW50IHR5cGUgZm9yIGVhY2ggZWxlbWVudCBhbmQgaGFuZGxlclxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMgKGVsZW1lbnQsIGV2ZW50cywgaGFuZGxlcikge1xuICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSk7XG59XG5cbi8vZXhwb3J0XG5tb2R1bGUuZXhwb3J0cyA9IERlc2t0b3A7XG4iLCIvKlxuKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGRyYWdnYWJsZS13aW5kb3cgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiogSXQgY3JlYXRlcyBhIHdpbmRvdyB0aGF0IGNhbiBiZSBtb3ZlZCBhY3Jvc3MgdGhlIHNjcmVlbiwgY2xvc2VkIGFuZCBtaW5pbWl6ZWQuXG4qIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiogQHZlcnNpb24gMS4wLjBcbipcbiovXG5cbmNsYXNzIERyYWdnYWJsZVdpbmRvdyBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBkcmFnZ2FibGUtd2luZG93LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGxldCB3aW5kb3dUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9kcmFnZ2FibGUtd2luZG93Lmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dUZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxuXG4gICAgICAgIC8vc2V0dXAgc2hhZG93IGRvbSBzdHlsZXNcbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCIsIGRlbGVnYXRlc0ZvY3VzOiB0cnVlfSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHdpbmRvd1RlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gd2luZG93IGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAgICAgKiBTZXRzIHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVoYXZpb3VyIG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG5cbiAgICAgICAgLy9zZXQgYmVoYXZpb3VyXG4gICAgICAgIG1ha2VEcmFnZ2FibGUodGhpcywgdGhpcy5wYXJlbnROb2RlKTtcblxuICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQuY29tcG9zZWRQYXRoKClbMF07IC8vZm9sbG93IHRoZSB0cmFpbCB0aHJvdWdoIHNoYWRvdyBET01cbiAgICAgICAgICAgIGxldCBpZCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgICAgICAgICAgIGlmIChpZCA9PT0gXCJjbG9zZVwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpZCA9PT0gXCJtaW5pbWl6ZVwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHsgLy9tYWtlIHdvcmsgd2l0aCB0b3VjaCBldmVudHNcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgd2hhdCBhdHRyaWJ1dGUtY2hhbmdlcyB0byB3YXRjaCBmb3IgaW4gdGhlIERPTS5cbiAgICAgKiBAcmV0dXJucyB7W3N0cmluZ119IGFuIGFycmF5IG9mIHRoZSBuYW1lcyBvZiB0aGUgYXR0cmlidXRlcyB0byB3YXRjaC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgICAgcmV0dXJuIFsnb3BlbiddO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoZXMgZm9yIGF0dHJpYnV0ZSBjaGFuZ2VzIGluIHRoZSBET00gYWNjb3JkaW5nIHRvIG9ic2VydmVkQXR0cmlidXRlcygpXG4gICAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSB0aGUgb2xkIHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlIHRoZSBuZXcgdmFsdWVcbiAgICAgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sobmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5vcGVuKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgd2luZG93IGhhcyBhdHRyaWJ1dGUgJ29wZW4nXG4gICAgICovXG4gICAgZ2V0IG9wZW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc0F0dHJpYnV0ZSgnb3BlbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlICdvcGVuJyBhdHRyaWJ1dGUgb24gdGhlIHdpbmRvdy5cbiAgICAgKiBAcGFyYW0gb3BlbiB7Ym9vbGVhbn0gd2hldGhlciB0byBhZGQgb3IgcmVtb3ZlIHRoZSAnb3BlbicgYXR0cmlidXRlXG4gICAgICovXG4gICAgc2V0IG9wZW4ob3Blbikge1xuICAgICAgICBpZiAob3Blbikge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ29wZW4nLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnb3BlbicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHdpbmRvdyBoYXMgYXR0cmlidXRlICdtaW5pbWl6ZWQnXG4gICAgICovXG4gICAgZ2V0IG1pbmltaXplZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzQXR0cmlidXRlKCdtaW5pbWl6ZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSAnbWluaW1pemVkJyBhdHRyaWJ1dGUgb24gdGhlIHdpbmRvdy5cbiAgICAgKiBAcGFyYW0gbWluaW1pemUge2Jvb2xlYW59IHdoZXRoZXIgdG8gYWRkIG9yIHJlbW92ZSB0aGUgJ21pbmltaXplZCcgYXR0cmlidXRlXG4gICAgICovXG4gICAgc2V0IG1pbmltaXplZChtaW5pbWl6ZSkge1xuICAgICAgICBpZiAobWluaW1pemUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdtaW5pbWl6ZWQnLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnbWluaW1pemVkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZXMgdGhlIHdpbmRvdy4gUmVtb3ZlcyBpdCBmcm9tIHRoZSBET00gYW5kIHNldHMgYWxsIGF0dHJpYnV0ZXMgdG8gZmFsc2UuXG4gICAgICovXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wZW4pIHtcbiAgICAgICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGFyZW50Tm9kZS5ob3N0ICYmIHRoaXMucGFyZW50Tm9kZS5ob3N0LnBhcmVudE5vZGUpIHsgLy90aGlzIGlzIHBhcnQgb2YgYSBzaGFkb3cgZG9tXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnROb2RlLmhvc3QucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnBhcmVudE5vZGUuaG9zdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxuLy9oZWxwZXIgZnVuY3Rpb25cbi8vbWFrZXMgYW4gZWxlbWVudCBkcmFnZ2FibGUgd2l0aCAgbW91c2UsIGFycm93cyBhbmQgdG91Y2hcbmZ1bmN0aW9uIG1ha2VEcmFnZ2FibGUoZWwpIHtcbiAgICBsZXQgYXJyb3dEcmFnO1xuICAgIGxldCBtb3VzZURyYWc7XG4gICAgbGV0IGRyYWdvZmZzZXQgPSB7IC8vdG8gbWFrZSB0aGUgZHJhZyBub3QganVtcCBmcm9tIHRoZSBjb3JuZXJcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBsZXQgZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGVsLCAnZm9jdXNpbiBtb3VzZWRvd24nLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQ7XG4gICAgICAgICAgICBhcnJvd0RyYWcgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nKSB7XG4gICAgICAgICAgICAgICAgbW91c2VEcmFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkcmFnb2Zmc2V0LnggPSB0YXJnZXQucGFnZVggLSBlbC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGRyYWdvZmZzZXQueSA9IHRhcmdldC5wYWdlWSAtIGVsLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhlbCwgJ2ZvY3Vzb3V0IG1vdXNldXAnLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNldXAnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vdXNlRHJhZykge1xuICAgICAgICAgICAgICAgICAgICBtb3VzZURyYWcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFycm93RHJhZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGRvY3VtZW50LCAnbW91c2Vtb3ZlIGtleWRvd24nLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7fTsgLy9hcyB0byBub3Qga2VlcCBwb2xsaW5nIHRoZSBET01cblxuICAgICAgICAgICAgaWYgKG1vdXNlRHJhZykge1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAoZXZlbnQucGFnZVkgLSBkcmFnb2Zmc2V0LnkpO1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAoZXZlbnQucGFnZVggLSBkcmFnb2Zmc2V0LngpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhcnJvd0RyYWcpIHtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gcGFyc2VJbnQoZWwuc3R5bGUudG9wLnNsaWNlKDAsIC0yKSk7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9IHBhcnNlSW50KGVsLnN0eWxlLmxlZnQuc2xpY2UoMCwgLTIpKTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSAtPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggLT0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1vdXNlRHJhZyB8fCBhcnJvd0RyYWcpIHtcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gZGVzdGluYXRpb24ueCAgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gZGVzdGluYXRpb24ueSAgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIH07XG5cbiAgICAvL2luaXRpYXRlIGEgbW91c2UgZXZlbnQgZnJvbSB0aGUgdG91Y2hcbiAgICBmdW5jdGlvbiB0b3VjaEhhbmRsZXIoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5hc3NpZ25lZFNsb3QgJiYgZXZlbnQudGFyZ2V0LmFzc2lnbmVkU2xvdC5uYW1lID09PSAndGl0bGUnKSB7IC8vb25seSBkcmFnIGZyb20gdGhlIHRpdGxlIGJhciBvbiB0b3VjaCwgYXMgdG8gbm90IGludGVycnVwdCBzY3JvbGxpbmdcbiAgICAgICAgICAgIGxldCB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXM7XG4gICAgICAgICAgICBsZXQgZmlyc3QgPSB0b3VjaGVzWzBdO1xuICAgICAgICAgICAgbGV0IHR5cGUgPSBcIlwiO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwidG91Y2hzdGFydFwiOlxuICAgICAgICAgICAgICAgICAgICB0eXBlID0gXCJtb3VzZWRvd25cIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInRvdWNobW92ZVwiOlxuICAgICAgICAgICAgICAgICAgICB0eXBlID0gXCJtb3VzZW1vdmVcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInRvdWNoZW5kXCI6XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSBcIm1vdXNldXBcIjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL3NldCB1cCB0aGUgZXZlbnRcbiAgICAgICAgICAgIGxldCBzaW11bGF0ZWRFdmVudCA9IG5ldyBNb3VzZUV2ZW50KHR5cGUsIHtcbiAgICAgICAgICAgICAgICBzY3JlZW5YOiBmaXJzdC5zY3JlZW5YLFxuICAgICAgICAgICAgICAgIHNjcmVlblk6IGZpcnN0LnNjcmVlblksXG4gICAgICAgICAgICAgICAgY2xpZW50WDogZmlyc3QuY2xpZW50WCxcbiAgICAgICAgICAgICAgICBjbGllbnRZOiBmaXJzdC5jbGllbnRZLFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogMSxcbiAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlXG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvdWNoZXZlbnRzKCkge1xuICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCB0b3VjaEhhbmRsZXIsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIHRvdWNoSGFuZGxlciwgdHJ1ZSk7XG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCB0b3VjaEhhbmRsZXIsIHRydWUpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hjYW5jZWxcIiwgdG91Y2hIYW5kbGVyLCB0cnVlKTtcbiAgICB9XG5cbiAgICBldmVudHMoKTtcbiAgICB0b3VjaGV2ZW50cygpO1xufVxuXG4vL2hlbHBlciBmdW5jdGlvblxuLy9hZGRzIG11bHRpcGxlIGV2ZW50IGxpc3RlbmVycyB3aXRoIGlkZW50aWNhbCBoYW5kbGVyc1xuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cblxuLy9kZWZpbmVzIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2RyYWdnYWJsZS13aW5kb3cnLCBEcmFnZ2FibGVXaW5kb3cpO1xuIiwiLypcbiAqIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgZXhwYW5kYWJsZS1tZW51LWl0ZW0gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiAqIEl0IGNyZWF0ZXMgYW4gaXRlbSB0aGF0IHdoZW4gY2xpY2tlZCB0b2dnbGVzIHRvIHNob3cgb3IgaGlkZSBzdWItaXRlbXMuXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICpcbiAqL1xuXG5jbGFzcyBFeHBhbmRhYmxlTWVudUl0ZW0gZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIGEgZHJhZ2dhYmxlLXdpbmRvdywgc2V0cyB1cCBzaGFkb3cgRE9NLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBsZXQgbWVudVRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2V4cGFuZGFibGUtbWVudS1pdGVtLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNtZW51SXRlbVRlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cbiAgICAgICAgLy9zZXQgdXAgc2hhZG93IGRvbSBzdHlsZXNcbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCJ9KTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gbWVudVRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgd2hlbiB3aW5kb3cgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBiZWhhdmlvdXIgb2YgdGhlIGl0ZW0uXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIG1ha2VFeHBhbmRhYmxlKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtbbm9kZV19IGFuIGFycmF5IG9mIHRoZSBzdWJpdGVtcyB0aGUgaXRlbSBoYXMgYXNzaWduZWQgaW4gdGhlIERPTS5cbiAgICAgKiBBIHN1Yml0ZW0gY291bnRzIGFzIGFuIGl0ZW0gdGhhdCBoYXMgdGhlIHNsb3Qgb2YgJ3N1Yml0ZW0nIGFuZCB0aGUgc2FtZSBsYWJlbFxuICAgICAqIGFzIHRoZSBleHBhbmRhYmxlIG1lbnUgaXRlbSBpdHNlbGYuXG4gICAgICovXG4gICAgZ2V0IHN1Yk1lbnUoKSB7XG4gICAgICAgIGxldCBsYWJlbCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKHRoaXMucXVlcnlTZWxlY3RvckFsbCgnW3Nsb3Q9XCJzdWJpdGVtXCJdJyksIChub2RlKSA9PiB7XG4gICAgICAgICAgICBsZXQgbm9kZUxhYmVsID0gbm9kZS5nZXRBdHRyaWJ1dGUoJ2xhYmVsJyk7XG4gICAgICAgICAgICByZXR1cm4gbm9kZUxhYmVsID09PSBsYWJlbDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGl0ZW0gaXMgY3VycmVudGx5IGRpc3BsYXlpbmcgdGhlIHN1Ym1lbnUtaXRlbXMuXG4gICAgICovXG4gICAgZ2V0IGRpc3BsYXlpbmdTdWJNZW51KCkge1xuICAgICAgICByZXR1cm4gIXRoaXMuc3ViTWVudVswXS5oYXNBdHRyaWJ1dGUoJ2hpZGUnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaG93cyBvciBoaWRlcyB0aGUgc3VibWVudS1pdGVtcy5cbiAgICAgKiBAcGFyYW0gc2hvdyB7Ym9vbGVhbn0gd2hldGhlciB0byBzaG93IG9yIGhpZGUuXG4gICAgICovXG4gICAgdG9nZ2xlU3ViTWVudShzaG93KSB7XG4gICAgICAgIGlmIChzaG93KSB7XG4gICAgICAgICAgICB0aGlzLnN1Yk1lbnUuZm9yRWFjaCgocG9zdCkgPT4ge1xuICAgICAgICAgICAgICAgIHBvc3QucmVtb3ZlQXR0cmlidXRlKCdoaWRlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3ViTWVudS5mb3JFYWNoKChwb3N0KSA9PiB7XG4gICAgICAgICAgICAgICAgcG9zdC5zZXRBdHRyaWJ1dGUoJ2hpZGUnLCAnJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG59XG5cbi8vZGVmaW5lcyB0aGUgZWxlbWVudFxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdleHBhbmRhYmxlLW1lbnUtaXRlbScsIEV4cGFuZGFibGVNZW51SXRlbSk7XG5cbi8vaGVscGVyIGZ1bmN0aW9uIHRvIG1ha2UgdGhlIGl0ZW0gZXhwYW5kYWJsZVxuLy90YWtlcyB0aGUgaXRlbSB0byBleHBhbmQgYXMgYSBwYXJhbWV0ZXJcbmZ1bmN0aW9uIG1ha2VFeHBhbmRhYmxlKGl0ZW0pIHtcbiAgICBsZXQgbmV4dEZvY3VzID0gMDtcbiAgICBsZXQgc2hvdyA9IGZhbHNlO1xuICAgIGxldCBhcnJvd0V4cGFuZDtcbiAgICBsZXQgbW91c2VFeHBhbmQ7XG5cbiAgICBsZXQgZXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhpdGVtLCAnZm9jdXNpbiBjbGljaycsICgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBhcnJvd0V4cGFuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHtcbiAgICAgICAgICAgICAgICAgICAgbW91c2VFeHBhbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBzaG93ID0gIXNob3c7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudShzaG93KTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pKTtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoaXRlbSwgJ2tleWRvd24nLCAoKGV2ZW50KSA9PiB7IC8vbWFrZSB0aGUgc3ViLWl0ZW1zIHRyYXZlcnNhYmxlIGJ5IHByZXNzaW5nIHRoZSBhcnJvdyBrZXlzXG4gICAgICAgICAgICAgICAgaWYgKGFycm93RXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd0xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWl0ZW0uZGlzcGxheWluZ1N1Yk1lbnUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0Rm9jdXMgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dEZvY3VzIDwgMCB8fCBuZXh0Rm9jdXMgPj0gaXRlbS5zdWJNZW51Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0Rm9jdXMgPSBpdGVtLnN1Yk1lbnUubGVuZ3RoIC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnN1Yk1lbnVbbmV4dEZvY3VzXS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzKGl0ZW0sIGl0ZW0uc3ViTWVudVtuZXh0Rm9jdXNdKTsgLy9tYWtlIGl0IGFjY2Vzc2libGUgdmlhIGNzcyB2aXN1YWwgY2x1ZXMgZXZlbiBpZiB0aGUgYWN0aXZlIGVsZW1lbnQgaXMgaGlkZGVuIHdpdGhpbiBzaGFkb3dET01cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdGVtLmRpc3BsYXlpbmdTdWJNZW51KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEZvY3VzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRGb2N1cyA+PSBpdGVtLnN1Yk1lbnUubGVuZ3RoIHx8IG5leHRGb2N1cyA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEZvY3VzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5zdWJNZW51W25leHRGb2N1c10uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2N1cyhpdGVtLCBpdGVtLnN1Yk1lbnVbbmV4dEZvY3VzXSk7IC8vbWFrZSBpdCBhY2Nlc3NpYmxlIHZpYSBjc3MgdmlzdWFsIGNsdWVzIGV2ZW4gaWYgdGhlIGFjdGl2ZSBlbGVtZW50IGlzIGhpZGRlbiB3aXRoaW4gc2hhZG93RE9NXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIH07XG5cbiAgICBldmVudHMoKTtcbn1cblxuLy9oZWxwZXIgZnVuY3Rpb25zXG5cbi8vYWRkcyBtdWx0aXBsZSBldmVudCBsaXN0ZW5lcnMgd2l0aCBpZGVudGljYWwgaGFuZGxlcnNcbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzKGVsZW1lbnQsIGV2ZW50cywgaGFuZGxlcikge1xuICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSk7XG59XG5cbi8vIEFkZHMgYSAnZm9jdXNlZCcgYXR0cmlidXRlIHRvIHRoZSBkZXNpcmVkIHN1Yml0ZW0gYW5kXG4vLyByZW1vdmVzIGl0IGZyb20gb3RoZXIgc3ViIGl0ZW1zIHRvIGhlbHBcbi8vIHdpdGggYWNjZXNzaWJpbGl0eSBhbmQgc2hhZG93IERPbSBzdHlsaW5nLlxuZnVuY3Rpb24gZm9jdXMoaXRlbSwgZWxlbWVudCkge1xuICAgIGxldCBzdWJzID0gaXRlbS5zdWJNZW51O1xuICAgIHN1YnMuZm9yRWFjaCgoc3ViKSA9PiB7XG4gICAgICAgIGlmIChzdWIgPT09IGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHN1Yi5zZXRBdHRyaWJ1dGUoJ2ZvY3VzZWQnLCAnJyk7XG4gICAgICAgICAgICBpdGVtLmZvY3VzZWQgPSBlbGVtZW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3ViLnJlbW92ZUF0dHJpYnV0ZSgnZm9jdXNlZCcpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCIvKlxuICogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBpbWFnZS1nYWxsZXJ5LWFwcCB0byBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuICogSXQgY29tYmluZWQgdGhlIGNvbXBvbmVudCBpbWFnZS1nYWxsZXJ5IHdpdGggdGhlIGNvbXBvbmVudCBkcmFnZ2FibGUtd2luZG93LCB0b1xuICogbWFrZSBhbiBpbWFnZSBnYWxsZXJ5IGluIGEgd2luZG93IHdpdGggYW4gYWRkZWQgbWVudS5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICovXG5cbmNsYXNzIEltYWdlR2FsbGVyeUFwcCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBnYWxsZXJ5LXdpbmRvdywgc2V0cyB1cCBzaGFkb3cgRE9NLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBsZXQgZ2FsbGVyeVdpbmRvd1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2ltYWdlLWdhbGxlcnktYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNnYWxsZXJ5V2luZG93VGVtcGxhdGVcIik7IC8vc2hhZG93IERPTSBpbXBvcnRcblxuXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IGdhbGxlcnlXaW5kb3dUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICAgICAgdGhpcy5pbWFnZXMgPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gZ2FsbGVyeSBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogU2V0cyB1cCBldmVudCBsaXN0ZW5lcnMgZm9yXG4gICAgICogdGhlIG1lbnUuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIGxldCBpbWFnZUdhbGxlcnkgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignaW1hZ2UtZ2FsbGVyeScpO1xuICAgICAgICBsZXQgYWJvdXRzcGFjZSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjYWJvdXQnKTtcblxuICAgICAgICBsZXQgZ2FsbGVyeU9wdGlvbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJnYWxsZXJ5XCJdJyk7XG4gICAgICAgIGxldCBxdWl0T3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cInF1aXRcIl0nKTtcbiAgICAgICAgbGV0IGFib3V0T3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cImFib3V0XCJdJyk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVJbWFnZXMoKTtcblxuICAgICAgICAvL21lbnUgZXZlbnQgbGlzdGVuZXJzLiBhZGQgc2VwYXJhdGUgb25lcyBmb3IgYWNjZXNzaWJpbGl0eSByZWFzb25zIHdpdGggd2ViIGNvbXBvbmVudHMuXG4gICAgICAgIHF1aXRPcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQuZm9jdXNlZCB8fCBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7IC8vc2hhZG93IERPTSBhY2Nlc3NpYmlsaXR5IGlzc3Vlc1xuICAgICAgICAgICAgbGV0IHRhc2sgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3F1aXQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICAvL21lbnUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgZ2FsbGVyeU9wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10YXNrXScpIHx8IGV2ZW50LnRhcmdldDsgLy9zaGFkb3cgRE9NIGFjY2Vzc2liaWxpdHkgaXNzdWVzXG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhc2spIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ2FsbGVyeSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlR2FsbGVyeS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZUdhbGxlcnkuc2hvd1RodW1ibmFpbHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9tZW51IGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIGFib3V0T3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0OyAvL3NoYWRvdyBET00gYWNjZXNzaWJpbGl0eSBpc3N1ZXNcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdhYm91dCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZUdhbGxlcnkuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYWxsIHRoZSBhZGRlZCBpbWFnZXNcbiAgICAgKiBAcmV0dXJucyB7Tm9kZUxpc3R9IGEgbGlzdCBvZiBhbGwgdGhlIGltYWdlIGVsZW1lbnRzIHRoYXQgYXJlXG4gICAgICogY2hpbGRyZW4gb2YgdGhlIGdhbGxlcnkuXG4gICAgICovXG4gICAgZ2V0SW1hZ2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdpbWcnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGFsbCB0aGUgaW1hZ2VkZXNjcmlwdGlvbnMuXG4gICAgICogQHJldHVybnMge05vZGVMaXN0fSBhIGxpc3Qgb2YgYWxsIHRoZSBwIGVsZW1lbnRzIHRoYXQgYXJlXG4gICAgICogY2hpbGRyZW4gb2YgdGhlIGdhbGxlcnkgYW5kIGhhcyBhIGZvci1hdHRyaWJ1dGUuXG4gICAgICovXG4gICAgZ2V0RGVzY3JpcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdwW2Zvcl0nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYXRjaGVzIGRlc2NyaXB0aW9ucyB3aXRoIGltYWdlLXNvdXJjZXMgdmlhIHRoZSBtYXRjaGluZyBmb3ItIGFuZCBsYWJlbC0gYXR0cmlidXRlc1xuICAgICAqIG9uIHRoZSBwIGFuZCBpbWcgZWxlbWVudHMgcmVzcGVjdGl2ZWx5LlxuICAgICAqL1xuICAgIHVwZGF0ZUltYWdlcygpIHtcbiAgICAgICAgbGV0IGltZ1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2ltYWdlLWdhbGxlcnktYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNpbWdUZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxuICAgICAgICBsZXQgaW1hZ2VHYWxsZXJ5ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2ltYWdlLWdhbGxlcnknKTtcblxuICAgICAgICB0aGlzLmltYWdlcyA9IHRoaXMuaW1hZ2VzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLmdldEltYWdlcygpKSk7XG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb25zID0gdGhpcy5nZXREZXNjcmlwdGlvbnMoKTtcblxuICAgICAgICB0aGlzLmltYWdlcy5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9IGltZ1RlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICAgICAgY29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkLnJlcGxhY2VDaGlsZChpbWFnZSwgY29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkLnF1ZXJ5U2VsZWN0b3IoJ2ltZycpKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChjb250YWluZXIucXVlcnlTZWxlY3RvcigncCcpKTtcbiAgICAgICAgICAgIGltYWdlR2FsbGVyeS5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHRoaXMuZGVzY3JpcHRpb25zLCAoZGVzY3JpcHRpb24pID0+IHtcbiAgICAgICAgICAgIGltYWdlR2FsbGVyeS5hcHBlbmRDaGlsZChkZXNjcmlwdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBjb250YWluaW5nIHRoZSBhcHAgaXMgb3Blbi5cbiAgICAgKi9cbiAgICBnZXQgb3BlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93Jykub3BlbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgY29udGFpbmluZyB0aGUgYXBwIGlzIG1pbmltaXplZC5cbiAgICAgKi9cbiAgICBnZXQgbWluaW1pemVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5taW5pbWl6ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbWluaW1pemVkIHByb3BlcnR5IG9mIHRoZSB3aW5kb3cgY29udGFpbmluZyB0aGUgYXBwLlxuICAgICAqIEBwYXJhbSBtaW5pbWl6ZSB7Ym9vbGVhbn0gd2hldGhlciB0byBtaW5pbWl6ZVxuICAgICAqL1xuICAgIHNldCBtaW5pbWl6ZWQobWluaW1pemUpIHtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5taW5pbWl6ZWQgPSBtaW5pbWl6ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZXMgdGhlIHdpbmRvdyBjb250YWluaW5nIHRoZSBhcHAuXG4gICAgICovXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93JykuY2xvc2UoKTtcbiAgICB9XG5cbn1cblxuXG4vL2RlZmluZSB0aGUgZWxlbWVudFxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdpbWFnZS1nYWxsZXJ5LWFwcCcsIEltYWdlR2FsbGVyeUFwcCk7XG4iLCIvKlxuICogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBpbWFnZS1nYWxsZXJ5IHRvIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjcmVhdGVzIGEgZ2FsbGVyeSB0aGF0IGRpc3BsYXlzIGNsaWNrYWJsZSBpbWFnZXMgYXMgdGh1bWJuYWlscy5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICovXG5cbmNsYXNzIEltYWdlR2FsbGVyeSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBnYWxsZXJ5LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGxldCBnYWxsZXJ5VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW1hZ2UtZ2FsbGVyeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW1hZ2UtZ2FsbGVyeS5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FsbGVyeVRlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cbiAgICAgICAgLy9zZXR1cCBzaGFkb3cgZG9tIHN0eWxlc1xuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBnYWxsZXJ5VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIGdhbGxlcnkgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGFuZCB0cmFja3MgdGhlIHBpY3R1cmUgc291cmNlcy5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgbGV0IGdhbGxlcnkgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2dhbGxlcnknKTtcbiAgICAgICAgbGV0IGltYWdlRGlzcGxheSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjaW1hZ2VEaXNwbGF5Jyk7XG4gICAgICAgIGxldCBsb2NhbE5hdiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjbG9jYWxOYXYnKTtcblxuICAgICAgICAvL21ha2UgYXJyYXkgb2YgYWxsIHRoZSBwaWN0dXJlIHNvdXJjZXMgZm9yIHRyYXZlcnNpbmdcbiAgICAgICAgdGhpcy5waWN0dXJlU291cmNlcyA9IFtdO1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHRoaXMucXVlcnlTZWxlY3RvckFsbCgnW3Nsb3QgPVwicGljdHVyZVwiJyksIChhKSA9PiB7XG4gICAgICAgICAgICBpZiAoYS5oYXNBdHRyaWJ1dGUoJ3NyYycpICYmIHRoaXMucGljdHVyZVNvdXJjZXMuaW5kZXhPZihhLmdldEF0dHJpYnV0ZSgnc3JjJykpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGljdHVyZVNvdXJjZXMucHVzaChhLmdldEF0dHJpYnV0ZSgnc3JjJykpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhLmZpcnN0RWxlbWVudENoaWxkICYmIGEuZmlyc3RFbGVtZW50Q2hpbGQuaGFzQXR0cmlidXRlKCdzcmMnKSAmJiB0aGlzLnBpY3R1cmVTb3VyY2VzLmluZGV4T2YoYS5maXJzdEVsZW1lbnRDaGlsZC5nZXRBdHRyaWJ1dGUoJ3NyYycpKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBpY3R1cmVTb3VyY2VzLnB1c2goYS5maXJzdEVsZW1lbnRDaGlsZC5nZXRBdHRyaWJ1dGUoJ3NyYycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZ2FsbGVyeS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHNyYyA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ3NyYycpIHx8IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuXG4gICAgICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgICAgICAgZ2FsbGVyeS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgaW1hZ2VEaXNwbGF5LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlQaWN0dXJlKHNyYywgaW1hZ2VEaXNwbGF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbG9jYWxOYXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgdGFzayA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50UGljdHVyZSA9IGltYWdlRGlzcGxheS5xdWVyeVNlbGVjdG9yKCdpbWcuZGlzcGxheWVkJyk7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRQaWN0dXJlU3JjID0gY3VycmVudFBpY3R1cmUuZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFBpY3R1cmVTcmM7XG5cbiAgICAgICAgICAgICAgIGlmICh0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tzbG90ID1cInBpY3R1cmVcIicpLmxlbmd0aCAhPT0gdGhpcy5waWN0dXJlU291cmNlcy5sZW5ndGgpIHsgLy9jaGVjayBpZiBtb3JlIHBpY3R1cmVzIGhhcyBiZWVuIGFkZGVkXG4gICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwodGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdbc2xvdCA9XCJwaWN0dXJlXCInKSwgKGEpID0+IHsgLy9pbiB0aGF0IGNhc2UgdXBkYXRlIHNvdXJjZWxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzcmMgPSBhLmdldEF0dHJpYnV0ZSgnc3JjJykgfHwgYS5maXJzdEVsZW1lbnRDaGlsZC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGljdHVyZVNvdXJjZXMuaW5kZXhPZihzcmMpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGljdHVyZVNvdXJjZXMucHVzaChzcmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL3RyYXZlcnNlIHRocm91Z2ggdGhlIHBpY3R1cmUgc291cmNlc1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdmb3J3YXJkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQaWN0dXJlU3JjID0gdGhpcy5waWN0dXJlU291cmNlcy5pbmRleE9mKGN1cnJlbnRQaWN0dXJlU3JjKSArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dFBpY3R1cmVTcmMgPT09IHRoaXMucGljdHVyZVNvdXJjZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBpY3R1cmVTcmMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBpY3R1cmVTcmMgPSB0aGlzLnBpY3R1cmVTb3VyY2VzW25leHRQaWN0dXJlU3JjXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheVBpY3R1cmUobmV4dFBpY3R1cmVTcmMsIGltYWdlRGlzcGxheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYmFjayc6XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0UGljdHVyZVNyYyA9IHRoaXMucGljdHVyZVNvdXJjZXMuaW5kZXhPZihjdXJyZW50UGljdHVyZVNyYykgLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRQaWN0dXJlU3JjIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQaWN0dXJlU3JjID0gdGhpcy5waWN0dXJlU291cmNlcy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBpY3R1cmVTcmMgPSB0aGlzLnBpY3R1cmVTb3VyY2VzW25leHRQaWN0dXJlU3JjXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheVBpY3R1cmUobmV4dFBpY3R1cmVTcmMsIGltYWdlRGlzcGxheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ2FsbGVyeSc6XG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd1RodW1ibmFpbHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9zaG93IGZ1bGwgaW1hZ2UgaW4gc2VwYXJhdGUgd2luZG93IGlmIGNsaWNrZWRcbiAgICAgICAgaW1hZ2VEaXNwbGF5LnF1ZXJ5U2VsZWN0b3IoJ2EuZGlzcGxheWVkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBzcmMgPSBldmVudC50YXJnZXQuc3JjIHx8IGV2ZW50LnRhcmdldC5ocmVmO1xuICAgICAgICAgICAgaWYgKHNyYykge1xuICAgICAgICAgICAgICAgIG9wZW4oc3JjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwbGF5cyBhbiBpbWFnZSB3aXRoIGEgZGVzY3JpcHRpb24uIERlc2NyaXB0aW9uIGhhcyB0byBoYXZlXG4gICAgICogYSBmb3ItYXR0cmlidXRlIHRoYXQgbWF0Y2hlcyB0aGUgaW1hZ2VzIGxhYmVsLWF0dHJpYnV0ZS5cbiAgICAgKiBAcGFyYW0gc3JjIHtzdHJpbmd9IHRoZSBzb3VyY2Ugb2YgdGhlIHBpY3R1cmUgdG8gZGlzcGxheVxuICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbiB7SFRNTEVsZW1lbnR9IHdoZXJlIHRvIGRpc3BsYXkgdGhlIGltYWdlLlxuICAgICAqL1xuICAgIGRpc3BsYXlQaWN0dXJlKHNyYywgZGVzdGluYXRpb24pIHtcbiAgICAgICAgbGV0IGRpc3BsYXkgPSBkZXN0aW5hdGlvbjtcbiAgICAgICAgbGV0IGltZyA9IGRpc3BsYXkucXVlcnlTZWxlY3RvcignaW1nLmRpc3BsYXllZCcpO1xuICAgICAgICBsZXQgYSA9IGRpc3BsYXkucXVlcnlTZWxlY3RvcignYS5kaXNwbGF5ZWQnKTtcbiAgICAgICAgbGV0IHAgPSBkaXNwbGF5LnF1ZXJ5U2VsZWN0b3IoJ3AjZGVzY3JpcHRpb24nKTtcblxuICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMucXVlcnlTZWxlY3RvcignW3NyYz1cIicgKyBzcmMgKyAnXCJdJyk7XG4gICAgICAgIGxldCBsYWJlbCA9IGN1cnJlbnQuZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuICAgICAgICBsZXQgZGVzY3JpcHRpb25Gb3IgPSBcIltmb3I9J1wiICsgbGFiZWwgKyBcIiddXCI7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbiA9IHRoaXMucXVlcnlTZWxlY3RvcihkZXNjcmlwdGlvbkZvcikudGV4dENvbnRlbnQ7XG5cbiAgICAgICAgaW1nLnNyYyA9IHNyYztcbiAgICAgICAgYS5ocmVmID0gc3JjO1xuICAgICAgICBwLnRleHRDb250ZW50ID0gZGVzY3JpcHRpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2hvd3MgY2xpY2thYmxlIHRodW1ibmFpbHMgb2YgYWxsIHRoZSBpbWFnZXMgaW4gdGhlIGdhbGxlcnkuXG4gICAgICovXG4gICAgc2hvd1RodW1ibmFpbHMoKSB7XG4gICAgICAgIGxldCBnYWxsZXJ5ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNnYWxsZXJ5Jyk7XG4gICAgICAgIGxldCBpbWFnZURpc3BsYXkgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2ltYWdlRGlzcGxheScpO1xuXG4gICAgICAgIGdhbGxlcnkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICBpbWFnZURpc3BsYXkuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuXG4gICAgfVxufVxuXG5cbi8vZGVmaW5lcyB0aGUgZWxlbWVudFxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdpbWFnZS1nYWxsZXJ5JywgSW1hZ2VHYWxsZXJ5KTtcbiIsIi8qXG4gKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGluc3RhLWNoYXQtYXBwIHRvIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjb21iaW5lZCB0aGUgY29tcG9uZW50IGluc3RhLWNoYXQgd2l0aCB0aGUgY29tcG9uZW50IGRyYWdnYWJsZS13aW5kb3csIHRvXG4gKiBtYWtlIGEgY2hhdCBpbiBhIHdpbmRvdyB3aXRoIGFuIGFkZGVkIG1lbnUuXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICpcbiAqL1xuXG5jbGFzcyBJbnN0YUNoYXRBcHAgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIGEgY2hhdC13aW5kb3csIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgbGV0IGNoYXRXaW5kb3dUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbnN0YS1jaGF0LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFdpbmRvd1RlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCJ9KTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gY2hhdFdpbmRvd1RlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gY2hhdCBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogU2V0cyB1cCBldmVudCBsaXN0ZW5lcnMgZm9yXG4gICAgICogdGhlIG1lbnUsIGFuZCBwcmludHMgbWVzc2FnZXNcbiAgICAgKiBzYXZlZCBpbiBsb2NhbCBzdG9yYWdlIGlmIGFueS5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgLy9pbml0aWF0ZSB0aGUgY2hhdFxuICAgICAgICBsZXQgY2hhdHNwYWNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5zdGEtY2hhdCcpO1xuICAgICAgICBjaGF0c3BhY2Uuc2V0QXR0cmlidXRlKCdzbG90JywgJ2NvbnRlbnQnKTtcbiAgICAgICAgY2hhdHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5hcHBlbmRDaGlsZChjaGF0c3BhY2UpO1xuXG5cbiAgICAgICAgbGV0IG5hbWVzcGFjZSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjc3VibWl0TmFtZScpO1xuICAgICAgICBsZXQgYWJvdXRzcGFjZSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjYWJvdXQnKTtcblxuICAgICAgICBsZXQgY2hhdG9wdGlvbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJjaGF0XCJdJyk7XG4gICAgICAgIGxldCBhYm91dG9wdGlvbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJhYm91dFwiXScpO1xuICAgICAgICBsZXQgb3B0aW9ub3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cIm9wdGlvbnNcIl0nKTtcblxuICAgICAgICAvL2NoZWNrIGlmIGEgbmFtZSBoYXMgYWxyZWFkeSBiZWVuIGNob29zZW5cbiAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5jaGF0TmFtZSkge1xuICAgICAgICAgICAgbGV0IG5hbWUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5jaGF0TmFtZSk7XG4gICAgICAgICAgICBjaGF0c3BhY2UuY2hhbmdlQ29uZmlnKHtuYW1lOiBuYW1lfSk7XG4gICAgICAgICAgICBuYW1lc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBjaGF0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICB9IGVsc2UgeyAvL2FzayBmb3IgYSBuYW1lXG4gICAgICAgICAgICBjaGF0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBuYW1lc3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgbmFtZXNwYWNlLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgbmFtZSA9IG5hbWVzcGFjZS5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpLnZhbHVlO1xuICAgICAgICAgICAgY2hhdHNwYWNlLmNoYW5nZUNvbmZpZyh7bmFtZTogbmFtZX0pO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLmNoYXROYW1lID0gSlNPTi5zdHJpbmdpZnkobmFtZSk7XG4gICAgICAgICAgICBuYW1lc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBjaGF0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL2V2ZW50IGxpc3RlbmVycyBmb3IgbWVudSwgYWRkIHNlcGFyYXRlIG9uZXMgZm9yIGFjY2Vzc2liaWxpdHkgcmVhc29uc1xuICAgICAgICBvcHRpb25vcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQuZm9jdXNlZCB8fCBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICduYW1lY2hhbmdlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncXVpdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vYXZlbnQgbGlzdGVuZXIgZm9yIG1lbnVcbiAgICAgICAgYWJvdXRvcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQuZm9jdXNlZCB8fCBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdhYm91dCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhdHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL2V2ZW50IGxpc3RlbmVyIGZvciBtZW51XG4gICAgICAgIGNoYXRvcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQuZm9jdXNlZCB8fCBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjaGF0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXRzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vcHJpbnQgdGhlIGxhc3QgdHdlbnR5IG1lc3NhZ2VzIGZyb20gbGFzdCB0aW1lXG4gICAgICAgIGxldCBtZXNzYWdlcyA9IGNoYXRzcGFjZS5tZXNzYWdlTWFuYWdlci5nZXRDaGF0TG9nKCkucmV2ZXJzZSgpO1xuICAgICAgICBpZiAobWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbWVzc2FnZXMuZm9yRWFjaCgobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNoYXRzcGFjZS5wcmludChtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9zY3JvbGwgZG93biB3aGVuIHdpbmRvdyBoYXMgYmVlbiByZW5kZXJlZFxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNoYXRzcGFjZS5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNtZXNzYWdlV2luZG93Jykuc2Nyb2xsVG9wID0gY2hhdHNwYWNlLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI21lc3NhZ2VXaW5kb3cnKS5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIH0sIDEwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gYXBwIGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLlxuICAgICAqIENsb3NlcyB0aGUgd2luZG93IGFuZCB0aGUgd2ViIHNvY2tldC5cbiAgICAgKi9cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBjb250YWluaW5nIHRoZSBhcHAgaXMgb3Blbi5cbiAgICAgKi9cbiAgICBnZXQgb3BlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93Jykub3BlbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIHRoZSB3aW5kb3cgY29udGFpbmluZyB0aGUgYXBwIGlzIG1pbmltaXplZC5cbiAgICAgKi9cbiAgICBnZXQgbWluaW1pemVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5taW5pbWl6ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbWluaW1pemVkIHByb3BlcnR5IG9mIHRoZSB3aW5kb3cgY29udGFpbmluZyB0aGUgYXBwLlxuICAgICAqIEBwYXJhbSBtaW5pbWl6ZSB7Ym9vbGVhbn0gd2hldGhlciB0byBtaW5pbWl6ZVxuICAgICAqL1xuICAgIHNldCBtaW5pbWl6ZWQobWluaW1pemUpIHtcbiAgICAgICAgaWYgKG1pbmltaXplKSB7XG4gICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZXMgdGhlIHdpbmRvdyBhbmQgdGhlIHdlYiBzb2NrZXQuXG4gICAgICovXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93JykuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2luc3RhLWNoYXQnKS5zb2NrZXQuY2xvc2UoKTtcbiAgICB9XG59XG5cbi8vZGVmaW5lcyB0aGUgZWxlbWVudFxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdpbnN0YS1jaGF0LWFwcCcsIEluc3RhQ2hhdEFwcCk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBJbnN0YUNoYXRBcHA7XG4iLCIvKlxuICogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBpbnN0YS1jaGF0IHRvIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjcmVhdGVzIGEgY2hhdCBjb25uZWN0ZWQgdG8gYSB3ZWIgc29ja2V0IHRoYXQgc2VuZHMsIHJlY2VpdmVzIGFuZCBwcmludHNcbiAqIG1lc3NhZ2VzLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxuY2xhc3MgSW5zdGFDaGF0IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIGNoYXQsIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKiBAcGFyYW0gY29uZmlnIHtvYmplY3R9IGEgY29uZmlnIG9iamVjdCB3aXRoIHRoZSB3ZWJzb2NrZXRzIHVybCwgY2hhbm5lbCwga2V5IGFuZCBhIG5hbWUgZm9yIHRoZSB1c2VyXG4gICAgICogQHBhcmFtIHN0YXJ0TWVzc2FnZXMge1tPYmplY3RdfSBtZXNzYWdlcyB0byBwcmludCBhdCB0aGUgc3RhcnQgb2YgdGhlIGNoYXQuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY29uZmlnID0ge30sIHN0YXJ0TWVzc2FnZXMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgbGV0IGNoYXRUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbnN0YS1jaGF0LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbnN0YS1jaGF0Lmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNjaGF0VGVtcGxhdGVcIik7IC8vc2hhZG93IERPTSBpbXBvcnRcblxuICAgICAgICAvL3NldHVwIHNoYWRvdyBkb20gc3R5bGVzXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IGNoYXRUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICAgICAgLy9zZXQgY29uZmlnIG9iamVjdCBhcyB0aGlzLmNvbmZpZ1xuICAgICAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgICAgICAgIHVybDogY29uZmlnLnVybCB8fCAnd3M6dmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvJyxcbiAgICAgICAgICAgIG5hbWU6IGNvbmZpZy5uYW1lIHx8ICdzZXZlcnVzIHNuYXBlJyxcbiAgICAgICAgICAgIGNoYW5uZWw6IGNvbmZpZy5jaGFubmVsIHx8ICcnLFxuICAgICAgICAgICAga2V5OiBjb25maWcua2V5IHx8ICdlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZCdcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5tZXNzYWdlcyA9IHN0YXJ0TWVzc2FnZXMgfHwgW107XG4gICAgICAgIHRoaXMuc29ja2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5vbmxpbmVDaGVja2VyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gY2hhdCBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogQ29ubmVjdHMgdG8gdGhlIHNlcnZlciwgc2V0cyB1cCBldmVudCBsaXN0ZW5lcnMgYW5kIHByaW50c1xuICAgICAqIGFscmVhZHkgc2F2ZWQgbWVzc2FnZXMgaWYgYW55LlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAvL2Nvbm5lY3RcbiAgICAgICAgdGhpcy5jb25uZWN0KCk7XG5cbiAgICAgICAgLy9zZXQgZXZlbnQgbGlzdGVuZXIgdG8gc2VuZCBtZXNzYWdlIG9uIGVudGVyXG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjbWVzc2FnZUFyZWEnKS5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZChldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vaWYgbWVzc2FnZXMgdG8gcHJpbnQgYXQgc3RhcnQgb2YgY2hhdCwgcHJpbnQgZWFjaFxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzLmZvckVhY2goKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByaW50KG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZXMgdGhlIHdlYiBzb2NrZXQgY29ubmVjdGlvbiBpZiBjaGF0IGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLlxuICAgICAqL1xuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLnNvY2tldC5jbG9zZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbm5lY3RzIHRvIHRoZSBXZWJTb2NrZXQgc2VydmVyLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGNvbm5lY3Rpb24gaXMgb3BlblxuICAgICAqIGFuZCByZWplY3RzIHdpdGggdGhlIHNlcnZlciByZXNwb25zZSBpZiBzb21ldGhpbmcgd2VudCB3cm9uZy5cbiAgICAgKiBJZiBhIGNvbm5lY3Rpb24gaXMgYWxyZWFkeSBvcGVuLCByZXNvbHZlcyB3aXRoXG4gICAgICogdGhlIHNvY2tldCBmb3IgdGhhdCBjb25uZWN0aW9uLlxuICAgICAqL1xuICAgIGNvbm5lY3QoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgIGxldCBzb2NrZXQgPSB0aGlzLnNvY2tldDtcblxuICAgICAgICAgICAgLy9jaGVjayBmb3IgZXN0YWJsaXNoZWQgY29ubmVjdGlvblxuICAgICAgICAgICAgaWYgKHNvY2tldCAmJiBzb2NrZXQucmVhZHlTdGF0ZSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoc29ja2V0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh0aGlzLmNvbmZpZy51cmwpO1xuXG4gICAgICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRPbmxpbmVDaGVja2VyKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoc29ja2V0KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdjb3VsZCBub3QgY29ubmVjdCB0byBzZXJ2ZXInKSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS50eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJpbnQocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlTWFuYWdlci5zZXRDaGF0TG9nKHJlc3BvbnNlKTsgLy9zYXZlIG1lc3NhZ2UgaW4gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLnR5cGUgPT09ICdoZWFydGJlYXQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaGVhcnRiZWF0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0T25saW5lQ2hlY2tlcigpOyAvL3Jlc2V0IGZvciBldmVyeSBoZWFydGJlYXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZU1hbmFnZXIuZ2V0VW5zZW50KCkuZm9yRWFjaCgobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZChtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlTWFuYWdlci5jbGVhclVuc2VudCgpOyAvL3B1c2ggdW5zZW50IG1lc3NhZ2VzIHdoZW4gdGhlcmUgaXMgYSBjb25uZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZHMgYSBtZXNzYWdlIHRvIHRoZSBzZXJ2ZXIuXG4gICAgICogQHBhcmFtIG1lc3NhZ2Uge3N0cmluZ30gdGhlIG1lc3NhZ2UgdG8gc2VuZC5cbiAgICAgKi9cbiAgICBzZW5kKG1lc3NhZ2UpIHtcblxuICAgICAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdtZXNzYWdlJyxcbiAgICAgICAgICAgIGRhdGE6IG1lc3NhZ2UsXG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy5jb25maWcubmFtZSxcbiAgICAgICAgICAgIGNoYW5uZWw6IHRoaXMuY29uZmlnLmNoYW5uZWwsXG4gICAgICAgICAgICBrZXk6IHRoaXMuY29uZmlnLmtleVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY29ubmVjdCgpXG4gICAgICAgICAgICAudGhlbigoc29ja2V0KSA9PiB7XG4gICAgICAgICAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICB9KS5jYXRjaCgocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZU1hbmFnZXIuc2V0VW5zZW50KGRhdGEpO1xuICAgICAgICAgICAgdGhpcy5wcmludChkYXRhLCB0cnVlKTsgLy9wcmludCBtZXNzYWdlIGFzIFwidW5zZW50XCIgdG8gbWFrZSBpdCBsb29rIGRpZmZlcmVudDtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmludHMgYSBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHtPYmplY3R9IHRoZSBtZXNzYWdlIHRvIHByaW50LlxuICAgICAqIEBwYXJhbSB1bnNlbnQge2Jvb2xlYW59IHRydWUgaWYgdGhlIG1lc3NhZ2UgaGFzIG5vdCBiZWVuIHN1Y2Nlc3NmdWxseSBzZW50XG4gICAgICovXG4gICAgcHJpbnQobWVzc2FnZSwgdW5zZW50KSB7XG4gICAgICAgIGxldCBtZXNzYWdlVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW5zdGEtY2hhdC1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW5zdGEtY2hhdC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVRlbXBsYXRlXCIpOyAvL21lc3NhZ2UgZGlzcGxheSB0ZW1wbGF0ZVxuXG4gICAgICAgIGxldCBjaGF0V2luZG93ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNtZXNzYWdlV2luZG93Jyk7XG4gICAgICAgIGxldCBtZXNzYWdlRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShtZXNzYWdlVGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvcignLmF1dGhvcicpLnRleHRDb250ZW50ID0gbWVzc2FnZS5kYXRhLnVzZXJuYW1lIHx8IG1lc3NhZ2UudXNlcm5hbWU7XG4gICAgICAgIG1lc3NhZ2VEaXYucXVlcnlTZWxlY3RvcignLm1lc3NhZ2UnKS50ZXh0Q29udGVudCA9IG1lc3NhZ2UuZGF0YS5kYXRhIHx8IG1lc3NhZ2UuZGF0YTtcblxuICAgICAgICBpZiAodW5zZW50KSB7XG4gICAgICAgICAgICBtZXNzYWdlRGl2LmNsYXNzTGlzdC5hZGQoJ3Vuc2VudCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hhdFdpbmRvdy5hcHBlbmRDaGlsZChtZXNzYWdlRGl2KTtcbiAgICAgICAgY2hhdFdpbmRvdy5zY3JvbGxUb3AgPSBjaGF0V2luZG93LnNjcm9sbEhlaWdodDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGVhcnMgYW5kIHNldHMgYSBuZXcgdGltZW91dCB0byBtYWtlIHN1cmUgc2VydmVyIGlzIHN0aWxsIGNvbm5lY3RlZC5cbiAgICAgKiBJZiBjb25uZWN0aW9uIGlzIGxvc3QgYW5kIHRoZW4gcmVnYWluZWQsIHByaW50cyBhbGwgdW5zZW50IG1lc3NhZ2VzLlxuICAgICAqL1xuICAgIHJlc2V0T25saW5lQ2hlY2tlcigpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMub25saW5lQ2hlY2tlcik7XG5cbiAgICAgICAgdGhpcy5vbmxpbmVDaGVja2VyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAvL1RPRE86IHNvbWV0aGluZyBoZXJlXG4gICAgICAgIH0sIDYwMDAwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIG9iamVjdCB0byBtYW5hZ2UgbWVzc2FnZXMuXG4gICAgICogQHJldHVybnMge29iamVjdH0gdGhlIG9iamVjdC5cbiAgICAgKi9cbiAgICBnZXQgbWVzc2FnZU1hbmFnZXIoKSB7XG4gICAgICAgICAgICBsZXQgc3RvcmFnZSA9IGxvY2FsU3RvcmFnZTtcbiAgICAgICAgICAgIGxldCBjaGF0TG9nID0gW107XG4gICAgICAgICAgICBsZXQgdW5zZW50ID0gW107XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUmV0cmlldmVzIGNoYXQgbG9nIGZyb20gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICogQHJldHVybnMge09iamVjdH0gdGhlICwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBubyBtZXNzYWdlc1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBnZXRDaGF0TG9nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RvcmFnZS5jaGF0TG9nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoYXRMb2cgPSBKU09OLnBhcnNlKHN0b3JhZ2UuY2hhdExvZyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYXRMb2c7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZXRyaWV2ZXMgdW5zZW50IG1lc3NhZ2VzIGZyb20gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICogQHJldHVybnMge09iamVjdH0gdGhlIG1lc3NhZ2VzLCBvciB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG5vIG1lc3NhZ2VzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdldFVuc2VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2UudW5zZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHVuc2VudCA9IEpTT04ucGFyc2Uoc3RvcmFnZS51bnNlbnQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB1bnNlbnQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBzZXRzIHVuc2VudCBtZXNzYWdlcyBpbiBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgKiBAcGFyYW0gbWVzc2FnZSB7b2JqZWN0fSB0aGUgbWVzc2FnZSBvYmplY3QgdG8gc2F2ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzZXRVbnNlbnQ6IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBsZXQgb2xkTWVzc2FnZXM7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RvcmFnZS51bnNlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMgPSBKU09OLnBhcnNlKHN0b3JhZ2UudW5zZW50KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzLnVuc2hpZnQobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICBzdG9yYWdlLnVuc2VudCA9IEpTT04uc3RyaW5naWZ5KG9sZE1lc3NhZ2VzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIENsZWFycyB1bnNlbnQgbWVzc2FnZXMuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNsZWFyVW5zZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oJ3Vuc2VudCcpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBTZXRzIHNlbnQgbWVzc2FnZXMgaW4gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICogQHBhcmFtIG1lc3NhZ2Uge29iamVjdH0gdGhlIG1lc3NhZ2Ugb2JqZWN0IHRvIHNhdmVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2V0Q2hhdExvZzogZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGxldCBvbGRNZXNzYWdlcztcblxuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlLmNoYXRMb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMgPSBKU09OLnBhcnNlKHN0b3JhZ2UuY2hhdExvZyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcy51bnNoaWZ0KG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG9sZE1lc3NhZ2VzLmxlbmd0aCA+IDIwKSB7IC8va2VlcCB0aGUgbGlzdCB0byAyMCBtZXNzYWdlc1xuICAgICAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcy5sZW5ndGggPSAyMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdG9yYWdlLmNoYXRMb2cgPSBKU09OLnN0cmluZ2lmeShvbGRNZXNzYWdlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyB0aGUgY29uZmlnIGZpbGUuXG4gICAgICogQHBhcmFtIGNvbmZpZyB7b2JqZWN0fSB0aGUgbmV3IHZhbHVlcyBpbiBhbiBvYmplY3QuXG4gICAgICovXG4gICAgY2hhbmdlQ29uZmlnKGNvbmZpZykge1xuICAgICAgICB0aGlzLmNvbmZpZy5uYW1lID0gY29uZmlnLm5hbWUgfHwgdGhpcy5jb25maWcubmFtZTtcbiAgICAgICAgdGhpcy5jb25maWcudXJsID0gY29uZmlnLnVybHx8IHRoaXMuY29uZmlnLnVybDtcbiAgICAgICAgdGhpcy5jb25maWcuY2hhbm5lbCA9IGNvbmZpZy5jaGFubmVsIHx8IHRoaXMuY29uZmlnLmNoYW5uZWw7XG4gICAgICAgIHRoaXMuY29uZmlnLmtleSA9IGNvbmZpZy5rZXkgfHwgdGhpcy5jb25maWcua2V5O1xuICAgIH1cbn1cblxuLy9kZWZpbmVzIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2luc3RhLWNoYXQnLCBJbnN0YUNoYXQpO1xuIiwiLypcbiAqIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgbWVtb3J5LWFwcCB0byBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuICogSXQgY29tYmluZXMgdGhlIGNvbXBvbmVudCBtZW1vcnktZ2FtZSB3aXRoIHRoZSBjb21wb25lbnQgZHJhZ2dhYmxlLXdpbmRvdywgdG9cbiAqIG1ha2UgYSBjaGF0IGluIGEgd2luZG93IHdpdGggYW4gYWRkZWQgbWVudS5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICovXG5cbmNsYXNzIE1lbW9yeUFwcCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBtZW1vcnktd2luZG93LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGxldCBtZW1vcnlXaW5kb3dUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlXaW5kb3dUZW1wbGF0ZVwiKTtcblxuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBtZW1vcnlXaW5kb3dUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIG1lbW9yeS1hcHAgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGZvclxuICAgICAqIHRoZSBtZW51IGFuZCBnYW1lIGJvYXJkIHNpemUuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIGxldCBnYW1lc3BhY2UgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKTtcbiAgICAgICAgbGV0IGhpZ2hzY29yZXNwYWNlID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNoaWdoc2NvcmVzJyk7XG4gICAgICAgIGxldCBhYm91dHNwYWNlID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNhYm91dCcpO1xuXG4gICAgICAgIGxldCBnYW1lID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ21lbW9yeS1nYW1lJyk7XG4gICAgICAgIGxldCBnYW1lT3B0aW9ucyA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJnYW1lXCJdJyk7XG4gICAgICAgIGxldCBoaWdoc2NvcmVzT3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cImhpZ2hzY29yZVwiXScpO1xuICAgICAgICBsZXQgYWJvdXRPcHRpb24gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwiYWJvdXRcIl0nKTtcblxuICAgICAgICAvL21lbnUgZXZlbnQgbGlzdGVuZXJzLCBhZGQgc2VwYXJhdGUgb25lcyBmb3IgYWNjZXNzaWJpbGl0eSByZWFzb25zXG4gICAgICAgIGdhbWVPcHRpb25zLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LmZvY3VzZWQgfHwgZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0OyAvL3NoYWRvdyBET00gYWNjZXNzaWJpbGl0eSBpc3N1ZXNcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZXN0YXJ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lc3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZXNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lc3BhY2UucmVwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICduZXcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaHNjb3Jlc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVzcGFjZS5yZXN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdxdWl0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIC8vbWVudSBldmVudCBsaXN0ZW5lclxuICAgICAgICBoaWdoc2NvcmVzT3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0OyAvL3NoYWRvdyBET00gYWNjZXNzaWJpbGl0eSBpc3N1ZXNcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdoaWdoc2NvcmVzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hzY29yZXMoZ2FtZS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZXNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZXNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL21lbnUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgYWJvdXRPcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7IC8vc2hhZG93IERPTSBhY2Nlc3NpYmlsaXR5IGlzc3Vlc1xuICAgICAgICAgICAgbGV0IHRhc2sgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Fib3V0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBoaWdoc2NvcmVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9ib2FyZCBzaXplIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5wYXRoWzBdO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2JvYXJkc2l6ZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51c2VyID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbnRybyBpbnB1dCcpLnZhbHVlIHx8ICdzdHJhbmdlcic7IC8vZ2V0IHRoZSBuYW1lIHdoZW4gYm9hcmQgc2l6ZSBpcyBjaG9zZW5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2JvYXJkc2l6ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzQ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUud2lkdGggPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5oZWlnaHQgPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5kcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc0Mic6XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLndpZHRoID0gNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuaGVpZ2h0ID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnMjQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS53aWR0aCA9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmhlaWdodCA9IDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgd2hlbiBhcHAgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00uXG4gICAgICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIGhpZ2hzY29yZXMgYnkgc2V0dGluZyB0aGVtIGluIHRoZSBsb2NhbCBzdG9yYWdlXG4gICAgICogYW5kIGRpc3BsYXlpbmcgZGVtLlxuICAgICAqIEBwYXJhbSByZXN1bHRcbiAgICAgKi9cbiAgICB1cGRhdGVIaWdoc2NvcmVzKHJlc3VsdCkge1xuICAgICAgICBsZXQgaGlnaHNjb3Jlc1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2hpZ2hzY29yZXNUZW1wbGF0ZVwiKTtcblxuICAgICAgICBsZXQgaGlnaHNjb3JlcyA9IHtcbiAgICAgICAgICAgIHN0b3JhZ2U6IGxvY2FsU3RvcmFnZSxcbiAgICAgICAgICAgIHNjb3JlczogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZXRyaWV2ZXMgaGlnaHNjb3JlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSBoaWdoc2NvcmUtbGlzdCwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBubyBoaWdoc2NvcmVzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdldEhpZ2hTY29yZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdG9yYWdlLm1lbW9yeUhpZ2hTY29yZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29yZXMgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zY29yZXM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBzZXRzIGhpZ2hzY29yZXMgaW4gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICogQHBhcmFtIHVzZXIge3N0cmluZ30gdGhlIHVzZXJzIG5hbWVcbiAgICAgICAgICAgICAqIEBwYXJhbSBuZXdTY29yZSB7bnVtYmVyfSB0aGUgc2NvcmUgdG8gc2V0XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNldEhpZ2hTY29yZXM6IGZ1bmN0aW9uICh1c2VyLCBuZXdTY29yZSkge1xuICAgICAgICAgICAgICAgIGxldCBvbGRIaWdoU2NvcmVzO1xuICAgICAgICAgICAgICAgIGxldCBuZXdIaWdoU2NvcmVzO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEhpZ2hTY29yZXMgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvbGRIaWdoU2NvcmVzID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2xkSGlnaFNjb3Jlcy5wdXNoKHt1c2VyOiB1c2VyLCBzY29yZTogbmV3U2NvcmV9KTtcblxuICAgICAgICAgICAgICAgIG5ld0hpZ2hTY29yZXMgPSBvbGRIaWdoU2NvcmVzLnNvcnQoKGEsIGIpID0+IHsgLy9zb3J0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhLnNjb3JlIC0gYi5zY29yZTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXdIaWdoU2NvcmVzLmxlbmd0aCA+IDUpIHsgLy9rZWVwIHRoZSBsaXN0IHRvIDUgc2NvcmVzXG4gICAgICAgICAgICAgICAgICAgIG5ld0hpZ2hTY29yZXMubGVuZ3RoID0gNTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnN0b3JhZ2UubWVtb3J5SGlnaFNjb3JlcyA9IEpTT04uc3RyaW5naWZ5KG5ld0hpZ2hTY29yZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChyZXN1bHQpIHsgLy9hIG5ldyByZXN1bHQgaXMgcHJlc2VudFxuICAgICAgICAgICAgbGV0IHNjb3JlID0gKHJlc3VsdC50dXJucyAqIHJlc3VsdC50aW1lKSAvICh0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKS5oZWlnaHQgKiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKS53aWR0aCk7XG4gICAgICAgICAgICBoaWdoc2NvcmVzLnNldEhpZ2hTY29yZXModGhpcy51c2VyLCBzY29yZSk7XG4gICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKS5yZXN1bHQgPSB1bmRlZmluZWQ7IC8vY2xlYW4gdGhlIHJlc3VsdFxuICAgICAgICB9XG5cbiAgICAgICAgLy9kaXNwbGF5IHRoZSBzY29yZXNcbiAgICAgICAgbGV0IHNjb3JlcyA9IGhpZ2hzY29yZXMuZ2V0SGlnaFNjb3JlcygpO1xuICAgICAgICBsZXQgaGlnaHNjb3JlRGlzcGxheSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjaGlnaHNjb3JlRGlzcGxheScpO1xuICAgICAgICBsZXQgb2xkTGlzdCA9IGhpZ2hzY29yZURpc3BsYXkucXVlcnlTZWxlY3RvcigndWwnKTtcbiAgICAgICAgbGV0IGxpc3QgPSBkb2N1bWVudC5pbXBvcnROb2RlKGhpZ2hzY29yZXNUZW1wbGF0ZS5jb250ZW50LnF1ZXJ5U2VsZWN0b3IoXCJ1bFwiKSwgdHJ1ZSk7XG4gICAgICAgIGxldCBlbnRyeTtcblxuICAgICAgICBpZiAoc2NvcmVzKSB7XG4gICAgICAgICAgICBzY29yZXMuZm9yRWFjaCgoc2NvcmUpID0+IHtcbiAgICAgICAgICAgICAgICBlbnRyeSA9IGRvY3VtZW50LmltcG9ydE5vZGUoKGxpc3QucXVlcnlTZWxlY3RvcihcImxpXCIpKSk7XG4gICAgICAgICAgICAgICAgZW50cnkudGV4dENvbnRlbnQgPSBzY29yZS51c2VyICsgXCI6IFwiICsgc2NvcmUuc2NvcmU7XG4gICAgICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChlbnRyeSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVudHJ5ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSgobGlzdC5xdWVyeVNlbGVjdG9yKFwibGlcIikpKTtcbiAgICAgICAgICAgIGVudHJ5LnRleHRDb250ZW50ID0gXCItXCI7XG4gICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKGVudHJ5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb2xkTGlzdCkgeyAvL2lmIHNjb3JlcyBoYXZlIGFscmVhZHkgYmVlbiBkaXNwbGF5ZWQsIHJlcGxhY2UgdGhlbVxuICAgICAgICAgICAgaGlnaHNjb3JlRGlzcGxheS5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhpZ2hzY29yZURpc3BsYXkucmVwbGFjZUNoaWxkKGxpc3QsIG9sZExpc3QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgd2luZG93IGNvbnRhaW5pbmcgdGhlIGFwcCBpcyBvcGVuLlxuICAgICAqL1xuICAgIGdldCBvcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5vcGVuO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgdGhlIHdpbmRvdyBjb250YWluaW5nIHRoZSBhcHAgaXMgbWluaW1pemVkLlxuICAgICAqL1xuICAgIGdldCBtaW5pbWl6ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBtaW5pbWl6ZWQgcHJvcGVydHkgb2YgdGhlIHdpbmRvdyBjb250YWluaW5nIHRoZSBhcHAuXG4gICAgICogQHBhcmFtIG1pbmltaXplIHtib29sZWFufSB3aGV0aGVyIHRvIG1pbmltaXplXG4gICAgICovXG4gICAgc2V0IG1pbmltaXplZChtaW5pbWl6ZSkge1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZCA9IG1pbmltaXplO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIG5vZGUgYW5kIGNsb3NlcyB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93JykuY2xvc2UoKTtcbiAgICB9XG5cbn1cblxuLy9oZWxwZXIgZnVuY3Rpb25cbi8vYWRkcyBtdWx0aXBsZSBldmVudCBsaXN0ZW5lcnMgd2l0aCBpZGVudGljYWwgaGFuZGxlcnNcbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzKGVsZW1lbnQsIGV2ZW50cywgaGFuZGxlcikge1xuICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSk7XG59XG5cbi8vZGVmaW5lIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ21lbW9yeS1hcHAnLCBNZW1vcnlBcHApO1xuIiwiLypcbiAqIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgbWVtb3J5LWdhbWUgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiAqIEl0IGNyZWF0ZXMgYSBtZW1vcnkgZ2FtZSB3aXRoIGEgdGltZXIgYSBhIHR1cm4tY291bnRlci4gVGhlIGdhbWUgaXMgb3ZlciB3aGVuXG4gKiBhbGwgYnJpY2tzIGhhdmUgYmVlbiBwYWlyZWQgYW5kIHN0b3JlcyB0aGUgdG90YWwgdGltZSBhbmQgdHVybnMgaW4gYSByZXN1bHQtdmFyaWFibGUuXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICpcbiAqL1xuXG4vL3JlcXVpcmVzXG5sZXQgVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyLmpzJyk7XG5cblxuY2xhc3MgTWVtb3J5R2FtZSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBtZW1vcnkgZ2FtZSwgc2V0cyB1cCBzaGFkb3cgRE9NLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgbGV0IG1lbW9yeVRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWdhbWUuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeVRlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cbiAgICAgICAgLy9zZXR1cCBzaGFkb3cgZG9tIHN0eWxlc1xuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBtZW1vcnlUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICAgICAgLy9zZXQgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkYXRhLXdpZHRoJywgd2lkdGggfHwgdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2lkdGgnKSB8fCA0KTtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0JywgaGVpZ2h0IHx8IHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcpICB8fCA0KTtcblxuICAgICAgICAvL3NldCByZWZlcmVuY2VzXG4gICAgICAgIHRoaXMuc2V0ID0gW107XG4gICAgICAgIHRoaXMudGltZXIgPSBuZXcgVGltZXIoMCk7XG4gICAgICAgIHRoaXMuZ2FtZVBsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudGltZXNwYW4gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiN0aW1lc3BhblwiKTtcbiAgICAgICAgdGhpcy50dXJuc3BhbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI3R1cm5zcGFuXCIpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIG1lbW9yeSBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogQWRkcyBldmVudCBsaXN0ZW5lcnMgYW5kIHJlbmRlcnMgYSBib2FyZCB3aXRoIGJyaWNrcy5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbnRybyBidXR0b24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZHJhdygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSB3aWR0aCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzXG4gICAgICovXG4gICAgZ2V0IHdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2lkdGgnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB3aWR0aCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzLlxuICAgICAqIEBwYXJhbSBuZXdWYWwge3N0cmluZ30gdGhlIG5ldyB3aWR0aCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzXG4gICAgICovXG4gICAgc2V0IHdpZHRoKG5ld1ZhbCkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnZGF0YS13aWR0aCcsIG5ld1ZhbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIGhlaWdodCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzXG4gICAgICovXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGhlaWdodCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzLlxuICAgICAqIEBwYXJhbSBuZXdWYWwge3N0cmluZ30gdGhlIG5ldyBoZWlnaHQgb2YgdGhlIGJvYXJkIGluIGJyaWNrc1xuICAgICAqL1xuICAgIHNldCBoZWlnaHQobmV3VmFsKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcsIG5ld1ZhbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2h1ZmZsZXMgdGhlIGJyaWNrcyB1c2luZyBGaXNoZXItWWF0ZXMgYWxnb3JpdGhtLlxuICAgICAqL1xuICAgIHNodWZmbGUoKSB7XG4gICAgICAgIGxldCB0aGVTZXQgPSB0aGlzLnNldDtcbiAgICAgICAgZm9yIChsZXQgaSA9ICh0aGVTZXQubGVuZ3RoIC0gMSk7IGkgPiAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgIGxldCBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSk7XG4gICAgICAgICAgICBsZXQgaU9sZCA9IHRoZVNldFtpXTtcbiAgICAgICAgICAgIHRoZVNldFtpXSA9IHRoZVNldFtqXTtcbiAgICAgICAgICAgIHRoZVNldFtqXSA9IGlPbGQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQgPSB0aGVTZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgYnJpY2tzIHRvIHRoZSBib2FyZCBhbmQgcmVuZGVycyB0aGVtIGluIHRoZSBET00uXG4gICAgICovXG4gICAgZHJhdygpIHtcbiAgICAgICAgbGV0IGJyaWNrVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktZ2FtZS5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjYnJpY2tUZW1wbGF0ZVwiKTsgLy9icmljayB0ZW1wbGF0ZVxuXG4gICAgICAgIGxldCBicmljaztcbiAgICAgICAgbGV0IG1hdGNoO1xuICAgICAgICBsZXQgcGFpcnMgPSBNYXRoLnJvdW5kKCh0aGlzLndpZHRoICogdGhpcy5oZWlnaHQpKSAvIDI7XG4gICAgICAgIHRoaXMuc2V0ID0gW107XG4gICAgICAgIGxldCBvbGRCcmlja3MgPSB0aGlzLmNoaWxkcmVuO1xuXG4gICAgICAgIC8vcmVtb3ZlIG9sZCBicmlja3MgaWYgYW55XG4gICAgICAgIGZvciAobGV0IGkgPSBvbGRCcmlja3MubGVuZ3RoIC0xOyBpID49IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgbGV0IGJyaWNrID0gb2xkQnJpY2tzW2ldO1xuICAgICAgICAgICAgaWYgKGJyaWNrLmdldEF0dHJpYnV0ZSgnc2xvdCcpID09PSAnYnJpY2snKSB7XG4gICAgICAgICAgICAgICAgYnJpY2sucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChicmljayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL2luaXRpYXRlIGJyaWNrc1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBwYWlyczsgaSArPSAxKSB7XG4gICAgICAgICAgICBicmljayA9IG5ldyBCcmljayhpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0LnB1c2goYnJpY2spO1xuICAgICAgICAgICAgbWF0Y2ggPSBicmljay5jbG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5zZXQucHVzaChtYXRjaCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRoZVNldCA9IHRoaXMuc2V0O1xuXG4gICAgICAgIC8vcHV0IHRoZW0gaW4gdGhlIGRvbVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoZVNldC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgbGV0IGJyaWNrRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShicmlja1RlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICAgICAgbGV0IGltZyA9IGJyaWNrRGl2LnF1ZXJ5U2VsZWN0b3IoXCJpbWdcIik7XG4gICAgICAgICAgICBsZXQgYnJpY2sgPSB0aGVTZXRbaV07XG4gICAgICAgICAgICBpbWcuc3JjID0gJy9pbWFnZS9tZW1vcnktYnJpY2stJyArIGJyaWNrLmRyYXcoKSArICcucG5nJztcbiAgICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJicmlja051bWJlclwiLCBpKTtcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kQ2hpbGQoYnJpY2tEaXYpO1xuXG4gICAgICAgICAgICBpZiAoKGkgKyAxKSAlIHRoaXMud2lkdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgYnIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIik7XG4gICAgICAgICAgICAgICAgYnIuc2V0QXR0cmlidXRlKCdzbG90JywgJ2JyaWNrJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChicik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydHMgYSBnYW1lLCBwbGF5cyBpdCB0aHJvdWdoLCBzYXZlcyB0aGUgcmVzdWx0IGFuZFxuICAgICAqIHRoZW4gZGlzcGxheXMgdGhlIG91dHJvLlxuICAgICAqL1xuICAgIHBsYXkoKSB7XG4gICAgICAgIHRoaXMuc2h1ZmZsZSgpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI21haW5cIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMudGltZXIuc3RhcnQoMCk7XG4gICAgICAgIHRoaXMudGltZXIuZGlzcGxheSh0aGlzLnRpbWVzcGFuKTtcbiAgICAgICAgcGxheUdhbWUodGhpcy5zZXQsIHRoaXMpXG4gICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnRpbWUgPSB0aGlzLnRpbWVyLnN0b3AoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VsdCA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblwiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cm9cIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzdGFydHMgdGhlIGdhbWUgd2l0aCB0aGUgc2FtZSBzaXplIG9mIGJvYXJkIHdpdGhvdXQgcmUtcmVuZGVyaW5nXG4gICAgICovXG4gICAgcmVwbGF5KCkge1xuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI2ludHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblwiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI291dHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBnYW1lIGFuZCB0aGVuIGxldHMgdGhlIHVzZXIgY2hvb3NlIGEgbmV3IGdhbWUgc2l6ZSBhbmRcbiAgICAgKiB1c2VyIG5hbWUsIHJlLXJlbmRlcmluZyB0aGUgYm9hcmQuXG4gICAgICovXG4gICAgcmVzdGFydCgpIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI21haW5cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBnYW1lIHRvIG1ha2UgaXQgcGxheWFibGUgYWdhaW4uIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzXG4gICAgICogYW5kIHR1cm5zIHRoZSBicmlja3Mgb3Zlci5cbiAgICAgKi9cbiAgICByZXNldCgpIHtcbiAgICAgICAgbGV0IGJyaWNrcyA9IHRoaXMucXVlcnlTZWxlY3RvckFsbCgnW3Nsb3Q9XCJicmlja1wiXScpO1xuICAgICAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGJyaWNrcywgKGJyaWNrKSA9PiB7XG4gICAgICAgICAgICBicmljay5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGRlbicpO1xuICAgICAgICAgICAgbGV0IGltZyA9IGJyaWNrLnF1ZXJ5U2VsZWN0b3IoXCJpbWdcIik7XG4gICAgICAgICAgICBpZiAoaW1nKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJyaWNrTnVtYmVyID0gaW1nLmdldEF0dHJpYnV0ZShcImJyaWNrTnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNldFticmlja051bWJlcl0uZHJhdygpICE9PSAwKSB7IC8vdHVybiB0aGUgYnJpY2sgb3ZlciBpZiBpdCdzIG5vdCB0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgaW1nLnNyYyA9ICcvaW1hZ2UvbWVtb3J5LWJyaWNrLScgKyB0aGlzLnNldFticmlja051bWJlcl0udHVybigpICsgJy5wbmcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGltZXNwYW4udGV4dENvbnRlbnQgPSAnJztcbiAgICAgICAgdGhpcy50dXJuc3Bhbi50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgICB0aGlzLnRpbWVyLnN0b3AoKTsgLy9tYWtlIHN1cmUgdGltZXIgaXMgc3RvcHBlZFxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2JvYXJkJykucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMuZ2FtZVBsYXkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuZHMgdGhlIGdhbWUgYW5kIGRpc3BsYXlzIHRoZSBvdXRyby5cbiAgICAgKi9cbiAgICBlbmQoKSB7XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjaW50cm9cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNtYWluXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cm9cIikuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgIH1cbn1cblxuLy9kZWZpbmVzIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ21lbW9yeS1nYW1lJywgTWVtb3J5R2FtZSk7XG5cblxuLyoqXG4gKiBBIGNsYXNzIEJyaWNrIHRvIGdvIHdpdGggdGhlIG1lbW9yeSBnYW1lLlxuICovXG5jbGFzcyBCcmljayB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIHRoZSBCcmljayB3aXRoIGEgdmFsdWUgYW5kIHBsYWNlcyBpdCBmYWNlZG93bi5cbiAgICAgKiBAcGFyYW0gbnVtYmVyIHtudW1iZXJ9IHRoZSB2YWx1ZSB0byBpbml0aWF0ZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihudW1iZXIpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IG51bWJlcjtcbiAgICAgICAgdGhpcy5mYWNlZG93biA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHVybnMgdGhlIGJyaWNrIGFuZCByZXR1cm5zIHRoZSB2YWx1ZSBhZnRlciB0aGUgdHVybi5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgdmFsdWUgb2YgdGhlIGJyaWNrIGlmIGl0J3MgZmFjZXVwLCBvdGhlcndpc2UgMC5cbiAgICAgKi9cbiAgICB0dXJuKCkge1xuICAgICAgICB0aGlzLmZhY2Vkb3duID0gISh0aGlzLmZhY2Vkb3duKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhdygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXBhcmVzIHR3byBicmlja3MuXG4gICAgICogQHBhcmFtIG90aGVyIHtCcmlja30gdGhlIEJyaWNrIHRvIGNvbXBhcmUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGJyaWNrcyB2YWx1ZXMgYXJlIGVxdWFsLlxuICAgICAqL1xuICAgIGVxdWFscyhvdGhlcikge1xuICAgICAgICByZXR1cm4gKG90aGVyIGluc3RhbmNlb2YgQnJpY2spICYmICh0aGlzLnZhbHVlID09PSBvdGhlci52YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvbmVzIHRoZSBicmljay5cbiAgICAgKiBAcmV0dXJucyB7QnJpY2t9IHRoZSBjbG9uZS5cbiAgICAgKi9cbiAgICBjbG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBCcmljayh0aGlzLnZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgYnJpY2sncyB2YWx1ZSwgb3IgMCBpZiBpdCBpcyBmYWNlIGRvd24uXG4gICAgICovXG4gICAgZHJhdygpIHtcbiAgICAgICAgaWYgKHRoaXMuZmFjZWRvd24pIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHNldHMgdXAgdGhlIGdhbWVwbGF5LiBBZGRzIGFuZCByZW1vdmVzIGV2ZW50LWxpc3RlbmVycyBzbyB0aGF0IHRoZSBzYW1lIGdhbWUgY2FuIGJlIHJlc2V0LlxuICogQHBhcmFtIHNldCBbe0JyaWNrXX0gdGhlIHNldCBvZiBicmlja3MgdG8gcGxheSB3aXRoLlxuICogQHBhcmFtIGdhbWUge25vZGV9IHRoZSBzcGFjZSB0byBwbGF5XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgcmVzdWx0IG9mIHRoZSBnYW1lIHdoZW4gdGhlIGdhbWUgaGFzIGJlZW4gcGxheWVkLlxuICovXG5mdW5jdGlvbiBwbGF5R2FtZShzZXQsIGdhbWUpIHtcbiAgICBsZXQgdHVybnMgPSAwO1xuICAgIGxldCBicmlja3MgPSBwYXJzZUludChnYW1lLndpZHRoKSAqIHBhcnNlSW50KGdhbWUuaGVpZ2h0KTtcbiAgICBsZXQgYm9hcmQgPSBnYW1lLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2JvYXJkJyk7XG4gICAgbGV0IGJyaWNrc0xlZnQgPSBicmlja3M7XG4gICAgbGV0IGNob2ljZTE7XG4gICAgbGV0IGNob2ljZTI7XG4gICAgbGV0IGltZzE7XG4gICAgbGV0IGltZzI7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBnYW1lLmdhbWVQbGF5ID0gZnVuY3Rpb24oZXZlbnQpIHsgLy9leHBvc2UgdGhlIHJlZmVyZW5jZSBzbyB0aGUgZXZlbnQgbGlzdGVuZXIgY2FuIGJlIHJlbW92ZWQgZnJvbSBvdXRzaWRlIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgaWYgKCFjaG9pY2UyKSB7IC8vaWYgdHdvIGJyaWNrcyBhcmUgbm90IHR1cm5lZFxuICAgICAgICAgICAgICAgIGxldCBpbWcgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcihcImltZ1wiKSB8fCBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgbGV0IGJyaWNrTnVtYmVyID0gaW1nLmdldEF0dHJpYnV0ZShcImJyaWNrTnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIGlmICghYnJpY2tOdW1iZXIpIHsgLy90YXJnZXQgaXMgbm90IGEgYnJpY2tcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBicmljayA9IHNldFticmlja051bWJlcl07XG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9ICcvaW1hZ2UvJyArIGJyaWNrLnR1cm4oKSArICcucG5nJztcblxuICAgICAgICAgICAgICAgIGlmICghY2hvaWNlMSkgeyAvL2ZpcnN0IGJyaWNrIHRvIGJlIHR1cm5lZFxuICAgICAgICAgICAgICAgICAgICBpbWcxID0gaW1nO1xuICAgICAgICAgICAgICAgICAgICBjaG9pY2UxID0gYnJpY2s7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy9zZWNvbmQgYnJpY2sgdG8gYmUgdHVybmVkXG4gICAgICAgICAgICAgICAgICAgIGltZzIgPSBpbWc7XG4gICAgICAgICAgICAgICAgICAgIGNob2ljZTIgPSBicmljaztcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hvaWNlMS5lcXVhbHMoY2hvaWNlMikgJiYgaW1nMS5nZXRBdHRyaWJ1dGUoJ2JyaWNrTnVtYmVyJykgIT09IGltZzIuZ2V0QXR0cmlidXRlKCdicmlja051bWJlcicpKSB7IC8vdGhlIHR3byBicmlja3MgYXJlIGVxdWFsIGJ1dCBub3QgdGhlIHNhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzEucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LnNldEF0dHJpYnV0ZSgnaGlkZGVuJywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nMi5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1nMSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyaWNrc0xlZnQgLT0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChicmlja3NMZWZ0ID09PSAwKSB7IC8vYWxsIGJyaWNrcyBhcmUgdHVybmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7dHVybnM6IHR1cm5zfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vYnJpY2tzIGFyZSBub3QgdGhlIHNhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZzEuc3JjID0gJy9pbWFnZS8nICsgY2hvaWNlMS50dXJuKCkgKyAnLnBuZyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nMi5zcmMgPSAnL2ltYWdlLycgKyBjaG9pY2UyLnR1cm4oKSArICcucG5nJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcyID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdHVybnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgZ2FtZS50dXJuc3Bhbi50ZXh0Q29udGVudCA9IHR1cm5zO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIGJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBnYW1lLmdhbWVQbGF5KTtcblxuICAgIH0pO1xuXG59XG4iLCIvKipcbiAqIE1vZHVsZSBmb3IgVGltZXIuXG4gKlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqL1xuXG5jbGFzcyBUaW1lciB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIGEgVGltZXIuXG4gICAgICogQHBhcmFtIHN0YXJ0VGltZSB7bnVtYmVyfSB3aGVyZSB0byBzdGFydCBjb3VudGluZy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihzdGFydFRpbWUgPSAwKSB7XG4gICAgICAgIHRoaXMuY291bnQgPSBzdGFydFRpbWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge251bWJlcn0gdGhlIGNvdW50XG4gICAgICovXG4gICAgZ2V0IHRpbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHRpbWUgb24gdGhlIHRpbWVyLlxuICAgICAqIEBwYXJhbSBuZXdUaW1lIHtudW1iZXJ9IHRoZSBuZXcgdGltZVxuICAgICAqL1xuICAgIHNldCB0aW1lKG5ld1RpbWUpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IG5ld1RpbWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHN0YXJ0cyB0aGUgdGltZXIuIGluY3JlbWVudHMgdGltZSBldmVyeSAxMDAgbWlsbGlzZWNvbmRzLlxuICAgICAqIEBwYXJhbSB0aW1lIHtudW1iZXJ9IHdoYXQgbnVtYmVyIHRvIHN0YXJ0IGl0IG9uLlxuICAgICAqL1xuICAgIHN0YXJ0KHRpbWUgPSB0aGlzLnRpbWUpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IHRpbWU7XG4gICAgICAgIHRoaXMudGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvdW50ICs9IDEwMDtcbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc3RhcnRzIHRoZSB0aW1lci4gZGVjcmVtZW50cyB0aW1lIGV2ZXJ5IDEwMCBtaWxsaXNlY29uZHMuXG4gICAgICogQHBhcmFtIHRpbWUge251bWJlcn0gd2hhdCBudW1iZXIgdG8gc3RhcnQgaXQgb24uXG4gICAgICovXG4gICAgY291bnRkb3duKHRpbWUpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IHRpbWUgfHwgdGhpcy5jb3VudDtcbiAgICAgICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY291bnQgLT0gMTAwO1xuICAgICAgICB9LCAxMDApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBzdG9wcyB0aGUgVGltZXIuXG4gICAgICogQHJldHVybnMgdGhlIGNvdW50LlxuICAgICAqL1xuICAgIHN0b3AoKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5kaXNwbGF5SW50ZXJ2YWwpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3VudDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzcGxheXMgYSByb3VuZGVkIHZhbHVlIG9mIHRoZSBjb3VudCBvZiB0aGUgdGltZXJcbiAgICAgKiB0byB0aGUgZGVzaXJlZCBwcmVjaXNpb24sIGF0IGFuIGludGVydmFsLlxuICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbiB7bm9kZX0gd2hlcmUgdG8gbWFrZSB0aGUgZGlzcGxheVxuICAgICAqIEBwYXJhbSBpbnRlcnZhbCB7bnVtYmVyfSB0aGUgaW50ZXJ2YWwgdG8gbWFrZSB0aGUgZGlzcGxheSBpbiwgaW4gbWlsbGlzZWNvbmRzXG4gICAgICogQHBhcmFtIHByZWNpc2lvbiB7bnVtYmVyfXRoZSBudW1iZXIgdG8gZGl2aWRlIHRoZSBkaXNwbGF5ZWQgbWlsbGlzZWNvbmRzIGJ5XG4gICAgICogQHJldHVybnMgdGhlIGludGVydmFsLlxuICAgICAqXG4gICAgICovXG4gICAgZGlzcGxheShkZXN0aW5hdGlvbiwgaW50ZXJ2YWwgPSAxMDAsIHByZWNpc2lvbiA9IDEwMDApIHtcbiAgICAgICAgdGhpcy5kaXNwbGF5SW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCggKCk9PiB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi50ZXh0Q29udGVudCA9IE1hdGgucm91bmQodGhpcy5jb3VudCAvIHByZWNpc2lvbik7XG4gICAgICAgIH0sIGludGVydmFsKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheUludGVydmFsO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcbiJdfQ==
