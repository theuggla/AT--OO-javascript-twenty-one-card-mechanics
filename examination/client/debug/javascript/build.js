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
         link.setAttribute("href", "/window.html");
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
//requires
let Menu = require("./../menu.js");
let desktop = require("./desktop.js");

//ÄR DETTA VARFÖR DET FUNKAR MED MENYN MÅSTE KOLLA SEN
//nodes


//variables




},{"./../menu.js":5,"./desktop.js":4}],4:[function(require,module,exports){
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


},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvSFRNTFV0aWwuanMiLCJjbGllbnQvc291cmNlL2pzL1dpbmRvd01hbmFnZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvZGVza3RvcC5qcyIsImNsaWVudC9zb3VyY2UvbWVudS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbipcbiovXG5cblxuZnVuY3Rpb24gbWFrZURyYWdnYWJsZShlbCwgY29udGFpbmVyKSB7XG4gICAgbGV0IGFycm93RHJhZztcbiAgICBsZXQgbW91c2VEcmFnO1xuICAgIGxldCBkcmFnb2Zmc2V0ID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgfTtcblxuICAgIGxldCBldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoZWwsICdmb2N1c2luIG1vdXNlZG93bicsIChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgYXJyb3dEcmFnID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2Vkb3duJykge1xuICAgICAgICAgICAgICAgIG1vdXNlRHJhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgZHJhZ29mZnNldC54ID0gZXZlbnQucGFnZVggLSBlbC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGRyYWdvZmZzZXQueSA9IGV2ZW50LnBhZ2VZIC0gZWwub2Zmc2V0VG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGVsLCAnZm9jdXNvdXQgbW91c2V1cCcsIChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2V1cCcpIHtcbiAgICAgICAgICAgICAgICBpZiAobW91c2VEcmFnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vdXNlRHJhZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyb3dEcmFnID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoZG9jdW1lbnQsICdtb3VzZW1vdmUga2V5ZG93bicsICgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHt9O1xuXG4gICAgICAgICAgICBpZiAobW91c2VEcmFnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAoZXZlbnQucGFnZVkgLSBkcmFnb2Zmc2V0LnkpO1xuICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gKGV2ZW50LnBhZ2VYIC0gZHJhZ29mZnNldC54KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJyb3dEcmFnKSB7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9IHBhcnNlSW50KGVsLnN0eWxlLnRvcC5zbGljZSgwLCAtMikpO1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSBwYXJzZUludChlbC5zdHlsZS5sZWZ0LnNsaWNlKDAsIC0yKSk7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgLT0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSArPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54IC09IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dSaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtb3VzZURyYWcgfHwgYXJyb3dEcmFnKSB7XG4gICAgICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IHdpdGhpbkJvdW5kcyhlbCwgY29udGFpbmVyLCBkZXN0aW5hdGlvbikgPyBkZXN0aW5hdGlvbi54ICArIFwicHhcIiA6IGVsLnN0eWxlLmxlZnQ7XG4gICAgICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gd2l0aGluQm91bmRzKGVsLCBjb250YWluZXIsIGRlc3RpbmF0aW9uKSA/IGRlc3RpbmF0aW9uLnkgICsgXCJweFwiIDogZWwuc3R5bGUudG9wICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgZWwuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgZXZlbnRzKCk7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzKGVsZW1lbnQsIGV2ZW50cywgaGFuZGxlcikge1xuICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSk7XG59XG5cbmZ1bmN0aW9uIHdpdGhpbkJvdW5kcyhlbGVtZW50LCBjb250YWluZXIsIGNvb3Jkcykge1xuICAgIGxldCBtaW5YID0gY29udGFpbmVyLm9mZnNldExlZnQ7XG4gICAgbGV0IG1heFggPSAobWluWCArIGNvbnRhaW5lci5jbGllbnRXaWR0aCkgLSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuICAgIGxldCBtaW5ZID0gY29udGFpbmVyLm9mZnNldFRvcDtcbiAgICBsZXQgbWF4WSA9IChtaW5ZICsgY29udGFpbmVyLmNsaWVudEhlaWdodCkgLSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcblxuICAgIHJldHVybiAoY29vcmRzLnggPD0gbWF4WCAmJiBjb29yZHMueCA+PSBtaW5YICYmIGNvb3Jkcy55IDw9IG1heFkgJiYgY29vcmRzLnkgPj0gbWluWSk7XG59XG5cbi8vZXhwb3J0c1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbWFrZURyYWdnYWJsZTogbWFrZURyYWdnYWJsZSxcbiAgICBhZGRFdmVudExpc3RlbmVyczogYWRkRXZlbnRMaXN0ZW5lcnMsXG4gICAgd2l0aGluQm91bmRzOiB3aXRoaW5Cb3VuZHNcbn07XG4iLCJmdW5jdGlvbiBXaW5kb3dNYW5hZ2VyKHdpbmRvd1NwYWNlKSB7XG4gICAgbGV0IHdtID0ge307XG5cbiAgICBjbGFzcyBXaW5kb3dNYW5hZ2VyIHtcblxuICAgICAgICBjb25zdHJ1Y3Rvcih3aW5kb3dTcGFjZSkge1xuICAgICAgICAgICAgd20uc3RhcnRYID0gd2luZG93U3BhY2Uub2Zmc2V0TGVmdCArIDIwO1xuICAgICAgICAgICAgd20uc3RhcnRZID0gd2luZG93U3BhY2Uub2Zmc2V0VG9wICsgMjA7XG4gICAgICAgICAgICB3bS50eXBlcyA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGVXaW5kb3codHlwZSkge1xuICAgICAgICAgICAgbGV0IGFXaW5kb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZHJhZ2dhYmxlLXdpbmRvd1wiKTtcblxuICAgICAgICAvKm1ha2UgdGVtcGxhdGUsIGlmIG5vIHdpbmRvd3Mgb3BlbiBvZiBraW5kIGV0Y1xuICAgICAgICAgbGV0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcbiAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwicmVsXCIsIFwiaW1wb3J0XCIpO1xuICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiL3dpbmRvdy5odG1sXCIpO1xuICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgIGV2ZW50LnRhcmdldC5zZXRBdHRyaWJ1dGUoXCJsYWJlbFwiLCB0eXBlKTsqL1xuXG4gICAgICAgICAgICB3aW5kb3dTcGFjZS5hcHBlbmRDaGlsZChhV2luZG93KTtcbiAgICAgICAgICAgIHNldHVwU3BhY2UodHlwZSwgYVdpbmRvdyk7XG5cbiAgICAgICAgICAgIGlmICh3bVt0eXBlXS5vcGVuKSB7XG4gICAgICAgICAgICAgICAgd21bdHlwZV0ub3Blbi5wdXNoKGFXaW5kb3cpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuID0gW2FXaW5kb3ddO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYVdpbmRvdztcbiAgICAgICAgfVxuXG4gICAgICAgIG9wZW4odHlwZSkge1xuICAgICAgICAgICAgaWYgKHdtW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCB3aW5kb3dzID0gd21bdHlwZV0ub3BlbjtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB3aW5kb3dzLmZpbHRlciggKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHcub3BlbjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZXhwYW5kKHR5cGUpIHtcbiAgICAgICAgICAgIGxldCB3aW5zID0gdGhpcy5vcGVuKHR5cGUpO1xuICAgICAgICAgICAgaWYgKHdpbnMpIHtcbiAgICAgICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdy5taW5pbWl6ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG1pbmltaXplKHR5cGUpIHtcbiAgICAgICAgICAgIGxldCB3aW5zID0gdGhpcy5vcGVuKHR5cGUpO1xuICAgICAgICAgICAgaWYgKHdpbnMpIHtcbiAgICAgICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdy5taW5pbWl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBjbG9zZSh0eXBlKSB7XG4gICAgICAgICAgICBsZXQgd2lucyA9IHRoaXMub3Blbih0eXBlKTtcbiAgICAgICAgICAgIGlmICh3aW5zKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cod2lucyk7XG4gICAgICAgICAgICAgICAgd2lucy5mb3JFYWNoKCh3KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHcuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgV2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSk7XG5cbiAgICAvL2hlbHBlciBmdW5jdGlvbnNcbiAgICBmdW5jdGlvbiBzZXR1cFNwYWNlKHR5cGUsIHNwYWNlKSB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHt9O1xuICAgICAgICBsZXQgeDtcbiAgICAgICAgbGV0IHk7XG5cbiAgICAgICAgaWYgKHdtW3R5cGVdKSB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gKHdtW3R5cGVdLmxhdGVzdENvb3Jkcy54ICs9IDUwKTtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAod21bdHlwZV0ubGF0ZXN0Q29vcmRzLnkgKz0gNTApO1xuXG4gICAgICAgICAgICBpZiAoISh3aXRoaW5Cb3VuZHMoc3BhY2UsIHdpbmRvd1NwYWNlLCBkZXN0aW5hdGlvbikpKSB7XG4gICAgICAgICAgICAgICAgeCA9IHdtW3R5cGVdLnN0YXJ0Q29vcmRzLnggKz0gNTtcbiAgICAgICAgICAgICAgICB5ID0gd21bdHlwZV0uc3RhcnRDb29yZHMueSArPSA1O1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLmxhdGVzdENvb3Jkcy54ID0geDtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5sYXRlc3RDb29yZHMueSA9IHk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHggPSBkZXN0aW5hdGlvbi54O1xuICAgICAgICAgICAgICAgIHkgPSBkZXN0aW5hdGlvbi55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gKHdtLnN0YXJ0WCArICg2MCAqIHdtLnR5cGVzKSk7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gKHdtLnN0YXJ0WSk7XG5cbiAgICAgICAgICAgIGlmICghKHdpdGhpbkJvdW5kcyhzcGFjZSwgd2luZG93U3BhY2UsIGRlc3RpbmF0aW9uKSkpIHtcbiAgICAgICAgICAgICAgICB4ID0gd20uc3RhcnRYO1xuICAgICAgICAgICAgICAgIHkgPSB3bS5zdGFydFk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHggPSBkZXN0aW5hdGlvbi54O1xuICAgICAgICAgICAgICAgIHkgPSBkZXN0aW5hdGlvbi55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3bVt0eXBlXSA9IHt9O1xuICAgICAgICAgICAgd21bdHlwZV0uc3RhcnRDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd21bdHlwZV0ubGF0ZXN0Q29vcmRzID0ge1xuICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgeTogeVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdtLnR5cGVzICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgc3BhY2UudGFiSW5kZXggPSAwO1xuICAgICAgICBzcGFjZS5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xuICAgICAgICBzcGFjZS5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3aXRoaW5Cb3VuZHMoZWxlbWVudCwgY29udGFpbmVyLCBjb29yZHMpIHtcbiAgICAgICAgbGV0IG1pblggPSBjb250YWluZXIub2Zmc2V0TGVmdDtcbiAgICAgICAgbGV0IG1heFggPSAobWluWCArIGNvbnRhaW5lci5jbGllbnRXaWR0aCkgLSAoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCk7XG4gICAgICAgIGxldCBtaW5ZID0gY29udGFpbmVyLm9mZnNldFRvcDtcbiAgICAgICAgbGV0IG1heFkgPSAobWluWSArIGNvbnRhaW5lci5jbGllbnRIZWlnaHQpIC0gKGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0KTtcblxuICAgICAgICByZXR1cm4gKGNvb3Jkcy54IDw9IG1heFggJiYgY29vcmRzLnggPj0gbWluWCAmJiBjb29yZHMueSA8PSBtYXhZICYmIGNvb3Jkcy55ID49IG1pblkpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXaW5kb3dNYW5hZ2VyO1xuXG4iLCIvL3JlcXVpcmVzXG5sZXQgTWVudSA9IHJlcXVpcmUoXCIuLy4uL21lbnUuanNcIik7XG5sZXQgZGVza3RvcCA9IHJlcXVpcmUoXCIuL2Rlc2t0b3AuanNcIik7XG5cbi8vw4RSIERFVFRBIFZBUkbDllIgREVUIEZVTktBUiBNRUQgTUVOWU4gTcOFU1RFIEtPTExBIFNFTlxuLy9ub2Rlc1xuXG5cbi8vdmFyaWFibGVzXG5cblxuXG4iLCIvL3JlcXVpcmVzXG5sZXQgdSA9IHJlcXVpcmUoXCIuL0hUTUxVdGlsLmpzXCIpO1xubGV0IFdpbmRvd01hbmFnZXIgPSByZXF1aXJlKFwiLi9XaW5kb3dNYW5hZ2VyLmpzXCIpO1xuXG5cbi8vbm9kZXNcbmxldCBtYWluTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjd2luZG93U2VsZWN0b3JcIik7XG5sZXQgd2luZG93U3BhY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI29wZW5XaW5kb3dzXCIpO1xubGV0IHN1Yk1lbnVUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3ViTWVudVwiKTtcblxuLy92YXJpYWJsZXNcbmxldCBXTSA9IFdpbmRvd01hbmFnZXIod2luZG93U3BhY2UpO1xubGV0IHRvcCA9IDE7XG5cbkFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobWFpbk1lbnUuY2hpbGRyZW4sIChub2RlKSA9PiB7XG4gICAgYWRkU3ViTWVudShub2RlKTtcbn0pO1xuXG5tYWluTWVudS5hZGRFdmVudExpc3RlbmVyKCdkYmxjbGljaycsIChldmVudCkgPT4ge1xuICAgIGxldCB0eXBlID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEta2luZFwiKSB8fCBldmVudC50YXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLWtpbmRcIik7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgICAgV00uY3JlYXRlV2luZG93KHR5cGUpLmZvY3VzKCk7XG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59KTtcblxuYWRkRXZlbnRMaXN0ZW5lcnMobWFpbk1lbnUsICdjbGljayBmb2N1c291dCcsIChldmVudCkgPT4ge1xuICAgIGxldCBtYWluTWVudUl0ZW1zID0gbWFpbk1lbnUucXVlcnlTZWxlY3RvckFsbCgnZXhwYW5kYWJsZS1tZW51LWl0ZW0nKTtcbiAgICBtYWluTWVudUl0ZW1zLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKChpdGVtICE9PSBldmVudC50YXJnZXQgJiYgaXRlbSAhPT0gZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQpICYmIChpdGVtLmRpc3BsYXlpbmdTdWJNZW51KSkge1xuICAgICAgICAgICAgaXRlbS50b2dnbGVTdWJNZW51KGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0pXG59KTtcblxud2luZG93U3BhY2UuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoZXZlbnQpID0+IHtcbiAgICBldmVudC50YXJnZXQuc3R5bGUuekluZGV4ID0gdG9wO1xuICAgIHRvcCArPSAxO1xufSwgdHJ1ZSk7XG5cbmZ1bmN0aW9uIGFkZFN1Yk1lbnUoaXRlbSkge1xuICAgIGxldCBpbnN0YW5jZSA9IGRvY3VtZW50LmltcG9ydE5vZGUoc3ViTWVudVRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGxldCBsYWJlbCA9IGl0ZW0uZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuXG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChpbnN0YW5jZS5jaGlsZHJlbiwgKG5vZGUpID0+IHtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoJ2xhYmVsJywgbGFiZWwpO1xuICAgIH0pO1xuXG4gICAgaXRlbS5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG5cbiAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgIHN3aXRjaCAoZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10YXNrJykpIHtcbiAgICAgICAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICAgICAgICAgIFdNLmNyZWF0ZVdpbmRvdyhsYWJlbCkuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Nsb3NlJzpcbiAgICAgICAgICAgICAgICBXTS5jbG9zZShsYWJlbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdtaW5pbWl6ZSc6XG4gICAgICAgICAgICAgICAgV00ubWluaW1pemUobGFiZWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXhwYW5kJzpcbiAgICAgICAgICAgICAgICBXTS5leHBhbmQobGFiZWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ2NsaWNrJykge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyAoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cbiIsIlxuIl19
