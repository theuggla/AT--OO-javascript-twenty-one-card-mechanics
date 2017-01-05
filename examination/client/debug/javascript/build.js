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

/// /menu items has to be of type expandaböe menu item
class Desktop {
    constructor(desktopConfig) {
        let topWindow = 2;

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

    addSubMenu(item, subMenu, eventHandler) {
        let label = item.getAttribute('label');

        Array.prototype.forEach.call(subMenu.children, (node) => {
            node.setAttribute('label', label);
        });

        item.appendChild(subMenu);

        item.addEventListener('click', eventHandler);
    }

    static windowManager(windowSpace) {
        let wm = {
            startX: windowSpace.offsetLeft + 20,
            startY: windowSpace.offsetTop + 20,
            types: 0
        };

        return {
            createWindow: function (type) {
                /*if (!wm[type]) {
                    let linkTemplate = document.querySelector("#linkTemplate");
                    let link = document.importNode(linkTemplate.content.firstElementChild, true);
                    link.href = "/" + type + ".html";
                    document.head.appendChild(link);
                }*/


                let aWindow = document.createElement(type);

                if (type === 'image-gallery-app') {
                    if (document.querySelector('#pictures')) {
                        aWindow.appendChild(document.importNode(document.querySelector('#pictures').content, true));
                    }
                }

                windowSpace.appendChild(aWindow);
                setupSpace(type, aWindow);

                if (wm[type].open) {
                    wm[type].open.push(aWindow);
                } else {
                    wm[type].open = [aWindow];
                }

                return aWindow;
            },
            openWindows: function (type) {
                if (wm[type]) {
                    let result = [];
                    let windows = wm[type].open;
                    result = windows.filter((w) => {
                        return w.open;
                    });
                    wm[type].open = result;
                    return result;
                } else {
                    return 0;
                }
            },
            expand: function (type) {
                let wins = this.openWindows(type);
                if (wins) {
                    wins.forEach((w) => {
                        w.minimized = false;
                    });
                }
            },
            minimize: function (type) {
                let wins = this.openWindows(type);
                if (wins) {
                    wins.forEach((w) => {
                        w.minimized = true;
                    });
                }
            },
            close: function (type) {
                let wins = this.openWindows(type);
                if (wins) {
                    console.log(wins);
                    wins.forEach((w) => {
                        w.close();
                    });
                }
            }
        }

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

    function touchHandler(event) {
        let touches = event.changedTouches;
        let first = touches[0];
        let type = "";

        switch(event.type) {
            case "touchstart": type = "mousedown"; break;
            case "touchmove":  type="mousemove"; break;
            case "touchend":   type="mouseup"; break;
            default: return;
        }

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

    function init() {
        el.addEventListener("touchstart", touchHandler, true);
        document.addEventListener("touchmove", touchHandler, true);
        el.addEventListener("touchend", touchHandler, true);
        document.addEventListener("touchcancel", touchHandler, true);
    }

    events();
    init();
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
     * Runs when chat is inserted into the DOM.
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

    getImages() {
        return this.querySelectorAll('img');
    }

    getDescriptions() {
        return this.querySelectorAll('p[for]');
    }

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

    get open() {
        return this.shadowRoot.querySelector('draggable-window').open;
    }

    get minimized() {
        return this.shadowRoot.querySelector('draggable-window').minimized;
    }

    set minimized(minimize) {
        if (minimize) {
            this.shadowRoot.querySelector('draggable-window').minimized = true;
        } else {
            this.shadowRoot.querySelector('draggable-window').minimized = false;
        }

    }

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
     * Connects to the server, sets up event listeners and prints
     * already saved messages if any.
     */
    connectedCallback() {
        let gallery = this.shadowRoot.querySelector('#gallery');
        let imageDisplay = this.shadowRoot.querySelector('#imageDisplay');
        let localNav = this.shadowRoot.querySelector('#localNav');

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

               if (this.querySelectorAll('[slot ="picture"').length !== this.pictureSources.length) { //check if more picture has been added
                    Array.prototype.forEach.call(this.querySelectorAll('[slot ="picture"'), (a) => { //in that case update sourcelist
                        let src = a.getAttribute('src') || a.firstElementChild.getAttribute('src');
                        if (this.pictureSources.indexOf(src) === -1) {
                            this.pictureSources.push(src);
                        }
                    });
                }

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

        imageDisplay.querySelector('a.displayed').addEventListener('click', (event) => {
            let src = event.target.src || event.target.href;
            if (src) {
                open(src);
            }
        });

    }

    disconnectedCallback() {

    }

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

        //event listeners for menu
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

    get open() {
        return this.shadowRoot.querySelector('draggable-window').open;
    }

    get minimized() {
        return this.shadowRoot.querySelector('draggable-window').minimized;
    }

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

        //menu event listeners
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

    get open() {
        return this.shadowRoot.querySelector('draggable-window').open;
    }

    get minimized() {
        return this.shadowRoot.querySelector('draggable-window').minimized;
    }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kcmFnZ2FibGUtd2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9leHBhbmRhYmxlLW1lbnUtaXRlbS5qcyIsImNsaWVudC9zb3VyY2UvanMvaW1hZ2UtZ2FsbGVyeS1hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2ltYWdlLWdhbGxlcnkuanMiLCJjbGllbnQvc291cmNlL2pzL2luc3RhLWNoYXQtYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9pbnN0YS1jaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnktYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnktZ2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGltZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogU3RhcnRpbmcgcG9pbnQgZnByIHRoZSBhcHBsaWNhdGlvbi5cbiAqIFRoZSBhcHBsaWNhdGlvbiB3b3VsZCB3b3JrIGJldHRlciB3aGVuIHVzZWQgd2l0aCBIVFRQMlxuICogZHVlIHRvIHRoZSBmYWN0IHRoYXQgaXQgbWFrZXMgdXNlIG9mIHdlYi1jb21wb25lbnRzLFxuICogYnV0IGl0J3MgYmVlbiBidWlsdCB3aXRoIGJyb3dzZXJpZnkgdG8gd29yayBhcyBhXG4gKiBub3JtYWwgSFRUUDEgYXBwbGljYXRpb24gaW4gbGlldSBvZiB0aGlzLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wXG4gKi9cblxuXG4vL3RvIG1ha2Ugd2ViIGNvbXBvbmVudHMgd29yayB3aXRoIGJyb3dzZXJpZnlcbmxldCB3aW5kb3cgPSByZXF1aXJlKCcuL2RyYWdnYWJsZS13aW5kb3cuanMnKTtcbmxldCBtZW51ID0gcmVxdWlyZShcIi4vZXhwYW5kYWJsZS1tZW51LWl0ZW0uanNcIik7XG5sZXQgbWVtb3J5R2FtZSA9IHJlcXVpcmUoJy4vbWVtb3J5LWdhbWUuanMnKTtcbmxldCBtZW1vcnlBcHAgPSByZXF1aXJlKCcuL21lbW9yeS1hcHAuanMnKTtcbmxldCBpbnN0YUNoYXQ9IHJlcXVpcmUoJy4vaW5zdGEtY2hhdC5qcycpO1xubGV0IGluc3RhQ2hhdEFwcCA9IHJlcXVpcmUoJy4vaW5zdGEtY2hhdC1hcHAuanMnKTtcbmxldCBpbWFnZUdhbGxlcnkgPSByZXF1aXJlKCcuL2ltYWdlLWdhbGxlcnkuanMnKTtcbmxldCBpbWFnZUdhbGxlcnlBcHAgPSByZXF1aXJlKCcuL2ltYWdlLWdhbGxlcnktYXBwLmpzJyk7XG5cbi8vcmVxdWlyZXNcbmxldCBEZXNrdG9wID0gcmVxdWlyZShcIi4vZGVza3RvcC5qc1wiKTtcblxuLy9ub2Rlc1xubGV0IG1haW5NZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dTZWxlY3RvclwiKTtcbmxldCBzdWJNZW51VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3N1Yk1lbnVcIik7XG5sZXQgd2luZG93U3BhY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI29wZW5XaW5kb3dzXCIpO1xuXG4vL3ZhcmlhYmxlc1xubGV0IG15RGVza3RvcDtcbmxldCB3aW5kb3dNYW5hZ2VyID0gRGVza3RvcC53aW5kb3dNYW5hZ2VyKHdpbmRvd1NwYWNlKTtcblxuXG4vL3NldCB1cCBldmVudCBoYW5kbGVyIGZvciBzdWItbWVudVxubGV0IGV2ZW50SGFuZGxlclN1Yk1lbnUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBsZXQgdHlwZSA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEta2luZCcpIHx8IGV2ZW50LnRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1raW5kJyk7XG5cbiAgICBzd2l0Y2ggKGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICAgICAgd2luZG93TWFuYWdlci5jcmVhdGVXaW5kb3codHlwZSkuZm9jdXMoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgICAgICB3aW5kb3dNYW5hZ2VyLmNsb3NlKHR5cGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21pbmltaXplJzpcbiAgICAgICAgICAgIHdpbmRvd01hbmFnZXIubWluaW1pemUodHlwZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZXhwYW5kJzpcbiAgICAgICAgICAgIHdpbmRvd01hbmFnZXIuZXhwYW5kKHR5cGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG59O1xuXG5sZXQgZGVza3RvcENvbmZpZyA9IHtcbiAgICBzcGFjZTogd2luZG93U3BhY2UsXG4gICAgbWVudTogbWFpbk1lbnUsXG4gICAgd2luZG93TWFuYWdlcjogd2luZG93TWFuYWdlcixcbiAgICBzdWJUZW1wbGF0ZTogc3ViTWVudVRlbXBsYXRlLFxuICAgIHN1YkhhbmRsZXI6IGV2ZW50SGFuZGxlclN1Yk1lbnVcbn07XG5cblxuLy9pbml0aWF0ZSBkZXNrdG9wXG5teURlc2t0b3AgPSBuZXcgRGVza3RvcChkZXNrdG9wQ29uZmlnKTtcblxuXG5cbiIsIi8qKlxuICogQSBtb2R1bGUgZm9yIGEgY2xhc3MgZGVza3RvcC5cbiAqIEluaXRpYXRlcyBhIHdlYiBkZXNrdG9wIHdpdGggYSBtZW51XG4gKiBhbmQgd2luZG93cyB0byBvcGVuLlxuICpcbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMFxuICovXG5cbi8vLyAvbWVudSBpdGVtcyBoYXMgdG8gYmUgb2YgdHlwZSBleHBhbmRhYsO2ZSBtZW51IGl0ZW1cbmNsYXNzIERlc2t0b3Age1xuICAgIGNvbnN0cnVjdG9yKGRlc2t0b3BDb25maWcpIHtcbiAgICAgICAgbGV0IHRvcFdpbmRvdyA9IDI7XG5cbiAgICAgICAgbGV0IG1haW5NZW51ID0gZGVza3RvcENvbmZpZy5tZW51O1xuICAgICAgICBsZXQgd2luZG93U3BhY2UgPSBkZXNrdG9wQ29uZmlnLnNwYWNlO1xuICAgICAgICBsZXQgd2luZG93TWFuYWdlciA9IGRlc2t0b3BDb25maWcud2luZG93TWFuYWdlciB8fCBEZXNrdG9wLndpbmRvd01hbmFnZXIod2luZG93U3BhY2UpOyAvL3N1cHBseSB3aW5kb3dNYW5hZ2VyIGlmIHRoZXJlIGlzIG5vbmVcbiAgICAgICAgbGV0IHN1Yk1lbnVUZW1wbGF0ZSA9IGRlc2t0b3BDb25maWcuc3ViVGVtcGxhdGU7XG4gICAgICAgIGxldCBzdWJIYW5kbGVyID0gZGVza3RvcENvbmZpZy5zdWJIYW5kbGVyO1xuXG5cbiAgICAgICAgaWYgKHN1Yk1lbnVUZW1wbGF0ZSkgeyAvL3RoZXJlIGlzIGEgc3VibWVudVxuICAgICAgICAgICAgLy9hZGQgdGhlIHN1Ym1lbnVcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobWFpbk1lbnUuY2hpbGRyZW4sIChub2RlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHN1Yk1lbnUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHN1Yk1lbnVUZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFN1Yk1lbnUobm9kZSwgc3ViTWVudSwgc3ViSGFuZGxlcik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy9hZGQgZXZlbnQgaGFuZGxlcnMgb24gdGhlIHN1YiBtZW51XG4gICAgICAgICAgICBhZGRFdmVudExpc3RlbmVycyhtYWluTWVudSwgJ2NsaWNrIGZvY3Vzb3V0JywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IG1haW5NZW51SXRlbXMgPSBtYWluTWVudS5xdWVyeVNlbGVjdG9yQWxsKCdleHBhbmRhYmxlLW1lbnUtaXRlbScpO1xuICAgICAgICAgICAgICAgIG1haW5NZW51SXRlbXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKGl0ZW0gIT09IGV2ZW50LnRhcmdldCAmJiBpdGVtICE9PSBldmVudC50YXJnZXQucGFyZW50RWxlbWVudCkgJiYgKGl0ZW0uZGlzcGxheWluZ1N1Yk1lbnUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9vcGVuIG5ldyB3aW5kb3cgYXQgZG91YmxlIGNsaWNrXG4gICAgICAgIG1haW5NZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2RibGNsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdHlwZSA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWtpbmRcIikgfHwgZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1raW5kXCIpO1xuICAgICAgICAgICAgaWYgKHR5cGUpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3dNYW5hZ2VyLmNyZWF0ZVdpbmRvdyh0eXBlKS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9wdXQgZm9jdXNlZCB3aW5kb3cgb24gdG9wXG4gICAgICAgIHdpbmRvd1NwYWNlLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ICE9PSB3aW5kb3dTcGFjZSkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5zdHlsZS56SW5kZXggPSB0b3BXaW5kb3c7XG4gICAgICAgICAgICAgICAgdG9wV2luZG93ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuICAgIH1cblxuICAgIGFkZFN1Yk1lbnUoaXRlbSwgc3ViTWVudSwgZXZlbnRIYW5kbGVyKSB7XG4gICAgICAgIGxldCBsYWJlbCA9IGl0ZW0uZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoc3ViTWVudS5jaGlsZHJlbiwgKG5vZGUpID0+IHtcbiAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdsYWJlbCcsIGxhYmVsKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXRlbS5hcHBlbmRDaGlsZChzdWJNZW51KTtcblxuICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZlbnRIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgd2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSkge1xuICAgICAgICBsZXQgd20gPSB7XG4gICAgICAgICAgICBzdGFydFg6IHdpbmRvd1NwYWNlLm9mZnNldExlZnQgKyAyMCxcbiAgICAgICAgICAgIHN0YXJ0WTogd2luZG93U3BhY2Uub2Zmc2V0VG9wICsgMjAsXG4gICAgICAgICAgICB0eXBlczogMFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjcmVhdGVXaW5kb3c6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgLyppZiAoIXdtW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBsaW5rVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2xpbmtUZW1wbGF0ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpbmsgPSBkb2N1bWVudC5pbXBvcnROb2RlKGxpbmtUZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgbGluay5ocmVmID0gXCIvXCIgKyB0eXBlICsgXCIuaHRtbFwiO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICAgICAgICAgIH0qL1xuXG5cbiAgICAgICAgICAgICAgICBsZXQgYVdpbmRvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodHlwZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2ltYWdlLWdhbGxlcnktYXBwJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BpY3R1cmVzJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFXaW5kb3cuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcGljdHVyZXMnKS5jb250ZW50LCB0cnVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aW5kb3dTcGFjZS5hcHBlbmRDaGlsZChhV2luZG93KTtcbiAgICAgICAgICAgICAgICBzZXR1cFNwYWNlKHR5cGUsIGFXaW5kb3cpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHdtW3R5cGVdLm9wZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgd21bdHlwZV0ub3Blbi5wdXNoKGFXaW5kb3cpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4gPSBbYVdpbmRvd107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFXaW5kb3c7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3BlbldpbmRvd3M6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdtW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdpbmRvd3MgPSB3bVt0eXBlXS5vcGVuO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSB3aW5kb3dzLmZpbHRlcigodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHcub3BlbjtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV4cGFuZDogZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBsZXQgd2lucyA9IHRoaXMub3BlbldpbmRvd3ModHlwZSk7XG4gICAgICAgICAgICAgICAgaWYgKHdpbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgd2lucy5mb3JFYWNoKCh3KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3Lm1pbmltaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWluaW1pemU6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHdpbnMgPSB0aGlzLm9wZW5XaW5kb3dzKHR5cGUpO1xuICAgICAgICAgICAgICAgIGlmICh3aW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdy5taW5pbWl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgbGV0IHdpbnMgPSB0aGlzLm9wZW5XaW5kb3dzKHR5cGUpO1xuICAgICAgICAgICAgICAgIGlmICh3aW5zKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHdpbnMpO1xuICAgICAgICAgICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHcuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9oZWxwZXIgZnVuY3Rpb25zXG4gICAgICAgIGZ1bmN0aW9uIHNldHVwU3BhY2UodHlwZSwgc3BhY2UpIHtcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHt9O1xuICAgICAgICAgICAgbGV0IHg7XG4gICAgICAgICAgICBsZXQgeTtcblxuICAgICAgICAgICAgaWYgKHdtW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9ICh3bVt0eXBlXS5sYXRlc3RDb29yZHMueCArPSA1MCk7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9ICh3bVt0eXBlXS5sYXRlc3RDb29yZHMueSArPSA1MCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoISh3aXRoaW5Cb3VuZHMoc3BhY2UsIHdpbmRvd1NwYWNlLCBkZXN0aW5hdGlvbikpKSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSB3bVt0eXBlXS5zdGFydENvb3Jkcy54ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgIHkgPSB3bVt0eXBlXS5zdGFydENvb3Jkcy55ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgIHdtW3R5cGVdLmxhdGVzdENvb3Jkcy54ID0geDtcbiAgICAgICAgICAgICAgICAgICAgd21bdHlwZV0ubGF0ZXN0Q29vcmRzLnkgPSB5O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHggPSBkZXN0aW5hdGlvbi54O1xuICAgICAgICAgICAgICAgICAgICB5ID0gZGVzdGluYXRpb24ueTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9ICh3bS5zdGFydFggKyAoNjAgKiB3bS50eXBlcykpO1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAod20uc3RhcnRZKTtcblxuICAgICAgICAgICAgICAgIGlmICghKHdpdGhpbkJvdW5kcyhzcGFjZSwgd2luZG93U3BhY2UsIGRlc3RpbmF0aW9uKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgeCA9IHdtLnN0YXJ0WDtcbiAgICAgICAgICAgICAgICAgICAgeSA9IHdtLnN0YXJ0WTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB4ID0gZGVzdGluYXRpb24ueDtcbiAgICAgICAgICAgICAgICAgICAgeSA9IGRlc3RpbmF0aW9uLnk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd21bdHlwZV0gPSB7fTtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5zdGFydENvb3JkcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICAgICAgeTogeVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgd21bdHlwZV0ubGF0ZXN0Q29vcmRzID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB3bS50eXBlcyArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3BhY2UudGFiSW5kZXggPSAwO1xuICAgICAgICAgICAgc3BhY2Uuc3R5bGUudG9wID0geSArIFwicHhcIjtcbiAgICAgICAgICAgIHNwYWNlLnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gd2l0aGluQm91bmRzKGVsZW1lbnQsIGNvbnRhaW5lciwgY29vcmRzKSB7XG4gICAgICAgICAgICBsZXQgbWluWCA9IGNvbnRhaW5lci5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgbGV0IG1heFggPSAobWluWCArIGNvbnRhaW5lci5jbGllbnRXaWR0aCkgLSAoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCk7XG4gICAgICAgICAgICBsZXQgbWluWSA9IGNvbnRhaW5lci5vZmZzZXRUb3A7XG4gICAgICAgICAgICBsZXQgbWF4WSA9IChtaW5ZICsgY29udGFpbmVyLmNsaWVudEhlaWdodCkgLSAoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQpO1xuXG4gICAgICAgICAgICByZXR1cm4gKGNvb3Jkcy54IDw9IG1heFggJiYgY29vcmRzLnggPj0gbWluWCAmJiBjb29yZHMueSA8PSBtYXhZICYmIGNvb3Jkcy55ID49IG1pblkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8vaGVscGVyIGZ1bmN0aW9uIHRvIGFkZCBtb3JlIHRoYW4gb25lIGV2ZW50IHR5cGUgZm9yIGVhY2ggZWxlbWVudCBhbmQgaGFuZGxlclxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMgKGVsZW1lbnQsIGV2ZW50cywgaGFuZGxlcikge1xuICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSk7XG59XG5cbi8vZXhwb3J0XG5tb2R1bGUuZXhwb3J0cyA9IERlc2t0b3A7XG4iLCIvKlxuKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGRyYWdnYWJsZS13aW5kb3cgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiogSXQgY3JlYXRlcyBhIHdpbmRvdyB0aGF0IGNhbiBiZSBtb3ZlZCBhY3Jvc3MgdGhlIHNjcmVlbiwgY2xvc2VkIGFuZCBtaW5pbWl6ZWQuXG4qIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiogQHZlcnNpb24gMS4wLjBcbipcbiovXG5cbmNsYXNzIERyYWdnYWJsZVdpbmRvdyBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBkcmFnZ2FibGUtd2luZG93LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGxldCB3aW5kb3dUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9kcmFnZ2FibGUtd2luZG93Lmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dUZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxuXG4gICAgICAgIC8vc2V0dXAgc2hhZG93IGRvbSBzdHlsZXNcbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCIsIGRlbGVnYXRlc0ZvY3VzOiB0cnVlfSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IHdpbmRvd1RlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gd2luZG93IGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAgICAgKiBTZXRzIHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVoYXZpb3VyIG9mIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG5cbiAgICAgICAgLy9zZXQgYmVoYXZpb3VyXG4gICAgICAgIG1ha2VEcmFnZ2FibGUodGhpcywgdGhpcy5wYXJlbnROb2RlKTtcblxuICAgICAgICAvL2FkZCBldmVudCBsaXN0ZW5lcnNcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQuY29tcG9zZWRQYXRoKClbMF07IC8vZm9sbG93IHRoZSB0cmFpbCB0aHJvdWdoIHNoYWRvdyBET01cbiAgICAgICAgICAgIGxldCBpZCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoXCJpZFwiKTtcbiAgICAgICAgICAgIGlmIChpZCA9PT0gXCJjbG9zZVwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpZCA9PT0gXCJtaW5pbWl6ZVwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdjbGljaycpIHsgLy9tYWtlIHdvcmsgd2l0aCB0b3VjaCBldmVudHNcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm9wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdXAgd2hhdCBhdHRyaWJ1dGUtY2hhbmdlcyB0byB3YXRjaCBmb3IgaW4gdGhlIERPTS5cbiAgICAgKiBAcmV0dXJucyB7W3N0cmluZ119IGFuIGFycmF5IG9mIHRoZSBuYW1lcyBvZiB0aGUgYXR0cmlidXRlcyB0byB3YXRjaC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgICAgcmV0dXJuIFsnb3BlbiddO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdhdGNoZXMgZm9yIGF0dHJpYnV0ZSBjaGFuZ2VzIGluIHRoZSBET00gYWNjb3JkaW5nIHRvIG9ic2VydmVkQXR0cmlidXRlcygpXG4gICAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZVxuICAgICAqIEBwYXJhbSBvbGRWYWx1ZSB0aGUgb2xkIHZhbHVlXG4gICAgICogQHBhcmFtIG5ld1ZhbHVlIHRoZSBuZXcgdmFsdWVcbiAgICAgKi9cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sobmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGlmICghdGhpcy5vcGVuKSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgd2luZG93IGhhcyBhdHRyaWJ1dGUgJ29wZW4nXG4gICAgICovXG4gICAgZ2V0IG9wZW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc0F0dHJpYnV0ZSgnb3BlbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlICdvcGVuJyBhdHRyaWJ1dGUgb24gdGhlIHdpbmRvdy5cbiAgICAgKiBAcGFyYW0gb3BlbiB7Ym9vbGVhbn0gd2hldGhlciB0byBhZGQgb3IgcmVtb3ZlIHRoZSAnb3BlbicgYXR0cmlidXRlXG4gICAgICovXG4gICAgc2V0IG9wZW4ob3Blbikge1xuICAgICAgICBpZiAob3Blbikge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ29wZW4nLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnb3BlbicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHdpbmRvdyBoYXMgYXR0cmlidXRlICdtaW5pbWl6ZWQnXG4gICAgICovXG4gICAgZ2V0IG1pbmltaXplZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzQXR0cmlidXRlKCdtaW5pbWl6ZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSAnbWluaW1pemVkJyBhdHRyaWJ1dGUgb24gdGhlIHdpbmRvdy5cbiAgICAgKiBAcGFyYW0gbWluaW1pemUge2Jvb2xlYW59IHdoZXRoZXIgdG8gYWRkIG9yIHJlbW92ZSB0aGUgJ21pbmltaXplZCcgYXR0cmlidXRlXG4gICAgICovXG4gICAgc2V0IG1pbmltaXplZChtaW5pbWl6ZSkge1xuICAgICAgICBpZiAobWluaW1pemUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdtaW5pbWl6ZWQnLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZSgnbWluaW1pemVkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZXMgdGhlIHdpbmRvdy4gUmVtb3ZlcyBpdCBmcm9tIHRoZSBET00gYW5kIHNldHMgYWxsIGF0dHJpYnV0ZXMgdG8gZmFsc2UuXG4gICAgICovXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wZW4pIHtcbiAgICAgICAgICAgIHRoaXMub3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5taW5pbWl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLnBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGFyZW50Tm9kZS5ob3N0ICYmIHRoaXMucGFyZW50Tm9kZS5ob3N0LnBhcmVudE5vZGUpIHsgLy90aGlzIGlzIHBhcnQgb2YgYSBzaGFkb3cgZG9tXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnROb2RlLmhvc3QucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnBhcmVudE5vZGUuaG9zdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxuLy9oZWxwZXIgZnVuY3Rpb25cbi8vbWFrZXMgYW4gZWxlbWVudCBkcmFnZ2FibGUgd2l0aCAgbW91c2UsIGFycm93cyBhbmQgdG91Y2hcbmZ1bmN0aW9uIG1ha2VEcmFnZ2FibGUoZWwpIHtcbiAgICBsZXQgYXJyb3dEcmFnO1xuICAgIGxldCBtb3VzZURyYWc7XG4gICAgbGV0IGRyYWdvZmZzZXQgPSB7IC8vdG8gbWFrZSB0aGUgZHJhZyBub3QganVtcCBmcm9tIHRoZSBjb3JuZXJcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBsZXQgZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGVsLCAnZm9jdXNpbiBtb3VzZWRvd24nLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQ7XG4gICAgICAgICAgICBhcnJvd0RyYWcgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nKSB7XG4gICAgICAgICAgICAgICAgbW91c2VEcmFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkcmFnb2Zmc2V0LnggPSB0YXJnZXQucGFnZVggLSBlbC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGRyYWdvZmZzZXQueSA9IHRhcmdldC5wYWdlWSAtIGVsLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhlbCwgJ2ZvY3Vzb3V0IG1vdXNldXAnLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNldXAnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vdXNlRHJhZykge1xuICAgICAgICAgICAgICAgICAgICBtb3VzZURyYWcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFycm93RHJhZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGRvY3VtZW50LCAnbW91c2Vtb3ZlIGtleWRvd24nLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7fTsgLy9hcyB0byBub3Qga2VlcCBwb2xsaW5nIHRoZSBET01cblxuICAgICAgICAgICAgaWYgKG1vdXNlRHJhZykge1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAoZXZlbnQucGFnZVkgLSBkcmFnb2Zmc2V0LnkpO1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAoZXZlbnQucGFnZVggLSBkcmFnb2Zmc2V0LngpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhcnJvd0RyYWcpIHtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gcGFyc2VJbnQoZWwuc3R5bGUudG9wLnNsaWNlKDAsIC0yKSk7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9IHBhcnNlSW50KGVsLnN0eWxlLmxlZnQuc2xpY2UoMCwgLTIpKTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSAtPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggLT0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1vdXNlRHJhZyB8fCBhcnJvd0RyYWcpIHtcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gZGVzdGluYXRpb24ueCAgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gZGVzdGluYXRpb24ueSAgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiB0b3VjaEhhbmRsZXIoZXZlbnQpIHtcbiAgICAgICAgbGV0IHRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcztcbiAgICAgICAgbGV0IGZpcnN0ID0gdG91Y2hlc1swXTtcbiAgICAgICAgbGV0IHR5cGUgPSBcIlwiO1xuXG4gICAgICAgIHN3aXRjaChldmVudC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwidG91Y2hzdGFydFwiOiB0eXBlID0gXCJtb3VzZWRvd25cIjsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwidG91Y2htb3ZlXCI6ICB0eXBlPVwibW91c2Vtb3ZlXCI7IGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcInRvdWNoZW5kXCI6ICAgdHlwZT1cIm1vdXNldXBcIjsgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2ltdWxhdGVkRXZlbnQgPSBuZXcgTW91c2VFdmVudCh0eXBlLCB7XG4gICAgICAgICAgICBzY3JlZW5YOiBmaXJzdC5zY3JlZW5YLFxuICAgICAgICAgICAgc2NyZWVuWTogZmlyc3Quc2NyZWVuWSxcbiAgICAgICAgICAgIGNsaWVudFg6IGZpcnN0LmNsaWVudFgsXG4gICAgICAgICAgICBjbGllbnRZOiBmaXJzdC5jbGllbnRZLFxuICAgICAgICAgICAgYnV0dG9uOiAxLFxuICAgICAgICAgICAgYnViYmxlczogdHJ1ZVxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQoc2ltdWxhdGVkRXZlbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHRvdWNoSGFuZGxlciwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgdG91Y2hIYW5kbGVyLCB0cnVlKTtcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsIHRvdWNoSGFuZGxlciwgdHJ1ZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGNhbmNlbFwiLCB0b3VjaEhhbmRsZXIsIHRydWUpO1xuICAgIH1cblxuICAgIGV2ZW50cygpO1xuICAgIGluaXQoKTtcbn1cblxuLy9oZWxwZXIgZnVuY3Rpb25cbi8vYWRkcyBtdWx0aXBsZSBldmVudCBsaXN0ZW5lcnMgd2l0aCBpZGVudGljYWwgaGFuZGxlcnNcbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzKGVsZW1lbnQsIGV2ZW50cywgaGFuZGxlcikge1xuICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSk7XG59XG5cbi8vZGVmaW5lcyB0aGUgZWxlbWVudFxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdkcmFnZ2FibGUtd2luZG93JywgRHJhZ2dhYmxlV2luZG93KTtcbiIsIi8qXG4gKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGV4cGFuZGFibGUtbWVudS1pdGVtIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjcmVhdGVzIGFuIGl0ZW0gdGhhdCB3aGVuIGNsaWNrZWQgdG9nZ2xlcyB0byBzaG93IG9yIGhpZGUgc3ViLWl0ZW1zLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxuY2xhc3MgRXhwYW5kYWJsZU1lbnVJdGVtIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIGRyYWdnYWJsZS13aW5kb3csIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgbGV0IG1lbnVUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9leHBhbmRhYmxlLW1lbnUtaXRlbS5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudUl0ZW1UZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxuXG4gICAgICAgIC8vc2V0IHVwIHNoYWRvdyBkb20gc3R5bGVzXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IG1lbnVUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gd2luZG93IGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAgICAgKiBTZXRzIHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgYmVoYXZpb3VyIG9mIHRoZSBpdGVtLlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBtYWtlRXhwYW5kYWJsZSh0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7W25vZGVdfSBhbiBhcnJheSBvZiB0aGUgc3ViaXRlbXMgdGhlIGl0ZW0gaGFzIGFzc2lnbmVkIGluIHRoZSBET00uXG4gICAgICogQSBzdWJpdGVtIGNvdW50cyBhcyBhbiBpdGVtIHRoYXQgaGFzIHRoZSBzbG90IG9mICdzdWJpdGVtJyBhbmQgdGhlIHNhbWUgbGFiZWxcbiAgICAgKiBhcyB0aGUgZXhwYW5kYWJsZSBtZW51IGl0ZW0gaXRzZWxmLlxuICAgICAqL1xuICAgIGdldCBzdWJNZW51KCkge1xuICAgICAgICBsZXQgbGFiZWwgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbGFiZWwnKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbCh0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tzbG90PVwic3ViaXRlbVwiXScpLCAobm9kZSkgPT4ge1xuICAgICAgICAgICAgbGV0IG5vZGVMYWJlbCA9IG5vZGUuZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuICAgICAgICAgICAgcmV0dXJuIG5vZGVMYWJlbCA9PT0gbGFiZWw7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBpdGVtIGlzIGN1cnJlbnRseSBkaXNwbGF5aW5nIHRoZSBzdWJtZW51LWl0ZW1zLlxuICAgICAqL1xuICAgIGdldCBkaXNwbGF5aW5nU3ViTWVudSgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLnN1Yk1lbnVbMF0uaGFzQXR0cmlidXRlKCdoaWRlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2hvd3Mgb3IgaGlkZXMgdGhlIHN1Ym1lbnUtaXRlbXMuXG4gICAgICogQHBhcmFtIHNob3cge2Jvb2xlYW59IHdoZXRoZXIgdG8gc2hvdyBvciBoaWRlLlxuICAgICAqL1xuICAgIHRvZ2dsZVN1Yk1lbnUoc2hvdykge1xuICAgICAgICBpZiAoc2hvdykge1xuICAgICAgICAgICAgdGhpcy5zdWJNZW51LmZvckVhY2goKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgICBwb3N0LnJlbW92ZUF0dHJpYnV0ZSgnaGlkZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN1Yk1lbnUuZm9yRWFjaCgocG9zdCkgPT4ge1xuICAgICAgICAgICAgICAgIHBvc3Quc2V0QXR0cmlidXRlKCdoaWRlJywgJycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH1cblxufVxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZXhwYW5kYWJsZS1tZW51LWl0ZW0nLCBFeHBhbmRhYmxlTWVudUl0ZW0pO1xuXG4vL2hlbHBlciBmdW5jdGlvbiB0byBtYWtlIHRoZSBpdGVtIGV4cGFuZGFibGVcbi8vdGFrZXMgdGhlIGl0ZW0gdG8gZXhwYW5kIGFzIGEgcGFyYW1ldGVyXG5mdW5jdGlvbiBtYWtlRXhwYW5kYWJsZShpdGVtKSB7XG4gICAgbGV0IG5leHRGb2N1cyA9IDA7XG4gICAgbGV0IHNob3cgPSBmYWxzZTtcbiAgICBsZXQgYXJyb3dFeHBhbmQ7XG4gICAgbGV0IG1vdXNlRXhwYW5kO1xuXG4gICAgbGV0IGV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoaXRlbSwgJ2ZvY3VzaW4gY2xpY2snLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgYXJyb3dFeHBhbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnY2xpY2snKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vdXNlRXhwYW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2hvdyA9ICFzaG93O1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUoc2hvdyk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHRydWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGl0ZW0sICdrZXlkb3duJywgKChldmVudCkgPT4geyAvL21ha2UgdGhlIHN1Yi1pdGVtcyB0cmF2ZXJzYWJsZSBieSBwcmVzc2luZyB0aGUgYXJyb3cga2V5c1xuICAgICAgICAgICAgICAgIGlmIChhcnJvd0V4cGFuZCkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dSaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpdGVtLmRpc3BsYXlpbmdTdWJNZW51KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEZvY3VzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRGb2N1cyA8IDAgfHwgbmV4dEZvY3VzID49IGl0ZW0uc3ViTWVudS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEZvY3VzID0gaXRlbS5zdWJNZW51Lmxlbmd0aCAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5zdWJNZW51W25leHRGb2N1c10uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2N1cyhpdGVtLCBpdGVtLnN1Yk1lbnVbbmV4dEZvY3VzXSk7IC8vbWFrZSBpdCBhY2Nlc3NpYmxlIHZpYSBjc3MgdmlzdWFsIGNsdWVzIGV2ZW4gaWYgdGhlIGFjdGl2ZSBlbGVtZW50IGlzIGhpZGRlbiB3aXRoaW4gc2hhZG93RE9NXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXRlbS5kaXNwbGF5aW5nU3ViTWVudSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRGb2N1cyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0Rm9jdXMgPj0gaXRlbS5zdWJNZW51Lmxlbmd0aCB8fCBuZXh0Rm9jdXMgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRGb2N1cyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uc3ViTWVudVtuZXh0Rm9jdXNdLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXMoaXRlbSwgaXRlbS5zdWJNZW51W25leHRGb2N1c10pOyAvL21ha2UgaXQgYWNjZXNzaWJsZSB2aWEgY3NzIHZpc3VhbCBjbHVlcyBldmVuIGlmIHRoZSBhY3RpdmUgZWxlbWVudCBpcyBoaWRkZW4gd2l0aGluIHNoYWRvd0RPTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgZXZlbnRzKCk7XG59XG5cbi8vaGVscGVyIGZ1bmN0aW9uXG4vL2FkZHMgbXVsdGlwbGUgZXZlbnQgbGlzdGVuZXJzIHdpdGggaWRlbnRpY2FsIGhhbmRsZXJzXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyhlbGVtZW50LCBldmVudHMsIGhhbmRsZXIpIHtcbiAgICBldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGV2ZW50ID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcikpO1xufVxuXG4vLyBBZGRzIGEgJ2ZvY3VzZWQnIGF0dHJpYnV0ZSB0byB0aGUgZGVzaXJlZCBzdWJpdGVtIGFuZFxuLy8gcmVtb3ZlcyBpdCBmcm9tIG90aGVyIHN1YiBpdGVtcyB0byBoZWxwXG4vLyB3aXRoIGFjY2Vzc2liaWxpdHkgYW5kIHNoYWRvdyBET20gc3R5bGluZy5cbmZ1bmN0aW9uIGZvY3VzKGl0ZW0sIGVsZW1lbnQpIHtcbiAgICBsZXQgc3VicyA9IGl0ZW0uc3ViTWVudTtcbiAgICBzdWJzLmZvckVhY2goKHN1YikgPT4ge1xuICAgICAgICBpZiAoc3ViID09PSBlbGVtZW50KSB7XG4gICAgICAgICAgICBzdWIuc2V0QXR0cmlidXRlKCdmb2N1c2VkJywgJycpO1xuICAgICAgICAgICAgaXRlbS5mb2N1c2VkID0gZWxlbWVudDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1Yi5yZW1vdmVBdHRyaWJ1dGUoJ2ZvY3VzZWQnKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuIiwiLypcbiAqIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgaW1hZ2UtZ2FsbGVyeS1hcHAgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiAqIEl0IGNvbWJpbmVkIHRoZSBjb21wb25lbnQgaW1hZ2UtZ2FsbGVyeSB3aXRoIHRoZSBjb21wb25lbnQgZHJhZ2dhYmxlLXdpbmRvdywgdG9cbiAqIG1ha2UgYW4gaW1hZ2UgZ2FsbGVyeSBpbiBhIHdpbmRvdyB3aXRoIGFuIGFkZGVkIG1lbnUuXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICpcbiAqL1xuXG5jbGFzcyBJbWFnZUdhbGxlcnlBcHAgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIGEgZ2FsbGVyeS13aW5kb3csIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgbGV0IGdhbGxlcnlXaW5kb3dUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbWFnZS1nYWxsZXJ5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FsbGVyeVdpbmRvd1RlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cblxuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBnYWxsZXJ5V2luZG93VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuXG4gICAgICAgIHRoaXMuaW1hZ2VzID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIGNoYXQgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGZvclxuICAgICAqIHRoZSBtZW51LlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBsZXQgaW1hZ2VHYWxsZXJ5ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2ltYWdlLWdhbGxlcnknKTtcbiAgICAgICAgbGV0IGFib3V0c3BhY2UgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2Fib3V0Jyk7XG5cbiAgICAgICAgbGV0IGdhbGxlcnlPcHRpb24gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwiZ2FsbGVyeVwiXScpO1xuICAgICAgICBsZXQgcXVpdE9wdGlvbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJxdWl0XCJdJyk7XG4gICAgICAgIGxldCBhYm91dE9wdGlvbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJhYm91dFwiXScpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlSW1hZ2VzKCk7XG5cbiAgICAgICAgLy9tZW51IGV2ZW50IGxpc3RlbmVycy4gYWRkIHNlcGFyYXRlIG9uZXMgZm9yIGFjY2Vzc2liaWxpdHkgcmVhc29ucyB3aXRoIHdlYiBjb21wb25lbnRzLlxuICAgICAgICBxdWl0T3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LmZvY3VzZWQgfHwgZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0OyAvL3NoYWRvdyBET00gYWNjZXNzaWJpbGl0eSBpc3N1ZXNcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdxdWl0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgLy9tZW51IGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIGdhbGxlcnlPcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7IC8vc2hhZG93IERPTSBhY2Nlc3NpYmlsaXR5IGlzc3Vlc1xuICAgICAgICAgICAgbGV0IHRhc2sgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2dhbGxlcnknOlxuICAgICAgICAgICAgICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZUdhbGxlcnkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VHYWxsZXJ5LnNob3dUaHVtYm5haWxzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vbWVudSBldmVudCBsaXN0ZW5lclxuICAgICAgICBhYm91dE9wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10YXNrXScpIHx8IGV2ZW50LnRhcmdldDsgLy9zaGFkb3cgRE9NIGFjY2Vzc2liaWxpdHkgaXNzdWVzXG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhc2spIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYWJvdXQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VHYWxsZXJ5LmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRJbWFnZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZycpO1xuICAgIH1cblxuICAgIGdldERlc2NyaXB0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbCgncFtmb3JdJyk7XG4gICAgfVxuXG4gICAgdXBkYXRlSW1hZ2VzKCkge1xuICAgICAgICBsZXQgaW1nVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW1hZ2UtZ2FsbGVyeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2ltZ1RlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG4gICAgICAgIGxldCBpbWFnZUdhbGxlcnkgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignaW1hZ2UtZ2FsbGVyeScpO1xuXG4gICAgICAgIHRoaXMuaW1hZ2VzID0gdGhpcy5pbWFnZXMuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuZ2V0SW1hZ2VzKCkpKTtcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbnMgPSB0aGlzLmdldERlc2NyaXB0aW9ucygpO1xuXG4gICAgICAgIHRoaXMuaW1hZ2VzLmZvckVhY2goKGltYWdlKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29udGFpbmVyID0gaW1nVGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgICBjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQucmVwbGFjZUNoaWxkKGltYWdlLCBjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQucXVlcnlTZWxlY3RvcignaW1nJykpO1xuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdwJykpO1xuICAgICAgICAgICAgaW1hZ2VHYWxsZXJ5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwodGhpcy5kZXNjcmlwdGlvbnMsIChkZXNjcmlwdGlvbikgPT4ge1xuICAgICAgICAgICAgaW1hZ2VHYWxsZXJ5LmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0IG9wZW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm9wZW47XG4gICAgfVxuXG4gICAgZ2V0IG1pbmltaXplZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93JykubWluaW1pemVkO1xuICAgIH1cblxuICAgIHNldCBtaW5pbWl6ZWQobWluaW1pemUpIHtcbiAgICAgICAgaWYgKG1pbmltaXplKSB7XG4gICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBjbG9zZSgpIHtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5jbG9zZSgpO1xuICAgIH1cblxufVxuXG5cbi8vZGVmaW5lIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2ltYWdlLWdhbGxlcnktYXBwJywgSW1hZ2VHYWxsZXJ5QXBwKTtcbiIsIi8qXG4gKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGltYWdlLWdhbGxlcnkgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiAqIEl0IGNyZWF0ZXMgYSBnYWxsZXJ5IHRoYXQgZGlzcGxheXMgY2xpY2thYmxlIGltYWdlcyBhcyB0aHVtYm5haWxzLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxuY2xhc3MgSW1hZ2VHYWxsZXJ5IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIGdhbGxlcnksIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgbGV0IGdhbGxlcnlUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbWFnZS1nYWxsZXJ5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbWFnZS1nYWxsZXJ5Lmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNnYWxsZXJ5VGVtcGxhdGVcIik7IC8vc2hhZG93IERPTSBpbXBvcnRcblxuICAgICAgICAvL3NldHVwIHNoYWRvdyBkb20gc3R5bGVzXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IGdhbGxlcnlUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gZ2FsbGVyeSBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogQ29ubmVjdHMgdG8gdGhlIHNlcnZlciwgc2V0cyB1cCBldmVudCBsaXN0ZW5lcnMgYW5kIHByaW50c1xuICAgICAqIGFscmVhZHkgc2F2ZWQgbWVzc2FnZXMgaWYgYW55LlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBsZXQgZ2FsbGVyeSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjZ2FsbGVyeScpO1xuICAgICAgICBsZXQgaW1hZ2VEaXNwbGF5ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbWFnZURpc3BsYXknKTtcbiAgICAgICAgbGV0IGxvY2FsTmF2ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNsb2NhbE5hdicpO1xuXG4gICAgICAgIHRoaXMucGljdHVyZVNvdXJjZXMgPSBbXTtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCh0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tzbG90ID1cInBpY3R1cmVcIicpLCAoYSkgPT4ge1xuICAgICAgICAgICAgaWYgKGEuaGFzQXR0cmlidXRlKCdzcmMnKSAmJiB0aGlzLnBpY3R1cmVTb3VyY2VzLmluZGV4T2YoYS5nZXRBdHRyaWJ1dGUoJ3NyYycpKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBpY3R1cmVTb3VyY2VzLnB1c2goYS5nZXRBdHRyaWJ1dGUoJ3NyYycpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYS5maXJzdEVsZW1lbnRDaGlsZCAmJiBhLmZpcnN0RWxlbWVudENoaWxkLmhhc0F0dHJpYnV0ZSgnc3JjJykgJiYgdGhpcy5waWN0dXJlU291cmNlcy5pbmRleE9mKGEuZmlyc3RFbGVtZW50Q2hpbGQuZ2V0QXR0cmlidXRlKCdzcmMnKSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5waWN0dXJlU291cmNlcy5wdXNoKGEuZmlyc3RFbGVtZW50Q2hpbGQuZ2V0QXR0cmlidXRlKCdzcmMnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdhbGxlcnkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBzcmMgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCdzcmMnKSB8fCBldmVudC50YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQuZ2V0QXR0cmlidXRlKCdzcmMnKTtcblxuICAgICAgICAgICAgaWYgKHNyYykge1xuICAgICAgICAgICAgICAgIGdhbGxlcnkuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgIGltYWdlRGlzcGxheS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5UGljdHVyZShzcmMsIGltYWdlRGlzcGxheSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxvY2FsTmF2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHRhc2sgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKTtcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudFBpY3R1cmUgPSBpbWFnZURpc3BsYXkucXVlcnlTZWxlY3RvcignaW1nLmRpc3BsYXllZCcpO1xuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50UGljdHVyZVNyYyA9IGN1cnJlbnRQaWN0dXJlLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgICAgICAgICAgICAgbGV0IG5leHRQaWN0dXJlU3JjO1xuXG4gICAgICAgICAgICAgICBpZiAodGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdbc2xvdCA9XCJwaWN0dXJlXCInKS5sZW5ndGggIT09IHRoaXMucGljdHVyZVNvdXJjZXMubGVuZ3RoKSB7IC8vY2hlY2sgaWYgbW9yZSBwaWN0dXJlIGhhcyBiZWVuIGFkZGVkXG4gICAgICAgICAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwodGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdbc2xvdCA9XCJwaWN0dXJlXCInKSwgKGEpID0+IHsgLy9pbiB0aGF0IGNhc2UgdXBkYXRlIHNvdXJjZWxpc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzcmMgPSBhLmdldEF0dHJpYnV0ZSgnc3JjJykgfHwgYS5maXJzdEVsZW1lbnRDaGlsZC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGljdHVyZVNvdXJjZXMuaW5kZXhPZihzcmMpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGljdHVyZVNvdXJjZXMucHVzaChzcmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZm9yd2FyZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0UGljdHVyZVNyYyA9IHRoaXMucGljdHVyZVNvdXJjZXMuaW5kZXhPZihjdXJyZW50UGljdHVyZVNyYykgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRQaWN0dXJlU3JjID09PSB0aGlzLnBpY3R1cmVTb3VyY2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQaWN0dXJlU3JjID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQaWN0dXJlU3JjID0gdGhpcy5waWN0dXJlU291cmNlc1tuZXh0UGljdHVyZVNyY107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlQaWN0dXJlKG5leHRQaWN0dXJlU3JjLCBpbWFnZURpc3BsYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JhY2snOlxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBpY3R1cmVTcmMgPSB0aGlzLnBpY3R1cmVTb3VyY2VzLmluZGV4T2YoY3VycmVudFBpY3R1cmVTcmMpIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0UGljdHVyZVNyYyA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0UGljdHVyZVNyYyA9IHRoaXMucGljdHVyZVNvdXJjZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQaWN0dXJlU3JjID0gdGhpcy5waWN0dXJlU291cmNlc1tuZXh0UGljdHVyZVNyY107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlQaWN0dXJlKG5leHRQaWN0dXJlU3JjLCBpbWFnZURpc3BsYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2dhbGxlcnknOlxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dUaHVtYm5haWxzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGltYWdlRGlzcGxheS5xdWVyeVNlbGVjdG9yKCdhLmRpc3BsYXllZCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgc3JjID0gZXZlbnQudGFyZ2V0LnNyYyB8fCBldmVudC50YXJnZXQuaHJlZjtcbiAgICAgICAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgICAgICAgICBvcGVuKHNyYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG5cbiAgICB9XG5cbiAgICBkaXNwbGF5UGljdHVyZShzcmMsIGRlc3RpbmF0aW9uKSB7XG4gICAgICAgIGxldCBkaXNwbGF5ID0gZGVzdGluYXRpb247XG4gICAgICAgIGxldCBpbWcgPSBkaXNwbGF5LnF1ZXJ5U2VsZWN0b3IoJ2ltZy5kaXNwbGF5ZWQnKTtcbiAgICAgICAgbGV0IGEgPSBkaXNwbGF5LnF1ZXJ5U2VsZWN0b3IoJ2EuZGlzcGxheWVkJyk7XG4gICAgICAgIGxldCBwID0gZGlzcGxheS5xdWVyeVNlbGVjdG9yKCdwI2Rlc2NyaXB0aW9uJyk7XG5cbiAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ1tzcmM9XCInICsgc3JjICsgJ1wiXScpO1xuICAgICAgICBsZXQgbGFiZWwgPSBjdXJyZW50LmdldEF0dHJpYnV0ZSgnbGFiZWwnKTtcbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uRm9yID0gXCJbZm9yPSdcIiArIGxhYmVsICsgXCInXVwiO1xuICAgICAgICBsZXQgZGVzY3JpcHRpb24gPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoZGVzY3JpcHRpb25Gb3IpLnRleHRDb250ZW50O1xuXG4gICAgICAgIGltZy5zcmMgPSBzcmM7XG4gICAgICAgIGEuaHJlZiA9IHNyYztcbiAgICAgICAgcC50ZXh0Q29udGVudCA9IGRlc2NyaXB0aW9uO1xuICAgIH1cblxuICAgIHNob3dUaHVtYm5haWxzKCkge1xuICAgICAgICBsZXQgZ2FsbGVyeSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjZ2FsbGVyeScpO1xuICAgICAgICBsZXQgaW1hZ2VEaXNwbGF5ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbWFnZURpc3BsYXknKTtcblxuICAgICAgICBnYWxsZXJ5LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgaW1hZ2VEaXNwbGF5LmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcblxuICAgIH1cbn1cblxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnaW1hZ2UtZ2FsbGVyeScsIEltYWdlR2FsbGVyeSk7XG4iLCIvKlxuICogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBpbnN0YS1jaGF0LWFwcCB0byBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuICogSXQgY29tYmluZWQgdGhlIGNvbXBvbmVudCBpbnN0YS1jaGF0IHdpdGggdGhlIGNvbXBvbmVudCBkcmFnZ2FibGUtd2luZG93LCB0b1xuICogbWFrZSBhIGNoYXQgaW4gYSB3aW5kb3cgd2l0aCBhbiBhZGRlZCBtZW51LlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxuY2xhc3MgSW5zdGFDaGF0QXBwIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIGNoYXQtd2luZG93LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGxldCBjaGF0V2luZG93VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW5zdGEtY2hhdC1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2NoYXRXaW5kb3dUZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxuXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IGNoYXRXaW5kb3dUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIGNoYXQgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGZvclxuICAgICAqIHRoZSBtZW51LCBhbmQgcHJpbnRzIG1lc3NhZ2VzXG4gICAgICogc2F2ZWQgaW4gbG9jYWwgc3RvcmFnZSBpZiBhbnkuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIC8vaW5pdGlhdGUgdGhlIGNoYXRcbiAgICAgICAgbGV0IGNoYXRzcGFjZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2luc3RhLWNoYXQnKTtcbiAgICAgICAgY2hhdHNwYWNlLnNldEF0dHJpYnV0ZSgnc2xvdCcsICdjb250ZW50Jyk7XG4gICAgICAgIGNoYXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93JykuYXBwZW5kQ2hpbGQoY2hhdHNwYWNlKTtcblxuXG4gICAgICAgIGxldCBuYW1lc3BhY2UgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI3N1Ym1pdE5hbWUnKTtcbiAgICAgICAgbGV0IGFib3V0c3BhY2UgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2Fib3V0Jyk7XG5cbiAgICAgICAgbGV0IGNoYXRvcHRpb24gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwiY2hhdFwiXScpO1xuICAgICAgICBsZXQgYWJvdXRvcHRpb24gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwiYWJvdXRcIl0nKTtcbiAgICAgICAgbGV0IG9wdGlvbm9wdGlvbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJvcHRpb25zXCJdJyk7XG5cbiAgICAgICAgLy9jaGVjayBpZiBhIG5hbWUgaGFzIGFscmVhZHkgYmVlbiBjaG9vc2VuXG4gICAgICAgIGlmIChsb2NhbFN0b3JhZ2UuY2hhdE5hbWUpIHtcbiAgICAgICAgICAgIGxldCBuYW1lID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuY2hhdE5hbWUpO1xuICAgICAgICAgICAgY2hhdHNwYWNlLmNoYW5nZUNvbmZpZyh7bmFtZTogbmFtZX0pO1xuICAgICAgICAgICAgbmFtZXNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgY2hhdHNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgfSBlbHNlIHsgLy9hc2sgZm9yIGEgbmFtZVxuICAgICAgICAgICAgY2hhdHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgbmFtZXNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5hbWVzcGFjZS5xdWVyeVNlbGVjdG9yKCdidXR0b24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IG5hbWUgPSBuYW1lc3BhY2UucXVlcnlTZWxlY3RvcignaW5wdXQnKS52YWx1ZTtcbiAgICAgICAgICAgIGNoYXRzcGFjZS5jaGFuZ2VDb25maWcoe25hbWU6IG5hbWV9KTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5jaGF0TmFtZSA9IEpTT04uc3RyaW5naWZ5KG5hbWUpO1xuICAgICAgICAgICAgbmFtZXNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgY2hhdHNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9ldmVudCBsaXN0ZW5lcnMgZm9yIG1lbnVcbiAgICAgICAgb3B0aW9ub3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LmZvY3VzZWQgfHwgZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgbGV0IHRhc2sgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbmFtZWNoYW5nZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGF0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3F1aXQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBhYm91dG9wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldC5mb2N1c2VkIHx8IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10YXNrXScpIHx8IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJykpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Fib3V0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGF0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNoYXRvcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQuZm9jdXNlZCB8fCBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjaGF0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXRzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vcHJpbnQgdGhlIGxhc3QgdHdlbnR5IG1lc3NhZ2VzIGZyb20gbGFzdCB0aW1lXG4gICAgICAgIGxldCBtZXNzYWdlcyA9IGNoYXRzcGFjZS5tZXNzYWdlTWFuYWdlci5nZXRDaGF0TG9nKCkucmV2ZXJzZSgpO1xuICAgICAgICBpZiAobWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbWVzc2FnZXMuZm9yRWFjaCgobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNoYXRzcGFjZS5wcmludChtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9zY3JvbGwgZG93biB3aGVuIHdpbmRvdyBoYXMgYmVlbiByZW5kZXJlZFxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNoYXRzcGFjZS5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNtZXNzYWdlV2luZG93Jykuc2Nyb2xsVG9wID0gY2hhdHNwYWNlLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI21lc3NhZ2VXaW5kb3cnKS5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIH0sIDEwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gYXBwIGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLlxuICAgICAqIENsb3NlcyB0aGUgd2luZG93IGFuZCB0aGUgd2ViIHNvY2tldC5cbiAgICAgKi9cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cblxuICAgIGdldCBvcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5vcGVuO1xuICAgIH1cblxuICAgIGdldCBtaW5pbWl6ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZDtcbiAgICB9XG5cbiAgICBzZXQgbWluaW1pemVkKG1pbmltaXplKSB7XG4gICAgICAgIGlmIChtaW5pbWl6ZSkge1xuICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5taW5pbWl6ZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5taW5pbWl6ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2VzIHRoZSB3aW5kb3cgYW5kIHRoZSB3ZWIgc29ja2V0LlxuICAgICAqL1xuICAgIGNsb3NlKCkge1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdpbnN0YS1jaGF0Jykuc29ja2V0LmNsb3NlKCk7XG4gICAgfVxufVxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnaW5zdGEtY2hhdC1hcHAnLCBJbnN0YUNoYXRBcHApO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gSW5zdGFDaGF0QXBwO1xuIiwiLypcbiAqIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgaW5zdGEtY2hhdCB0byBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuICogSXQgY3JlYXRlcyBhIGNoYXQgY29ubmVjdGVkIHRvIGEgd2ViIHNvY2tldCB0aGF0IHNlbmRzLCByZWNlaXZlcyBhbmQgcHJpbnRzXG4gKiBtZXNzYWdlcy5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICovXG5cbmNsYXNzIEluc3RhQ2hhdCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBjaGF0LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICogQHBhcmFtIGNvbmZpZyB7b2JqZWN0fSBhIGNvbmZpZyBvYmplY3Qgd2l0aCB0aGUgd2Vic29ja2V0cyB1cmwsIGNoYW5uZWwsIGtleSBhbmQgYSBuYW1lIGZvciB0aGUgdXNlclxuICAgICAqIEBwYXJhbSBzdGFydE1lc3NhZ2VzIHtbT2JqZWN0XX0gbWVzc2FnZXMgdG8gcHJpbnQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBjaGF0LlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGNvbmZpZyA9IHt9LCBzdGFydE1lc3NhZ2VzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGxldCBjaGF0VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW5zdGEtY2hhdC1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW5zdGEtY2hhdC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFRlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cbiAgICAgICAgLy9zZXR1cCBzaGFkb3cgZG9tIHN0eWxlc1xuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBjaGF0VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuXG4gICAgICAgIC8vc2V0IGNvbmZpZyBvYmplY3QgYXMgdGhpcy5jb25maWdcbiAgICAgICAgdGhpcy5jb25maWcgPSB7XG4gICAgICAgICAgICB1cmw6IGNvbmZpZy51cmwgfHwgJ3dzOnZob3N0My5sbnUuc2U6MjAwODAvc29ja2V0LycsXG4gICAgICAgICAgICBuYW1lOiBjb25maWcubmFtZSB8fCAnc2V2ZXJ1cyBzbmFwZScsXG4gICAgICAgICAgICBjaGFubmVsOiBjb25maWcuY2hhbm5lbCB8fCAnJyxcbiAgICAgICAgICAgIGtleTogY29uZmlnLmtleSB8fCAnZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmQnXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubWVzc2FnZXMgPSBzdGFydE1lc3NhZ2VzIHx8IFtdO1xuICAgICAgICB0aGlzLnNvY2tldCA9IG51bGw7XG4gICAgICAgIHRoaXMub25saW5lQ2hlY2tlciA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIGNoYXQgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIENvbm5lY3RzIHRvIHRoZSBzZXJ2ZXIsIHNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGFuZCBwcmludHNcbiAgICAgKiBhbHJlYWR5IHNhdmVkIG1lc3NhZ2VzIGlmIGFueS5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgLy9jb25uZWN0XG4gICAgICAgIHRoaXMuY29ubmVjdCgpO1xuXG4gICAgICAgIC8vc2V0IGV2ZW50IGxpc3RlbmVyIHRvIHNlbmQgbWVzc2FnZSBvbiBlbnRlclxuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI21lc3NhZ2VBcmVhJykuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL2lmIG1lc3NhZ2VzIHRvIHByaW50IGF0IHN0YXJ0IG9mIGNoYXQsIHByaW50IGVhY2hcbiAgICAgICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlcy5mb3JFYWNoKChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmludChtZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2VzIHRoZSB3ZWIgc29ja2V0IGNvbm5lY3Rpb24gaWYgY2hhdCBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAgICAgKi9cbiAgICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5zb2NrZXQuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25uZWN0cyB0byB0aGUgV2ViU29ja2V0IHNlcnZlci5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBjb25uZWN0aW9uIGlzIG9wZW5cbiAgICAgKiBhbmQgcmVqZWN0cyB3aXRoIHRoZSBzZXJ2ZXIgcmVzcG9uc2UgaWYgc29tZXRoaW5nIHdlbnQgd3JvbmcuXG4gICAgICogSWYgYSBjb25uZWN0aW9uIGlzIGFscmVhZHkgb3BlbiwgcmVzb2x2ZXMgd2l0aFxuICAgICAqIHRoZSBzb2NrZXQgZm9yIHRoYXQgY29ubmVjdGlvbi5cbiAgICAgKi9cbiAgICBjb25uZWN0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgICBsZXQgc29ja2V0ID0gdGhpcy5zb2NrZXQ7XG5cbiAgICAgICAgICAgIC8vY2hlY2sgZm9yIGVzdGFibGlzaGVkIGNvbm5lY3Rpb25cbiAgICAgICAgICAgIGlmIChzb2NrZXQgJiYgc29ja2V0LnJlYWR5U3RhdGUpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHNvY2tldCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQodGhpcy5jb25maWcudXJsKTtcblxuICAgICAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0T25saW5lQ2hlY2tlcigpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNvY2tldCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignY291bGQgbm90IGNvbm5lY3QgdG8gc2VydmVyJykpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3BvbnNlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UudHlwZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByaW50KHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZU1hbmFnZXIuc2V0Q2hhdExvZyhyZXNwb25zZSk7IC8vc2F2ZSBtZXNzYWdlIGluIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS50eXBlID09PSAnaGVhcnRiZWF0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2hlYXJ0YmVhdCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldE9ubGluZUNoZWNrZXIoKTsgLy9yZXNldCBmb3IgZXZlcnkgaGVhcnRiZWF0XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VNYW5hZ2VyLmdldFVuc2VudCgpLmZvckVhY2goKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmQobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZU1hbmFnZXIuY2xlYXJVbnNlbnQoKTsgLy9wdXNoIHVuc2VudCBtZXNzYWdlcyB3aGVuIHRoZXJlIGlzIGEgY29ubmVjdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIGEgbWVzc2FnZSB0byB0aGUgc2VydmVyLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlIHtzdHJpbmd9IHRoZSBtZXNzYWdlIHRvIHNlbmQuXG4gICAgICovXG4gICAgc2VuZChtZXNzYWdlKSB7XG5cbiAgICAgICAgbGV0IGRhdGEgPSB7XG4gICAgICAgICAgICB0eXBlOiAnbWVzc2FnZScsXG4gICAgICAgICAgICBkYXRhOiBtZXNzYWdlLFxuICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMuY29uZmlnLm5hbWUsXG4gICAgICAgICAgICBjaGFubmVsOiB0aGlzLmNvbmZpZy5jaGFubmVsLFxuICAgICAgICAgICAga2V5OiB0aGlzLmNvbmZpZy5rZXlcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNvbm5lY3QoKVxuICAgICAgICAgICAgLnRoZW4oKHNvY2tldCkgPT4ge1xuICAgICAgICAgICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgfSkuY2F0Y2goKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VNYW5hZ2VyLnNldFVuc2VudChkYXRhKTtcbiAgICAgICAgICAgIHRoaXMucHJpbnQoZGF0YSwgdHJ1ZSk7IC8vcHJpbnQgbWVzc2FnZSBhcyBcInVuc2VudFwiIHRvIG1ha2UgaXQgbG9vayBkaWZmZXJlbnQ7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJpbnRzIGEgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB7T2JqZWN0fSB0aGUgbWVzc2FnZSB0byBwcmludC5cbiAgICAgKiBAcGFyYW0gdW5zZW50IHtib29sZWFufSB0cnVlIGlmIHRoZSBtZXNzYWdlIGhhcyBub3QgYmVlbiBzdWNjZXNzZnVsbHkgc2VudFxuICAgICAqL1xuICAgIHByaW50KG1lc3NhZ2UsIHVuc2VudCkge1xuICAgICAgICBsZXQgbWVzc2FnZVRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2luc3RhLWNoYXQtYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2luc3RhLWNoYXQuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI21lc3NhZ2VUZW1wbGF0ZVwiKTsgLy9tZXNzYWdlIGRpc3BsYXkgdGVtcGxhdGVcblxuICAgICAgICBsZXQgY2hhdFdpbmRvdyA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjbWVzc2FnZVdpbmRvdycpO1xuICAgICAgICBsZXQgbWVzc2FnZURpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUobWVzc2FnZVRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgICAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3IoJy5hdXRob3InKS50ZXh0Q29udGVudCA9IG1lc3NhZ2UuZGF0YS51c2VybmFtZSB8fCBtZXNzYWdlLnVzZXJuYW1lO1xuICAgICAgICBtZXNzYWdlRGl2LnF1ZXJ5U2VsZWN0b3IoJy5tZXNzYWdlJykudGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGEuZGF0YSB8fCBtZXNzYWdlLmRhdGE7XG5cbiAgICAgICAgaWYgKHVuc2VudCkge1xuICAgICAgICAgICAgbWVzc2FnZURpdi5jbGFzc0xpc3QuYWRkKCd1bnNlbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYXRXaW5kb3cuYXBwZW5kQ2hpbGQobWVzc2FnZURpdik7XG4gICAgICAgIGNoYXRXaW5kb3cuc2Nyb2xsVG9wID0gY2hhdFdpbmRvdy5zY3JvbGxIZWlnaHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xlYXJzIGFuZCBzZXRzIGEgbmV3IHRpbWVvdXQgdG8gbWFrZSBzdXJlIHNlcnZlciBpcyBzdGlsbCBjb25uZWN0ZWQuXG4gICAgICogSWYgY29ubmVjdGlvbiBpcyBsb3N0IGFuZCB0aGVuIHJlZ2FpbmVkLCBwcmludHMgYWxsIHVuc2VudCBtZXNzYWdlcy5cbiAgICAgKi9cbiAgICByZXNldE9ubGluZUNoZWNrZXIoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLm9ubGluZUNoZWNrZXIpO1xuXG4gICAgICAgIHRoaXMub25saW5lQ2hlY2tlciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgLy9UT0RPOiBzb21ldGhpbmcgaGVyZVxuICAgICAgICB9LCA2MDAwMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBvYmplY3QgdG8gbWFuYWdlIG1lc3NhZ2VzLlxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IHRoZSBvYmplY3QuXG4gICAgICovXG4gICAgZ2V0IG1lc3NhZ2VNYW5hZ2VyKCkge1xuICAgICAgICAgICAgbGV0IHN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2U7XG4gICAgICAgICAgICBsZXQgY2hhdExvZyA9IFtdO1xuICAgICAgICAgICAgbGV0IHVuc2VudCA9IFtdO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFJldHJpZXZlcyBjaGF0IGxvZyBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSAsIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbm8gbWVzc2FnZXNcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZ2V0Q2hhdExvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2UuY2hhdExvZykge1xuICAgICAgICAgICAgICAgICAgICBjaGF0TG9nID0gSlNPTi5wYXJzZShzdG9yYWdlLmNoYXRMb2cpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBjaGF0TG9nO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUmV0cmlldmVzIHVuc2VudCBtZXNzYWdlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSBtZXNzYWdlcywgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBubyBtZXNzYWdlc1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBnZXRVbnNlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlLnVuc2VudCkge1xuICAgICAgICAgICAgICAgICAgICB1bnNlbnQgPSBKU09OLnBhcnNlKHN0b3JhZ2UudW5zZW50KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5zZW50O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogc2V0cyB1bnNlbnQgbWVzc2FnZXMgaW4gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICogQHBhcmFtIG1lc3NhZ2Uge29iamVjdH0gdGhlIG1lc3NhZ2Ugb2JqZWN0IHRvIHNhdmVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2V0VW5zZW50OiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9sZE1lc3NhZ2VzO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2UudW5zZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzID0gSlNPTi5wYXJzZShzdG9yYWdlLnVuc2VudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcy51bnNoaWZ0KG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAgICAgc3RvcmFnZS51bnNlbnQgPSBKU09OLnN0cmluZ2lmeShvbGRNZXNzYWdlcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBDbGVhcnMgdW5zZW50IG1lc3NhZ2VzLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjbGVhclVuc2VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3RvcmFnZS5yZW1vdmVJdGVtKCd1bnNlbnQnKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogU2V0cyBzZW50IG1lc3NhZ2VzIGluIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEBwYXJhbSBtZXNzYWdlIHtvYmplY3R9IHRoZSBtZXNzYWdlIG9iamVjdCB0byBzYXZlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNldENoYXRMb2c6IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBsZXQgb2xkTWVzc2FnZXM7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3RvcmFnZS5jaGF0TG9nKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzID0gSlNPTi5wYXJzZShzdG9yYWdlLmNoYXRMb2cpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMudW5zaGlmdChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIGlmIChvbGRNZXNzYWdlcy5sZW5ndGggPiAyMCkgeyAvL2tlZXAgdGhlIGxpc3QgdG8gMjAgbWVzc2FnZXNcbiAgICAgICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMubGVuZ3RoID0gMjA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3RvcmFnZS5jaGF0TG9nID0gSlNPTi5zdHJpbmdpZnkob2xkTWVzc2FnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGNvbmZpZyBmaWxlLlxuICAgICAqIEBwYXJhbSBjb25maWcge29iamVjdH0gdGhlIG5ldyB2YWx1ZXMgaW4gYW4gb2JqZWN0LlxuICAgICAqL1xuICAgIGNoYW5nZUNvbmZpZyhjb25maWcpIHtcbiAgICAgICAgdGhpcy5jb25maWcubmFtZSA9IGNvbmZpZy5uYW1lIHx8IHRoaXMuY29uZmlnLm5hbWU7XG4gICAgICAgIHRoaXMuY29uZmlnLnVybCA9IGNvbmZpZy51cmx8fCB0aGlzLmNvbmZpZy51cmw7XG4gICAgICAgIHRoaXMuY29uZmlnLmNoYW5uZWwgPSBjb25maWcuY2hhbm5lbCB8fCB0aGlzLmNvbmZpZy5jaGFubmVsO1xuICAgICAgICB0aGlzLmNvbmZpZy5rZXkgPSBjb25maWcua2V5IHx8IHRoaXMuY29uZmlnLmtleTtcbiAgICB9XG59XG5cbi8vZGVmaW5lcyB0aGUgZWxlbWVudFxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdpbnN0YS1jaGF0JywgSW5zdGFDaGF0KTtcbiIsIi8qXG4gKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IG1lbW9yeS1hcHAgdG8gZm9ybSBwYXJ0IG9mIGEgd2ViIGNvbXBvbmVudC5cbiAqIEl0IGNvbWJpbmVzIHRoZSBjb21wb25lbnQgbWVtb3J5LWdhbWUgd2l0aCB0aGUgY29tcG9uZW50IGRyYWdnYWJsZS13aW5kb3csIHRvXG4gKiBtYWtlIGEgY2hhdCBpbiBhIHdpbmRvdyB3aXRoIGFuIGFkZGVkIG1lbnUuXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICpcbiAqL1xuXG5jbGFzcyBNZW1vcnlBcHAgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIGEgbWVtb3J5LXdpbmRvdywgc2V0cyB1cCBzaGFkb3cgRE9NLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBsZXQgbWVtb3J5V2luZG93VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5V2luZG93VGVtcGxhdGVcIik7XG5cbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCJ9KTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gbWVtb3J5V2luZG93VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgd2hlbiBtZW1vcnktYXBwIGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAgICAgKiBTZXRzIHVwIGV2ZW50IGxpc3RlbmVycyBmb3JcbiAgICAgKiB0aGUgbWVudSBhbmQgZ2FtZSBib2FyZCBzaXplLlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBsZXQgZ2FtZXNwYWNlID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ21lbW9yeS1nYW1lJyk7XG4gICAgICAgIGxldCBoaWdoc2NvcmVzcGFjZSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjaGlnaHNjb3JlcycpO1xuICAgICAgICBsZXQgYWJvdXRzcGFjZSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjYWJvdXQnKTtcblxuICAgICAgICBsZXQgZ2FtZSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdtZW1vcnktZ2FtZScpO1xuICAgICAgICBsZXQgZ2FtZU9wdGlvbnMgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwiZ2FtZVwiXScpO1xuICAgICAgICBsZXQgaGlnaHNjb3Jlc09wdGlvbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJoaWdoc2NvcmVcIl0nKTtcbiAgICAgICAgbGV0IGFib3V0T3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cImFib3V0XCJdJyk7XG5cbiAgICAgICAgLy9tZW51IGV2ZW50IGxpc3RlbmVyc1xuICAgICAgICBnYW1lT3B0aW9ucy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldC5mb2N1c2VkIHx8IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10YXNrXScpIHx8IGV2ZW50LnRhcmdldDsgLy9zaGFkb3cgRE9NIGFjY2Vzc2liaWxpdHkgaXNzdWVzXG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVzdGFydCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZXNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoaWdoc2NvcmVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZXNwYWNlLnJlcGxheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbmV3JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lc3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZXNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lc3BhY2UucmVzdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAncXVpdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICAvL21lbnUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgaGlnaHNjb3Jlc09wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10YXNrXScpIHx8IGV2ZW50LnRhcmdldDsgLy9zaGFkb3cgRE9NIGFjY2Vzc2liaWxpdHkgaXNzdWVzXG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhc2spIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaGlnaHNjb3Jlcyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmVuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVIaWdoc2NvcmVzKGdhbWUucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBoaWdoc2NvcmVzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9tZW51IGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIGFib3V0T3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0OyAvL3NoYWRvdyBET00gYWNjZXNzaWJpbGl0eSBpc3N1ZXNcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdhYm91dCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGlnaHNjb3Jlc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vYm9hcmQgc2l6ZSBldmVudCBsaXN0ZW5lclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQucGF0aFswXTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdib2FyZHNpemUnKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudXNlciA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjaW50cm8gaW5wdXQnKS52YWx1ZSB8fCAnc3RyYW5nZXInOyAvL2dldCB0aGUgbmFtZSB3aGVuIGJvYXJkIHNpemUgaXMgY2hvc2VuXG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdib2FyZHNpemUnKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc0NCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLndpZHRoID0gNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuaGVpZ2h0ID0gNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnNDInOlxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS53aWR0aCA9IDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmhlaWdodCA9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzI0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUud2lkdGggPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5oZWlnaHQgPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5kcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gYXBwIGlzIHJlbW92ZWQgZnJvbSB0aGUgRE9NLlxuICAgICAqIENsb3NlcyB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyBoaWdoc2NvcmVzIGJ5IHNldHRpbmcgdGhlbSBpbiB0aGUgbG9jYWwgc3RvcmFnZVxuICAgICAqIGFuZCBkaXNwbGF5aW5nIGRlbS5cbiAgICAgKiBAcGFyYW0gcmVzdWx0XG4gICAgICovXG4gICAgdXBkYXRlSGlnaHNjb3JlcyhyZXN1bHQpIHtcbiAgICAgICAgbGV0IGhpZ2hzY29yZXNUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNoaWdoc2NvcmVzVGVtcGxhdGVcIik7XG5cbiAgICAgICAgbGV0IGhpZ2hzY29yZXMgPSB7XG4gICAgICAgICAgICBzdG9yYWdlOiBsb2NhbFN0b3JhZ2UsXG4gICAgICAgICAgICBzY29yZXM6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogUmV0cmlldmVzIGhpZ2hzY29yZXMgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSB0aGUgaGlnaHNjb3JlLWxpc3QsIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbm8gaGlnaHNjb3Jlc1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBnZXRIaWdoU2NvcmVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcmVzID0gSlNPTi5wYXJzZSh0aGlzLnN0b3JhZ2UubWVtb3J5SGlnaFNjb3Jlcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2NvcmVzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogc2V0cyBoaWdoc2NvcmVzIGluIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEBwYXJhbSB1c2VyIHtzdHJpbmd9IHRoZSB1c2VycyBuYW1lXG4gICAgICAgICAgICAgKiBAcGFyYW0gbmV3U2NvcmUge251bWJlcn0gdGhlIHNjb3JlIHRvIHNldFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzZXRIaWdoU2NvcmVzOiBmdW5jdGlvbiAodXNlciwgbmV3U2NvcmUpIHtcbiAgICAgICAgICAgICAgICBsZXQgb2xkSGlnaFNjb3JlcztcbiAgICAgICAgICAgICAgICBsZXQgbmV3SGlnaFNjb3JlcztcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0b3JhZ2UubWVtb3J5SGlnaFNjb3Jlcykge1xuICAgICAgICAgICAgICAgICAgICBvbGRIaWdoU2NvcmVzID0gSlNPTi5wYXJzZSh0aGlzLnN0b3JhZ2UubWVtb3J5SGlnaFNjb3Jlcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkSGlnaFNjb3JlcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9sZEhpZ2hTY29yZXMucHVzaCh7dXNlcjogdXNlciwgc2NvcmU6IG5ld1Njb3JlfSk7XG5cbiAgICAgICAgICAgICAgICBuZXdIaWdoU2NvcmVzID0gb2xkSGlnaFNjb3Jlcy5zb3J0KChhLCBiKSA9PiB7IC8vc29ydFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5zY29yZSAtIGIuc2NvcmU7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobmV3SGlnaFNjb3Jlcy5sZW5ndGggPiA1KSB7IC8va2VlcCB0aGUgbGlzdCB0byA1IHNjb3Jlc1xuICAgICAgICAgICAgICAgICAgICBuZXdIaWdoU2NvcmVzLmxlbmd0aCA9IDU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9yYWdlLm1lbW9yeUhpZ2hTY29yZXMgPSBKU09OLnN0cmluZ2lmeShuZXdIaWdoU2NvcmVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocmVzdWx0KSB7IC8vYSBuZXcgcmVzdWx0IGlzIHByZXNlbnRcbiAgICAgICAgICAgIGxldCBzY29yZSA9IChyZXN1bHQudHVybnMgKiByZXN1bHQudGltZSkgLyAodGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ21lbW9yeS1nYW1lJykuaGVpZ2h0ICogdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ21lbW9yeS1nYW1lJykud2lkdGgpO1xuICAgICAgICAgICAgaGlnaHNjb3Jlcy5zZXRIaWdoU2NvcmVzKHRoaXMudXNlciwgc2NvcmUpO1xuICAgICAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ21lbW9yeS1nYW1lJykucmVzdWx0ID0gdW5kZWZpbmVkOyAvL2NsZWFuIHRoZSByZXN1bHRcbiAgICAgICAgfVxuXG4gICAgICAgIC8vZGlzcGxheSB0aGUgc2NvcmVzXG4gICAgICAgIGxldCBzY29yZXMgPSBoaWdoc2NvcmVzLmdldEhpZ2hTY29yZXMoKTtcbiAgICAgICAgbGV0IGhpZ2hzY29yZURpc3BsYXkgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2hpZ2hzY29yZURpc3BsYXknKTtcbiAgICAgICAgbGV0IG9sZExpc3QgPSBoaWdoc2NvcmVEaXNwbGF5LnF1ZXJ5U2VsZWN0b3IoJ3VsJyk7XG4gICAgICAgIGxldCBsaXN0ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShoaWdoc2NvcmVzVGVtcGxhdGUuY29udGVudC5xdWVyeVNlbGVjdG9yKFwidWxcIiksIHRydWUpO1xuICAgICAgICBsZXQgZW50cnk7XG5cbiAgICAgICAgaWYgKHNjb3Jlcykge1xuICAgICAgICAgICAgc2NvcmVzLmZvckVhY2goKHNjb3JlKSA9PiB7XG4gICAgICAgICAgICAgICAgZW50cnkgPSBkb2N1bWVudC5pbXBvcnROb2RlKChsaXN0LnF1ZXJ5U2VsZWN0b3IoXCJsaVwiKSkpO1xuICAgICAgICAgICAgICAgIGVudHJ5LnRleHRDb250ZW50ID0gc2NvcmUudXNlciArIFwiOiBcIiArIHNjb3JlLnNjb3JlO1xuICAgICAgICAgICAgICAgIGxpc3QuYXBwZW5kQ2hpbGQoZW50cnkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbnRyeSA9IGRvY3VtZW50LmltcG9ydE5vZGUoKGxpc3QucXVlcnlTZWxlY3RvcihcImxpXCIpKSk7XG4gICAgICAgICAgICBlbnRyeS50ZXh0Q29udGVudCA9IFwiLVwiO1xuICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChlbnRyeSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9sZExpc3QpIHsgLy9pZiBzY29yZXMgaGF2ZSBhbHJlYWR5IGJlZW4gZGlzcGxheWVkLCByZXBsYWNlIHRoZW1cbiAgICAgICAgICAgIGhpZ2hzY29yZURpc3BsYXkuYXBwZW5kQ2hpbGQobGlzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaWdoc2NvcmVEaXNwbGF5LnJlcGxhY2VDaGlsZChsaXN0LCBvbGRMaXN0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBvcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5vcGVuO1xuICAgIH1cblxuICAgIGdldCBtaW5pbWl6ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignZHJhZ2dhYmxlLXdpbmRvdycpLm1pbmltaXplZDtcbiAgICB9XG5cbiAgICBzZXQgbWluaW1pemVkKG1pbmltaXplKSB7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93JykubWluaW1pemVkID0gbWluaW1pemU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgbm9kZSBhbmQgY2xvc2VzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5jbG9zZSgpO1xuICAgIH1cblxufVxuXG4vL2hlbHBlciBmdW5jdGlvblxuLy9hZGRzIG11bHRpcGxlIGV2ZW50IGxpc3RlbmVycyB3aXRoIGlkZW50aWNhbCBoYW5kbGVyc1xuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cblxuLy9kZWZpbmUgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbWVtb3J5LWFwcCcsIE1lbW9yeUFwcCk7XG4iLCIvKlxuICogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBtZW1vcnktZ2FtZSB0byBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuICogSXQgY3JlYXRlcyBhIG1lbW9yeSBnYW1lIHdpdGggYSB0aW1lciBhIGEgdHVybi1jb3VudGVyLiBUaGUgZ2FtZSBpcyBvdmVyIHdoZW5cbiAqIGFsbCBicmlja3MgaGF2ZSBiZWVuIHBhaXJlZCBhbmQgc3RvcmVzIHRoZSB0b3RhbCB0aW1lIGFuZCB0dXJucyBpbiBhIHJlc3VsdC12YXJpYWJsZS5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICovXG5cbi8vcmVxdWlyZXNcbmxldCBUaW1lciA9IHJlcXVpcmUoJy4vdGltZXIuanMnKTtcblxuXG5jbGFzcyBNZW1vcnlHYW1lIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIG1lbW9yeSBnYW1lLCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iod2lkdGgsIGhlaWdodCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBsZXQgbWVtb3J5VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktZ2FtZS5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5VGVtcGxhdGVcIik7IC8vc2hhZG93IERPTSBpbXBvcnRcblxuICAgICAgICAvL3NldHVwIHNoYWRvdyBkb20gc3R5bGVzXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IG1lbW9yeVRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcblxuICAgICAgICAvL3NldCB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXNcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2lkdGgnLCB3aWR0aCB8fCB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS13aWR0aCcpIHx8IDQpO1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnZGF0YS1oZWlnaHQnLCBoZWlnaHQgfHwgdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0JykgIHx8IDQpO1xuXG4gICAgICAgIC8vc2V0IHJlZmVyZW5jZXNcbiAgICAgICAgdGhpcy5zZXQgPSBbXTtcbiAgICAgICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcigwKTtcbiAgICAgICAgdGhpcy5nYW1lUGxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy50aW1lc3BhbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVzcGFuXCIpO1xuICAgICAgICB0aGlzLnR1cm5zcGFuID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjdHVybnNwYW5cIik7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gbWVtb3J5IGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyBhbmQgcmVuZGVycyBhIGJvYXJkIHdpdGggYnJpY2tzLlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2ludHJvIGJ1dHRvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsYXkoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIHdpZHRoIG9mIHRoZSBib2FyZCBpbiBicmlja3NcbiAgICAgKi9cbiAgICBnZXQgd2lkdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS13aWR0aCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHdpZHRoIG9mIHRoZSBib2FyZCBpbiBicmlja3MuXG4gICAgICogQHBhcmFtIG5ld1ZhbCB7c3RyaW5nfSB0aGUgbmV3IHdpZHRoIG9mIHRoZSBib2FyZCBpbiBicmlja3NcbiAgICAgKi9cbiAgICBzZXQgd2lkdGgobmV3VmFsKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkYXRhLXdpZHRoJywgbmV3VmFsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgaGVpZ2h0IG9mIHRoZSBib2FyZCBpbiBicmlja3NcbiAgICAgKi9cbiAgICBnZXQgaGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0Jyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgaGVpZ2h0IG9mIHRoZSBib2FyZCBpbiBicmlja3MuXG4gICAgICogQHBhcmFtIG5ld1ZhbCB7c3RyaW5nfSB0aGUgbmV3IGhlaWdodCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzXG4gICAgICovXG4gICAgc2V0IGhlaWdodChuZXdWYWwpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0JywgbmV3VmFsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaHVmZmxlcyB0aGUgYnJpY2tzIHVzaW5nIEZpc2hlci1ZYXRlcyBhbGdvcml0aG0uXG4gICAgICovXG4gICAgc2h1ZmZsZSgpIHtcbiAgICAgICAgbGV0IHRoZVNldCA9IHRoaXMuc2V0O1xuICAgICAgICBmb3IgKGxldCBpID0gKHRoZVNldC5sZW5ndGggLSAxKTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgbGV0IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKTtcbiAgICAgICAgICAgIGxldCBpT2xkID0gdGhlU2V0W2ldO1xuICAgICAgICAgICAgdGhlU2V0W2ldID0gdGhlU2V0W2pdO1xuICAgICAgICAgICAgdGhlU2V0W2pdID0gaU9sZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldCA9IHRoZVNldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBicmlja3MgdG8gdGhlIGJvYXJkIGFuZCByZW5kZXJzIHRoZW0gaW4gdGhlIERPTS5cbiAgICAgKi9cbiAgICBkcmF3KCkge1xuICAgICAgICBsZXQgYnJpY2tUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1nYW1lLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNicmlja1RlbXBsYXRlXCIpOyAvL2JyaWNrIHRlbXBsYXRlXG5cbiAgICAgICAgbGV0IGJyaWNrO1xuICAgICAgICBsZXQgbWF0Y2g7XG4gICAgICAgIGxldCBwYWlycyA9IE1hdGgucm91bmQoKHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCkpIC8gMjtcbiAgICAgICAgdGhpcy5zZXQgPSBbXTtcbiAgICAgICAgbGV0IG9sZEJyaWNrcyA9IHRoaXMuY2hpbGRyZW47XG5cbiAgICAgICAgLy9yZW1vdmUgb2xkIGJyaWNrcyBpZiBhbnlcbiAgICAgICAgZm9yIChsZXQgaSA9IG9sZEJyaWNrcy5sZW5ndGggLTE7IGkgPj0gMDsgaSAtPSAxKSB7XG4gICAgICAgICAgICBsZXQgYnJpY2sgPSBvbGRCcmlja3NbaV07XG4gICAgICAgICAgICBpZiAoYnJpY2suZ2V0QXR0cmlidXRlKCdzbG90JykgPT09ICdicmljaycpIHtcbiAgICAgICAgICAgICAgICBicmljay5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGJyaWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vaW5pdGlhdGUgYnJpY2tzXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHBhaXJzOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGJyaWNrID0gbmV3IEJyaWNrKGkpO1xuICAgICAgICAgICAgdGhpcy5zZXQucHVzaChicmljayk7XG4gICAgICAgICAgICBtYXRjaCA9IGJyaWNrLmNsb25lKCk7XG4gICAgICAgICAgICB0aGlzLnNldC5wdXNoKG1hdGNoKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGhlU2V0ID0gdGhpcy5zZXQ7XG5cbiAgICAgICAgLy9wdXQgdGhlbSBpbiB0aGUgZG9tXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhlU2V0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBsZXQgYnJpY2tEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKGJyaWNrVGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgICAgICBsZXQgaW1nID0gYnJpY2tEaXYucXVlcnlTZWxlY3RvcihcImltZ1wiKTtcbiAgICAgICAgICAgIGxldCBicmljayA9IHRoZVNldFtpXTtcbiAgICAgICAgICAgIGltZy5zcmMgPSAnL2ltYWdlL21lbW9yeS1icmljay0nICsgYnJpY2suZHJhdygpICsgJy5wbmcnO1xuICAgICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZShcImJyaWNrTnVtYmVyXCIsIGkpO1xuICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChicmlja0Rpdik7XG5cbiAgICAgICAgICAgIGlmICgoaSArIDEpICUgdGhpcy53aWR0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGxldCBiciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKTtcbiAgICAgICAgICAgICAgICBici5zZXRBdHRyaWJ1dGUoJ3Nsb3QnLCAnYnJpY2snKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZENoaWxkKGJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyBhIGdhbWUsIHBsYXlzIGl0IHRocm91Z2gsIHNhdmVzIHRoZSByZXN1bHQgYW5kXG4gICAgICogdGhlbiBkaXNwbGF5cyB0aGUgb3V0cm8uXG4gICAgICovXG4gICAgcGxheSgpIHtcbiAgICAgICAgdGhpcy5zaHVmZmxlKCk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI2ludHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblwiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI291dHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy50aW1lci5zdGFydCgwKTtcbiAgICAgICAgdGhpcy50aW1lci5kaXNwbGF5KHRoaXMudGltZXNwYW4pO1xuICAgICAgICBwbGF5R2FtZSh0aGlzLnNldCwgdGhpcylcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGltZSA9IHRoaXMudGltZXIuc3RvcCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI2ludHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNtYWluXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXN0YXJ0cyB0aGUgZ2FtZSB3aXRoIHRoZSBzYW1lIHNpemUgb2YgYm9hcmQgd2l0aG91dCByZS1yZW5kZXJpbmdcbiAgICAgKi9cbiAgICByZXBsYXkoKSB7XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjaW50cm9cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNtYWluXCIpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cm9cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnBsYXkoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIGdhbWUgYW5kIHRoZW4gbGV0cyB0aGUgdXNlciBjaG9vc2UgYSBuZXcgZ2FtZSBzaXplIGFuZFxuICAgICAqIHVzZXIgbmFtZSwgcmUtcmVuZGVyaW5nIHRoZSBib2FyZC5cbiAgICAgKi9cbiAgICByZXN0YXJ0KCkge1xuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI2ludHJvXCIpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblwiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI291dHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIGdhbWUgdG8gbWFrZSBpdCBwbGF5YWJsZSBhZ2Fpbi4gUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnNcbiAgICAgKiBhbmQgdHVybnMgdGhlIGJyaWNrcyBvdmVyLlxuICAgICAqL1xuICAgIHJlc2V0KCkge1xuICAgICAgICBsZXQgYnJpY2tzID0gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdbc2xvdD1cImJyaWNrXCJdJyk7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoYnJpY2tzLCAoYnJpY2spID0+IHtcbiAgICAgICAgICAgIGJyaWNrLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG4gICAgICAgICAgICBsZXQgaW1nID0gYnJpY2sucXVlcnlTZWxlY3RvcihcImltZ1wiKTtcbiAgICAgICAgICAgIGlmIChpbWcpIHtcbiAgICAgICAgICAgICAgICBsZXQgYnJpY2tOdW1iZXIgPSBpbWcuZ2V0QXR0cmlidXRlKFwiYnJpY2tOdW1iZXJcIik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2V0W2JyaWNrTnVtYmVyXS5kcmF3KCkgIT09IDApIHsgLy90dXJuIHRoZSBicmljayBvdmVyIGlmIGl0J3Mgbm90IHR1cm5lZFxuICAgICAgICAgICAgICAgICAgICBpbWcuc3JjID0gJy9pbWFnZS9tZW1vcnktYnJpY2stJyArIHRoaXMuc2V0W2JyaWNrTnVtYmVyXS50dXJuKCkgKyAnLnBuZyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50aW1lc3Bhbi50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgICB0aGlzLnR1cm5zcGFuLnRleHRDb250ZW50ID0gJyc7XG4gICAgICAgIHRoaXMudGltZXIuc3RvcCgpOyAvL21ha2Ugc3VyZSB0aW1lciBpcyBzdG9wcGVkXG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjYm9hcmQnKS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5nYW1lUGxheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5kcyB0aGUgZ2FtZSBhbmQgZGlzcGxheXMgdGhlIG91dHJvLlxuICAgICAqL1xuICAgIGVuZCgpIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI21haW5cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgfVxufVxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbWVtb3J5LWdhbWUnLCBNZW1vcnlHYW1lKTtcblxuXG4vKipcbiAqIEEgY2xhc3MgQnJpY2sgdG8gZ28gd2l0aCB0aGUgbWVtb3J5IGdhbWUuXG4gKi9cbmNsYXNzIEJyaWNrIHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgdGhlIEJyaWNrIHdpdGggYSB2YWx1ZSBhbmQgcGxhY2VzIGl0IGZhY2Vkb3duLlxuICAgICAqIEBwYXJhbSBudW1iZXIge251bWJlcn0gdGhlIHZhbHVlIHRvIGluaXRpYXRlLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG51bWJlcikge1xuICAgICAgICB0aGlzLnZhbHVlID0gbnVtYmVyO1xuICAgICAgICB0aGlzLmZhY2Vkb3duID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUdXJucyB0aGUgYnJpY2sgYW5kIHJldHVybnMgdGhlIHZhbHVlIGFmdGVyIHRoZSB0dXJuLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSB2YWx1ZSBvZiB0aGUgYnJpY2sgaWYgaXQncyBmYWNldXAsIG90aGVyd2lzZSAwLlxuICAgICAqL1xuICAgIHR1cm4oKSB7XG4gICAgICAgIHRoaXMuZmFjZWRvd24gPSAhKHRoaXMuZmFjZWRvd24pO1xuICAgICAgICByZXR1cm4gdGhpcy5kcmF3KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIGJyaWNrcy5cbiAgICAgKiBAcGFyYW0gb3RoZXIge0JyaWNrfSB0aGUgQnJpY2sgdG8gY29tcGFyZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgYnJpY2tzIHZhbHVlcyBhcmUgZXF1YWwuXG4gICAgICovXG4gICAgZXF1YWxzKG90aGVyKSB7XG4gICAgICAgIHJldHVybiAob3RoZXIgaW5zdGFuY2VvZiBCcmljaykgJiYgKHRoaXMudmFsdWUgPT09IG90aGVyLnZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9uZXMgdGhlIGJyaWNrLlxuICAgICAqIEByZXR1cm5zIHtCcmlja30gdGhlIGNsb25lLlxuICAgICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gbmV3IEJyaWNrKHRoaXMudmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBicmljaydzIHZhbHVlLCBvciAwIGlmIGl0IGlzIGZhY2UgZG93bi5cbiAgICAgKi9cbiAgICBkcmF3KCkge1xuICAgICAgICBpZiAodGhpcy5mYWNlZG93bikge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgc2V0cyB1cCB0aGUgZ2FtZXBsYXkuIEFkZHMgYW5kIHJlbW92ZXMgZXZlbnQtbGlzdGVuZXJzIHNvIHRoYXQgdGhlIHNhbWUgZ2FtZSBjYW4gYmUgcmVzZXQuXG4gKiBAcGFyYW0gc2V0IFt7QnJpY2tdfSB0aGUgc2V0IG9mIGJyaWNrcyB0byBwbGF5IHdpdGguXG4gKiBAcGFyYW0gZ2FtZSB7bm9kZX0gdGhlIHNwYWNlIHRvIHBsYXlcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSByZXN1bHQgb2YgdGhlIGdhbWUgd2hlbiB0aGUgZ2FtZSBoYXMgYmVlbiBwbGF5ZWQuXG4gKi9cbmZ1bmN0aW9uIHBsYXlHYW1lKHNldCwgZ2FtZSkge1xuICAgIGxldCB0dXJucyA9IDA7XG4gICAgbGV0IGJyaWNrcyA9IHBhcnNlSW50KGdhbWUud2lkdGgpICogcGFyc2VJbnQoZ2FtZS5oZWlnaHQpO1xuICAgIGxldCBib2FyZCA9IGdhbWUuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjYm9hcmQnKTtcbiAgICBsZXQgYnJpY2tzTGVmdCA9IGJyaWNrcztcbiAgICBsZXQgY2hvaWNlMTtcbiAgICBsZXQgY2hvaWNlMjtcbiAgICBsZXQgaW1nMTtcbiAgICBsZXQgaW1nMjtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGdhbWUuZ2FtZVBsYXkgPSBmdW5jdGlvbihldmVudCkgeyAvL2V4cG9zZSB0aGUgcmVmZXJlbmNlIHNvIHRoZSBldmVudCBsaXN0ZW5lciBjYW4gYmUgcmVtb3ZlZCBmcm9tIG91dHNpZGUgdGhlIGZ1bmN0aW9uXG4gICAgICAgICAgICBpZiAoIWNob2ljZTIpIHsgLy9pZiB0d28gYnJpY2tzIGFyZSBub3QgdHVybmVkXG4gICAgICAgICAgICAgICAgbGV0IGltZyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yKFwiaW1nXCIpIHx8IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgICAgICBsZXQgYnJpY2tOdW1iZXIgPSBpbWcuZ2V0QXR0cmlidXRlKFwiYnJpY2tOdW1iZXJcIik7XG4gICAgICAgICAgICAgICAgaWYgKCFicmlja051bWJlcikgeyAvL3RhcmdldCBpcyBub3QgYSBicmlja1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGJyaWNrID0gc2V0W2JyaWNrTnVtYmVyXTtcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gJy9pbWFnZS8nICsgYnJpY2sudHVybigpICsgJy5wbmcnO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFjaG9pY2UxKSB7IC8vZmlyc3QgYnJpY2sgdG8gYmUgdHVybmVkXG4gICAgICAgICAgICAgICAgICAgIGltZzEgPSBpbWc7XG4gICAgICAgICAgICAgICAgICAgIGNob2ljZTEgPSBicmljaztcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvL3NlY29uZCBicmljayB0byBiZSB0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgaW1nMiA9IGltZztcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlMiA9IGJyaWNrO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaG9pY2UxLmVxdWFscyhjaG9pY2UyKSAmJiBpbWcxLmdldEF0dHJpYnV0ZSgnYnJpY2tOdW1iZXInKSAhPT0gaW1nMi5nZXRBdHRyaWJ1dGUoJ2JyaWNrTnVtYmVyJykpIHsgLy90aGUgdHdvIGJyaWNrcyBhcmUgZXF1YWwgYnV0IG5vdCB0aGUgc2FtZVxuICAgICAgICAgICAgICAgICAgICAgICAgaW1nMS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcyLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTEgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hvaWNlMiA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJpY2tzTGVmdCAtPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJyaWNrc0xlZnQgPT09IDApIHsgLy9hbGwgYnJpY2tzIGFyZSB0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHt0dXJuczogdHVybnN9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy9icmlja3MgYXJlIG5vdCB0aGUgc2FtZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nMS5zcmMgPSAnL2ltYWdlLycgKyBjaG9pY2UxLnR1cm4oKSArICcucG5nJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcyLnNyYyA9ICcvaW1hZ2UvJyArIGNob2ljZTIudHVybigpICsgJy5wbmcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTEgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZzEgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZzIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0dXJucyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBnYW1lLnR1cm5zcGFuLnRleHRDb250ZW50ID0gdHVybnM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdhbWUuZ2FtZVBsYXkpO1xuXG4gICAgfSk7XG5cbn1cbiIsIi8qKlxuICogTW9kdWxlIGZvciBUaW1lci5cbiAqXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG5cbmNsYXNzIFRpbWVyIHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBUaW1lci5cbiAgICAgKiBAcGFyYW0gc3RhcnRUaW1lIHtudW1iZXJ9IHdoZXJlIHRvIHN0YXJ0IGNvdW50aW5nLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN0YXJ0VGltZSA9IDApIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IHN0YXJ0VGltZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgY291bnRcbiAgICAgKi9cbiAgICBnZXQgdGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY291bnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdGltZSBvbiB0aGUgdGltZXIuXG4gICAgICogQHBhcmFtIG5ld1RpbWUge251bWJlcn0gdGhlIG5ldyB0aW1lXG4gICAgICovXG4gICAgc2V0IHRpbWUobmV3VGltZSkge1xuICAgICAgICB0aGlzLmNvdW50ID0gbmV3VGltZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc3RhcnRzIHRoZSB0aW1lci4gaW5jcmVtZW50cyB0aW1lIGV2ZXJ5IDEwMCBtaWxsaXNlY29uZHMuXG4gICAgICogQHBhcmFtIHRpbWUge251bWJlcn0gd2hhdCBudW1iZXIgdG8gc3RhcnQgaXQgb24uXG4gICAgICovXG4gICAgc3RhcnQodGltZSA9IHRoaXMudGltZSkge1xuICAgICAgICB0aGlzLmNvdW50ID0gdGltZTtcbiAgICAgICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY291bnQgKz0gMTAwO1xuICAgICAgICB9LCAxMDApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBzdGFydHMgdGhlIHRpbWVyLiBkZWNyZW1lbnRzIHRpbWUgZXZlcnkgMTAwIG1pbGxpc2Vjb25kcy5cbiAgICAgKiBAcGFyYW0gdGltZSB7bnVtYmVyfSB3aGF0IG51bWJlciB0byBzdGFydCBpdCBvbi5cbiAgICAgKi9cbiAgICBjb3VudGRvd24odGltZSkge1xuICAgICAgICB0aGlzLmNvdW50ID0gdGltZSB8fCB0aGlzLmNvdW50O1xuICAgICAgICB0aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb3VudCAtPSAxMDA7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHN0b3BzIHRoZSBUaW1lci5cbiAgICAgKiBAcmV0dXJucyB0aGUgY291bnQuXG4gICAgICovXG4gICAgc3RvcCgpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmRpc3BsYXlJbnRlcnZhbCk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEaXNwbGF5cyBhIHJvdW5kZWQgdmFsdWUgb2YgdGhlIGNvdW50IG9mIHRoZSB0aW1lclxuICAgICAqIHRvIHRoZSBkZXNpcmVkIHByZWNpc2lvbiwgYXQgYW4gaW50ZXJ2YWwuXG4gICAgICogQHBhcmFtIGRlc3RpbmF0aW9uIHtub2RlfSB3aGVyZSB0byBtYWtlIHRoZSBkaXNwbGF5XG4gICAgICogQHBhcmFtIGludGVydmFsIHtudW1iZXJ9IHRoZSBpbnRlcnZhbCB0byBtYWtlIHRoZSBkaXNwbGF5IGluLCBpbiBtaWxsaXNlY29uZHNcbiAgICAgKiBAcGFyYW0gcHJlY2lzaW9uIHtudW1iZXJ9dGhlIG51bWJlciB0byBkaXZpZGUgdGhlIGRpc3BsYXllZCBtaWxsaXNlY29uZHMgYnlcbiAgICAgKiBAcmV0dXJucyB0aGUgaW50ZXJ2YWwuXG4gICAgICpcbiAgICAgKi9cbiAgICBkaXNwbGF5KGRlc3RpbmF0aW9uLCBpbnRlcnZhbCA9IDEwMCwgcHJlY2lzaW9uID0gMTAwMCkge1xuICAgICAgICB0aGlzLmRpc3BsYXlJbnRlcnZhbCA9IHNldEludGVydmFsKCAoKT0+IHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZCh0aGlzLmNvdW50IC8gcHJlY2lzaW9uKTtcbiAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICByZXR1cm4gdGhpcy5kaXNwbGF5SW50ZXJ2YWw7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xuIl19
