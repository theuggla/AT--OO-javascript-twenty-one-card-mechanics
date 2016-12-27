//to make web components work with browserify
let window = require('./draggable-window.js');
let menu = require("./expandable-menu-item.js");
let memoryGame = require('./memory-game.js');
let memoryApp = require('./memory-app.js');


//requires
let desktop = require("./desktop.js");


document.addEventListener('keydown', (event) => {
    console.log(document.activeElement.shadowRoot.activeElement);
});
