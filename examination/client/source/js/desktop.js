//requires
let Menu = require("./menu.js");
let u = require("./HTMLUtil.js");
let Window = require("./window.js");


//nodes
let mainMenu = document.querySelector("#windowSelector");
let windowTemp = document.querySelector("#windowTemplate").content;
let windowSpace = document.querySelector("#openWindows");

//variables
let windowManager = {
    startX: windowSpace.offsetLeft + 20,
    startY: windowSpace.offsetTop + 20,
    types: 0
};
let top = 1;

mainMenu.addEventListener("click", (event) => {
    let destination = document.importNode(windowTemp.firstElementChild, true);
    let type = event.target.getAttribute("data-kind");
    windowSpace.appendChild(destination);
    makeWindow(type, destination);
    event.preventDefault();
});

windowSpace.addEventListener("focus", (event) => {
    event.target.style.zIndex = top;
    top += 1;
}, true);



//helper functions
function makeWindow(type, destination) {
    let window;
    let minX = windowSpace.offsetLeft;
    let maxX = (minX + windowSpace.clientWidth) - destination.clientWidth;
    let minY = windowSpace.offsetTop;
    let maxY = (minY + windowSpace.clientHeight) - destination.clientHeight;
    let x;
    let y;

    //set up destination
    if (windowManager[type]) {
        x = (windowManager[type].latestCoords.x + 50);
        y = (windowManager[type].latestCoords.y + 50);

        if (!(x < maxX && x > minX) || !(y < maxY && y > minY)) {
            x = windowManager[type].startCoords.x += 5;
            y = windowManager[type].startCoords.y += 5;
        }

        windowManager[type].latestCoords.x = x;
        windowManager[type].latestCoords.y = y;

    } else {
        x = (windowManager.startX + (60 * windowManager.types));
        y = (windowManager.startY);

        if (!(y < maxY && y > minY) || !(x < maxX && x > minX)) {
            x = windowManager.startX;
            y = windowManager.startY;
        }

        windowManager[type] = {};
        windowManager[type].latestCoords = {
            x: x,
            y: y
        };
        windowManager[type].startCoords = {
            x: x,
            y: y
        };
        windowManager.types += 1;
    }

    u.makeDraggable(destination, windowSpace, whenDragged);
    destination.tabIndex = 0;
    console.log(windowManager.startX, windowManager.startY, x, y);
    destination.style.top = y + "px";
    destination.style.left = x + "px";


    //get the window
    window = destination; //TODO: fix this window thing
    window.textContent = type;

    if (windowManager[type].open) {
        windowManager[type].open.push(window);
    } else {
        windowManager[type].open = [window];
    }

    return window;
}

function whenDragged(el) {
    el.addEventListener("mousedown", () => {
        el.focus();
    });
}
