/**
 * Module for Deck.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */
const Card = require('../src/Card.js');

class Deck {
    constructor() {
        let unused = [];
        let inPlay = [];
        let used = [];

        let suits = Card.getSuits();
        let values = Card.getValues();

        suits.forEach(function(suit) {
            values.forEach(function (value) {
                unused.push(new Card(suit, value));
            });
        });

        Object.defineProperties(this, {
            unusedCards: {
                get: ,
                set: ,
                enumerable: ,
                configurable:
            },
            usedCards: {
                get: ,
                set: ,
                enumerable: ,
                configurable:
            }
            cardsInPlay: {
                get: ,
                set: ,
                enumerable: ,
                configurable:
            }

        });
    }

    toString() {
        output = '';

    }

    shuffle() {

    }

    deal(amount) {

    }

    giveBackToDeck(cards[]) {

    }
}
