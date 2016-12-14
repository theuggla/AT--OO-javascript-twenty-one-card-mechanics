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
    let maxX = (minX + container.clientWidth) - element.clientWidth;
    let minY = container.offsetTop;
    let maxY = (minY + container.clientHeight) - element.clientHeight;

    return (coords.x <= maxX && coords.x >= minX && coords.y <= maxY && coords.y >= minY);
}



//exports
module.exports = {
    makeDraggable: makeDraggable,
    addEventListeners: addEventListeners,
    withinBounds: withinBounds
};

},{}],2:[function(require,module,exports){
let Window = require("./window.js");
let u = require("./HTMLUtil.js");

function WindowManager(windowSpace) {
    let wm = {};

    class WindowManager {

        constructor(windowSpace) {
            wm.startX = windowSpace.offsetLeft + 20;
            wm.startY = windowSpace.offsetTop + 20;
            wm.types = 0;
        }

        createWindow(type, space) {
            let window = Window(type);
            setupSpace(type, space);

            if (wm[type].open) {
                wm[type].open.push(window);
            } else {
                wm[type].open = [window];
            }

            return window;
        }
    }

    return new WindowManager(windowSpace);

    //helper function
    function setupSpace(type, space) {
        let destination = {};
        let x;
        let y;

        if (wm[type]) {
            destination.x = (wm[type].latestCoords.x + 50);
            destination.y = (wm[type].latestCoords.y + 50);

            if (!(u.withinBounds(space, windowSpace, destination))) {
                x = wm[type].startCoords.x += 5;
                y = wm[type].startCoords.y += 5;
            } else {
                x = destination.x;
                y = destination.y;
            }

            wm[type].latestCoords.x = x;
            wm[type].latestCoords.y = y;

        } else {
            destination.x = (wm.startX + (60 * wm.types));
            destination.y = (wm.startY);

            if (!(u.withinBounds(space, windowSpace, destination))) {
                x = wm.startX;
                y = wm.startY;
            } else {
                x = destination.x;
                y = destination.y;
            }

            wm[type] = {};
            wm[type].latestCoords = {
                x: x,
                y: y
            };
            wm[type].startCoords = {
                x: x,
                y: y
            };
            wm.types += 1;
        }
        space.tabIndex = 0;
        space.style.top = y + "px";
        space.style.left = x + "px";
    }
}

module.exports = WindowManager;


},{"./HTMLUtil.js":1,"./window.js":6}],3:[function(require,module,exports){
//requires
let Menu = require("./menu.js");
let desktop = require("./desktop.js");

//nodes


//variables




},{"./desktop.js":4,"./menu.js":5}],4:[function(require,module,exports){
//requires
let Menu = require("./menu.js");
let u = require("./HTMLUtil.js");
let WindowManager = require("./WindowManager.js");


//nodes
let mainMenu = document.querySelector("#windowSelector");
let windowTemp = document.querySelector("#windowTemplate").content;
let windowSpace = document.querySelector("#openWindows");

//variables
let WM = WindowManager(windowSpace);
let top = 1;

mainMenu.addEventListener("click", (event) => {
    let windowDestination = document.importNode(windowTemp.firstElementChild, true);
    let type = event.target.getAttribute("data-kind");
    windowSpace.appendChild(windowDestination);
    WM.createWindow(type, windowDestination);
    u.makeDraggable(windowDestination, windowSpace);
    windowDestination.focus();
    event.preventDefault();
});

windowSpace.addEventListener("focus", (event) => {
    event.target.style.zIndex = top;
    top += 1;
}, true);

windowSpace.addEventListener("mousedown", (event) => {
    event.target.focus();
});

},{"./HTMLUtil.js":1,"./WindowManager.js":2,"./menu.js":5}],5:[function(require,module,exports){
function Menu(item) {
    let items = [];

    class Menu {
        constructor(item) {
            items.push(item);
        }

        get items() {
            return items.slice();
        }

        set items(item) {
            items.push(item);
        }
    }

    return new Menu(item);
}


module.exports = Menu;

},{}],6:[function(require,module,exports){
function Window(type) {
    let name;
    let symbol;

    class Window {
        constructor(type) {
            name = type;
        }

        get name() {
            return name;
        }

        set name(name) {

        }

        get menu() {
            return menu.clone();
        }

        set menu(newMenu) {

        }

        addMenuItem(item) {

        }

        removeMenuItem(item) {

        }
    }

    return new Window(type)
}


module.exports = Window;

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvSFRNTFV0aWwuanMiLCJjbGllbnQvc291cmNlL2pzL1dpbmRvd01hbmFnZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvZGVza3RvcC5qcyIsImNsaWVudC9zb3VyY2UvanMvbWVudS5qcyIsImNsaWVudC9zb3VyY2UvanMvd2luZG93LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbipcbiovXG5cblxuZnVuY3Rpb24gbWFrZURyYWdnYWJsZShlbCwgY29udGFpbmVyKSB7XG4gICAgbGV0IGFycm93RHJhZztcbiAgICBsZXQgbW91c2VEcmFnO1xuICAgIGxldCBkcmFnb2Zmc2V0ID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgfTtcblxuICAgIGxldCBldmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoZWwsICdmb2N1c2luIG1vdXNlZG93bicsIChmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgYXJyb3dEcmFnID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2Vkb3duJykge1xuICAgICAgICAgICAgICAgIG1vdXNlRHJhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgZHJhZ29mZnNldC54ID0gZXZlbnQucGFnZVggLSBlbC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIGRyYWdvZmZzZXQueSA9IGV2ZW50LnBhZ2VZIC0gZWwub2Zmc2V0VG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGVsLCAnZm9jdXNvdXQgbW91c2V1cCcsIChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2V1cCcpIHtcbiAgICAgICAgICAgICAgICBpZiAobW91c2VEcmFnKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vdXNlRHJhZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyb3dEcmFnID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoZG9jdW1lbnQsICdtb3VzZW1vdmUga2V5ZG93bicsICgoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHt9O1xuXG4gICAgICAgICAgICBpZiAobW91c2VEcmFnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAoZXZlbnQucGFnZVkgLSBkcmFnb2Zmc2V0LnkpO1xuICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gKGV2ZW50LnBhZ2VYIC0gZHJhZ29mZnNldC54KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJyb3dEcmFnKSB7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9IHBhcnNlSW50KGVsLnN0eWxlLnRvcC5zbGljZSgwLCAtMikpO1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSBwYXJzZUludChlbC5zdHlsZS5sZWZ0LnNsaWNlKDAsIC0yKSk7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgLT0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSArPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54IC09IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dSaWdodCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtb3VzZURyYWcgfHwgYXJyb3dEcmFnKSB7XG4gICAgICAgICAgICAgICAgZWwuc3R5bGUubGVmdCA9IHdpdGhpbkJvdW5kcyhlbCwgY29udGFpbmVyLCBkZXN0aW5hdGlvbikgPyBkZXN0aW5hdGlvbi54ICArIFwicHhcIiA6IGVsLnN0eWxlLmxlZnQ7XG4gICAgICAgICAgICAgICAgZWwuc3R5bGUudG9wID0gd2l0aGluQm91bmRzKGVsLCBjb250YWluZXIsIGRlc3RpbmF0aW9uKSA/IGRlc3RpbmF0aW9uLnkgICsgXCJweFwiIDogZWwuc3R5bGUudG9wICsgXCJweFwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgZWwuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgZXZlbnRzKCk7XG59XG5cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzKGVsZW1lbnQsIGV2ZW50cywgaGFuZGxlcikge1xuICAgIGV2ZW50cy5zcGxpdCgnICcpLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyKSk7XG59XG5cbmZ1bmN0aW9uIHdpdGhpbkJvdW5kcyhlbGVtZW50LCBjb250YWluZXIsIGNvb3Jkcykge1xuICAgIGxldCBtaW5YID0gY29udGFpbmVyLm9mZnNldExlZnQ7XG4gICAgbGV0IG1heFggPSAobWluWCArIGNvbnRhaW5lci5jbGllbnRXaWR0aCkgLSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIGxldCBtaW5ZID0gY29udGFpbmVyLm9mZnNldFRvcDtcbiAgICBsZXQgbWF4WSA9IChtaW5ZICsgY29udGFpbmVyLmNsaWVudEhlaWdodCkgLSBlbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgIHJldHVybiAoY29vcmRzLnggPD0gbWF4WCAmJiBjb29yZHMueCA+PSBtaW5YICYmIGNvb3Jkcy55IDw9IG1heFkgJiYgY29vcmRzLnkgPj0gbWluWSk7XG59XG5cblxuXG4vL2V4cG9ydHNcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1ha2VEcmFnZ2FibGU6IG1ha2VEcmFnZ2FibGUsXG4gICAgYWRkRXZlbnRMaXN0ZW5lcnM6IGFkZEV2ZW50TGlzdGVuZXJzLFxuICAgIHdpdGhpbkJvdW5kczogd2l0aGluQm91bmRzXG59O1xuIiwibGV0IFdpbmRvdyA9IHJlcXVpcmUoXCIuL3dpbmRvdy5qc1wiKTtcbmxldCB1ID0gcmVxdWlyZShcIi4vSFRNTFV0aWwuanNcIik7XG5cbmZ1bmN0aW9uIFdpbmRvd01hbmFnZXIod2luZG93U3BhY2UpIHtcbiAgICBsZXQgd20gPSB7fTtcblxuICAgIGNsYXNzIFdpbmRvd01hbmFnZXIge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHdpbmRvd1NwYWNlKSB7XG4gICAgICAgICAgICB3bS5zdGFydFggPSB3aW5kb3dTcGFjZS5vZmZzZXRMZWZ0ICsgMjA7XG4gICAgICAgICAgICB3bS5zdGFydFkgPSB3aW5kb3dTcGFjZS5vZmZzZXRUb3AgKyAyMDtcbiAgICAgICAgICAgIHdtLnR5cGVzID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZVdpbmRvdyh0eXBlLCBzcGFjZSkge1xuICAgICAgICAgICAgbGV0IHdpbmRvdyA9IFdpbmRvdyh0eXBlKTtcbiAgICAgICAgICAgIHNldHVwU3BhY2UodHlwZSwgc3BhY2UpO1xuXG4gICAgICAgICAgICBpZiAod21bdHlwZV0ub3Blbikge1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4ucHVzaCh3aW5kb3cpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuID0gW3dpbmRvd107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB3aW5kb3c7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFdpbmRvd01hbmFnZXIod2luZG93U3BhY2UpO1xuXG4gICAgLy9oZWxwZXIgZnVuY3Rpb25cbiAgICBmdW5jdGlvbiBzZXR1cFNwYWNlKHR5cGUsIHNwYWNlKSB7XG4gICAgICAgIGxldCBkZXN0aW5hdGlvbiA9IHt9O1xuICAgICAgICBsZXQgeDtcbiAgICAgICAgbGV0IHk7XG5cbiAgICAgICAgaWYgKHdtW3R5cGVdKSB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gKHdtW3R5cGVdLmxhdGVzdENvb3Jkcy54ICsgNTApO1xuICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9ICh3bVt0eXBlXS5sYXRlc3RDb29yZHMueSArIDUwKTtcblxuICAgICAgICAgICAgaWYgKCEodS53aXRoaW5Cb3VuZHMoc3BhY2UsIHdpbmRvd1NwYWNlLCBkZXN0aW5hdGlvbikpKSB7XG4gICAgICAgICAgICAgICAgeCA9IHdtW3R5cGVdLnN0YXJ0Q29vcmRzLnggKz0gNTtcbiAgICAgICAgICAgICAgICB5ID0gd21bdHlwZV0uc3RhcnRDb29yZHMueSArPSA1O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB4ID0gZGVzdGluYXRpb24ueDtcbiAgICAgICAgICAgICAgICB5ID0gZGVzdGluYXRpb24ueTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd21bdHlwZV0ubGF0ZXN0Q29vcmRzLnggPSB4O1xuICAgICAgICAgICAgd21bdHlwZV0ubGF0ZXN0Q29vcmRzLnkgPSB5O1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gKHdtLnN0YXJ0WCArICg2MCAqIHdtLnR5cGVzKSk7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gKHdtLnN0YXJ0WSk7XG5cbiAgICAgICAgICAgIGlmICghKHUud2l0aGluQm91bmRzKHNwYWNlLCB3aW5kb3dTcGFjZSwgZGVzdGluYXRpb24pKSkge1xuICAgICAgICAgICAgICAgIHggPSB3bS5zdGFydFg7XG4gICAgICAgICAgICAgICAgeSA9IHdtLnN0YXJ0WTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgeCA9IGRlc3RpbmF0aW9uLng7XG4gICAgICAgICAgICAgICAgeSA9IGRlc3RpbmF0aW9uLnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdtW3R5cGVdID0ge307XG4gICAgICAgICAgICB3bVt0eXBlXS5sYXRlc3RDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd21bdHlwZV0uc3RhcnRDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd20udHlwZXMgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBzcGFjZS50YWJJbmRleCA9IDA7XG4gICAgICAgIHNwYWNlLnN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XG4gICAgICAgIHNwYWNlLnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXaW5kb3dNYW5hZ2VyO1xuXG4iLCIvL3JlcXVpcmVzXG5sZXQgTWVudSA9IHJlcXVpcmUoXCIuL21lbnUuanNcIik7XG5sZXQgZGVza3RvcCA9IHJlcXVpcmUoXCIuL2Rlc2t0b3AuanNcIik7XG5cbi8vbm9kZXNcblxuXG4vL3ZhcmlhYmxlc1xuXG5cblxuIiwiLy9yZXF1aXJlc1xubGV0IE1lbnUgPSByZXF1aXJlKFwiLi9tZW51LmpzXCIpO1xubGV0IHUgPSByZXF1aXJlKFwiLi9IVE1MVXRpbC5qc1wiKTtcbmxldCBXaW5kb3dNYW5hZ2VyID0gcmVxdWlyZShcIi4vV2luZG93TWFuYWdlci5qc1wiKTtcblxuXG4vL25vZGVzXG5sZXQgbWFpbk1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvd1NlbGVjdG9yXCIpO1xubGV0IHdpbmRvd1RlbXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvd1RlbXBsYXRlXCIpLmNvbnRlbnQ7XG5sZXQgd2luZG93U3BhY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI29wZW5XaW5kb3dzXCIpO1xuXG4vL3ZhcmlhYmxlc1xubGV0IFdNID0gV2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSk7XG5sZXQgdG9wID0gMTtcblxubWFpbk1lbnUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuICAgIGxldCB3aW5kb3dEZXN0aW5hdGlvbiA9IGRvY3VtZW50LmltcG9ydE5vZGUod2luZG93VGVtcC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgbGV0IHR5cGUgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1raW5kXCIpO1xuICAgIHdpbmRvd1NwYWNlLmFwcGVuZENoaWxkKHdpbmRvd0Rlc3RpbmF0aW9uKTtcbiAgICBXTS5jcmVhdGVXaW5kb3codHlwZSwgd2luZG93RGVzdGluYXRpb24pO1xuICAgIHUubWFrZURyYWdnYWJsZSh3aW5kb3dEZXN0aW5hdGlvbiwgd2luZG93U3BhY2UpO1xuICAgIHdpbmRvd0Rlc3RpbmF0aW9uLmZvY3VzKCk7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbn0pO1xuXG53aW5kb3dTcGFjZS5hZGRFdmVudExpc3RlbmVyKFwiZm9jdXNcIiwgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQudGFyZ2V0LnN0eWxlLnpJbmRleCA9IHRvcDtcbiAgICB0b3AgKz0gMTtcbn0sIHRydWUpO1xuXG53aW5kb3dTcGFjZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChldmVudCkgPT4ge1xuICAgIGV2ZW50LnRhcmdldC5mb2N1cygpO1xufSk7XG4iLCJmdW5jdGlvbiBNZW51KGl0ZW0pIHtcbiAgICBsZXQgaXRlbXMgPSBbXTtcblxuICAgIGNsYXNzIE1lbnUge1xuICAgICAgICBjb25zdHJ1Y3RvcihpdGVtKSB7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0IGl0ZW1zKCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW1zLnNsaWNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXQgaXRlbXMoaXRlbSkge1xuICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgTWVudShpdGVtKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnU7XG4iLCJmdW5jdGlvbiBXaW5kb3codHlwZSkge1xuICAgIGxldCBuYW1lO1xuICAgIGxldCBzeW1ib2w7XG5cbiAgICBjbGFzcyBXaW5kb3cge1xuICAgICAgICBjb25zdHJ1Y3Rvcih0eXBlKSB7XG4gICAgICAgICAgICBuYW1lID0gdHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBuYW1lKCkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBzZXQgbmFtZShuYW1lKSB7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBtZW51KCkge1xuICAgICAgICAgICAgcmV0dXJuIG1lbnUuY2xvbmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldCBtZW51KG5ld01lbnUpIHtcblxuICAgICAgICB9XG5cbiAgICAgICAgYWRkTWVudUl0ZW0oaXRlbSkge1xuXG4gICAgICAgIH1cblxuICAgICAgICByZW1vdmVNZW51SXRlbShpdGVtKSB7XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgV2luZG93KHR5cGUpXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBXaW5kb3c7XG4iXX0=
