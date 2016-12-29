/*
 * A module for a custom HTML element memory-game to form part of a web component.
 * It creates a memory game with a timer a a turn-counter. The game is over when
 * all bricks have been paired and stores the total time and turns in a result-variable.
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
            img.src = '/image/memory-brick-' + brick.draw() + '.png';
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
                img.src = '/image/memory-brick-' + this.set[brickNumber].turn() + '.png';
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
            this.result = result;
            this.shadowRoot.querySelector("#intro").classList.add('hide');
            this.shadowRoot.querySelector("#main").classList.add('hide');
            this.shadowRoot.querySelector("#outro").classList.remove('hide');
            });
    }
}

//defines the element
customElements.define('memory-game', MemoryGame);


/**
 * A class Brick to go with the memory game.
 */
class Brick {
    /**
     * Initiates the Brick with a value and places it facedown.
     * @param number {number} the value to initiate.
     */
    constructor(number) {
        this.value = number;
        this.facedown = true;
    }

    /**
     * Turns the brick and returns the value after the turn.
     * @returns {number} the value of the brick if it's faceup, otherwise 0.
     */
    turn() {
        this.facedown = !(this.facedown);
        return this.draw();
    }

    /**
     * Compares two bricks.
     * @param other {Brick} the Brick to compare.
     * @returns {boolean} true if the bricks values are equal.
     */
    equals(other) {
        return (other instanceof Brick) && (this.value === other.value);
    }

    /**
     * Clones the brick.
     * @returns {Brick} the clone.
     */
    clone() {
        return new Brick(this.value);
    }

    /**
     * @returns {number} the brick's value, or 0 if it is face down.
     */
    draw() {
        if (this.facedown) {
            return 0;
        } else {
            return this.value;
        }
    }
}

/**
 * A function that sets up the gameplay. Adds and removes event-listeners so that the same game can be reset.
 * @param set [{Brick]} the set of bricks to play with.
 * @param game {node} the space to play
 * @returns {Promise} a promise that resolves with the result of the game when the game has been played.
 */
function playGame(set, game) {
    let timer = new Timer(0);
    timer.start(0);
    let timeDisplay = timer.display(game.timespan);
    let turns = 0;
    let bricks = game.querySelectorAll("a");
    let board = game.shadowRoot.querySelector('#board');
    let bricksLeft = bricks.length;
    let choice1;
    let choice2;
    let img1;
    let img2;

    return new Promise((resolve, reject) => {

        board.addEventListener("click", gamePlay);

        function gamePlay(event) {
            if (!choice2) { //two bricks are not turned
                let img = event.target.querySelector("img") || event.target;
                let brickNumber = img.getAttribute("brickNumber");

                if (!brickNumber) { //target is not a brick
                    return;
                }

                let brick = set[brickNumber];
                img.src = '/image/memory-brick-' + brick.turn() + '.png';

                if (!choice1) { //this is the first turned brick
                    img1 = img;
                    choice1 = brick;
                } else { //this is the second turned brick
                    img2 = img;
                    choice2 = brick;

                    if (choice1.equals(choice2) && img1.getAttribute('brickNumber') !== img2.getAttribute('brickNumber')) { //the bricks are equal but not the same brick
                        img1.parentElement.parentElement.classList.add("hide"); //hide the bricks
                        img2.parentElement.parentElement.classList.add("hide");
                        choice1 = "";
                        choice2 = "";
                        img1 = "";
                        img2 = "";
                        bricksLeft -= 2;
                        if (bricksLeft === 0) { //all bricks have been turned
                            reset();
                            resolve({turns: turns, time: timer.stop()}); //resolve with the result
                        } else { //the bricks are not equal
                            setTimeout(function () {
                                img1.src = '/image/memory-brick-' + choice1.turn() + '.png';
                                img2.src = '/image/memory-brick-' + choice2.turn() + '.png';
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
            board.removeEventListener("click", gamePlay);
            clearInterval(timeDisplay);
        }

    });

}
