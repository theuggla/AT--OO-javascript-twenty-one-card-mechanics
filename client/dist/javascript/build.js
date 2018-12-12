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


//initiate serviceWorker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./javascript/serviceWorker.js', {
        scope: '/'
    }).then(function(reg) {
        console.log('◕‿◕', reg);
    }, function(err) {
        console.log('ಠ_ಠ', err);
    });
}




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
        if (event.target.assignedSlot && event.target.assignedSlot.name === 'title') {
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

},{}]},{},[1]);
