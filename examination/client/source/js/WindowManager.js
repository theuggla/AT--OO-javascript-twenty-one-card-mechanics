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

