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
