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
