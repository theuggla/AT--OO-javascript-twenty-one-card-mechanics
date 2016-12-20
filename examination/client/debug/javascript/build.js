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
            setupSpace(type, aWindow);
            windowSpace.appendChild(aWindow);

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
            let wins = wm[type].open;
            wins.forEach((w) => {
                w.minimized = false;
            });
        }

        minimize(type) {
            let wins = wm[type].open;
            wins.forEach((w) => {
                w.minimized = true;
            });
        }

        close(type) {
            let wins = wm[type].open;
            wins.forEach((w) => {
                w.close();
            });
        }
    }

    return new WindowManager(windowSpace);

    //helper functions
    function setupSpace(type, space) {
        let destination = {};
        let x;
        let y;

        if (wm[type]) {
            destination.x = (wm[type].startCoords.x + (50 * wm[type].open.length));
            destination.y = (wm[type].startCoords.y + (50 * wm[type].open.length));

            if (!(withinBounds(space, windowSpace, destination))) {
                x = wm[type].startCoords.x += 5;
                y = wm[type].startCoords.y += 5;
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
            wm.types += 1;
        }
        space.tabIndex = 0;
        space.style.top = y + "px";
        space.style.left = x + "px";
    }

    function withinBounds(element, container, coords) {
        let minX = container.offsetLeft;
        let maxX = (minX + container.clientWidth) - element.getBoundingClientRect().width;
        let minY = container.offsetTop;
        let maxY = (minY + container.clientHeight) - element.getBoundingClientRect().height;

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
let mainMenu = document.querySelector("#windowSelector custom-menu");
let windowSpace = document.querySelector("#openWindows");
let subMenu = document.querySelector("#subMenu");

//variables
let WM = WindowManager(windowSpace);
let top = 1;

Array.prototype.forEach.call(mainMenu.children, (node) => {
    if (node.hasAttribute('expand')) {
        addSubMenu(node);
    }
});

mainMenu.addEventListener("click", (event) => {
    let type = event.target.getAttribute("data-kind");
    if (type) {
        let open = WM.open(type);
        if (open) {
            WM.createWindow(type).focus();
        } else {
            /*make template
            let link = document.createElement("link");
            link.setAttribute("rel", "import");
            link.setAttribute("href", "/window.html");
            document.head.appendChild(link);
            event.target.setAttribute("label", type);*/
            WM.createWindow(type).focus();
        }
    }
    event.preventDefault();
});

windowSpace.addEventListener("focus", (event) => {
    event.target.style.zIndex = top;
    top += 1;
}, true);

function addSubMenu(item) {
    let instance = document.importNode(subMenu.content, true);
    let label = item.getAttribute('label');

    Array.prototype.forEach.call(instance.children, (node) => {
        node.setAttribute('label', label);
    });

    mainMenu.appendChild(instance);
}

},{"./HTMLUtil.js":1,"./WindowManager.js":2}],5:[function(require,module,exports){


},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvSFRNTFV0aWwuanMiLCJjbGllbnQvc291cmNlL2pzL1dpbmRvd01hbmFnZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvZGVza3RvcC5qcyIsImNsaWVudC9zb3VyY2UvbWVudS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuKlxuKi9cblxuXG5mdW5jdGlvbiBtYWtlRHJhZ2dhYmxlKGVsLCBjb250YWluZXIpIHtcbiAgICBsZXQgYXJyb3dEcmFnO1xuICAgIGxldCBtb3VzZURyYWc7XG4gICAgbGV0IGRyYWdvZmZzZXQgPSB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9O1xuXG4gICAgbGV0IGV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhlbCwgJ2ZvY3VzaW4gbW91c2Vkb3duJywgKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBhcnJvd0RyYWcgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nKSB7XG4gICAgICAgICAgICAgICAgbW91c2VEcmFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBkcmFnb2Zmc2V0LnggPSBldmVudC5wYWdlWCAtIGVsLm9mZnNldExlZnQ7XG4gICAgICAgICAgICAgICAgZHJhZ29mZnNldC55ID0gZXZlbnQucGFnZVkgLSBlbC5vZmZzZXRUb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcnMoZWwsICdmb2N1c291dCBtb3VzZXVwJywgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZXVwJykge1xuICAgICAgICAgICAgICAgIGlmIChtb3VzZURyYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgbW91c2VEcmFnID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcnJvd0RyYWcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhkb2N1bWVudCwgJ21vdXNlbW92ZSBrZXlkb3duJywgKChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge307XG5cbiAgICAgICAgICAgIGlmIChtb3VzZURyYWcpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9IChldmVudC5wYWdlWSAtIGRyYWdvZmZzZXQueSk7XG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAoZXZlbnQucGFnZVggLSBkcmFnb2Zmc2V0LngpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhcnJvd0RyYWcpIHtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gcGFyc2VJbnQoZWwuc3R5bGUudG9wLnNsaWNlKDAsIC0yKSk7XG4gICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9IHBhcnNlSW50KGVsLnN0eWxlLmxlZnQuc2xpY2UoMCwgLTIpKTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueSAtPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93RG93bic6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ICs9IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggLT0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1vdXNlRHJhZyB8fCBhcnJvd0RyYWcpIHtcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gd2l0aGluQm91bmRzKGVsLCBjb250YWluZXIsIGRlc3RpbmF0aW9uKSA/IGRlc3RpbmF0aW9uLnggICsgXCJweFwiIDogZWwuc3R5bGUubGVmdDtcbiAgICAgICAgICAgICAgICBlbC5zdHlsZS50b3AgPSB3aXRoaW5Cb3VuZHMoZWwsIGNvbnRhaW5lciwgZGVzdGluYXRpb24pID8gZGVzdGluYXRpb24ueSAgKyBcInB4XCIgOiBlbC5zdHlsZS50b3AgKyBcInB4XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSkpO1xuICAgIH07XG5cbiAgICBlbC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICBldmVudHMoKTtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcnMoZWxlbWVudCwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIpKTtcbn1cblxuZnVuY3Rpb24gd2l0aGluQm91bmRzKGVsZW1lbnQsIGNvbnRhaW5lciwgY29vcmRzKSB7XG4gICAgbGV0IG1pblggPSBjb250YWluZXIub2Zmc2V0TGVmdDtcbiAgICBsZXQgbWF4WCA9IChtaW5YICsgY29udGFpbmVyLmNsaWVudFdpZHRoKSAtIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgbGV0IG1pblkgPSBjb250YWluZXIub2Zmc2V0VG9wO1xuICAgIGxldCBtYXhZID0gKG1pblkgKyBjb250YWluZXIuY2xpZW50SGVpZ2h0KSAtIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuXG4gICAgcmV0dXJuIChjb29yZHMueCA8PSBtYXhYICYmIGNvb3Jkcy54ID49IG1pblggJiYgY29vcmRzLnkgPD0gbWF4WSAmJiBjb29yZHMueSA+PSBtaW5ZKTtcbn1cblxuLy9leHBvcnRzXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBtYWtlRHJhZ2dhYmxlOiBtYWtlRHJhZ2dhYmxlLFxuICAgIGFkZEV2ZW50TGlzdGVuZXJzOiBhZGRFdmVudExpc3RlbmVycyxcbiAgICB3aXRoaW5Cb3VuZHM6IHdpdGhpbkJvdW5kc1xufTtcbiIsImZ1bmN0aW9uIFdpbmRvd01hbmFnZXIod2luZG93U3BhY2UpIHtcbiAgICBsZXQgd20gPSB7fTtcblxuICAgIGNsYXNzIFdpbmRvd01hbmFnZXIge1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHdpbmRvd1NwYWNlKSB7XG4gICAgICAgICAgICB3bS5zdGFydFggPSB3aW5kb3dTcGFjZS5vZmZzZXRMZWZ0ICsgMjA7XG4gICAgICAgICAgICB3bS5zdGFydFkgPSB3aW5kb3dTcGFjZS5vZmZzZXRUb3AgKyAyMDtcbiAgICAgICAgICAgIHdtLnR5cGVzID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWF0ZVdpbmRvdyh0eXBlKSB7XG4gICAgICAgICAgICBsZXQgYVdpbmRvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkcmFnZ2FibGUtd2luZG93XCIpO1xuICAgICAgICAgICAgc2V0dXBTcGFjZSh0eXBlLCBhV2luZG93KTtcbiAgICAgICAgICAgIHdpbmRvd1NwYWNlLmFwcGVuZENoaWxkKGFXaW5kb3cpO1xuXG4gICAgICAgICAgICBpZiAod21bdHlwZV0ub3Blbikge1xuICAgICAgICAgICAgICAgIHdtW3R5cGVdLm9wZW4ucHVzaChhV2luZG93KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd21bdHlwZV0ub3BlbiA9IFthV2luZG93XTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFXaW5kb3c7XG4gICAgICAgIH1cblxuICAgICAgICBvcGVuKHR5cGUpIHtcbiAgICAgICAgICAgIGlmICh3bVt0eXBlXSkge1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgICAgICBsZXQgd2luZG93cyA9IHdtW3R5cGVdLm9wZW47XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gd2luZG93cy5maWx0ZXIoICh3KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3Lm9wZW47XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgd21bdHlwZV0ub3BlbiA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGV4cGFuZCh0eXBlKSB7XG4gICAgICAgICAgICBsZXQgd2lucyA9IHdtW3R5cGVdLm9wZW47XG4gICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICB3Lm1pbmltaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBtaW5pbWl6ZSh0eXBlKSB7XG4gICAgICAgICAgICBsZXQgd2lucyA9IHdtW3R5cGVdLm9wZW47XG4gICAgICAgICAgICB3aW5zLmZvckVhY2goKHcpID0+IHtcbiAgICAgICAgICAgICAgICB3Lm1pbmltaXplZCA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsb3NlKHR5cGUpIHtcbiAgICAgICAgICAgIGxldCB3aW5zID0gd21bdHlwZV0ub3BlbjtcbiAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgIHcuY2xvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBXaW5kb3dNYW5hZ2VyKHdpbmRvd1NwYWNlKTtcblxuICAgIC8vaGVscGVyIGZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIHNldHVwU3BhY2UodHlwZSwgc3BhY2UpIHtcbiAgICAgICAgbGV0IGRlc3RpbmF0aW9uID0ge307XG4gICAgICAgIGxldCB4O1xuICAgICAgICBsZXQgeTtcblxuICAgICAgICBpZiAod21bdHlwZV0pIHtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnggPSAod21bdHlwZV0uc3RhcnRDb29yZHMueCArICg1MCAqIHdtW3R5cGVdLm9wZW4ubGVuZ3RoKSk7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gKHdtW3R5cGVdLnN0YXJ0Q29vcmRzLnkgKyAoNTAgKiB3bVt0eXBlXS5vcGVuLmxlbmd0aCkpO1xuXG4gICAgICAgICAgICBpZiAoISh3aXRoaW5Cb3VuZHMoc3BhY2UsIHdpbmRvd1NwYWNlLCBkZXN0aW5hdGlvbikpKSB7XG4gICAgICAgICAgICAgICAgeCA9IHdtW3R5cGVdLnN0YXJ0Q29vcmRzLnggKz0gNTtcbiAgICAgICAgICAgICAgICB5ID0gd21bdHlwZV0uc3RhcnRDb29yZHMueSArPSA1O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB4ID0gZGVzdGluYXRpb24ueDtcbiAgICAgICAgICAgICAgICB5ID0gZGVzdGluYXRpb24ueTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9ICh3bS5zdGFydFggKyAoNjAgKiB3bS50eXBlcykpO1xuICAgICAgICAgICAgZGVzdGluYXRpb24ueSA9ICh3bS5zdGFydFkpO1xuXG4gICAgICAgICAgICBpZiAoISh3aXRoaW5Cb3VuZHMoc3BhY2UsIHdpbmRvd1NwYWNlLCBkZXN0aW5hdGlvbikpKSB7XG4gICAgICAgICAgICAgICAgeCA9IHdtLnN0YXJ0WDtcbiAgICAgICAgICAgICAgICB5ID0gd20uc3RhcnRZO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB4ID0gZGVzdGluYXRpb24ueDtcbiAgICAgICAgICAgICAgICB5ID0gZGVzdGluYXRpb24ueTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd21bdHlwZV0gPSB7fTtcbiAgICAgICAgICAgIHdtW3R5cGVdLnN0YXJ0Q29vcmRzID0ge1xuICAgICAgICAgICAgICAgIHg6IHgsXG4gICAgICAgICAgICAgICAgeTogeVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdtLnR5cGVzICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgc3BhY2UudGFiSW5kZXggPSAwO1xuICAgICAgICBzcGFjZS5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xuICAgICAgICBzcGFjZS5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3aXRoaW5Cb3VuZHMoZWxlbWVudCwgY29udGFpbmVyLCBjb29yZHMpIHtcbiAgICAgICAgbGV0IG1pblggPSBjb250YWluZXIub2Zmc2V0TGVmdDtcbiAgICAgICAgbGV0IG1heFggPSAobWluWCArIGNvbnRhaW5lci5jbGllbnRXaWR0aCkgLSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuICAgICAgICBsZXQgbWluWSA9IGNvbnRhaW5lci5vZmZzZXRUb3A7XG4gICAgICAgIGxldCBtYXhZID0gKG1pblkgKyBjb250YWluZXIuY2xpZW50SGVpZ2h0KSAtIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuXG4gICAgICAgIHJldHVybiAoY29vcmRzLnggPD0gbWF4WCAmJiBjb29yZHMueCA+PSBtaW5YICYmIGNvb3Jkcy55IDw9IG1heFkgJiYgY29vcmRzLnkgPj0gbWluWSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdpbmRvd01hbmFnZXI7XG5cbiIsIi8vcmVxdWlyZXNcbmxldCBNZW51ID0gcmVxdWlyZShcIi4vLi4vbWVudS5qc1wiKTtcbmxldCBkZXNrdG9wID0gcmVxdWlyZShcIi4vZGVza3RvcC5qc1wiKTtcblxuLy/DhFIgREVUVEEgVkFSRsOWUiBERVQgRlVOS0FSIE1FRCBNRU5ZTiBNw4VTVEUgS09MTEEgU0VOXG4vL25vZGVzXG5cblxuLy92YXJpYWJsZXNcblxuXG5cbiIsIi8vcmVxdWlyZXNcbmxldCB1ID0gcmVxdWlyZShcIi4vSFRNTFV0aWwuanNcIik7XG5sZXQgV2luZG93TWFuYWdlciA9IHJlcXVpcmUoXCIuL1dpbmRvd01hbmFnZXIuanNcIik7XG5cblxuLy9ub2Rlc1xubGV0IG1haW5NZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN3aW5kb3dTZWxlY3RvciBjdXN0b20tbWVudVwiKTtcbmxldCB3aW5kb3dTcGFjZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjb3BlbldpbmRvd3NcIik7XG5sZXQgc3ViTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3ViTWVudVwiKTtcblxuLy92YXJpYWJsZXNcbmxldCBXTSA9IFdpbmRvd01hbmFnZXIod2luZG93U3BhY2UpO1xubGV0IHRvcCA9IDE7XG5cbkFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwobWFpbk1lbnUuY2hpbGRyZW4sIChub2RlKSA9PiB7XG4gICAgaWYgKG5vZGUuaGFzQXR0cmlidXRlKCdleHBhbmQnKSkge1xuICAgICAgICBhZGRTdWJNZW51KG5vZGUpO1xuICAgIH1cbn0pO1xuXG5tYWluTWVudS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgbGV0IHR5cGUgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1raW5kXCIpO1xuICAgIGlmICh0eXBlKSB7XG4gICAgICAgIGxldCBvcGVuID0gV00ub3Blbih0eXBlKTtcbiAgICAgICAgaWYgKG9wZW4pIHtcbiAgICAgICAgICAgIFdNLmNyZWF0ZVdpbmRvdyh0eXBlKS5mb2N1cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLyptYWtlIHRlbXBsYXRlXG4gICAgICAgICAgICBsZXQgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuICAgICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoXCJyZWxcIiwgXCJpbXBvcnRcIik7XG4gICAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCIvd2luZG93Lmh0bWxcIik7XG4gICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnNldEF0dHJpYnV0ZShcImxhYmVsXCIsIHR5cGUpOyovXG4gICAgICAgICAgICBXTS5jcmVhdGVXaW5kb3codHlwZSkuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG5cbndpbmRvd1NwYWNlLmFkZEV2ZW50TGlzdGVuZXIoXCJmb2N1c1wiLCAoZXZlbnQpID0+IHtcbiAgICBldmVudC50YXJnZXQuc3R5bGUuekluZGV4ID0gdG9wO1xuICAgIHRvcCArPSAxO1xufSwgdHJ1ZSk7XG5cbmZ1bmN0aW9uIGFkZFN1Yk1lbnUoaXRlbSkge1xuICAgIGxldCBpbnN0YW5jZSA9IGRvY3VtZW50LmltcG9ydE5vZGUoc3ViTWVudS5jb250ZW50LCB0cnVlKTtcbiAgICBsZXQgbGFiZWwgPSBpdGVtLmdldEF0dHJpYnV0ZSgnbGFiZWwnKTtcblxuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoaW5zdGFuY2UuY2hpbGRyZW4sIChub2RlKSA9PiB7XG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdsYWJlbCcsIGxhYmVsKTtcbiAgICB9KTtcblxuICAgIG1haW5NZW51LmFwcGVuZENoaWxkKGluc3RhbmNlKTtcbn1cbiIsIlxuIl19
