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
let mainMenu = document.querySelector("#windowSelector");
let windowSpace = document.querySelector("#openWindows");
let subMenu = document.querySelector("#subMenu");

//variables
let WM = WindowManager(windowSpace);
let top = 1;

Array.prototype.forEach.call(mainMenu.children, (node) => {
    addSubMenu(node);
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

    item.appendChild(instance);
}

},{"./HTMLUtil.js":1,"./WindowManager.js":2}],5:[function(require,module,exports){


},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjcuMi4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvSFRNTFV0aWwuanMiLCJjbGllbnQvc291cmNlL2pzL1dpbmRvd01hbmFnZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvZGVza3RvcC5qcyIsImNsaWVudC9zb3VyY2UvbWVudS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4qXG4qL1xuXG5cbmZ1bmN0aW9uIG1ha2VEcmFnZ2FibGUoZWwsIGNvbnRhaW5lcikge1xuICAgIGxldCBhcnJvd0RyYWc7XG4gICAgbGV0IG1vdXNlRHJhZztcbiAgICBsZXQgZHJhZ29mZnNldCA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBsZXQgZXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGVsLCAnZm9jdXNpbiBtb3VzZWRvd24nLCAoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGFycm93RHJhZyA9IHRydWU7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNlZG93bicpIHtcbiAgICAgICAgICAgICAgICBtb3VzZURyYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGRyYWdvZmZzZXQueCA9IGV2ZW50LnBhZ2VYIC0gZWwub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBkcmFnb2Zmc2V0LnkgPSBldmVudC5wYWdlWSAtIGVsLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBhZGRFdmVudExpc3RlbmVycyhlbCwgJ2ZvY3Vzb3V0IG1vdXNldXAnLCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ21vdXNldXAnKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vdXNlRHJhZykge1xuICAgICAgICAgICAgICAgICAgICBtb3VzZURyYWcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFycm93RHJhZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIGFkZEV2ZW50TGlzdGVuZXJzKGRvY3VtZW50LCAnbW91c2Vtb3ZlIGtleWRvd24nLCAoKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7fTtcblxuICAgICAgICAgICAgaWYgKG1vdXNlRHJhZykge1xuICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gKGV2ZW50LnBhZ2VZIC0gZHJhZ29mZnNldC55KTtcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9IChldmVudC5wYWdlWCAtIGRyYWdvZmZzZXQueCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFycm93RHJhZykge1xuICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSBwYXJzZUludChlbC5zdHlsZS50b3Auc2xpY2UoMCwgLTIpKTtcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gcGFyc2VJbnQoZWwuc3R5bGUubGVmdC5zbGljZSgwLCAtMikpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbi55IC09IDU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgKz0gNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdBcnJvd0xlZnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCAtPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb24ueCArPSA1O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobW91c2VEcmFnIHx8IGFycm93RHJhZykge1xuICAgICAgICAgICAgICAgIGVsLnN0eWxlLmxlZnQgPSB3aXRoaW5Cb3VuZHMoZWwsIGNvbnRhaW5lciwgZGVzdGluYXRpb24pID8gZGVzdGluYXRpb24ueCAgKyBcInB4XCIgOiBlbC5zdHlsZS5sZWZ0O1xuICAgICAgICAgICAgICAgIGVsLnN0eWxlLnRvcCA9IHdpdGhpbkJvdW5kcyhlbCwgY29udGFpbmVyLCBkZXN0aW5hdGlvbikgPyBkZXN0aW5hdGlvbi55ICArIFwicHhcIiA6IGVsLnN0eWxlLnRvcCArIFwicHhcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KSk7XG4gICAgfTtcblxuICAgIGVsLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgIGV2ZW50cygpO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyhlbGVtZW50LCBldmVudHMsIGhhbmRsZXIpIHtcbiAgICBldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGV2ZW50ID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcikpO1xufVxuXG5mdW5jdGlvbiB3aXRoaW5Cb3VuZHMoZWxlbWVudCwgY29udGFpbmVyLCBjb29yZHMpIHtcbiAgICBsZXQgbWluWCA9IGNvbnRhaW5lci5vZmZzZXRMZWZ0O1xuICAgIGxldCBtYXhYID0gKG1pblggKyBjb250YWluZXIuY2xpZW50V2lkdGgpIC0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICBsZXQgbWluWSA9IGNvbnRhaW5lci5vZmZzZXRUb3A7XG4gICAgbGV0IG1heFkgPSAobWluWSArIGNvbnRhaW5lci5jbGllbnRIZWlnaHQpIC0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG5cbiAgICByZXR1cm4gKGNvb3Jkcy54IDw9IG1heFggJiYgY29vcmRzLnggPj0gbWluWCAmJiBjb29yZHMueSA8PSBtYXhZICYmIGNvb3Jkcy55ID49IG1pblkpO1xufVxuXG4vL2V4cG9ydHNcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1ha2VEcmFnZ2FibGU6IG1ha2VEcmFnZ2FibGUsXG4gICAgYWRkRXZlbnRMaXN0ZW5lcnM6IGFkZEV2ZW50TGlzdGVuZXJzLFxuICAgIHdpdGhpbkJvdW5kczogd2l0aGluQm91bmRzXG59O1xuIiwiZnVuY3Rpb24gV2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSkge1xuICAgIGxldCB3bSA9IHt9O1xuXG4gICAgY2xhc3MgV2luZG93TWFuYWdlciB7XG5cbiAgICAgICAgY29uc3RydWN0b3Iod2luZG93U3BhY2UpIHtcbiAgICAgICAgICAgIHdtLnN0YXJ0WCA9IHdpbmRvd1NwYWNlLm9mZnNldExlZnQgKyAyMDtcbiAgICAgICAgICAgIHdtLnN0YXJ0WSA9IHdpbmRvd1NwYWNlLm9mZnNldFRvcCArIDIwO1xuICAgICAgICAgICAgd20udHlwZXMgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgY3JlYXRlV2luZG93KHR5cGUpIHtcbiAgICAgICAgICAgIGxldCBhV2luZG93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRyYWdnYWJsZS13aW5kb3dcIik7XG4gICAgICAgICAgICBzZXR1cFNwYWNlKHR5cGUsIGFXaW5kb3cpO1xuICAgICAgICAgICAgd2luZG93U3BhY2UuYXBwZW5kQ2hpbGQoYVdpbmRvdyk7XG5cbiAgICAgICAgICAgIGlmICh3bVt0eXBlXS5vcGVuKSB7XG4gICAgICAgICAgICAgICAgd21bdHlwZV0ub3Blbi5wdXNoKGFXaW5kb3cpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuID0gW2FXaW5kb3ddO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYVdpbmRvdztcbiAgICAgICAgfVxuXG4gICAgICAgIG9wZW4odHlwZSkge1xuICAgICAgICAgICAgaWYgKHdtW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCB3aW5kb3dzID0gd21bdHlwZV0ub3BlbjtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB3aW5kb3dzLmZpbHRlciggKHcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHcub3BlbjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB3bVt0eXBlXS5vcGVuID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZXhwYW5kKHR5cGUpIHtcbiAgICAgICAgICAgIGxldCB3aW5zID0gd21bdHlwZV0ub3BlbjtcbiAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgIHcubWluaW1pemVkID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1pbmltaXplKHR5cGUpIHtcbiAgICAgICAgICAgIGxldCB3aW5zID0gd21bdHlwZV0ub3BlbjtcbiAgICAgICAgICAgIHdpbnMuZm9yRWFjaCgodykgPT4ge1xuICAgICAgICAgICAgICAgIHcubWluaW1pemVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xvc2UodHlwZSkge1xuICAgICAgICAgICAgbGV0IHdpbnMgPSB3bVt0eXBlXS5vcGVuO1xuICAgICAgICAgICAgd2lucy5mb3JFYWNoKCh3KSA9PiB7XG4gICAgICAgICAgICAgICAgdy5jbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFdpbmRvd01hbmFnZXIod2luZG93U3BhY2UpO1xuXG4gICAgLy9oZWxwZXIgZnVuY3Rpb25zXG4gICAgZnVuY3Rpb24gc2V0dXBTcGFjZSh0eXBlLCBzcGFjZSkge1xuICAgICAgICBsZXQgZGVzdGluYXRpb24gPSB7fTtcbiAgICAgICAgbGV0IHg7XG4gICAgICAgIGxldCB5O1xuXG4gICAgICAgIGlmICh3bVt0eXBlXSkge1xuICAgICAgICAgICAgZGVzdGluYXRpb24ueCA9ICh3bVt0eXBlXS5zdGFydENvb3Jkcy54ICsgKDUwICogd21bdHlwZV0ub3Blbi5sZW5ndGgpKTtcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uLnkgPSAod21bdHlwZV0uc3RhcnRDb29yZHMueSArICg1MCAqIHdtW3R5cGVdLm9wZW4ubGVuZ3RoKSk7XG5cbiAgICAgICAgICAgIGlmICghKHdpdGhpbkJvdW5kcyhzcGFjZSwgd2luZG93U3BhY2UsIGRlc3RpbmF0aW9uKSkpIHtcbiAgICAgICAgICAgICAgICB4ID0gd21bdHlwZV0uc3RhcnRDb29yZHMueCArPSA1O1xuICAgICAgICAgICAgICAgIHkgPSB3bVt0eXBlXS5zdGFydENvb3Jkcy55ICs9IDU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHggPSBkZXN0aW5hdGlvbi54O1xuICAgICAgICAgICAgICAgIHkgPSBkZXN0aW5hdGlvbi55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi54ID0gKHdtLnN0YXJ0WCArICg2MCAqIHdtLnR5cGVzKSk7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbi55ID0gKHdtLnN0YXJ0WSk7XG5cbiAgICAgICAgICAgIGlmICghKHdpdGhpbkJvdW5kcyhzcGFjZSwgd2luZG93U3BhY2UsIGRlc3RpbmF0aW9uKSkpIHtcbiAgICAgICAgICAgICAgICB4ID0gd20uc3RhcnRYO1xuICAgICAgICAgICAgICAgIHkgPSB3bS5zdGFydFk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHggPSBkZXN0aW5hdGlvbi54O1xuICAgICAgICAgICAgICAgIHkgPSBkZXN0aW5hdGlvbi55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3bVt0eXBlXSA9IHt9O1xuICAgICAgICAgICAgd21bdHlwZV0uc3RhcnRDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgd20udHlwZXMgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBzcGFjZS50YWJJbmRleCA9IDA7XG4gICAgICAgIHNwYWNlLnN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XG4gICAgICAgIHNwYWNlLnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdpdGhpbkJvdW5kcyhlbGVtZW50LCBjb250YWluZXIsIGNvb3Jkcykge1xuICAgICAgICBsZXQgbWluWCA9IGNvbnRhaW5lci5vZmZzZXRMZWZ0O1xuICAgICAgICBsZXQgbWF4WCA9IChtaW5YICsgY29udGFpbmVyLmNsaWVudFdpZHRoKSAtIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICAgIGxldCBtaW5ZID0gY29udGFpbmVyLm9mZnNldFRvcDtcbiAgICAgICAgbGV0IG1heFkgPSAobWluWSArIGNvbnRhaW5lci5jbGllbnRIZWlnaHQpIC0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG5cbiAgICAgICAgcmV0dXJuIChjb29yZHMueCA8PSBtYXhYICYmIGNvb3Jkcy54ID49IG1pblggJiYgY29vcmRzLnkgPD0gbWF4WSAmJiBjb29yZHMueSA+PSBtaW5ZKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gV2luZG93TWFuYWdlcjtcblxuIiwiLy9yZXF1aXJlc1xubGV0IE1lbnUgPSByZXF1aXJlKFwiLi8uLi9tZW51LmpzXCIpO1xubGV0IGRlc2t0b3AgPSByZXF1aXJlKFwiLi9kZXNrdG9wLmpzXCIpO1xuXG4vL8OEUiBERVRUQSBWQVJGw5ZSIERFVCBGVU5LQVIgTUVEIE1FTllOIE3DhVNURSBLT0xMQSBTRU5cbi8vbm9kZXNcblxuXG4vL3ZhcmlhYmxlc1xuXG5cblxuIiwiLy9yZXF1aXJlc1xubGV0IHUgPSByZXF1aXJlKFwiLi9IVE1MVXRpbC5qc1wiKTtcbmxldCBXaW5kb3dNYW5hZ2VyID0gcmVxdWlyZShcIi4vV2luZG93TWFuYWdlci5qc1wiKTtcblxuXG4vL25vZGVzXG5sZXQgbWFpbk1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3dpbmRvd1NlbGVjdG9yXCIpO1xubGV0IHdpbmRvd1NwYWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNvcGVuV2luZG93c1wiKTtcbmxldCBzdWJNZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdWJNZW51XCIpO1xuXG4vL3ZhcmlhYmxlc1xubGV0IFdNID0gV2luZG93TWFuYWdlcih3aW5kb3dTcGFjZSk7XG5sZXQgdG9wID0gMTtcblxuQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChtYWluTWVudS5jaGlsZHJlbiwgKG5vZGUpID0+IHtcbiAgICBhZGRTdWJNZW51KG5vZGUpO1xufSk7XG5cbm1haW5NZW51LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgICBsZXQgdHlwZSA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWtpbmRcIik7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgICAgbGV0IG9wZW4gPSBXTS5vcGVuKHR5cGUpO1xuICAgICAgICBpZiAob3Blbikge1xuICAgICAgICAgICAgV00uY3JlYXRlV2luZG93KHR5cGUpLmZvY3VzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvKm1ha2UgdGVtcGxhdGVcbiAgICAgICAgICAgIGxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG4gICAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZShcInJlbFwiLCBcImltcG9ydFwiKTtcbiAgICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcIi93aW5kb3cuaHRtbFwiKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgICAgICBldmVudC50YXJnZXQuc2V0QXR0cmlidXRlKFwibGFiZWxcIiwgdHlwZSk7Ki9cbiAgICAgICAgICAgIFdNLmNyZWF0ZVdpbmRvdyh0eXBlKS5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59KTtcblxud2luZG93U3BhY2UuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIChldmVudCkgPT4ge1xuICAgIGV2ZW50LnRhcmdldC5zdHlsZS56SW5kZXggPSB0b3A7XG4gICAgdG9wICs9IDE7XG59LCB0cnVlKTtcblxuZnVuY3Rpb24gYWRkU3ViTWVudShpdGVtKSB7XG4gICAgbGV0IGluc3RhbmNlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZShzdWJNZW51LmNvbnRlbnQsIHRydWUpO1xuICAgIGxldCBsYWJlbCA9IGl0ZW0uZ2V0QXR0cmlidXRlKCdsYWJlbCcpO1xuXG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChpbnN0YW5jZS5jaGlsZHJlbiwgKG5vZGUpID0+IHtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoJ2xhYmVsJywgbGFiZWwpO1xuICAgIH0pO1xuXG4gICAgaXRlbS5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG59XG4iLCJcbiJdfQ==
