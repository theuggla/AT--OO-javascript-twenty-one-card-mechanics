let memoryTemplate = document.querySelector('link[href="/memory-game.html"]').import.querySelector("#memoryTemplate");
let brickTemplate = document.querySelector('link[href="/memory-game.html"]').import.querySelector("#brickTemplate");

let Brick = require("./bricks.js");
let Timer = require('./timer.js');

let turnspan;
let timespan;
let timer = new Timer(0);

class MemoryGame extends HTMLElement {
    constructor(width, height) {
        super();

        //setup shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = memoryTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

        //set width and height attributes
        this.setAttribute('data-width', width || this.getAttribute('data-width') || 4);
        this.setAttribute('data-height', height || this.getAttribute('data-height')  || 4);
        this.set = [];
        timespan = this.shadowRoot.querySelector("#time");
        turnspan = this.shadowRoot.querySelector("#turns");

    }

    connectedCallback() {
        //set height and width
        this.height = this.getAttribute('data-height') || this.height;
        this.width = this.getAttribute('data-width') || this.width;

        //initiate bricks
        let brick;
        let match;
        let pairs = (this.width * this.height) / 2;

        for (let i = 1; i <= pairs; i += 1) {
            brick = new Brick(i);
            this.set.push(brick);
            match = brick.clone();
            this.set.push(match);
        }

        this.shuffle();
        this.draw();
        getGamePlay(this.set, this);
        timer.start(); //maybe move this to start function
        timer.display(timespan);

    }

    get width() {
        return this.getAttribute('data-width');
    }

    set width(newVal) {
        this.setAttribute('data-width', newVal);
    }

    get height() {
        return this.getAttribute('data-height');
    }

    set height(newVal) {
        this.setAttribute('data-height', newVal);
    }

    shuffle() {
        let theSet = this.set;
        for (let i = (theSet.length - 1); i > 0; i -= 1) {
            let j = Math.floor(Math.random() * i);
            let iOld = theSet[i];
            theSet[i] = theSet[j];
            theSet[j] = iOld;
        }
        this.set = theSet;
    }

    draw() {
        let theSet = this.set;

        for (let i = 0; i < theSet.length; i += 1) {
            let brickDiv = document.importNode(brickTemplate.content, true);
            let img = brickDiv.querySelector("img");
            let brick = theSet[i];
            img.src = brick.draw();
            img.setAttribute("brickNumber", i);
            this.appendChild(brickDiv);

            if ((i + 1) % this.width === 0) {
                let br = document.createElement("br");
                br.setAttribute('slot', 'brick');
                this.appendChild(br);
            }
        }
    }
}

customElements.define('memory-game', MemoryGame);

    function getGamePlay(board, destination) {

    let bricks = destination.querySelectorAll("a");
    let bricksLeft = bricks.length;
    let turns = 0;
    let choice1;
    let choice2;
    let img1;
    let img2;

    destination.addEventListener("click", function(event) {
        if (!choice2) {
            let img = event.target.querySelector("img") || event.target;
            let brickNumber = img.getAttribute("brickNumber");
            let brick = board[brickNumber];
            img.src = brick.turn();

            if (!choice1) {
                img1 = img;
                choice1 = brick;
            } else {
                img2 = img;
                choice2 = brick;

                if (choice1.equals(choice2)) {
                    img1.parentElement.parentElement.classList.add("hide");
                    img2.parentElement.parentElement.classList.add("hide");
                    choice1 = "";
                    choice2 = "";
                    img1 = "";
                    img2 = "";
                    bricksLeft -= 2;
                    if (bricksLeft === 0) {
                        timer.stop();
                    }
                } else {
                    setTimeout(function () {
                        img1.src = choice1.turn();
                        img2.src = choice2.turn();
                        choice1 = "";
                        choice2 = "";
                        img1 = "";
                        img2 = "";
                    }, 1000);
                }

                turns += 1;
                turnspan.textContent = turns;
            }

        }
        event.preventDefault();

    });

}
