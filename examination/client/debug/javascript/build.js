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
let imageGallery = require('./image-gallery.js');
let imageGalleryApp = require('./image-gallery-app.js');

//requires
let desktop = require("./desktop.js");



},{"./desktop.js":3,"./draggable-window.js":4,"./expandable-menu-item.js":5,"./image-gallery-app.js":6,"./image-gallery.js":7,"./insta-chat-app.js":8,"./insta-chat.js":9,"./memory-app.js":10,"./memory-game.js":11}],3:[function(require,module,exports){
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
            item.focused = element;
        } else {
            sub.removeAttribute('focused');
        }
    });
}

},{}],6:[function(require,module,exports){
/*
 * A module for a custom HTML element image-gallery-app to form part of a web component.
 * It combined the component image-gallery with the component draggable-window, to
 * make an image gallery in a window with an added menu.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

let galleryWindowTemplate = document.querySelector('link[href="/image-gallery-app.html"]').import.querySelector("#galleryWindowTemplate"); //shadow DOM import
let imgTemplate = document.querySelector('link[href="/image-gallery-app.html"]').import.querySelector("#imgTemplate"); //shadow DOM import

class ImageGalleryApp extends HTMLElement {
    /**
     * Initiates a gallery-window, sets up shadow DOM.
     */
    constructor() {
        super();

        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = galleryWindowTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);
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
        let imageGallery = this.shadowRoot.querySelector('image-gallery');

        this.images = this.getImages();
        this.descriptions = this.getDescriptions();

        Array.prototype.forEach.call(this.images, (image) => {
            let container = imgTemplate.content.cloneNode(true);
            container.firstElementChild.replaceChild(image, container.firstElementChild.querySelector('img'));
            container.removeChild(container.querySelector('p'));
            imageGallery.appendChild(container);
        });

        Array.prototype.forEach.call(this.descriptions, (description) => {
            imageGallery.appendChild(description);
        });
    }

    close() {
        this.shadowRoot.querySelector('draggable-window').close();
    }

}


//define the element
customElements.define('image-gallery-app', ImageGalleryApp);

},{}],7:[function(require,module,exports){
/*
 * A module for a custom HTML element image-gallery to form part of a web component.
 * It creates a gallery that displays clickable images as thumbnails.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */
let galleryTemplate = document.querySelector('link[href="/image-gallery-app.html"]').import.querySelector('link[href="/image-gallery.html"]').import.querySelector("#galleryTemplate"); //shadow DOM import
class ImageGallery extends HTMLElement {
    /**
     * Initiates a gallery, sets up shadow DOM.
     */
    constructor() {
        super();

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

        this.pictureSources = Array.prototype.map.call(this.querySelectorAll('[slot ="picture"'), (a) => {
            if (a.hasAttribute('src')) {
                return a.getAttribute('src')
            } else if (a.firstElementChild && a.firstElementChild.hasAttribute('src')) {
                return a.firstElementChild.getAttribute('src');
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
                   console.log(this.querySelectorAll('[slot ="picture"'));
                    this.pictureSources = Array.prototype.map.call(this.querySelectorAll('[slot ="picture"'), (a) => { //in that case update sourcelist
                        return a.getAttribute('src') || a.firstElementChild.getAttribute('src');
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
                        gallery.classList.remove('hide');
                        imageDisplay.classList.add('hide');
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
}


//defines the element
customElements.define('image-gallery', ImageGallery);

},{}],8:[function(require,module,exports){
/*
 * A module for a custom HTML element insta-chat-app to form part of a web component.
 * It combined the component insta-chat with the component draggable-window, to
 * make a chat in a window with an added menu.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

let chatWindowTemplate = document.querySelector('link[href="/insta-chat-app.html"]').import.querySelector("#chatWindowTemplate"); //shadow DOM import

class InstaChatApp extends HTMLElement {
    /**
     * Initiates a chat-window, sets up shadow DOM.
     */
    constructor() {
        super();

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
        let namespace = this.shadowRoot.querySelector('#submitName');
        let chatspace = this.shadowRoot.querySelector('insta-chat');
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
/*
 * A module for a custom HTML element memory-app to form part of a web component.
 * It combines the component memory-game with the component draggable-window, to
 * make a chat in a window with an added menu.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */


let memoryWindowTemplate = document.querySelector('link[href="/memory-app.html"]').import.querySelector("#memoryWindowTemplate");
let highscoresTemplate = document.querySelector('link[href="/memory-app.html"]').import.querySelector("#highscoresTemplate");

class MemoryApp extends HTMLElement {
    /**
     * Initiates a memory-window, sets up shadow DOM.
     */
    constructor() {
        super();

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

},{}],11:[function(require,module,exports){
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

},{"./timer.js":12}],12:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvV2luZG93TWFuYWdlci5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kZXNrdG9wLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9kcmFnZ2FibGUtd2luZG93LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9leHBhbmRhYmxlLW1lbnUtaXRlbS5qcyIsImNsaWVudC9zb3VyY2UvanMvaW1hZ2UtZ2FsbGVyeS1hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2ltYWdlLWdhbGxlcnkuanMiLCJjbGllbnQvc291cmNlL2pzL2luc3RhLWNoYXQtYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9pbnN0YS1jaGF0LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnktYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9tZW1vcnktZ2FtZS5qcyIsImNsaWVudC9zb3VyY2UvanMvdGltZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIFdpbmRvd01hbmFnZXIod2luZG93U3BhY2UpIHtcbiAgICBsZXQgd20gPSB7fTtcblxuICAgIGNsYXNzIFdpbmRvd01hbmFnZXIge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHdpbmRvd1NwYWNlKSB7XG4gICAgICAgICAgICB3bS5zdGFydFggPSB3aW5kb3dTcGFjZS5vZmZzZXRMZWZ0ICsgMjA7XG4gICAgICAgICAgICB3bS5zdGFydFkgPSB3aW5kb3dTcGFjZS5vZmZzZXRUb3AgKyAyMDtcbiAgICAgICAgICAgIHdtLnR5cGVzID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZVdpbmRvdyh0eXBlKSB7XG4gICAgICAgICAgICBsZXQgYVdpbmRvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkcmFnZ2FibGUtd2luZG93XCIpO1xuXG4gICAgICAgIC8qbWFrZSB0ZW1wbGF0ZSwgaWYgbm8gd2luZG93cyBvcGVuIG9mIGtpbmQgZXRjXG4gICAgICAgICBsZXQgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoXCJyZWxcIiwgXCJpbXBvcnRcIik7XG4gICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCIvZHJhZ2dhYmxlLXdpbmRvdy5odG1sXCIpO1xuICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgIGV2ZW50LnRhcmdldC5zZXRBdHRyaWJ1dGUoXCJsYWJlbFwiLCB0eXBlKTsqL1xuXG4gICAgICAgICAgICB3aW5kb3dTcGFjZS5hcHBlbmRDaGlsZChhV2luZG93KTtcbiAgICAgICAgICAgIHNldHVwU3BhY2UodHlwZSwgYVdpbmRvdyk7XG5cbiAgICAgICAgICAgIGlmICh3bVt0eXBlXS5vcGVuKSB7XG4gICAgICAgICAgICAgICAgd21bdHlwZV0ub3Blbi5wdXNoKGFXaW5kb3cpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuID0gW2FXaW5kb3ddO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYVdpbmRvdztcbiAgICAgICAgfVxuXG4gICAgICAgIG9wZW4odHlwZSkge1xuICAgICAgICAgICAgaWYgKHdtW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCB3aW5kb3dzID0gd21bdHlwZV0ub3BlbjtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB3aW5kb3dzLmZpbHRlciggKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHcub3BlbjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZXhwYW5kKHR5cGUpIHtcbiAgICAgICAgICAgIGxldCB3aW5zID0gdGhpcy5vcGVuKHR5cGUpO1xuICAgICAgICAgICAgaWYgKHdpbnMpIHtcbiAgICAgICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdy5taW5pbWl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG1pbmltaXplKHR5cGUpIHtcbiAgICAgICAgICAgIGxldCB3aW5zID0gdGhpcy5vcGVuKHR5cGUpO1xuICAgICAgICAgICAgaWYgKHdpbnMpIHtcbiAgICAgICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdy5taW5pbWl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBjbG9zZSh0eXBlKSB7XG4gICAgICAgICAgICBsZXQgd2lucyA9IHRoaXMub3Blbih0eXBlKTtcbiAgICAgICAgICAgIGlmICh3aW5zKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cod2lucyk7XG4gICAgICAgICAgICAgICAgd2lucy5mb3JFYWNoKCh3KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHcuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgV2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSk7XG5cbiAgICAvL2hlbHBlciBmdW5jdGlvbnNcbiAgICBmdW5jdGlvbiBzZXR1cFNwYWNlKHR5cGUsIHNwYWNlKSB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHt9O1xuICAgICAgICBsZXQgeDtcbiAgICAgICAgbGV0IHk7XG5cbiAgICAgICAgaWYgKHdtW3R5cGVdKSB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gKHdtW3R5cGVdLmxhdGVzdENvb3Jkcy54ICs9IDUwKTtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAod21bdHlwZV0ubGF0ZXN0Q29vcmRzLnkgKz0gNTApO1xuXG4gICAgICAgICAgICBpZiAoISh3aXRoaW5Cb3VuZHMoc3BhY2UsIHdpbmRvd1NwYWNlLCBkZXN0aW5hdGlvbikpKSB7XG4gICAgICAgICAgICAgICAgeCA9IHdtW3R5cGVdLnN0YXJ0Q29vcmRzLnggKz0gNTtcbiAgICAgICAgICAgICAgICB5ID0gd21bdHlwZV0uc3RhcnRDb29yZHMueSArPSA1O1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLmxhdGVzdENvb3Jkcy54ID0geDtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5sYXRlc3RDb29yZHMueSA9IHk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHggPSBkZXN0aW5hdGlvbi54O1xuICAgICAgICAgICAgICAgIHkgPSBkZXN0aW5hdGlvbi55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gKHdtLnN0YXJ0WCArICg2MCAqIHdtLnR5cGVzKSk7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gKHdtLnN0YXJ0WSk7XG5cbiAgICAgICAgICAgIGlmICghKHdpdGhpbkJvdW5kcyhzcGFjZSwgd2luZG93U3BhY2UsIGRlc3RpbmF0aW9uKSkpIHtcbiAgICAgICAgICAgICAgICB4ID0gd20uc3RhcnRYO1xuICAgICAgICAgICAgICAgIHkgPSB3bS5zdGFydFk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHggPSBkZXN0aW5hdGlvbi54O1xuICAgICAgICAgICAgICAgIHkgPSBkZXN0aW5hdGlvbi55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3bVt0eXBlXSA9IHt9O1xuICAgICAgICAgICAgd21bdHlwZV0uc3RhcnRDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd21bdHlwZV0ubGF0ZXN0Q29vcmRzID0ge1xuICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgeTogeVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdtLnR5cGVzICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgc3BhY2UudGFiSW5kZXggPSAwO1xuICAgICAgICBzcGFjZS5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xuICAgICAgICBzcGFjZS5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3aXRoaW5Cb3VuZHMoZWxlbWVudCwgY29udGFpbmVyLCBjb29yZHMpIHtcbiAgICAgICAgbGV0IG1pblggPSBjb250YWluZXIub2Zmc2V0TGVmdDtcbiAgICAgICAgbGV0IG1heFggPSAobWluWCArIGNvbnRhaW5lci5jbGllbnRXaWR0aCkgLSAoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCk7XG4gICAgICAgIGxldCBtaW5ZID0gY29udGFpbmVyLm9mZnNldFRvcDtcbiAgICAgICAgbGV0IG1heFkgPSAobWluWSArIGNvbnRhaW5lci5jbGllbnRIZWlnaHQpIC0gKGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KTtcblxuICAgICAgICByZXR1cm4gKGNvb3Jkcy54IDw9IG1heFggJiYgY29vcmRzLnggPj0gbWluWCAmJiBjb29yZHMueSA8PSBtYXhZICYmIGNvb3Jkcy55ID49IG1pblkpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXaW5kb3dNYW5hZ2VyO1xuXG4iLCIvKipcbiAqIFN0YXJ0aW5nIHBvaW50IGZwciB0aGUgYXBwbGljYXRpb24uXG4gKiBUaGUgYXBwbGljYXRpb24gd291bGQgd29yayBiZXR0ZXIgd2hlbiB1c2VkIHdpdGggSFRUUDJcbiAqIGR1ZSB0byB0aGUgZmFjdCB0aGF0IGl0IG1ha2VzIHVzZSBvZiB3ZWItY29tcG9uZW50cyxcbiAqIGJ1dCBpdCdzIGJlZW4gYnVpbHQgd2l0aCBicm93c2VyaWZ5IHRvIHdvcmsgYXMgYVxuICogbm9ybWFsIEhUVFAxIGFwcGxpY2F0aW9uIGluIGxpZXUgb2YgdGhpcy5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMFxuICovXG5cblxuLy90byBtYWtlIHdlYiBjb21wb25lbnRzIHdvcmsgd2l0aCBicm93c2VyaWZ5XG5sZXQgd2luZG93ID0gcmVxdWlyZSgnLi9kcmFnZ2FibGUtd2luZG93LmpzJyk7XG5sZXQgbWVudSA9IHJlcXVpcmUoXCIuL2V4cGFuZGFibGUtbWVudS1pdGVtLmpzXCIpO1xubGV0IG1lbW9yeUdhbWUgPSByZXF1aXJlKCcuL21lbW9yeS1nYW1lLmpzJyk7XG5sZXQgbWVtb3J5QXBwID0gcmVxdWlyZSgnLi9tZW1vcnktYXBwLmpzJyk7XG5sZXQgaW5zdGFDaGF0PSByZXF1aXJlKCcuL2luc3RhLWNoYXQuanMnKTtcbmxldCBpbnN0YUNoYXRBcHAgPSByZXF1aXJlKCcuL2luc3RhLWNoYXQtYXBwLmpzJyk7XG5sZXQgaW1hZ2VHYWxsZXJ5ID0gcmVxdWlyZSgnLi9pbWFnZS1nYWxsZXJ5LmpzJyk7XG5sZXQgaW1hZ2VHYWxsZXJ5QXBwID0gcmVxdWlyZSgnLi9pbWFnZS1nYWxsZXJ5LWFwcC5qcycpO1xuXG4vL3JlcXVpcmVzXG5sZXQgZGVza3RvcCA9IHJlcXVpcmUoXCIuL2Rlc2t0b3AuanNcIik7XG5cblxuIiwiLy9yZXF1aXJlc1xubGV0IFdpbmRvd01hbmFnZXIgPSByZXF1aXJlKFwiLi9XaW5kb3dNYW5hZ2VyLmpzXCIpO1xuXG5cbi8vbm9kZXNcbmxldCBtYWluTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93U2VsZWN0b3JcIik7XG5sZXQgd2luZG93U3BhY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI29wZW5XaW5kb3dzXCIpO1xubGV0IHN1Yk1lbnVUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3ViTWVudVwiKTtcblxuLy92YXJpYWJsZXNcbmxldCBXTSA9IFdpbmRvd01hbmFnZXIod2luZG93U3BhY2UpO1xubGV0IHRvcCA9IDE7XG5cbkFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobWFpbk1lbnUuY2hpbGRyZW4sIChub2RlKSA9PiB7XG4gICAgYWRkU3ViTWVudShub2RlKTtcbn0pO1xuXG5tYWluTWVudS5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIChldmVudCkgPT4ge1xuICAgIGxldCB0eXBlID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEta2luZFwiKSB8fCBldmVudC50YXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLWtpbmRcIik7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgICAgV00uY3JlYXRlV2luZG93KHR5cGUpLmZvY3VzKCk7XG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59KTtcblxuYWRkRXZlbnRMaXN0ZW5lcnMobWFpbk1lbnUsICdjbGljayBmb2N1c291dCcsIChldmVudCkgPT4ge1xuICAgIGxldCBtYWluTWVudUl0ZW1zID0gbWFpbk1lbnUucXVlcnlTZWxlY3RvckFsbCgnZXhwYW5kYWJsZS1tZW51LWl0ZW0nKTtcbiAgICBtYWluTWVudUl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKChpdGVtICE9PSBldmVudC50YXJnZXQgJiYgaXRlbSAhPT0gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQpICYmIChpdGVtLmRpc3BsYXlpbmdTdWJNZW51KSkge1xuICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0pXG59KTtcblxud2luZG93U3BhY2UuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoZXZlbnQpID0+IHtcbiAgICBldmVudC50YXJnZXQuc3R5bGUuekluZGV4ID0gdG9wO1xuICAgIHRvcCArPSAxO1xufSwgdHJ1ZSk7XG5cbmZ1bmN0aW9uIGFkZFN1Yk1lbnUoaXRlbSkge1xuICAgIGxldCBpbnN0YW5jZSA9IGRvY3VtZW50LmltcG9ydE5vZGUoc3ViTWVudVRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGxldCBsYWJlbCA9IGl0ZW0uZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuXG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChpbnN0YW5jZS5jaGlsZHJlbiwgKG5vZGUpID0+IHtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoJ2xhYmVsJywgbGFiZWwpO1xuICAgIH0pO1xuXG4gICAgaXRlbS5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJykpIHtcbiAgICAgICAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICAgICAgICAgIFdNLmNyZWF0ZVdpbmRvdyhsYWJlbCkuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Nsb3NlJzpcbiAgICAgICAgICAgICAgICBXTS5jbG9zZShsYWJlbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdtaW5pbWl6ZSc6XG4gICAgICAgICAgICAgICAgV00ubWluaW1pemUobGFiZWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXhwYW5kJzpcbiAgICAgICAgICAgICAgICBXTS5leHBhbmQobGFiZWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyAoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cbiIsIi8qXG4qIEEgbW9kdWxlIGZvciBhIGN1c3RvbSBIVE1MIGVsZW1lbnQgZHJhZ2dhYmxlLXdpbmRvdyB0byBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuKiBJdCBjcmVhdGVzIGEgd2luZG93IHRoYXQgY2FuIGJlIG1vdmVkIGFjcm9zcyB0aGUgc2NyZWVuLCBjbG9zZWQgYW5kIG1pbmltaXplZC5cbiogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuKiBAdmVyc2lvbiAxLjAuMFxuKlxuKi9cblxuXG5sZXQgd2luZG93VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvZHJhZ2dhYmxlLXdpbmRvdy5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93VGVtcGxhdGVcIik7IC8vc2hhZG93IERPTSBpbXBvcnRcblxuY2xhc3MgRHJhZ2dhYmxlV2luZG93IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIGRyYWdnYWJsZS13aW5kb3csIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvL3NldHVwIHNoYWRvdyBkb20gc3R5bGVzXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwiLCBkZWxlZ2F0ZXNGb2N1czogdHJ1ZX0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSB3aW5kb3dUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIHdpbmRvdyBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogU2V0cyB1cCBldmVudCBsaXN0ZW5lcnMgYW5kIGJlaGF2aW91ciBvZiB0aGUgd2luZG93LlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuXG4gICAgICAgIC8vc2V0IGJlaGF2aW91clxuICAgICAgICBtYWtlRHJhZ2dhYmxlKHRoaXMsIHRoaXMucGFyZW50Tm9kZSk7XG5cbiAgICAgICAgLy9hZGQgZXZlbnQgbGlzdGVuZXJzXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LmNvbXBvc2VkUGF0aCgpWzBdOyAvL2ZvbGxvdyB0aGUgdHJhaWwgdGhyb3VnaCBzaGFkb3cgRE9NXG4gICAgICAgICAgICBsZXQgaWQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKFwiaWRcIik7XG4gICAgICAgICAgICBpZiAoaWQgPT09IFwiY2xvc2VcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaWQgPT09IFwibWluaW1pemVcIikge1xuICAgICAgICAgICAgICAgIHRoaXMubWluaW1pemVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnY2xpY2snKSB7IC8vbWFrZSB3b3JrIHdpdGggdG91Y2ggZXZlbnRzXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5vcGVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHVwIHdoYXQgYXR0cmlidXRlLWNoYW5nZXMgdG8gd2F0Y2ggZm9yIGluIHRoZSBET00uXG4gICAgICogQHJldHVybnMge1tzdHJpbmddfSBhbiBhcnJheSBvZiB0aGUgbmFtZXMgb2YgdGhlIGF0dHJpYnV0ZXMgdG8gd2F0Y2guXG4gICAgICovXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiBbJ29wZW4nXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXYXRjaGVzIGZvciBhdHRyaWJ1dGUgY2hhbmdlcyBpbiB0aGUgRE9NIGFjY29yZGluZyB0byBvYnNlcnZlZEF0dHJpYnV0ZXMoKVxuICAgICAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGVcbiAgICAgKiBAcGFyYW0gb2xkVmFsdWUgdGhlIG9sZCB2YWx1ZVxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZSB0aGUgbmV3IHZhbHVlXG4gICAgICovXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKG5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAoIXRoaXMub3Blbikge1xuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIHdpbmRvdyBoYXMgYXR0cmlidXRlICdvcGVuJ1xuICAgICAqL1xuICAgIGdldCBvcGVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNBdHRyaWJ1dGUoJ29wZW4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSAnb3BlbicgYXR0cmlidXRlIG9uIHRoZSB3aW5kb3cuXG4gICAgICogQHBhcmFtIG9wZW4ge2Jvb2xlYW59IHdoZXRoZXIgdG8gYWRkIG9yIHJlbW92ZSB0aGUgJ29wZW4nIGF0dHJpYnV0ZVxuICAgICAqL1xuICAgIHNldCBvcGVuKG9wZW4pIHtcbiAgICAgICAgaWYgKG9wZW4pIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdvcGVuJywgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ29wZW4nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSB3aW5kb3cgaGFzIGF0dHJpYnV0ZSAnbWluaW1pemVkJ1xuICAgICAqL1xuICAgIGdldCBtaW5pbWl6ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc0F0dHJpYnV0ZSgnbWluaW1pemVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgJ21pbmltaXplZCcgYXR0cmlidXRlIG9uIHRoZSB3aW5kb3cuXG4gICAgICogQHBhcmFtIG1pbmltaXplIHtib29sZWFufSB3aGV0aGVyIHRvIGFkZCBvciByZW1vdmUgdGhlICdtaW5pbWl6ZWQnIGF0dHJpYnV0ZVxuICAgICAqL1xuICAgIHNldCBtaW5pbWl6ZWQobWluaW1pemUpIHtcbiAgICAgICAgaWYgKG1pbmltaXplKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnbWluaW1pemVkJywgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoJ21pbmltaXplZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2VzIHRoZSB3aW5kb3cuIFJlbW92ZXMgaXQgZnJvbSB0aGUgRE9NIGFuZCBzZXRzIGFsbCBhdHRyaWJ1dGVzIHRvIGZhbHNlLlxuICAgICAqL1xuICAgIGNsb3NlKCkge1xuICAgICAgICBpZiAodGhpcy5vcGVuKSB7XG4gICAgICAgICAgICB0aGlzLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubWluaW1pemVkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBhcmVudE5vZGUuaG9zdCAmJiB0aGlzLnBhcmVudE5vZGUuaG9zdC5wYXJlbnROb2RlKSB7IC8vdGhpcyBpcyBwYXJ0IG9mIGEgc2hhZG93IGRvbVxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5ob3N0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5wYXJlbnROb2RlLmhvc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59XG5cbi8vaGVscGVyIGZ1bmN0aW9uXG4vL21ha2VzIGFuIGVsZW1lbnQgZHJhZ2dhYmxlIHdpdGggIG1vdXNlLCBhcnJvd3MgYW5kIHRvdWNoXG5mdW5jdGlvbiBtYWtlRHJhZ2dhYmxlKGVsKSB7XG4gICAgbGV0IGFycm93RHJhZztcbiAgICBsZXQgbW91c2VEcmFnO1xuICAgIGxldCBkcmFnb2Zmc2V0ID0geyAvL3RvIG1ha2UgdGhlIGRyYWcgbm90IGp1bXAgZnJvbSB0aGUgY29ybmVyXG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9O1xuXG4gICAgbGV0IGV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhlbCwgJ2ZvY3VzaW4gbW91c2Vkb3duIHRvdWNobW92ZScsICgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQ7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ3RvdWNobW92ZScpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQgPSBldmVudC50YXJnZXRUb3VjaGVzWzBdOyAvL21ha2Ugd29yayB3aXRoIHRvdWNoIGV2ZW50XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IGV2ZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXJyb3dEcmFnID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2Vkb3duJyB8fCBldmVudC50eXBlID09PSAndG91Y2htb3ZlJykge1xuICAgICAgICAgICAgICAgIG1vdXNlRHJhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgZHJhZ29mZnNldC54ID0gdGFyZ2V0LnBhZ2VYIC0gZWwub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBkcmFnb2Zmc2V0LnkgPSB0YXJnZXQucGFnZVkgLSBlbC5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoZWwsICdmb2N1c291dCBtb3VzZXVwJywgKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2V1cCcpIHtcbiAgICAgICAgICAgICAgICBpZiAobW91c2VEcmFnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vdXNlRHJhZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyb3dEcmFnID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoZG9jdW1lbnQsICdtb3VzZW1vdmUga2V5ZG93biB0b3VjaG1vdmUnLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7fTsgLy9hcyB0byBub3Qga2VlcCBwb2xsaW5nIHRoZSBET01cblxuICAgICAgICAgICAgaWYgKG1vdXNlRHJhZykge1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAoZXZlbnQucGFnZVkgLSBkcmFnb2Zmc2V0LnkpO1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAoZXZlbnQucGFnZVggLSBkcmFnb2Zmc2V0LngpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhcnJvd0RyYWcpIHtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gcGFyc2VJbnQoZWwuc3R5bGUudG9wLnNsaWNlKDAsIC0yKSk7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9IHBhcnNlSW50KGVsLnN0eWxlLmxlZnQuc2xpY2UoMCwgLTIpKTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSAtPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggLT0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1vdXNlRHJhZyB8fCBhcnJvd0RyYWcpIHtcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gZGVzdGluYXRpb24ueCAgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gZGVzdGluYXRpb24ueSAgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIH07XG5cbiAgICBldmVudHMoKTtcbn1cblxuLy9oZWxwZXIgZnVuY3Rpb25cbi8vYWRkcyBtdWx0aXBsZSBldmVudCBsaXN0ZW5lcnMgd2l0aCBpZGVudGljYWwgaGFuZGxlcnNcbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzKGVsZW1lbnQsIGV2ZW50cywgaGFuZGxlcikge1xuICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSk7XG59XG5cbi8vZGVmaW5lcyB0aGUgZWxlbWVudFxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdkcmFnZ2FibGUtd2luZG93JywgRHJhZ2dhYmxlV2luZG93KTtcbiIsIi8qXG4gKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGV4cGFuZGFibGUtbWVudS1pdGVtIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjcmVhdGVzIGFuIGl0ZW0gdGhhdCB3aGVuIGNsaWNrZWQgdG9nZ2xlcyB0byBzaG93IG9yIGhpZGUgc3ViLWl0ZW1zLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxubGV0IG1lbnVUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9leHBhbmRhYmxlLW1lbnUtaXRlbS5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudUl0ZW1UZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxuXG5cbmNsYXNzIEV4cGFuZGFibGVNZW51SXRlbSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBkcmFnZ2FibGUtd2luZG93LCBzZXRzIHVwIHNoYWRvdyBET00uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgLy9zZXQgdXAgc2hhZG93IGRvbSBzdHlsZXNcbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCIsIGRlbGVnYXRlc0ZvY3VzOiBcInRydWVcIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBtZW51VGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgIHNoYWRvd1Jvb3QuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIHdpbmRvdyBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogU2V0cyB1cCBldmVudCBsaXN0ZW5lcnMgYW5kIGJlaGF2aW91ciBvZiB0aGUgaXRlbS5cbiAgICAgKi9cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgbWFrZUV4cGFuZGFibGUodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge1tub2RlXX0gYW4gYXJyYXkgb2YgdGhlIHN1Yml0ZW1zIHRoZSBpdGVtIGhhcyBhc3NpZ25lZCBpbiB0aGUgRE9NLlxuICAgICAqIEEgc3ViaXRlbSBjb3VudHMgYXMgYW4gaXRlbSB0aGF0IGhhcyB0aGUgc2xvdCBvZiAnc3ViaXRlbScgYW5kIHRoZSBzYW1lIGxhYmVsXG4gICAgICogYXMgdGhlIGV4cGFuZGFibGUgbWVudSBpdGVtIGl0c2VsZi5cbiAgICAgKi9cbiAgICBnZXQgc3ViTWVudSgpIHtcbiAgICAgICAgbGV0IGxhYmVsID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2xhYmVsJyk7XG4gICAgICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuZmlsdGVyLmNhbGwodGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdbc2xvdD1cInN1Yml0ZW1cIl0nKSwgKG5vZGUpID0+IHtcbiAgICAgICAgICAgIGxldCBub2RlTGFiZWwgPSBub2RlLmdldEF0dHJpYnV0ZSgnbGFiZWwnKTtcbiAgICAgICAgICAgIHJldHVybiBub2RlTGFiZWwgPT09IGxhYmVsO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgaXRlbSBpcyBjdXJyZW50bHkgZGlzcGxheWluZyB0aGUgc3VibWVudS1pdGVtcy5cbiAgICAgKi9cbiAgICBnZXQgZGlzcGxheWluZ1N1Yk1lbnUoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5zdWJNZW51WzBdLmhhc0F0dHJpYnV0ZSgnaGlkZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3dzIG9yIGhpZGVzIHRoZSBzdWJtZW51LWl0ZW1zLlxuICAgICAqIEBwYXJhbSBzaG93IHtib29sZWFufSB3aGV0aGVyIHRvIHNob3cgb3IgaGlkZS5cbiAgICAgKi9cbiAgICB0b2dnbGVTdWJNZW51KHNob3cpIHtcbiAgICAgICAgaWYgKHNob3cpIHtcbiAgICAgICAgICAgIHRoaXMuc3ViTWVudS5mb3JFYWNoKChwb3N0KSA9PiB7XG4gICAgICAgICAgICAgICAgcG9zdC5yZW1vdmVBdHRyaWJ1dGUoJ2hpZGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdWJNZW51LmZvckVhY2goKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgICBwb3N0LnNldEF0dHJpYnV0ZSgnaGlkZScsICcnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9XG5cbn1cblxuLy9kZWZpbmVzIHRoZSBlbGVtZW50XG5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2V4cGFuZGFibGUtbWVudS1pdGVtJywgRXhwYW5kYWJsZU1lbnVJdGVtKTtcblxuLy9oZWxwZXIgZnVuY3Rpb24gdG8gbWFrZSB0aGUgaXRlbSBleHBhbmRhYmxlXG4vL3Rha2VzIHRoZSBpdGVtIHRvIGV4cGFuZCBhcyBhIHBhcmFtZXRlclxuZnVuY3Rpb24gbWFrZUV4cGFuZGFibGUoaXRlbSkge1xuICAgIGxldCBuZXh0Rm9jdXMgPSAwO1xuICAgIGxldCBzaG93ID0gZmFsc2U7XG4gICAgbGV0IGFycm93RXhwYW5kO1xuICAgIGxldCBtb3VzZUV4cGFuZDtcblxuICAgIGxldCBldmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGl0ZW0sICdmb2N1c2luIGNsaWNrJywgKChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGFycm93RXhwYW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICBtb3VzZUV4cGFuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNob3cgPSAhc2hvdztcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHNob3cpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhpdGVtLCAna2V5ZG93bicsICgoZXZlbnQpID0+IHsgLy9tYWtlIHRoZSBzdWItaXRlbXMgdHJhdmVyc2FibGUgYnkgcHJlc3NpbmcgdGhlIGFycm93IGtleXNcbiAgICAgICAgICAgICAgICBpZiAoYXJyb3dFeHBhbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udG9nZ2xlU3ViTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXRlbS5kaXNwbGF5aW5nU3ViTWVudSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRvZ2dsZVN1Yk1lbnUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRGb2N1cyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0Rm9jdXMgPCAwIHx8IG5leHRGb2N1cyA+PSBpdGVtLnN1Yk1lbnUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRGb2N1cyA9IGl0ZW0uc3ViTWVudS5sZW5ndGggLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uc3ViTWVudVtuZXh0Rm9jdXNdLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXMoaXRlbSwgaXRlbS5zdWJNZW51W25leHRGb2N1c10pOyAvL21ha2UgaXQgYWNjZXNzaWJsZSB2aWEgY3NzIHZpc3VhbCBjbHVlcyBldmVuIGlmIHRoZSBhY3RpdmUgZWxlbWVudCBpcyBoaWRkZW4gd2l0aGluIHNoYWRvd0RPTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWl0ZW0uZGlzcGxheWluZ1N1Yk1lbnUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0Rm9jdXMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dEZvY3VzID49IGl0ZW0uc3ViTWVudS5sZW5ndGggfHwgbmV4dEZvY3VzIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0Rm9jdXMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnN1Yk1lbnVbbmV4dEZvY3VzXS5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzKGl0ZW0sIGl0ZW0uc3ViTWVudVtuZXh0Rm9jdXNdKTsgLy9tYWtlIGl0IGFjY2Vzc2libGUgdmlhIGNzcyB2aXN1YWwgY2x1ZXMgZXZlbiBpZiB0aGUgYWN0aXZlIGVsZW1lbnQgaXMgaGlkZGVuIHdpdGhpbiBzaGFkb3dET01cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgfTtcblxuICAgIGV2ZW50cygpO1xufVxuXG4vL2hlbHBlciBmdW5jdGlvblxuLy9hZGRzIG11bHRpcGxlIGV2ZW50IGxpc3RlbmVycyB3aXRoIGlkZW50aWNhbCBoYW5kbGVyc1xuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cblxuLy8gQWRkcyBhICdmb2N1c2VkJyBhdHRyaWJ1dGUgdG8gdGhlIGRlc2lyZWQgc3ViaXRlbSBhbmRcbi8vIHJlbW92ZXMgaXQgZnJvbSBvdGhlciBzdWIgaXRlbXMgdG8gaGVscFxuLy8gd2l0aCBhY2Nlc3NpYmlsaXR5IGFuZCBzaGFkb3cgRE9tIHN0eWxpbmcuXG5mdW5jdGlvbiBmb2N1cyhpdGVtLCBlbGVtZW50KSB7XG4gICAgbGV0IHN1YnMgPSBpdGVtLnN1Yk1lbnU7XG4gICAgc3Vicy5mb3JFYWNoKChzdWIpID0+IHtcbiAgICAgICAgaWYgKHN1YiA9PT0gZWxlbWVudCkge1xuICAgICAgICAgICAgc3ViLnNldEF0dHJpYnV0ZSgnZm9jdXNlZCcsICcnKTtcbiAgICAgICAgICAgIGl0ZW0uZm9jdXNlZCA9IGVsZW1lbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdWIucmVtb3ZlQXR0cmlidXRlKCdmb2N1c2VkJyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiIsIi8qXG4gKiBBIG1vZHVsZSBmb3IgYSBjdXN0b20gSFRNTCBlbGVtZW50IGltYWdlLWdhbGxlcnktYXBwIHRvIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjb21iaW5lZCB0aGUgY29tcG9uZW50IGltYWdlLWdhbGxlcnkgd2l0aCB0aGUgY29tcG9uZW50IGRyYWdnYWJsZS13aW5kb3csIHRvXG4gKiBtYWtlIGFuIGltYWdlIGdhbGxlcnkgaW4gYSB3aW5kb3cgd2l0aCBhbiBhZGRlZCBtZW51LlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxubGV0IGdhbGxlcnlXaW5kb3dUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbWFnZS1nYWxsZXJ5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FsbGVyeVdpbmRvd1RlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5sZXQgaW1nVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW1hZ2UtZ2FsbGVyeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2ltZ1RlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cbmNsYXNzIEltYWdlR2FsbGVyeUFwcCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBnYWxsZXJ5LXdpbmRvdywgc2V0cyB1cCBzaGFkb3cgRE9NLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IGdhbGxlcnlXaW5kb3dUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIGNoYXQgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGZvclxuICAgICAqIHRoZSBtZW51LlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBsZXQgaW1hZ2VHYWxsZXJ5ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2ltYWdlLWdhbGxlcnknKTtcbiAgICAgICAgbGV0IGFib3V0c3BhY2UgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI2Fib3V0Jyk7XG5cbiAgICAgICAgbGV0IGdhbGxlcnlPcHRpb24gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwiZ2FsbGVyeVwiXScpO1xuICAgICAgICBsZXQgcXVpdE9wdGlvbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJxdWl0XCJdJyk7XG4gICAgICAgIGxldCBhYm91dE9wdGlvbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJhYm91dFwiXScpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlSW1hZ2VzKCk7XG5cbiAgICAgICAgLy9tZW51IGV2ZW50IGxpc3RlbmVycy4gYWRkIHNlcGFyYXRlIG9uZXMgZm9yIGFjY2Vzc2liaWxpdHkgcmVhc29ucyB3aXRoIHdlYiBjb21wb25lbnRzLlxuICAgICAgICBxdWl0T3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LmZvY3VzZWQgfHwgZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0OyAvL3NoYWRvdyBET00gYWNjZXNzaWJpbGl0eSBpc3N1ZXNcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdxdWl0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgLy9tZW51IGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIGdhbGxlcnlPcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7IC8vc2hhZG93IERPTSBhY2Nlc3NpYmlsaXR5IGlzc3Vlc1xuICAgICAgICAgICAgbGV0IHRhc2sgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2dhbGxlcnknOlxuICAgICAgICAgICAgICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZUdhbGxlcnkuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL21lbnUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgYWJvdXRPcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7IC8vc2hhZG93IERPTSBhY2Nlc3NpYmlsaXR5IGlzc3Vlc1xuICAgICAgICAgICAgbGV0IHRhc2sgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Fib3V0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlR2FsbGVyeS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0SW1hZ2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdpbWcnKTtcbiAgICB9XG5cbiAgICBnZXREZXNjcmlwdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ3BbZm9yXScpO1xuICAgIH1cblxuICAgIHVwZGF0ZUltYWdlcygpIHtcbiAgICAgICAgbGV0IGltYWdlR2FsbGVyeSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdpbWFnZS1nYWxsZXJ5Jyk7XG5cbiAgICAgICAgdGhpcy5pbWFnZXMgPSB0aGlzLmdldEltYWdlcygpO1xuICAgICAgICB0aGlzLmRlc2NyaXB0aW9ucyA9IHRoaXMuZ2V0RGVzY3JpcHRpb25zKCk7XG5cbiAgICAgICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbCh0aGlzLmltYWdlcywgKGltYWdlKSA9PiB7XG4gICAgICAgICAgICBsZXQgY29udGFpbmVyID0gaW1nVGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgICBjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQucmVwbGFjZUNoaWxkKGltYWdlLCBjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQucXVlcnlTZWxlY3RvcignaW1nJykpO1xuICAgICAgICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdwJykpO1xuICAgICAgICAgICAgaW1hZ2VHYWxsZXJ5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwodGhpcy5kZXNjcmlwdGlvbnMsIChkZXNjcmlwdGlvbikgPT4ge1xuICAgICAgICAgICAgaW1hZ2VHYWxsZXJ5LmFwcGVuZENoaWxkKGRlc2NyaXB0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93JykuY2xvc2UoKTtcbiAgICB9XG5cbn1cblxuXG4vL2RlZmluZSB0aGUgZWxlbWVudFxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdpbWFnZS1nYWxsZXJ5LWFwcCcsIEltYWdlR2FsbGVyeUFwcCk7XG4iLCIvKlxuICogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBpbWFnZS1nYWxsZXJ5IHRvIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjcmVhdGVzIGEgZ2FsbGVyeSB0aGF0IGRpc3BsYXlzIGNsaWNrYWJsZSBpbWFnZXMgYXMgdGh1bWJuYWlscy5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICovXG5sZXQgZ2FsbGVyeVRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2ltYWdlLWdhbGxlcnktYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL2ltYWdlLWdhbGxlcnkuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2dhbGxlcnlUZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxuY2xhc3MgSW1hZ2VHYWxsZXJ5IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIGdhbGxlcnksIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvL3NldHVwIHNoYWRvdyBkb20gc3R5bGVzXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IGdhbGxlcnlUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gZ2FsbGVyeSBpcyBpbnNlcnRlZCBpbnRvIHRoZSBET00uXG4gICAgICogQ29ubmVjdHMgdG8gdGhlIHNlcnZlciwgc2V0cyB1cCBldmVudCBsaXN0ZW5lcnMgYW5kIHByaW50c1xuICAgICAqIGFscmVhZHkgc2F2ZWQgbWVzc2FnZXMgaWYgYW55LlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBsZXQgZ2FsbGVyeSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjZ2FsbGVyeScpO1xuICAgICAgICBsZXQgaW1hZ2VEaXNwbGF5ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbWFnZURpc3BsYXknKTtcbiAgICAgICAgbGV0IGxvY2FsTmF2ID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNsb2NhbE5hdicpO1xuXG4gICAgICAgIHRoaXMucGljdHVyZVNvdXJjZXMgPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwodGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdbc2xvdCA9XCJwaWN0dXJlXCInKSwgKGEpID0+IHtcbiAgICAgICAgICAgIGlmIChhLmhhc0F0dHJpYnV0ZSgnc3JjJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5nZXRBdHRyaWJ1dGUoJ3NyYycpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGEuZmlyc3RFbGVtZW50Q2hpbGQgJiYgYS5maXJzdEVsZW1lbnRDaGlsZC5oYXNBdHRyaWJ1dGUoJ3NyYycpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEuZmlyc3RFbGVtZW50Q2hpbGQuZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZ2FsbGVyeS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHNyYyA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ3NyYycpIHx8IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuXG4gICAgICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgICAgICAgZ2FsbGVyeS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgaW1hZ2VEaXNwbGF5LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlQaWN0dXJlKHNyYywgaW1hZ2VEaXNwbGF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbG9jYWxOYXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgdGFzayA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50UGljdHVyZSA9IGltYWdlRGlzcGxheS5xdWVyeVNlbGVjdG9yKCdpbWcuZGlzcGxheWVkJyk7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRQaWN0dXJlU3JjID0gY3VycmVudFBpY3R1cmUuZ2V0QXR0cmlidXRlKCdzcmMnKTtcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFBpY3R1cmVTcmM7XG5cbiAgICAgICAgICAgICAgIGlmICh0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tzbG90ID1cInBpY3R1cmVcIicpLmxlbmd0aCAhPT0gdGhpcy5waWN0dXJlU291cmNlcy5sZW5ndGgpIHsgLy9jaGVjayBpZiBtb3JlIHBpY3R1cmUgaGFzIGJlZW4gYWRkZWRcbiAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tzbG90ID1cInBpY3R1cmVcIicpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waWN0dXJlU291cmNlcyA9IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbCh0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tzbG90ID1cInBpY3R1cmVcIicpLCAoYSkgPT4geyAvL2luIHRoYXQgY2FzZSB1cGRhdGUgc291cmNlbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEuZ2V0QXR0cmlidXRlKCdzcmMnKSB8fCBhLmZpcnN0RWxlbWVudENoaWxkLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdmb3J3YXJkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQaWN0dXJlU3JjID0gdGhpcy5waWN0dXJlU291cmNlcy5pbmRleE9mKGN1cnJlbnRQaWN0dXJlU3JjKSArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dFBpY3R1cmVTcmMgPT09IHRoaXMucGljdHVyZVNvdXJjZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBpY3R1cmVTcmMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBpY3R1cmVTcmMgPSB0aGlzLnBpY3R1cmVTb3VyY2VzW25leHRQaWN0dXJlU3JjXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheVBpY3R1cmUobmV4dFBpY3R1cmVTcmMsIGltYWdlRGlzcGxheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYmFjayc6XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0UGljdHVyZVNyYyA9IHRoaXMucGljdHVyZVNvdXJjZXMuaW5kZXhPZihjdXJyZW50UGljdHVyZVNyYykgLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRQaWN0dXJlU3JjIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQaWN0dXJlU3JjID0gdGhpcy5waWN0dXJlU291cmNlcy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFBpY3R1cmVTcmMgPSB0aGlzLnBpY3R1cmVTb3VyY2VzW25leHRQaWN0dXJlU3JjXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheVBpY3R1cmUobmV4dFBpY3R1cmVTcmMsIGltYWdlRGlzcGxheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZ2FsbGVyeSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBnYWxsZXJ5LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlRGlzcGxheS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGltYWdlRGlzcGxheS5xdWVyeVNlbGVjdG9yKCdhLmRpc3BsYXllZCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgc3JjID0gZXZlbnQudGFyZ2V0LnNyYyB8fCBldmVudC50YXJnZXQuaHJlZjtcbiAgICAgICAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgICAgICAgICBvcGVuKHNyYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG5cbiAgICB9XG5cbiAgICBkaXNwbGF5UGljdHVyZShzcmMsIGRlc3RpbmF0aW9uKSB7XG4gICAgICAgIGxldCBkaXNwbGF5ID0gZGVzdGluYXRpb247XG4gICAgICAgIGxldCBpbWcgPSBkaXNwbGF5LnF1ZXJ5U2VsZWN0b3IoJ2ltZy5kaXNwbGF5ZWQnKTtcbiAgICAgICAgbGV0IGEgPSBkaXNwbGF5LnF1ZXJ5U2VsZWN0b3IoJ2EuZGlzcGxheWVkJyk7XG4gICAgICAgIGxldCBwID0gZGlzcGxheS5xdWVyeVNlbGVjdG9yKCdwI2Rlc2NyaXB0aW9uJyk7XG5cbiAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ1tzcmM9XCInICsgc3JjICsgJ1wiXScpO1xuICAgICAgICBsZXQgbGFiZWwgPSBjdXJyZW50LmdldEF0dHJpYnV0ZSgnbGFiZWwnKTtcbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uRm9yID0gXCJbZm9yPSdcIiArIGxhYmVsICsgXCInXVwiO1xuICAgICAgICBsZXQgZGVzY3JpcHRpb24gPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoZGVzY3JpcHRpb25Gb3IpLnRleHRDb250ZW50O1xuXG4gICAgICAgIGltZy5zcmMgPSBzcmM7XG4gICAgICAgIGEuaHJlZiA9IHNyYztcbiAgICAgICAgcC50ZXh0Q29udGVudCA9IGRlc2NyaXB0aW9uO1xuICAgIH1cbn1cblxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnaW1hZ2UtZ2FsbGVyeScsIEltYWdlR2FsbGVyeSk7XG4iLCIvKlxuICogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBpbnN0YS1jaGF0LWFwcCB0byBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuICogSXQgY29tYmluZWQgdGhlIGNvbXBvbmVudCBpbnN0YS1jaGF0IHdpdGggdGhlIGNvbXBvbmVudCBkcmFnZ2FibGUtd2luZG93LCB0b1xuICogbWFrZSBhIGNoYXQgaW4gYSB3aW5kb3cgd2l0aCBhbiBhZGRlZCBtZW51LlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxubGV0IGNoYXRXaW5kb3dUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbnN0YS1jaGF0LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhdFdpbmRvd1RlbXBsYXRlXCIpOyAvL3NoYWRvdyBET00gaW1wb3J0XG5cbmNsYXNzIEluc3RhQ2hhdEFwcCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBjaGF0LXdpbmRvdywgc2V0cyB1cCBzaGFkb3cgRE9NLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IGNoYXRXaW5kb3dUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIGNoYXQgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGZvclxuICAgICAqIHRoZSBtZW51LCBhbmQgcHJpbnRzIG1lc3NhZ2VzXG4gICAgICogc2F2ZWQgaW4gbG9jYWwgc3RvcmFnZSBpZiBhbnkuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIGxldCBuYW1lc3BhY2UgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI3N1Ym1pdE5hbWUnKTtcbiAgICAgICAgbGV0IGNoYXRzcGFjZSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdpbnN0YS1jaGF0Jyk7XG4gICAgICAgIGxldCBhYm91dHNwYWNlID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNhYm91dCcpO1xuXG4gICAgICAgIGxldCBjaGF0b3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cImNoYXRcIl0nKTtcbiAgICAgICAgbGV0IGFib3V0b3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cImFib3V0XCJdJyk7XG4gICAgICAgIGxldCBvcHRpb25vcHRpb24gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwib3B0aW9uc1wiXScpO1xuXG4gICAgICAgIC8vY2hlY2sgaWYgYSBuYW1lIGhhcyBhbHJlYWR5IGJlZW4gY2hvb3NlblxuICAgICAgICBpZiAobG9jYWxTdG9yYWdlLmNoYXROYW1lKSB7XG4gICAgICAgICAgICBsZXQgbmFtZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmNoYXROYW1lKTtcbiAgICAgICAgICAgIGNoYXRzcGFjZS5jaGFuZ2VDb25maWcoe25hbWU6IG5hbWV9KTtcbiAgICAgICAgICAgIG5hbWVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgIGNoYXRzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIH0gZWxzZSB7IC8vYXNrIGZvciBhIG5hbWVcbiAgICAgICAgICAgIGNoYXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgIG5hbWVzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIH1cblxuICAgICAgICBuYW1lc3BhY2UucXVlcnlTZWxlY3RvcignYnV0dG9uJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBuYW1lID0gbmFtZXNwYWNlLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykudmFsdWU7XG4gICAgICAgICAgICBjaGF0c3BhY2UuY2hhbmdlQ29uZmlnKHtuYW1lOiBuYW1lfSk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UuY2hhdE5hbWUgPSBKU09OLnN0cmluZ2lmeShuYW1lKTtcbiAgICAgICAgICAgIG5hbWVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgIGNoYXRzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vZXZlbnQgbGlzdGVuZXJzIGZvciBtZW51XG4gICAgICAgIG9wdGlvbm9wdGlvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldC5mb2N1c2VkIHx8IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yKCdbZGF0YS10YXNrXScpIHx8IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJykpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ25hbWVjaGFuZ2UnOlxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhdHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdxdWl0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgYWJvdXRvcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQuZm9jdXNlZCB8fCBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICBsZXQgdGFzayA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdGFzaycpKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdhYm91dCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhdHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjaGF0b3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LmZvY3VzZWQgfHwgZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgbGV0IHRhc2sgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2hhdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGF0c3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWJvdXRzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL3ByaW50IHRoZSBsYXN0IHR3ZW50eSBtZXNzYWdlcyBmcm9tIGxhc3QgdGltZVxuICAgICAgICBsZXQgbWVzc2FnZXMgPSBjaGF0c3BhY2UubWVzc2FnZU1hbmFnZXIuZ2V0Q2hhdExvZygpLnJldmVyc2UoKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG1lc3NhZ2VzLmZvckVhY2goKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICBjaGF0c3BhY2UucHJpbnQobWVzc2FnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vc2Nyb2xsIGRvd24gd2hlbiB3aW5kb3cgaGFzIGJlZW4gcmVuZGVyZWRcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjaGF0c3BhY2Uuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjbWVzc2FnZVdpbmRvdycpLnNjcm9sbFRvcCA9IGNoYXRzcGFjZS5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNtZXNzYWdlV2luZG93Jykuc2Nyb2xsSGVpZ2h0O1xuICAgICAgICB9LCAxMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIGFwcCBpcyByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAgICAgKiBDbG9zZXMgdGhlIHdpbmRvdyBhbmQgdGhlIHdlYiBzb2NrZXQuXG4gICAgICovXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZXMgdGhlIHdpbmRvdyBhbmQgdGhlIHdlYiBzb2NrZXQuXG4gICAgICovXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdkcmFnZ2FibGUtd2luZG93JykuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2luc3RhLWNoYXQnKS5zb2NrZXQuY2xvc2UoKTtcbiAgICB9XG59XG5cbi8vZGVmaW5lcyB0aGUgZWxlbWVudFxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdpbnN0YS1jaGF0LWFwcCcsIEluc3RhQ2hhdEFwcCk7XG4iLCIvKlxuICogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBpbnN0YS1jaGF0IHRvIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjcmVhdGVzIGEgY2hhdCBjb25uZWN0ZWQgdG8gYSB3ZWIgc29ja2V0IHRoYXQgc2VuZHMsIHJlY2VpdmVzIGFuZCBwcmludHNcbiAqIG1lc3NhZ2VzLlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxubGV0IGNoYXRUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbnN0YS1jaGF0LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9pbnN0YS1jaGF0Lmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNjaGF0VGVtcGxhdGVcIik7IC8vc2hhZG93IERPTSBpbXBvcnRcbmxldCBtZXNzYWdlVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW5zdGEtY2hhdC1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvaW5zdGEtY2hhdC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVRlbXBsYXRlXCIpOyAvL21lc3NhZ2UgZGlzcGxheSB0ZW1wbGF0ZVxuXG5jbGFzcyBJbnN0YUNoYXQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGVzIGEgY2hhdCwgc2V0cyB1cCBzaGFkb3cgRE9NLlxuICAgICAqIEBwYXJhbSBjb25maWcge29iamVjdH0gYSBjb25maWcgb2JqZWN0IHdpdGggdGhlIHdlYnNvY2tldHMgdXJsLCBjaGFubmVsLCBrZXkgYW5kIGEgbmFtZSBmb3IgdGhlIHVzZXJcbiAgICAgKiBAcGFyYW0gc3RhcnRNZXNzYWdlcyB7W09iamVjdF19IG1lc3NhZ2VzIHRvIHByaW50IGF0IHRoZSBzdGFydCBvZiB0aGUgY2hhdC5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihjb25maWcgPSB7fSwgc3RhcnRNZXNzYWdlcykge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8vc2V0dXAgc2hhZG93IGRvbSBzdHlsZXNcbiAgICAgICAgbGV0IHNoYWRvd1Jvb3QgPSB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogXCJvcGVuXCJ9KTtcbiAgICAgICAgbGV0IGluc3RhbmNlID0gY2hhdFRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcblxuICAgICAgICAvL3NldCBjb25maWcgb2JqZWN0IGFzIHRoaXMuY29uZmlnXG4gICAgICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgICAgICAgdXJsOiBjb25maWcudXJsIHx8ICd3czp2aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC8nLFxuICAgICAgICAgICAgbmFtZTogY29uZmlnLm5hbWUgfHwgJ3NldmVydXMgc25hcGUnLFxuICAgICAgICAgICAgY2hhbm5lbDogY29uZmlnLmNoYW5uZWwgfHwgJycsXG4gICAgICAgICAgICBrZXk6IGNvbmZpZy5rZXkgfHwgJ2VEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkJ1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLm1lc3NhZ2VzID0gc3RhcnRNZXNzYWdlcyB8fCBbXTtcbiAgICAgICAgdGhpcy5zb2NrZXQgPSBudWxsO1xuICAgICAgICB0aGlzLm9ubGluZUNoZWNrZXIgPSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgd2hlbiBjaGF0IGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAgICAgKiBDb25uZWN0cyB0byB0aGUgc2VydmVyLCBzZXRzIHVwIGV2ZW50IGxpc3RlbmVycyBhbmQgcHJpbnRzXG4gICAgICogYWxyZWFkeSBzYXZlZCBtZXNzYWdlcyBpZiBhbnkuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIC8vY29ubmVjdFxuICAgICAgICB0aGlzLmNvbm5lY3QoKTtcblxuICAgICAgICAvL3NldCBldmVudCBsaXN0ZW5lciB0byBzZW5kIG1lc3NhZ2Ugb24gZW50ZXJcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNtZXNzYWdlQXJlYScpLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9pZiBtZXNzYWdlcyB0byBwcmludCBhdCBzdGFydCBvZiBjaGF0LCBwcmludCBlYWNoXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZXMuZm9yRWFjaCgobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJpbnQobWVzc2FnZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsb3NlcyB0aGUgd2ViIHNvY2tldCBjb25uZWN0aW9uIGlmIGNoYXQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00uXG4gICAgICovXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMuc29ja2V0LmNsb3NlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29ubmVjdHMgdG8gdGhlIFdlYlNvY2tldCBzZXJ2ZXIuXG4gICAgICogQHJldHVybnMge1Byb21pc2V9IHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgY29ubmVjdGlvbiBpcyBvcGVuXG4gICAgICogYW5kIHJlamVjdHMgd2l0aCB0aGUgc2VydmVyIHJlc3BvbnNlIGlmIHNvbWV0aGluZyB3ZW50IHdyb25nLlxuICAgICAqIElmIGEgY29ubmVjdGlvbiBpcyBhbHJlYWR5IG9wZW4sIHJlc29sdmVzIHdpdGhcbiAgICAgKiB0aGUgc29ja2V0IGZvciB0aGF0IGNvbm5lY3Rpb24uXG4gICAgICovXG4gICAgY29ubmVjdCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgbGV0IHNvY2tldCA9IHRoaXMuc29ja2V0O1xuXG4gICAgICAgICAgICAvL2NoZWNrIGZvciBlc3RhYmxpc2hlZCBjb25uZWN0aW9uXG4gICAgICAgICAgICBpZiAoc29ja2V0ICYmIHNvY2tldC5yZWFkeVN0YXRlKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShzb2NrZXQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHRoaXMuY29uZmlnLnVybCk7XG5cbiAgICAgICAgICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldE9ubGluZUNoZWNrZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShzb2NrZXQpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2NvdWxkIG5vdCBjb25uZWN0IHRvIHNlcnZlcicpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByZXNwb25zZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnR5cGUgPT09ICdtZXNzYWdlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmludChyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VNYW5hZ2VyLnNldENoYXRMb2cocmVzcG9uc2UpOyAvL3NhdmUgbWVzc2FnZSBpbiBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzcG9uc2UudHlwZSA9PT0gJ2hlYXJ0YmVhdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdoZWFydGJlYXQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRPbmxpbmVDaGVja2VyKCk7IC8vcmVzZXQgZm9yIGV2ZXJ5IGhlYXJ0YmVhdFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlTWFuYWdlci5nZXRVbnNlbnQoKS5mb3JFYWNoKChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZW5kKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VNYW5hZ2VyLmNsZWFyVW5zZW50KCk7IC8vcHVzaCB1bnNlbnQgbWVzc2FnZXMgd2hlbiB0aGVyZSBpcyBhIGNvbm5lY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyBhIG1lc3NhZ2UgdG8gdGhlIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZSB7c3RyaW5nfSB0aGUgbWVzc2FnZSB0byBzZW5kLlxuICAgICAqL1xuICAgIHNlbmQobWVzc2FnZSkge1xuXG4gICAgICAgIGxldCBkYXRhID0ge1xuICAgICAgICAgICAgdHlwZTogJ21lc3NhZ2UnLFxuICAgICAgICAgICAgZGF0YTogbWVzc2FnZSxcbiAgICAgICAgICAgIHVzZXJuYW1lOiB0aGlzLmNvbmZpZy5uYW1lLFxuICAgICAgICAgICAgY2hhbm5lbDogdGhpcy5jb25maWcuY2hhbm5lbCxcbiAgICAgICAgICAgIGtleTogdGhpcy5jb25maWcua2V5XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jb25uZWN0KClcbiAgICAgICAgICAgIC50aGVuKChzb2NrZXQpID0+IHtcbiAgICAgICAgICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgIH0pLmNhdGNoKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlTWFuYWdlci5zZXRVbnNlbnQoZGF0YSk7XG4gICAgICAgICAgICB0aGlzLnByaW50KGRhdGEsIHRydWUpOyAvL3ByaW50IG1lc3NhZ2UgYXMgXCJ1bnNlbnRcIiB0byBtYWtlIGl0IGxvb2sgZGlmZmVyZW50O1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByaW50cyBhIG1lc3NhZ2UuXG4gICAgICogQHBhcmFtIG1lc3NhZ2Uge09iamVjdH0gdGhlIG1lc3NhZ2UgdG8gcHJpbnQuXG4gICAgICogQHBhcmFtIHVuc2VudCB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgbWVzc2FnZSBoYXMgbm90IGJlZW4gc3VjY2Vzc2Z1bGx5IHNlbnRcbiAgICAgKi9cbiAgICBwcmludChtZXNzYWdlLCB1bnNlbnQpIHtcbiAgICAgICAgbGV0IGNoYXRXaW5kb3cgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI21lc3NhZ2VXaW5kb3cnKTtcbiAgICAgICAgbGV0IG1lc3NhZ2VEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKG1lc3NhZ2VUZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yKCcuYXV0aG9yJykudGV4dENvbnRlbnQgPSBtZXNzYWdlLmRhdGEudXNlcm5hbWUgfHwgbWVzc2FnZS51c2VybmFtZTtcbiAgICAgICAgbWVzc2FnZURpdi5xdWVyeVNlbGVjdG9yKCcubWVzc2FnZScpLnRleHRDb250ZW50ID0gbWVzc2FnZS5kYXRhLmRhdGEgfHwgbWVzc2FnZS5kYXRhO1xuXG4gICAgICAgIGlmICh1bnNlbnQpIHtcbiAgICAgICAgICAgIG1lc3NhZ2VEaXYuY2xhc3NMaXN0LmFkZCgndW5zZW50Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGF0V2luZG93LmFwcGVuZENoaWxkKG1lc3NhZ2VEaXYpO1xuICAgICAgICBjaGF0V2luZG93LnNjcm9sbFRvcCA9IGNoYXRXaW5kb3cuc2Nyb2xsSGVpZ2h0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsZWFycyBhbmQgc2V0cyBhIG5ldyB0aW1lb3V0IHRvIG1ha2Ugc3VyZSBzZXJ2ZXIgaXMgc3RpbGwgY29ubmVjdGVkLlxuICAgICAqIElmIGNvbm5lY3Rpb24gaXMgbG9zdCBhbmQgdGhlbiByZWdhaW5lZCwgcHJpbnRzIGFsbCB1bnNlbnQgbWVzc2FnZXMuXG4gICAgICovXG4gICAgcmVzZXRPbmxpbmVDaGVja2VyKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5vbmxpbmVDaGVja2VyKTtcblxuICAgICAgICB0aGlzLm9ubGluZUNoZWNrZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIC8vVE9ETzogc29tZXRoaW5nIGhlcmVcbiAgICAgICAgfSwgNjAwMDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gb2JqZWN0IHRvIG1hbmFnZSBtZXNzYWdlcy5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSB0aGUgb2JqZWN0LlxuICAgICAqL1xuICAgIGdldCBtZXNzYWdlTWFuYWdlcigpIHtcbiAgICAgICAgICAgIGxldCBzdG9yYWdlID0gbG9jYWxTdG9yYWdlO1xuICAgICAgICAgICAgbGV0IGNoYXRMb2cgPSBbXTtcbiAgICAgICAgICAgIGxldCB1bnNlbnQgPSBbXTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZXRyaWV2ZXMgY2hhdCBsb2cgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSB0aGUgLCBvciB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG5vIG1lc3NhZ2VzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdldENoYXRMb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlLmNoYXRMb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhdExvZyA9IEpTT04ucGFyc2Uoc3RvcmFnZS5jaGF0TG9nKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY2hhdExvZztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFJldHJpZXZlcyB1bnNlbnQgbWVzc2FnZXMgZnJvbSBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSB0aGUgbWVzc2FnZXMsIG9yIHVuZGVmaW5lZCBpZiB0aGVyZSBhcmUgbm8gbWVzc2FnZXNcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZ2V0VW5zZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RvcmFnZS51bnNlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdW5zZW50ID0gSlNPTi5wYXJzZShzdG9yYWdlLnVuc2VudCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuc2VudDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIHNldHMgdW5zZW50IG1lc3NhZ2VzIGluIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEBwYXJhbSBtZXNzYWdlIHtvYmplY3R9IHRoZSBtZXNzYWdlIG9iamVjdCB0byBzYXZlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNldFVuc2VudDogZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGxldCBvbGRNZXNzYWdlcztcblxuICAgICAgICAgICAgICAgIGlmIChzdG9yYWdlLnVuc2VudCkge1xuICAgICAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcyA9IEpTT04ucGFyc2Uoc3RvcmFnZS51bnNlbnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2xkTWVzc2FnZXMudW5zaGlmdChtZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgIHN0b3JhZ2UudW5zZW50ID0gSlNPTi5zdHJpbmdpZnkob2xkTWVzc2FnZXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQ2xlYXJzIHVuc2VudCBtZXNzYWdlcy5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgY2xlYXJVbnNlbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbSgndW5zZW50Jyk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFNldHMgc2VudCBtZXNzYWdlcyBpbiBsb2NhbCBzdG9yYWdlXG4gICAgICAgICAgICAgKiBAcGFyYW0gbWVzc2FnZSB7b2JqZWN0fSB0aGUgbWVzc2FnZSBvYmplY3QgdG8gc2F2ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBzZXRDaGF0TG9nOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9sZE1lc3NhZ2VzO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2UuY2hhdExvZykge1xuICAgICAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcyA9IEpTT04ucGFyc2Uoc3RvcmFnZS5jaGF0TG9nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvbGRNZXNzYWdlcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzLnVuc2hpZnQobWVzc2FnZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAob2xkTWVzc2FnZXMubGVuZ3RoID4gMjApIHsgLy9rZWVwIHRoZSBsaXN0IHRvIDIwIG1lc3NhZ2VzXG4gICAgICAgICAgICAgICAgICAgIG9sZE1lc3NhZ2VzLmxlbmd0aCA9IDIwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN0b3JhZ2UuY2hhdExvZyA9IEpTT04uc3RyaW5naWZ5KG9sZE1lc3NhZ2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSBjb25maWcgZmlsZS5cbiAgICAgKiBAcGFyYW0gY29uZmlnIHtvYmplY3R9IHRoZSBuZXcgdmFsdWVzIGluIGFuIG9iamVjdC5cbiAgICAgKi9cbiAgICBjaGFuZ2VDb25maWcoY29uZmlnKSB7XG4gICAgICAgIHRoaXMuY29uZmlnLm5hbWUgPSBjb25maWcubmFtZSB8fCB0aGlzLmNvbmZpZy5uYW1lO1xuICAgICAgICB0aGlzLmNvbmZpZy51cmwgPSBjb25maWcudXJsfHwgdGhpcy5jb25maWcudXJsO1xuICAgICAgICB0aGlzLmNvbmZpZy5jaGFubmVsID0gY29uZmlnLmNoYW5uZWwgfHwgdGhpcy5jb25maWcuY2hhbm5lbDtcbiAgICAgICAgdGhpcy5jb25maWcua2V5ID0gY29uZmlnLmtleSB8fCB0aGlzLmNvbmZpZy5rZXk7XG4gICAgfVxufVxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnaW5zdGEtY2hhdCcsIEluc3RhQ2hhdCk7XG4iLCIvKlxuICogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBtZW1vcnktYXBwIHRvIGZvcm0gcGFydCBvZiBhIHdlYiBjb21wb25lbnQuXG4gKiBJdCBjb21iaW5lcyB0aGUgY29tcG9uZW50IG1lbW9yeS1nYW1lIHdpdGggdGhlIGNvbXBvbmVudCBkcmFnZ2FibGUtd2luZG93LCB0b1xuICogbWFrZSBhIGNoYXQgaW4gYSB3aW5kb3cgd2l0aCBhbiBhZGRlZCBtZW51LlxuICogQGF1dGhvciBNb2xseSBBcmhhbW1hclxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKi9cblxuXG5sZXQgbWVtb3J5V2luZG93VGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5V2luZG93VGVtcGxhdGVcIik7XG5sZXQgaGlnaHNjb3Jlc1RlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1hcHAuaHRtbFwiXScpLmltcG9ydC5xdWVyeVNlbGVjdG9yKFwiI2hpZ2hzY29yZXNUZW1wbGF0ZVwiKTtcblxuY2xhc3MgTWVtb3J5QXBwIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIEluaXRpYXRlcyBhIG1lbW9yeS13aW5kb3csIHNldHMgdXAgc2hhZG93IERPTS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBsZXQgc2hhZG93Um9vdCA9IHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiBcIm9wZW5cIn0pO1xuICAgICAgICBsZXQgaW5zdGFuY2UgPSBtZW1vcnlXaW5kb3dUZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgc2hhZG93Um9vdC5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIG1lbW9yeS1hcHAgaXMgaW5zZXJ0ZWQgaW50byB0aGUgRE9NLlxuICAgICAqIFNldHMgdXAgZXZlbnQgbGlzdGVuZXJzIGZvclxuICAgICAqIHRoZSBtZW51IGFuZCBnYW1lIGJvYXJkIHNpemUuXG4gICAgICovXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIGxldCBnYW1lc3BhY2UgPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKTtcbiAgICAgICAgbGV0IGhpZ2hzY29yZXNwYWNlID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNoaWdoc2NvcmVzJyk7XG4gICAgICAgIGxldCBhYm91dHNwYWNlID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNhYm91dCcpO1xuXG4gICAgICAgIGxldCBnYW1lID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ21lbW9yeS1nYW1lJyk7XG4gICAgICAgIGxldCBnYW1lT3B0aW9ucyA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdbbGFiZWw9XCJnYW1lXCJdJyk7XG4gICAgICAgIGxldCBoaWdoc2NvcmVzT3B0aW9uID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ1tsYWJlbD1cImhpZ2hzY29yZVwiXScpO1xuICAgICAgICBsZXQgYWJvdXRPcHRpb24gPSB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignW2xhYmVsPVwiYWJvdXRcIl0nKTtcblxuICAgICAgICAvL21lbnUgZXZlbnQgbGlzdGVuZXJzXG4gICAgICAgIGdhbWVPcHRpb25zLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LmZvY3VzZWQgfHwgZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0OyAvL3NoYWRvdyBET00gYWNjZXNzaWJpbGl0eSBpc3N1ZXNcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdyZXN0YXJ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lc3BhY2UuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZXNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYW1lc3BhY2UucmVwbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICduZXcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVzcGFjZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaHNjb3Jlc3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVzcGFjZS5yZXN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdxdWl0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIC8vbWVudSBldmVudCBsaXN0ZW5lclxuICAgICAgICBoaWdoc2NvcmVzT3B0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXRhc2tdJykgfHwgZXZlbnQudGFyZ2V0OyAvL3NoYWRvdyBET00gYWNjZXNzaWJpbGl0eSBpc3N1ZXNcbiAgICAgICAgICAgIGxldCB0YXNrID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJyk7XG4gICAgICAgICAgICBpZiAodGFzaykge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdoaWdoc2NvcmVzJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuZW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUhpZ2hzY29yZXMoZ2FtZS5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZXNwYWNlLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZXNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFib3V0c3BhY2UuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvL21lbnUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgYWJvdXRPcHRpb24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQucXVlcnlTZWxlY3RvcignW2RhdGEtdGFza10nKSB8fCBldmVudC50YXJnZXQ7IC8vc2hhZG93IERPTSBhY2Nlc3NpYmlsaXR5IGlzc3Vlc1xuICAgICAgICAgICAgbGV0IHRhc2sgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhc2snKTtcbiAgICAgICAgICAgIGlmICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Fib3V0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBoaWdoc2NvcmVzcGFjZS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhYm91dHNwYWNlLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9ib2FyZCBzaXplIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC5wYXRoWzBdO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2JvYXJkc2l6ZScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51c2VyID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbnRybyBpbnB1dCcpLnZhbHVlIHx8ICdzdHJhbmdlcic7IC8vZ2V0IHRoZSBuYW1lIHdoZW4gYm9hcmQgc2l6ZSBpcyBjaG9zZW5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2JvYXJkc2l6ZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzQ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUud2lkdGggPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5oZWlnaHQgPSA0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5kcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc0Mic6XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLndpZHRoID0gNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuaGVpZ2h0ID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUuZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnMjQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FtZS53aWR0aCA9IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmhlaWdodCA9IDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lLmRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWUucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgd2hlbiBhcHAgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00uXG4gICAgICogQ2xvc2VzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgZGlzY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIGhpZ2hzY29yZXMgYnkgc2V0dGluZyB0aGVtIGluIHRoZSBsb2NhbCBzdG9yYWdlXG4gICAgICogYW5kIGRpc3BsYXlpbmcgZGVtLlxuICAgICAqIEBwYXJhbSByZXN1bHRcbiAgICAgKi9cbiAgICB1cGRhdGVIaWdoc2NvcmVzKHJlc3VsdCkge1xuICAgICAgICBsZXQgaGlnaHNjb3JlcyA9IHtcbiAgICAgICAgICAgIHN0b3JhZ2U6IGxvY2FsU3RvcmFnZSxcbiAgICAgICAgICAgIHNjb3JlczogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBSZXRyaWV2ZXMgaGlnaHNjb3JlcyBmcm9tIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IHRoZSBoaWdoc2NvcmUtbGlzdCwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBubyBoaWdoc2NvcmVzXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdldEhpZ2hTY29yZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdG9yYWdlLm1lbW9yeUhpZ2hTY29yZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY29yZXMgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zY29yZXM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBzZXRzIGhpZ2hzY29yZXMgaW4gbG9jYWwgc3RvcmFnZVxuICAgICAgICAgICAgICogQHBhcmFtIHVzZXIge3N0cmluZ30gdGhlIHVzZXJzIG5hbWVcbiAgICAgICAgICAgICAqIEBwYXJhbSBuZXdTY29yZSB7bnVtYmVyfSB0aGUgc2NvcmUgdG8gc2V0XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNldEhpZ2hTY29yZXM6IGZ1bmN0aW9uICh1c2VyLCBuZXdTY29yZSkge1xuICAgICAgICAgICAgICAgIGxldCBvbGRIaWdoU2NvcmVzO1xuICAgICAgICAgICAgICAgIGxldCBuZXdIaWdoU2NvcmVzO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEhpZ2hTY29yZXMgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZS5tZW1vcnlIaWdoU2NvcmVzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvbGRIaWdoU2NvcmVzID0gW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2xkSGlnaFNjb3Jlcy5wdXNoKHt1c2VyOiB1c2VyLCBzY29yZTogbmV3U2NvcmV9KTtcblxuICAgICAgICAgICAgICAgIG5ld0hpZ2hTY29yZXMgPSBvbGRIaWdoU2NvcmVzLnNvcnQoKGEsIGIpID0+IHsgLy9zb3J0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhLnNjb3JlIC0gYi5zY29yZTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChuZXdIaWdoU2NvcmVzLmxlbmd0aCA+IDUpIHsgLy9rZWVwIHRoZSBsaXN0IHRvIDUgc2NvcmVzXG4gICAgICAgICAgICAgICAgICAgIG5ld0hpZ2hTY29yZXMubGVuZ3RoID0gNTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnN0b3JhZ2UubWVtb3J5SGlnaFNjb3JlcyA9IEpTT04uc3RyaW5naWZ5KG5ld0hpZ2hTY29yZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChyZXN1bHQpIHsgLy9hIG5ldyByZXN1bHQgaXMgcHJlc2VudFxuICAgICAgICAgICAgbGV0IHNjb3JlID0gKHJlc3VsdC50dXJucyAqIHJlc3VsdC50aW1lKSAvICh0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKS5oZWlnaHQgKiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKS53aWR0aCk7XG4gICAgICAgICAgICBoaWdoc2NvcmVzLnNldEhpZ2hTY29yZXModGhpcy51c2VyLCBzY29yZSk7XG4gICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignbWVtb3J5LWdhbWUnKS5yZXN1bHQgPSB1bmRlZmluZWQ7IC8vY2xlYW4gdGhlIHJlc3VsdFxuICAgICAgICB9XG5cbiAgICAgICAgLy9kaXNwbGF5IHRoZSBzY29yZXNcbiAgICAgICAgbGV0IHNjb3JlcyA9IGhpZ2hzY29yZXMuZ2V0SGlnaFNjb3JlcygpO1xuICAgICAgICBsZXQgaGlnaHNjb3JlRGlzcGxheSA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjaGlnaHNjb3JlRGlzcGxheScpO1xuICAgICAgICBsZXQgb2xkTGlzdCA9IGhpZ2hzY29yZURpc3BsYXkucXVlcnlTZWxlY3RvcigndWwnKTtcbiAgICAgICAgbGV0IGxpc3QgPSBkb2N1bWVudC5pbXBvcnROb2RlKGhpZ2hzY29yZXNUZW1wbGF0ZS5jb250ZW50LnF1ZXJ5U2VsZWN0b3IoXCJ1bFwiKSwgdHJ1ZSk7XG4gICAgICAgIGxldCBlbnRyeTtcblxuICAgICAgICBpZiAoc2NvcmVzKSB7XG4gICAgICAgICAgICBzY29yZXMuZm9yRWFjaCgoc2NvcmUpID0+IHtcbiAgICAgICAgICAgICAgICBlbnRyeSA9IGRvY3VtZW50LmltcG9ydE5vZGUoKGxpc3QucXVlcnlTZWxlY3RvcihcImxpXCIpKSk7XG4gICAgICAgICAgICAgICAgZW50cnkudGV4dENvbnRlbnQgPSBzY29yZS51c2VyICsgXCI6IFwiICsgc2NvcmUuc2NvcmU7XG4gICAgICAgICAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChlbnRyeSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVudHJ5ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSgobGlzdC5xdWVyeVNlbGVjdG9yKFwibGlcIikpKTtcbiAgICAgICAgICAgIGVudHJ5LnRleHRDb250ZW50ID0gXCItXCI7XG4gICAgICAgICAgICBsaXN0LmFwcGVuZENoaWxkKGVudHJ5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb2xkTGlzdCkgeyAvL2lmIHNjb3JlcyBoYXZlIGFscmVhZHkgYmVlbiBkaXNwbGF5ZWQsIHJlcGxhY2UgdGhlbVxuICAgICAgICAgICAgaGlnaHNjb3JlRGlzcGxheS5hcHBlbmRDaGlsZChsaXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhpZ2hzY29yZURpc3BsYXkucmVwbGFjZUNoaWxkKGxpc3QsIG9sZExpc3QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgbm9kZSBhbmQgY2xvc2VzIHRoZSB3aW5kb3cuXG4gICAgICovXG4gICAgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2RyYWdnYWJsZS13aW5kb3cnKS5jbG9zZSgpO1xuICAgIH1cblxufVxuXG4vL2hlbHBlciBmdW5jdGlvblxuLy9hZGRzIG11bHRpcGxlIGV2ZW50IGxpc3RlbmVycyB3aXRoIGlkZW50aWNhbCBoYW5kbGVyc1xuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cblxuLy9kZWZpbmUgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbWVtb3J5LWFwcCcsIE1lbW9yeUFwcCk7XG4iLCIvKlxuICogQSBtb2R1bGUgZm9yIGEgY3VzdG9tIEhUTUwgZWxlbWVudCBtZW1vcnktZ2FtZSB0byBmb3JtIHBhcnQgb2YgYSB3ZWIgY29tcG9uZW50LlxuICogSXQgY3JlYXRlcyBhIG1lbW9yeSBnYW1lIHdpdGggYSB0aW1lciBhIGEgdHVybi1jb3VudGVyLiBUaGUgZ2FtZSBpcyBvdmVyIHdoZW5cbiAqIGFsbCBicmlja3MgaGF2ZSBiZWVuIHBhaXJlZCBhbmQgc3RvcmVzIHRoZSB0b3RhbCB0aW1lIGFuZCB0dXJucyBpbiBhIHJlc3VsdC12YXJpYWJsZS5cbiAqIEBhdXRob3IgTW9sbHkgQXJoYW1tYXJcbiAqIEB2ZXJzaW9uIDEuMC4wXG4gKlxuICovXG5cbmxldCBtZW1vcnlUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktYXBwLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcignbGlua1tocmVmPVwiL21lbW9yeS1nYW1lLmh0bWxcIl0nKS5pbXBvcnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlUZW1wbGF0ZVwiKTsgLy9zaGFkb3cgRE9NIGltcG9ydFxubGV0IGJyaWNrVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW2hyZWY9XCIvbWVtb3J5LWFwcC5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbaHJlZj1cIi9tZW1vcnktZ2FtZS5odG1sXCJdJykuaW1wb3J0LnF1ZXJ5U2VsZWN0b3IoXCIjYnJpY2tUZW1wbGF0ZVwiKTsgLy9icmljayB0ZW1wbGF0ZVxuXG4vL3JlcXVpcmVzXG5sZXQgVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyLmpzJyk7XG5cblxuY2xhc3MgTWVtb3J5R2FtZSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBtZW1vcnkgZ2FtZSwgc2V0cyB1cCBzaGFkb3cgRE9NLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvL3NldHVwIHNoYWRvdyBkb20gc3R5bGVzXG4gICAgICAgIGxldCBzaGFkb3dSb290ID0gdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6IFwib3BlblwifSk7XG4gICAgICAgIGxldCBpbnN0YW5jZSA9IG1lbW9yeVRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBzaGFkb3dSb290LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcblxuICAgICAgICAvL3NldCB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXNcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2lkdGgnLCB3aWR0aCB8fCB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS13aWR0aCcpIHx8IDQpO1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnZGF0YS1oZWlnaHQnLCBoZWlnaHQgfHwgdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtaGVpZ2h0JykgIHx8IDQpO1xuXG4gICAgICAgIC8vc2V0IHJlZmVyZW5jZXNcbiAgICAgICAgdGhpcy5zZXQgPSBbXTtcbiAgICAgICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcigwKTtcbiAgICAgICAgdGhpcy5nYW1lUGxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy50aW1lc3BhbiA9IHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVzcGFuXCIpO1xuICAgICAgICB0aGlzLnR1cm5zcGFuID0gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjdHVybnNwYW5cIik7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHdoZW4gbWVtb3J5IGlzIGluc2VydGVkIGludG8gdGhlIERPTS5cbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyBhbmQgcmVuZGVycyBhIGJvYXJkIHdpdGggYnJpY2tzLlxuICAgICAqL1xuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignI291dHJvIGJ1dHRvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlc3RhcnQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJyNpbnRybyBidXR0b24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbGF5KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZHJhdygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSB3aWR0aCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzXG4gICAgICovXG4gICAgZ2V0IHdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtd2lkdGgnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB3aWR0aCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzLlxuICAgICAqIEBwYXJhbSBuZXdWYWwge3N0cmluZ30gdGhlIG5ldyB3aWR0aCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzXG4gICAgICovXG4gICAgc2V0IHdpZHRoKG5ld1ZhbCkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZSgnZGF0YS13aWR0aCcsIG5ld1ZhbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIGhlaWdodCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzXG4gICAgICovXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGhlaWdodCBvZiB0aGUgYm9hcmQgaW4gYnJpY2tzLlxuICAgICAqIEBwYXJhbSBuZXdWYWwge3N0cmluZ30gdGhlIG5ldyBoZWlnaHQgb2YgdGhlIGJvYXJkIGluIGJyaWNrc1xuICAgICAqL1xuICAgIHNldCBoZWlnaHQobmV3VmFsKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKCdkYXRhLWhlaWdodCcsIG5ld1ZhbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2h1ZmZsZXMgdGhlIGJyaWNrcyB1c2luZyBGaXNoZXItWWF0ZXMgYWxnb3JpdGhtLlxuICAgICAqL1xuICAgIHNodWZmbGUoKSB7XG4gICAgICAgIGxldCB0aGVTZXQgPSB0aGlzLnNldDtcbiAgICAgICAgZm9yIChsZXQgaSA9ICh0aGVTZXQubGVuZ3RoIC0gMSk7IGkgPiAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgIGxldCBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSk7XG4gICAgICAgICAgICBsZXQgaU9sZCA9IHRoZVNldFtpXTtcbiAgICAgICAgICAgIHRoZVNldFtpXSA9IHRoZVNldFtqXTtcbiAgICAgICAgICAgIHRoZVNldFtqXSA9IGlPbGQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXQgPSB0aGVTZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgYnJpY2tzIHRvIHRoZSBib2FyZCBhbmQgcmVuZGVycyB0aGVtIGluIHRoZSBET00uXG4gICAgICovXG4gICAgZHJhdygpIHtcbiAgICAgICAgbGV0IGJyaWNrO1xuICAgICAgICBsZXQgbWF0Y2g7XG4gICAgICAgIGxldCBwYWlycyA9IE1hdGgucm91bmQoKHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCkpIC8gMjtcbiAgICAgICAgdGhpcy5zZXQgPSBbXTtcbiAgICAgICAgbGV0IG9sZEJyaWNrcyA9IHRoaXMuY2hpbGRyZW47XG5cbiAgICAgICAgLy9yZW1vdmUgb2xkIGJyaWNrcyBpZiBhbnlcbiAgICAgICAgZm9yIChsZXQgaSA9IG9sZEJyaWNrcy5sZW5ndGggLTE7IGkgPj0gMDsgaSAtPSAxKSB7XG4gICAgICAgICAgICBsZXQgYnJpY2sgPSBvbGRCcmlja3NbaV07XG4gICAgICAgICAgICBpZiAoYnJpY2suZ2V0QXR0cmlidXRlKCdzbG90JykgPT09ICdicmljaycpIHtcbiAgICAgICAgICAgICAgICBicmljay5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGJyaWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vaW5pdGlhdGUgYnJpY2tzXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHBhaXJzOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGJyaWNrID0gbmV3IEJyaWNrKGkpO1xuICAgICAgICAgICAgdGhpcy5zZXQucHVzaChicmljayk7XG4gICAgICAgICAgICBtYXRjaCA9IGJyaWNrLmNsb25lKCk7XG4gICAgICAgICAgICB0aGlzLnNldC5wdXNoKG1hdGNoKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdGhlU2V0ID0gdGhpcy5zZXQ7XG5cbiAgICAgICAgLy9wdXQgdGhlbSBpbiB0aGUgZG9tXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhlU2V0Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBsZXQgYnJpY2tEaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKGJyaWNrVGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgICAgICBsZXQgaW1nID0gYnJpY2tEaXYucXVlcnlTZWxlY3RvcihcImltZ1wiKTtcbiAgICAgICAgICAgIGxldCBicmljayA9IHRoZVNldFtpXTtcbiAgICAgICAgICAgIGltZy5zcmMgPSAnL2ltYWdlL21lbW9yeS1icmljay0nICsgYnJpY2suZHJhdygpICsgJy5wbmcnO1xuICAgICAgICAgICAgaW1nLnNldEF0dHJpYnV0ZShcImJyaWNrTnVtYmVyXCIsIGkpO1xuICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChicmlja0Rpdik7XG5cbiAgICAgICAgICAgIGlmICgoaSArIDEpICUgdGhpcy53aWR0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGxldCBiciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKTtcbiAgICAgICAgICAgICAgICBici5zZXRBdHRyaWJ1dGUoJ3Nsb3QnLCAnYnJpY2snKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZENoaWxkKGJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyBhIGdhbWUsIHBsYXlzIGl0IHRocm91Z2gsIHNhdmVzIHRoZSByZXN1bHQgYW5kXG4gICAgICogdGhlbiBkaXNwbGF5cyB0aGUgb3V0cm8uXG4gICAgICovXG4gICAgcGxheSgpIHtcbiAgICAgICAgdGhpcy5zaHVmZmxlKCk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI2ludHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblwiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI291dHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy50aW1lci5zdGFydCgwKTtcbiAgICAgICAgdGhpcy50aW1lci5kaXNwbGF5KHRoaXMudGltZXNwYW4pO1xuICAgICAgICBwbGF5R2FtZSh0aGlzLnNldCwgdGhpcylcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGltZSA9IHRoaXMudGltZXIuc3RvcCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI2ludHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNtYWluXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXN0YXJ0cyB0aGUgZ2FtZSB3aXRoIHRoZSBzYW1lIHNpemUgb2YgYm9hcmQgd2l0aG91dCByZS1yZW5kZXJpbmdcbiAgICAgKi9cbiAgICByZXBsYXkoKSB7XG4gICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjaW50cm9cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNtYWluXCIpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjb3V0cm9cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnBsYXkoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIGdhbWUgYW5kIHRoZW4gbGV0cyB0aGUgdXNlciBjaG9vc2UgYSBuZXcgZ2FtZSBzaXplIGFuZFxuICAgICAqIHVzZXIgbmFtZSwgcmUtcmVuZGVyaW5nIHRoZSBib2FyZC5cbiAgICAgKi9cbiAgICByZXN0YXJ0KCkge1xuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI2ludHJvXCIpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoXCIjbWFpblwiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI291dHJvXCIpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIGdhbWUgdG8gbWFrZSBpdCBwbGF5YWJsZSBhZ2Fpbi4gUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnNcbiAgICAgKiBhbmQgdHVybnMgdGhlIGJyaWNrcyBvdmVyLlxuICAgICAqL1xuICAgIHJlc2V0KCkge1xuICAgICAgICBsZXQgYnJpY2tzID0gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKCdbc2xvdD1cImJyaWNrXCJdJyk7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoYnJpY2tzLCAoYnJpY2spID0+IHtcbiAgICAgICAgICAgIGJyaWNrLnJlbW92ZUF0dHJpYnV0ZSgnaGlkZGVuJyk7XG4gICAgICAgICAgICBsZXQgaW1nID0gYnJpY2sucXVlcnlTZWxlY3RvcihcImltZ1wiKTtcbiAgICAgICAgICAgIGlmIChpbWcpIHtcbiAgICAgICAgICAgICAgICBsZXQgYnJpY2tOdW1iZXIgPSBpbWcuZ2V0QXR0cmlidXRlKFwiYnJpY2tOdW1iZXJcIik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2V0W2JyaWNrTnVtYmVyXS5kcmF3KCkgIT09IDApIHsgLy90dXJuIHRoZSBicmljayBvdmVyIGlmIGl0J3Mgbm90IHR1cm5lZFxuICAgICAgICAgICAgICAgICAgICBpbWcuc3JjID0gJy9pbWFnZS9tZW1vcnktYnJpY2stJyArIHRoaXMuc2V0W2JyaWNrTnVtYmVyXS50dXJuKCkgKyAnLnBuZyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50aW1lc3Bhbi50ZXh0Q29udGVudCA9ICcnO1xuICAgICAgICB0aGlzLnR1cm5zcGFuLnRleHRDb250ZW50ID0gJyc7XG4gICAgICAgIHRoaXMudGltZXIuc3RvcCgpOyAvL21ha2Ugc3VyZSB0aW1lciBpcyBzdG9wcGVkXG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjYm9hcmQnKS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdGhpcy5nYW1lUGxheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5kcyB0aGUgZ2FtZSBhbmQgZGlzcGxheXMgdGhlIG91dHJvLlxuICAgICAqL1xuICAgIGVuZCgpIHtcbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNpbnRyb1wiKS5jbGFzc0xpc3QuYWRkKCdoaWRlJyk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKFwiI21haW5cIikuY2xhc3NMaXN0LmFkZCgnaGlkZScpO1xuICAgICAgICB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihcIiNvdXRyb1wiKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgfVxufVxuXG4vL2RlZmluZXMgdGhlIGVsZW1lbnRcbmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbWVtb3J5LWdhbWUnLCBNZW1vcnlHYW1lKTtcblxuXG4vKipcbiAqIEEgY2xhc3MgQnJpY2sgdG8gZ28gd2l0aCB0aGUgbWVtb3J5IGdhbWUuXG4gKi9cbmNsYXNzIEJyaWNrIHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgdGhlIEJyaWNrIHdpdGggYSB2YWx1ZSBhbmQgcGxhY2VzIGl0IGZhY2Vkb3duLlxuICAgICAqIEBwYXJhbSBudW1iZXIge251bWJlcn0gdGhlIHZhbHVlIHRvIGluaXRpYXRlLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG51bWJlcikge1xuICAgICAgICB0aGlzLnZhbHVlID0gbnVtYmVyO1xuICAgICAgICB0aGlzLmZhY2Vkb3duID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUdXJucyB0aGUgYnJpY2sgYW5kIHJldHVybnMgdGhlIHZhbHVlIGFmdGVyIHRoZSB0dXJuLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSB2YWx1ZSBvZiB0aGUgYnJpY2sgaWYgaXQncyBmYWNldXAsIG90aGVyd2lzZSAwLlxuICAgICAqL1xuICAgIHR1cm4oKSB7XG4gICAgICAgIHRoaXMuZmFjZWRvd24gPSAhKHRoaXMuZmFjZWRvd24pO1xuICAgICAgICByZXR1cm4gdGhpcy5kcmF3KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcGFyZXMgdHdvIGJyaWNrcy5cbiAgICAgKiBAcGFyYW0gb3RoZXIge0JyaWNrfSB0aGUgQnJpY2sgdG8gY29tcGFyZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgYnJpY2tzIHZhbHVlcyBhcmUgZXF1YWwuXG4gICAgICovXG4gICAgZXF1YWxzKG90aGVyKSB7XG4gICAgICAgIHJldHVybiAob3RoZXIgaW5zdGFuY2VvZiBCcmljaykgJiYgKHRoaXMudmFsdWUgPT09IG90aGVyLnZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9uZXMgdGhlIGJyaWNrLlxuICAgICAqIEByZXR1cm5zIHtCcmlja30gdGhlIGNsb25lLlxuICAgICAqL1xuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gbmV3IEJyaWNrKHRoaXMudmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBicmljaydzIHZhbHVlLCBvciAwIGlmIGl0IGlzIGZhY2UgZG93bi5cbiAgICAgKi9cbiAgICBkcmF3KCkge1xuICAgICAgICBpZiAodGhpcy5mYWNlZG93bikge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgc2V0cyB1cCB0aGUgZ2FtZXBsYXkuIEFkZHMgYW5kIHJlbW92ZXMgZXZlbnQtbGlzdGVuZXJzIHNvIHRoYXQgdGhlIHNhbWUgZ2FtZSBjYW4gYmUgcmVzZXQuXG4gKiBAcGFyYW0gc2V0IFt7QnJpY2tdfSB0aGUgc2V0IG9mIGJyaWNrcyB0byBwbGF5IHdpdGguXG4gKiBAcGFyYW0gZ2FtZSB7bm9kZX0gdGhlIHNwYWNlIHRvIHBsYXlcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSByZXN1bHQgb2YgdGhlIGdhbWUgd2hlbiB0aGUgZ2FtZSBoYXMgYmVlbiBwbGF5ZWQuXG4gKi9cbmZ1bmN0aW9uIHBsYXlHYW1lKHNldCwgZ2FtZSkge1xuICAgIGxldCB0dXJucyA9IDA7XG4gICAgbGV0IGJyaWNrcyA9IHBhcnNlSW50KGdhbWUud2lkdGgpICogcGFyc2VJbnQoZ2FtZS5oZWlnaHQpO1xuICAgIGxldCBib2FyZCA9IGdhbWUuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjYm9hcmQnKTtcbiAgICBsZXQgYnJpY2tzTGVmdCA9IGJyaWNrcztcbiAgICBsZXQgY2hvaWNlMTtcbiAgICBsZXQgY2hvaWNlMjtcbiAgICBsZXQgaW1nMTtcbiAgICBsZXQgaW1nMjtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGdhbWUuZ2FtZVBsYXkgPSBmdW5jdGlvbihldmVudCkgeyAvL2V4cG9zZSB0aGUgcmVmZXJlbmNlIHNvIHRoZSBldmVudCBsaXN0ZW5lciBjYW4gYmUgcmVtb3ZlZCBmcm9tIG91dHNpZGUgdGhlIGZ1bmN0aW9uXG4gICAgICAgICAgICBpZiAoIWNob2ljZTIpIHsgLy9pZiB0d28gYnJpY2tzIGFyZSBub3QgdHVybmVkXG4gICAgICAgICAgICAgICAgbGV0IGltZyA9IGV2ZW50LnRhcmdldC5xdWVyeVNlbGVjdG9yKFwiaW1nXCIpIHx8IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgICAgICBsZXQgYnJpY2tOdW1iZXIgPSBpbWcuZ2V0QXR0cmlidXRlKFwiYnJpY2tOdW1iZXJcIik7XG4gICAgICAgICAgICAgICAgaWYgKCFicmlja051bWJlcikgeyAvL3RhcmdldCBpcyBub3QgYSBicmlja1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGJyaWNrID0gc2V0W2JyaWNrTnVtYmVyXTtcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gJy9pbWFnZS8nICsgYnJpY2sudHVybigpICsgJy5wbmcnO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFjaG9pY2UxKSB7IC8vZmlyc3QgYnJpY2sgdG8gYmUgdHVybmVkXG4gICAgICAgICAgICAgICAgICAgIGltZzEgPSBpbWc7XG4gICAgICAgICAgICAgICAgICAgIGNob2ljZTEgPSBicmljaztcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvL3NlY29uZCBicmljayB0byBiZSB0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgaW1nMiA9IGltZztcbiAgICAgICAgICAgICAgICAgICAgY2hvaWNlMiA9IGJyaWNrO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaG9pY2UxLmVxdWFscyhjaG9pY2UyKSAmJiBpbWcxLmdldEF0dHJpYnV0ZSgnYnJpY2tOdW1iZXInKSAhPT0gaW1nMi5nZXRBdHRyaWJ1dGUoJ2JyaWNrTnVtYmVyJykpIHsgLy90aGUgdHdvIGJyaWNrcyBhcmUgZXF1YWwgYnV0IG5vdCB0aGUgc2FtZVxuICAgICAgICAgICAgICAgICAgICAgICAgaW1nMS5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdoaWRkZW4nLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcyLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hpZGRlbicsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTEgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hvaWNlMiA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWcxID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltZzIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJpY2tzTGVmdCAtPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJyaWNrc0xlZnQgPT09IDApIHsgLy9hbGwgYnJpY2tzIGFyZSB0dXJuZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHt0dXJuczogdHVybnN9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy9icmlja3MgYXJlIG5vdCB0aGUgc2FtZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nMS5zcmMgPSAnL2ltYWdlLycgKyBjaG9pY2UxLnR1cm4oKSArICcucG5nJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWcyLnNyYyA9ICcvaW1hZ2UvJyArIGNob2ljZTIudHVybigpICsgJy5wbmcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTEgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZTIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZzEgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZzIgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0dXJucyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBnYW1lLnR1cm5zcGFuLnRleHRDb250ZW50ID0gdHVybnM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgYm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGdhbWUuZ2FtZVBsYXkpO1xuXG4gICAgfSk7XG5cbn1cbiIsIi8qKlxuICogTW9kdWxlIGZvciBUaW1lci5cbiAqXG4gKiBAYXV0aG9yIE1vbGx5IEFyaGFtbWFyXG4gKiBAdmVyc2lvbiAxLjAuMFxuICovXG5cbmNsYXNzIFRpbWVyIHtcbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZXMgYSBUaW1lci5cbiAgICAgKiBAcGFyYW0gc3RhcnRUaW1lIHtudW1iZXJ9IHdoZXJlIHRvIHN0YXJ0IGNvdW50aW5nLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHN0YXJ0VGltZSA9IDApIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IHN0YXJ0VGltZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgY291bnRcbiAgICAgKi9cbiAgICBnZXQgdGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY291bnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdGltZSBvbiB0aGUgdGltZXIuXG4gICAgICogQHBhcmFtIG5ld1RpbWUge251bWJlcn0gdGhlIG5ldyB0aW1lXG4gICAgICovXG4gICAgc2V0IHRpbWUobmV3VGltZSkge1xuICAgICAgICB0aGlzLmNvdW50ID0gbmV3VGltZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogc3RhcnRzIHRoZSB0aW1lci4gaW5jcmVtZW50cyB0aW1lIGV2ZXJ5IDEwMCBtaWxsaXNlY29uZHMuXG4gICAgICogQHBhcmFtIHRpbWUge251bWJlcn0gd2hhdCBudW1iZXIgdG8gc3RhcnQgaXQgb24uXG4gICAgICovXG4gICAgc3RhcnQodGltZSA9IHRoaXMudGltZSkge1xuICAgICAgICB0aGlzLmNvdW50ID0gdGltZTtcbiAgICAgICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY291bnQgKz0gMTAwO1xuICAgICAgICB9LCAxMDApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBzdGFydHMgdGhlIHRpbWVyLiBkZWNyZW1lbnRzIHRpbWUgZXZlcnkgMTAwIG1pbGxpc2Vjb25kcy5cbiAgICAgKiBAcGFyYW0gdGltZSB7bnVtYmVyfSB3aGF0IG51bWJlciB0byBzdGFydCBpdCBvbi5cbiAgICAgKi9cbiAgICBjb3VudGRvd24odGltZSkge1xuICAgICAgICB0aGlzLmNvdW50ID0gdGltZSB8fCB0aGlzLmNvdW50O1xuICAgICAgICB0aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb3VudCAtPSAxMDA7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHN0b3BzIHRoZSBUaW1lci5cbiAgICAgKiBAcmV0dXJucyB0aGUgY291bnQuXG4gICAgICovXG4gICAgc3RvcCgpIHtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmRpc3BsYXlJbnRlcnZhbCk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvdW50O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEaXNwbGF5cyBhIHJvdW5kZWQgdmFsdWUgb2YgdGhlIGNvdW50IG9mIHRoZSB0aW1lclxuICAgICAqIHRvIHRoZSBkZXNpcmVkIHByZWNpc2lvbiwgYXQgYW4gaW50ZXJ2YWwuXG4gICAgICogQHBhcmFtIGRlc3RpbmF0aW9uIHtub2RlfSB3aGVyZSB0byBtYWtlIHRoZSBkaXNwbGF5XG4gICAgICogQHBhcmFtIGludGVydmFsIHtudW1iZXJ9IHRoZSBpbnRlcnZhbCB0byBtYWtlIHRoZSBkaXNwbGF5IGluLCBpbiBtaWxsaXNlY29uZHNcbiAgICAgKiBAcGFyYW0gcHJlY2lzaW9uIHtudW1iZXJ9dGhlIG51bWJlciB0byBkaXZpZGUgdGhlIGRpc3BsYXllZCBtaWxsaXNlY29uZHMgYnlcbiAgICAgKiBAcmV0dXJucyB0aGUgaW50ZXJ2YWwuXG4gICAgICpcbiAgICAgKi9cbiAgICBkaXNwbGF5KGRlc3RpbmF0aW9uLCBpbnRlcnZhbCA9IDEwMCwgcHJlY2lzaW9uID0gMTAwMCkge1xuICAgICAgICB0aGlzLmRpc3BsYXlJbnRlcnZhbCA9IHNldEludGVydmFsKCAoKT0+IHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnRleHRDb250ZW50ID0gTWF0aC5yb3VuZCh0aGlzLmNvdW50IC8gcHJlY2lzaW9uKTtcbiAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICByZXR1cm4gdGhpcy5kaXNwbGF5SW50ZXJ2YWw7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xuIl19
