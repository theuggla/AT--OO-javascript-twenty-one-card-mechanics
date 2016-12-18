//requires
let Menu = require("./menu.js");
let u = require("./HTMLUtil.js");
let WindowManager = require("./WindowManager.js");


//nodes
let mainMenu = document.querySelector("#windowSelector");
let windowSpace = document.querySelector("#openWindows");

//variables
let WM = WindowManager(windowSpace);
let top = 1;

mainMenu.addEventListener("click", (event) => {
    let type = event.target.getAttribute("data-kind");
    WM.createWindow(type).focus();
    event.preventDefault();
});

windowSpace.addEventListener("focus", (event) => {
    event.target.style.zIndex = top;
    top += 1;
}, true);

windowSpace.addEventListener("mousedown", (event) => {
    event.target.focus();
});
