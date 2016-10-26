/**
 * Module for Deck.
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Card = require('../src/Card.js');

/**
 * Initiates a Deck.
 *
 * @param joker {string} If this parameter is used, the Deck will include Jokers.
 */
function Deck(joker) {
  let used = [];
  let inPlay = [];
  //create a Deck with or without four Jokers
  let unused = joker ? Deck.createSet(Card.suits, Card.values) : Deck.createSet(Card.suits, Card.values.slice(1));

  Object.defineProperties(this, {
    unusedCards: {
      get: () => {
        return copyCards(unused);
      },
      set: (cards) => {
        if (areValidCards(cards)) {
          if (cards.length === 0) { //allow to be set to 0;
            unused = [];
          } else if (!(Deck.contains(inPlay, cards)) && !(Deck.contains(used, cards))) { //don't allow the cards to be added if they're already in the Deck
            unused = copyCards(cards);
          } else {
            throw new Error('These cards are already in the deck.');
          }
        }
      },
      enumerable: true,
      configurable: false
    },
    inPlay: {
        get: () => {
          return copyCards(inPlay);
        },
        set : (cards) => {
          if (areValidCards(cards)) {
            if (cards.length === 0) { //allow to be set to 0
              inPlay = [];
            } else if (!(Deck.contains(unused, cards)) && (!Deck.contains(used, cards))) { //don't allow the cards to be added if they're already in the Deck
              inPlay = copyCards(cards);
            } else {
              throw new Error('These cards are already in the deck.');
            }
          }
        },
        enumerable: true,
        configurable: false
      },
    usedCards: {
      get: () => {
        return copyCards(used);
      },
      set: (cards) => {
        if (areValidCards(cards)) {
          if (cards.length === 0) { //allow to be set to 0
            used = [];
          } else if (!(Deck.contains(unused, cards)) && (!Deck.contains(inPlay, cards))) { //don't allow the cards to be added if they're already in the Deck
            used = copyCards(cards);
          } else {
            throw new Error('These cards are already in the deck.');
          }
        }
      },
      enumerable: true,
      configurable: false
    },
    length: {
      get: () => {
        return unused.length;
      }
    }
  });
}

//let writable, configurable and enumerable default to private to lock object down
Object.defineProperties(Deck.prototype, { //prototype methods
  /**
   * Compares this with another Deck to see if they are equal.
   * @param other {Object} the object to compare to.
   * @returns {Boolean} true if the Decks have the same Cards in the same order.
   * */
  equals: {
    value: function(other) {
      if (!(other instanceof Deck)) {
        return false;
      } else if (other.unusedCards.length !== this.unusedCards.length || other.usedCards.length !== this.usedCards.length) {
        return false;
      } else {
        let result = true;
        let unused = this.unusedCards;
        let used = this.usedCards;
        let otherUnused = other.unusedCards;
        let otherUsed = other.usedCards;

        for (let i = 0; i < unused.length; i += 1) { //check the unused Cards
          if (!unused[i].equals(otherUnused[i])) {
            result = false;
            return result;
          }
        }

        for (let i = 0; i < used.length; i += 1) { //check the used Cards
          if (!used[i].equals(otherUsed[i])) {
            result = false;
            return result;
          }
        }

        return result;
      }
    },
  },
  /**
   * Makes an independent copy of this Deck.
   * @returns {Deck} the copy.
   */
  clone: {
    value: function() {
      let copy = new Deck();

      copy.unusedCards = copyCards(this.unusedCards);
      copy.usedCards = copyCards(this.usedCards);

      return copy;
    }
  },
  /**
   * Gives a string representation of the Deck, containing all the Cards in the unused pile.
   * @returns {String} the string representation.
   */
  toString: {
    value: function() {
      let output = '';
      let unused = this.unusedCards;
      unused.forEach((card) => {
        output += ' ' + card.toString();
      });
      return output;
    },
  },
  /**
   * Shuffles the Cards in the unused pile, using Fisher-Yates algorithm.
   * @returns this.
   */
  shuffle: {
    value: function() {
      let theDeck = this.unusedCards;
      for (let i = (theDeck.length - 1); i > 0; i -= 1) {
        let j = Math.floor(Math.random() * i);
        let iOld = theDeck[i];
        theDeck[i] = theDeck[j];
        theDeck[j] = iOld;
      }
      this.unusedCards = theDeck;
      return this;
    },
  },
  /**
   * Reshuffles the Deck by adding the cards of the used pile to the cards of the unused pile
   * and then shuffling.
   * @returns this.
   */
  reshuffle: {
    value: function() {
      let shuffledDeck = this.unusedCards;
      let used = this.usedCards;
      used.forEach(function(card) {
        shuffledDeck.push(card);
      });
      this.usedCards = [];
      this.unusedCards = shuffledDeck;
      this.shuffle();
      return this;
    },
  },
  /**
   * Deals the top Card in the unused pile.
   * @returns {Card} the dealt Card.
   * @throws {Error} if the Deck is empty.
   */
  deal: {
    value: function() {
      let theDeck = this.unusedCards;
      let inPlay = this.inPlay;
      let theCard;
      if (theDeck.length === 0) {
        throw new Error('Deck is empty, cannot deal.');
      } else {
        theCard = theDeck.pop();
        inPlay.push(theCard); //move the card to inPlay
        this.unusedCards = theDeck;
        this.inPlay = inPlay;
        return theCard.clone();
      }
    },
  },
  /**
   * Returns an Array of Cards to the usedCards pile.
   * @param cards {Array} the Array of Cards to return to the Deck.
   * @returns this.
   * @throws {Error} if the Cards are already in the Deck.
   */
  returnToDeck: {
    value: function(cards) {
      let used = this.usedCards;
      let inPlay = this.inPlay;
      if (cards.length > 0) {
        if (Deck.contains(inPlay, cards)) { //check that the Cards are in play and valid to return to the Deck
          for (let j = 0; j < cards.length; j += 1) {
            let found;
            for (let i = 0; i < inPlay.length && !found; i++) {
              if (inPlay[i].equals(cards[j])) { //remove each card from inPlay and put in usedCards
                used.push(inPlay[i]);
                inPlay.splice(i, 1);
                found = true; //when Card is found, move on to next Card
              }
            }
          }
        } else {
          throw new Error('These cards do not belong in the deck.');
        }
        this.inPlay = inPlay;
        this.usedCards = used;
      }
      return this;
    },
  },
  /**
   * Resets all of the cards in the Deck to the unusedCards pile.
   * @returns the reset Deck.
   */
  reset: {
      value: function() {
          let unused = this.unusedCards;
          let inPlay = this.inPlay;
          let used = this.usedCards;

          while (inPlay.length > 0) {
            unused.push(inPlay.pop());
          }
          while (used.length > 0) {
            unused.push(used.pop());
          }

          this.inPlay = inPlay;
          this.usedCards = used;
          this.unusedCards = unused;

          return this;
        }
    }
});

//static methods
Object.defineProperties(Deck, {
  /**
   * Checks if a set of Cards contains any of the Cards in another set of Cards.
   * @param set {Array} the Array of Cards to search.
   * @param cards {Array} the Array of Cards to search for.
   * @returns an Array of indices of all the Cards that the set contains.
   * @throws {TypeError} if the arguments are not Arrays.
   */
  contains: {
    value: function(set, cards) {
      let indices;

      if (!Array.isArray(set) || !Array.isArray(cards)) {
        throw new TypeError('Argument must be Array.');
      } else {
        for (let j = 0; j < cards.length; j += 1) {
          let found;
          for (let i = 0; i < set.length && !found; i += 1) {
            if (set[i].equals(cards[j])) {
              if (!indices) {
                indices = [];
              }
              indices.push(i);
              found = true; //if the card is found, look for the next card
            }
          }
        }
        return indices;
      }
    }
  },
  /**
   * Finds all of a type of Card in a set of Cards.
   * @param set {Array} the Array of Cards to search.
   * @param type {string} the name of the type of Card (suit or value).
   * @returns an Array of indices of all of the Cards in the set that matches the type.
   * @throws TypeError if the set argument is not an Array or of the type argument
   * is not a valid Card suit or Card value.
   */
  findAll: {
    value: function(set, type) {
      let theType;
      let values;
      let suits;

      if (!Array.isArray(set)) {
        throw new TypeError('Argument must be Array.');
      } else {
        if (Card.values.indexOf(type.toUpperCase()) !== -1) {
          values = [type];
          suits = Card.suits;
        } else if (Card.suits.indexOf(type.toUpperCase()) !== -1) {
          values = Card.values;
          suits = [type];
        } else {
          throw new TypeError('Cant\'t search for ' + type + ' in the deck.');
        }

        theType = Deck.createSet(suits, values);

        return Deck.contains(set, theType);
      }
    }
  },
  /**
   * Creates a set of Cards.
   * @param suits {Array} the suits to include in the set.
   * @param values {Array} the values to include in the set.
   * @returns {Array} the set.
   * @throws {TypeError} if any of the suits or values is not a valid Card suit or Card value.
   */
  createSet: {
    value: function(suits, values) {
        let newSet = [];
        let theCard;
        suits.forEach((suit) => {
          values.forEach((value) => {
            try {
              theCard = new Card(value, suit);
            } catch (e) {
              throw new TypeError('Not a valid suit or value.');
            }
            newSet.push(theCard);
          });
        });
        return newSet;
      }
  }
});

//helper functions
function copyCards(cards) { //copies all the Cards
  if (areValidCards) {
    return cards.map((card) => card.clone());
  }
}

function areValidCards(cards) { //checks if each Card is a valid Card
  if (!Array.isArray(cards)) {
    throw new TypeError('Argument not an Array');
  } else {
    cards.forEach((card) => {
      if (!Card.isValid(card)) {
        throw new TypeError(card + ' is not a valid card!');
      }
    });
    return true;
  }
}

/**
 * Exports.
 */
module.exports = Deck;
