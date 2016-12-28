/*
 * A module for a custom HTML element memory-game to form part of a web component.
 * It creates a memory game with a timer a a turn-counter. The game is over when
 * all bricks have been paired.
 * @author Molly Arhammar
 * @version 1.0.0
 *
 */

let memoryTemplate = document.querySelector('link[href="/memory-game.html"]').import.querySelector("#memoryTemplate"); //shadow DOM import
let brickTemplate = document.querySelector('link[href="/memory-game.html"]').import.querySelector("#brickTemplate"); //brick template

//requires
let Timer = require('./timer.js');


class MemoryGame extends HTMLElement {
    /**
     * Initiates a memory game, sets up shadow DOM.
     */
    constructor(width, height) {
        super();

        //setup shadow dom styles
        let shadowRoot = this.attachShadow({mode: "open"});
        let instance = memoryTemplate.content.cloneNode(true);
        shadowRoot.appendChild(instance);

        //set width and height attributes
        this.setAttribute('data-width', width || this.getAttribute('data-width') || 4);
        this.setAttribute('data-height', height || this.getAttribute('data-height')  || 4);

        //set references
        this.set = [];
        this.timespan = this.shadowRoot.querySelector("#timespan");
        this.turnspan = this.shadowRoot.querySelector("#turnspan");

    }

    /**
     * Runs when memory is inserted into the DOM.
     * Sets up the behaviour of the game and the bricks to be rendered.
     * Adds event listeners.
     */
    connectedCallback() {
        this.shadowRoot.querySelector('#outro button').addEventListener('click', (event) => {
            this.restart();
        });

        this.shadowRoot.querySelector('#intro button').addEventListener('click', (event) => {
            this.play();
        });

        //set height and width
        this.height = this.getAttribute('data-height') || this.height;
        this.width = this.getAttribute('data-width') || this.width;

        //initiate bricks
        let brick;
        let match;
        let pairs = Math.round((this.width * this.height)) / 2;

        for (let i = 1; i <= pairs; i += 1) {
            brick = new Brick(i);
            this.set.push(brick);
            match = brick.clone();
            this.set.push(match);
        }

        this.shuffle();
        this.draw();
    }

    /**
     * @returns {string} the width of the board in bricks
     */
    get width() {
        return this.getAttribute('data-width');
    }

    /**
     * Sets the width of the board in bricks.
     * @param newVal {string} the new width of the board in bricks
     */
    set width(newVal) {
        this.setAttribute('data-width', newVal);
    }

    /**
     * @returns {string} the height of the board in bricks
     */
    get height() {
        return this.getAttribute('data-height');
    }

    /**
     * Sets the height of the board in bricks.
     * @param newVal {string} the new height of the board in bricks
     */
    set height(newVal) {
        this.setAttribute('data-height', newVal);
    }

    /**
     * Shuffles the bricks using Fisher-Yates algorithm.
     */
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

    /**
     * Adds the bricks to the board and renders them in the DOM.
     */
    draw() {
        let theSet = this.set;

        for (let i = 0; i < theSet.length; i += 1) {
            let brickDiv = document.importNode(brickTemplate.content, true);
            let img = brickDiv.querySelector("img");
            let brick = theSet[i];
            img.src = '/image/' + brick.draw() + '.png';
            img.setAttribute("brickNumber", i);
            this.appendChild(brickDiv);

            if ((i + 1) % this.width === 0) {
                let br = document.createElement("br");
                br.setAttribute('slot', 'brick');
                this.appendChild(br);
            }
        }
    }

    /**
     * Restarts the game with the same size of board without re-rendering
     */
    restart() {
        this.shadowRoot.querySelector("#intro").classList.add('hide');
        this.shadowRoot.querySelector("#main").classList.remove('hide');
        this.shadowRoot.querySelector("#outro").classList.add('hide');
        this.shuffle();
        let bricks = this.querySelectorAll('[slot="brick"]');
        Array.prototype.forEach.call(bricks, (brick) => {
            brick.classList.remove('hide');
            let img = brick.querySelector("img");
            if (img) {
                let brickNumber = img.getAttribute("brickNumber");
                img.src = '/image/' + this.set[brickNumber].turn() + '.png';
            }
        });
        this.timespan.textContent = '';
        this.turnspan.textContent = '';
        this.play();
    }

    play() {
        this.shadowRoot.querySelector("#intro").classList.add('hide');
        this.shadowRoot.querySelector("#main").classList.remove('hide');
        this.shadowRoot.querySelector("#outro").classList.add('hide');
        playGame(this.set, this)
            .then((result) => {
            this.shadowRoot.querySelector("#intro").classList.add('hide');
            this.shadowRoot.querySelector("#main").classList.add('hide');
            this.shadowRoot.querySelector("#outro").classList.remove('hide');
            this.result = result;
            });
    }
}

//defines the element
customElements.define('memory-game', MemoryGame);


/**
 * A class Brick to go with the memory game.
 */
class Brick {
    constructor(number) {
        this.value = number;
        this.facedown = true;
    }

    turn() {
        this.facedown = !(this.facedown);
        return this.draw();
    }

    equals(other) {
        return (other instanceof Brick) && (this.value === other.value);
    }

    clone() {
        return new Brick(this.value);
    }

    draw() {
        if (this.facedown) {
            return 0;
        } else {
            return this.value;
        }
    }
}


function playGame(set, game) {
    let timer = new Timer(0);
    timer.start(0);
    let timeDisplay = timer.display(game.timespan);
    let turns = 0;
    let bricks = game.querySelectorAll("a");
    let bricksLeft = bricks.length;
    let choice1;
    let choice2;
    let img1;
    let img2;

    return new Promise((resolve, reject) => {

        game.addEventListener("click", gamePlay);

        function gamePlay(event) {
            if (!choice2) {
                let img = event.target.querySelector("img") || event.target;
                let brickNumber = img.getAttribute("brickNumber");
                let brick = set[brickNumber];
                img.src = '/image/' + brick.turn() + '.png';

                if (!choice1) {
                    img1 = img;
                    choice1 = brick;
                } else {
                    img2 = img;
                    choice2 = brick;

                    if (choice1.equals(choice2) && img1.getAttribute('brickNumber') !== img2.getAttribute('brickNumber')) {
                        img1.parentElement.parentElement.classList.add("hide");
                        img2.parentElement.parentElement.classList.add("hide");
                        choice1 = "";
                        choice2 = "";
                        img1 = "";
                        img2 = "";
                        bricksLeft -= 2;
                        if (bricksLeft === 0) {
                            let result = {turns: turns, time: timer.stop()};
                            reset();
                            resolve(result);
                        }
                    } else {
                        setTimeout(function () {
                            img1.src = '/image/' + choice1.turn() + '.png';
                            img2.src = '/image/' + choice2.turn() + '.png';
                            choice1 = "";
                            choice2 = "";
                            img1 = "";
                            img2 = "";
                        }, 1000);
                    }

                    turns += 1;
                    game.turnspan.textContent = turns;
                }

            }
            event.preventDefault();

        }

        /**
         * Resets in case the game is played again
         */
        function reset() {
            choice1 = "";
            choice2 = "";
            img1 = "";
            img2 = "";
            bricksLeft = bricks.length;
            timer = "";
            game.removeEventListener("click", gamePlay);
            clearInterval(timeDisplay);
        }

    });

}
