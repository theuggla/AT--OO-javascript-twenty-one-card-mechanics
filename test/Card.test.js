/**
 * Tests for the Card type.
 *
 * @author Molly Arhammar
 * @version 1.16.1
 */

'use strict';

const expect = require('chai').expect;

describe('Card', () => {
  const SUIT = 'CLUBS';
  const VALUE = 'TEN';
  const JOKER = 'JOKER';

  let Card;

  describe('Type', () => {
    it('should be defined', (done) => {
      Card = require('../src/Card.js');
      done();
    });
  });

  describe('Constructor', () => {
    let aCard;

    beforeEach(() => {
      // Create a new Card before every test.
      aCard = new Card(VALUE, SUIT);
    });

    it('should be instance of Card', (done) => {
      expect(aCard).to.be.an.instanceOf(Card);
      done();
    });

    it('should have property suit', (done) => {
      expect(aCard).to.have.property('suit');
      done();
    });

    it('should have property value', (done) => {
      expect(aCard).to.have.property('value');
      done();
    });

    it('should return randomized value and suit when not passed a parameter', (done) => {
      let anotherCard = new Card();
      expect(anotherCard.suit).to.not.equal('undefined');
      expect(anotherCard.value).to.not.equal('undefined');
      done();
    });
  });

  describe('Properties', () => {
    describe('suit', () => {
      let aCard;

      beforeEach(() => {
        // Create a new Card before every test.
        aCard = new Card(VALUE, SUIT);
      });

      it('should return the suit', (done) => {
        expect(aCard.suit).to.equal(SUIT);
        done();
      });

      it('should throw an Error if the suit tries to be changed (read only)', (done) => {
        expect(() => {
          aCard.suit = 'spades';
        }).to.throw(Error);
        done();
      });

      it('should throw a TypeError if the suit is initially set to an invalid value', (done) => {
        expect(() => {
          new Card(VALUE, 'hej');
        }).to.throw(Error);
        done();
      });

    });

    describe('value', () => {
      let aCard;

      beforeEach(() => {
        // Create a new Card before every test.
        aCard = new Card(VALUE, SUIT);
      });

      it('should return the value', (done) => {
        expect(aCard.value).to.equal(VALUE);
        done();
      });

      it('should throw an Error if the value tries to be changed (read only)', (done) => {
        expect(() => {
          aCard.value = 'five';
        }).to.throw(Error);
        done();
      });

      it('should throw a TypeError if the value is initially set to an invalid value', (done) => {
        expect(() => {
          new Card('hej', SUIT);
        }).to.throw(Error);
        done();
      });

    });
    describe('acevalue', () => {
      let aCard;

      it('should be defined', (done) => {
        aCard = new Card('ACE', 'HEARTS');
        expect(aCard).to.have.property('acevalue');
        done();
      });
      it('should not be defined', (done) => {
        aCard = new Card('TWO', 'HEARTS');
        expect(aCard).to.not.have.property('acevalue');
        done();
      });
      it('should be able to be changed to 1', (done) => {
        aCard = new Card('ACE', 'HEARTS');
        aCard.acevalue = 1;
        expect(aCard.acevalue).to.equal(1);
        done();
      });
      it('should be able to be changed to 14', (done) => {
        aCard = new Card('ACE', 'HEARTS');
        aCard.acevalue = 14;
        expect(aCard.acevalue).to.equal(14);
        done();
      });
      it('should throw an Error if changed to anything that\'s not 1 or 14', (done) => {
        aCard = new Card('ACE', 'HEARTS');
        expect(() => {
          aCard.acevalue = 10;
        }).to.throw(Error);
        done();
      });
    });
  });

  describe('Prototype methods', () => {
    describe('clone method', () => {
      let aCard;

      beforeEach(() => {
        // Create a new Card before every test.
        aCard = new Card(VALUE, SUIT);
      });

      it('should be defined', (done) => {
        expect(Card.prototype).to.have.property('clone').that.is.a('Function');
        done();
      });

      it('should return a Card object', (done) => {
        expect(aCard.clone()).to.be.an.instanceof(Card);
        done();
      });

      it('should return a copy', (done) => {
        expect(aCard.clone()).to.not.equal(aCard);
        expect(aCard.clone()).to.deep.equal(aCard);
        done();
      });

      it('should copy the acevalue', (done) => {
        let anotherCard = new Card('ACE', 'SPADES');
        expect(anotherCard.clone().acevalue).to.equal(anotherCard.acevalue);
        done();
      });
    });

    describe('toJSON method', () => {
      let aCard;

      beforeEach(() => {
        // Create a new Card before every test.
        aCard = new Card(VALUE, SUIT);
      });

      it('should be defined', (done) => {
        expect(Card.prototype).to.have.property('toJSON').that.is.a('Function');
        done();
      });

      it('should return valid JSON', (done) => {
        let json = JSON.stringify(aCard.toJSON());
        expect(() => {
          JSON.parse(json);
        }).not.to.throw(SyntaxError);
        expect(json.indexOf(VALUE), 'expected json to contain TEN').to.not.equal(-1);
        done();
      });
    });

    describe('toString method', () => {
      let aCard;

      beforeEach(() => {
        // Create a new Card before every test.
        aCard = new Card(VALUE, SUIT);
      });

      it('should be defined', (done) => {
        expect(Card.prototype).to.have.ownProperty('toString');
        expect(Card.prototype).to.have.property('toString').that.is.a('Function');
        done();
      });

      it('should return a string', (done) => {
        expect(Card.prototype).to.have.ownProperty('toString');
        expect(aCard.toString()).to.be.a('string');
        done();
      });

      it('should return valid string when Card was called without parameters', (done) => {
        aCard  = new Card();
        expect(aCard.toString()).to.not.equal('undefined');
        done();
      });

      it('should return valid string when card is a joker', (done) => {
        aCard = new Card('JOKER');
        expect(aCard.toString()).to.equal('JOKER');
        done();
      });

    });

    describe('equals method', () => {
      let aCard;

      beforeEach(() => {
        // Create a new Card before every test.
        aCard = new Card(VALUE, SUIT);
      });

      it('should be defined', (done) => {
        expect(Card.prototype).to.have.ownProperty('equals');
        expect(Card.prototype).to.have.property('equals').that.is.a('Function');
        done();
      });

      it('should return true', (done) => {
        let anotherCard = new Card(VALUE, SUIT);
        expect(aCard.equals(anotherCard)).to.equal(true);
        done();
      });

      it('should return false', (done) => {
        let anotherCard = new Card('four', 'spades');
        expect(aCard.equals(anotherCard)).to.equal(false);
        expect(aCard.equals({suit: 'HEARTS', value: 'TEN'})).to.equal(false);
        expect(aCard.equals([])).to.equal(false);
        expect(aCard.equals(42)).to.equal(false);
        expect(aCard.equals('Hej')).to.equal(false);
        done();
      });
      it('should return true when both cards are jokers', (done) => {
        let aJoker = new Card(JOKER);
        let anotherJoker = new Card(JOKER);
        expect(aJoker.equals(anotherJoker)).to.equal(true);
        done();
      });
    });

    describe('compareTo method', () => {
      let aCard;

      beforeEach(() => {
        // Create a new Card before every test.
        aCard = new Card(VALUE, SUIT);
      });

      it('should be defined', (done) => {
        expect(Card.prototype).to.have.ownProperty('compareTo');
        expect(Card.prototype).to.have.property('compareTo').that.is.a('Function');
        done();
      });

      it('should throw a TypeError when called to compare not-a-Card', (done) => {
        expect(() => {
          aCard.compareTo({});
        }).to.throw(TypeError);
        expect(() => {
          aCard.compareTo(42);
        }).to.throw(TypeError);
        expect(() => {
          aCard.compareTo([]);
        }).to.throw(TypeError);
        expect(() => {
          aCard.compareTo({suit: 'HEARTS', value: 'TEN'});
        }).to.throw(TypeError);
        expect(() => {
          aCard.compareTo('hej');
        }).to.throw(TypeError);
        done();
      });

      it('should return valid result when card is a Joker', (done) => {
        let anotherCard = new Card('JOKER');
        expect(aCard.compareTo(anotherCard)).to.equal(11);
        done();
      });

      it('should return equal', (done) => {
        let anotherCard = new Card(VALUE, SUIT);
        expect(aCard.compareTo(anotherCard)).to.equal(0);
        done();
      });

      it('should return negative', (done) => {
        let anotherCard = new Card('KING', 'HEARTS');
        expect(aCard.compareTo(anotherCard)).to.equal(-3);
        done();
      });

      it('should return positive', (done) => {
        let anotherCard = new Card('TWO', 'HEARTS');
        expect(aCard.compareTo(anotherCard)).to.equal(8);
        done();
      });

    });

    describe('valueOf method', () => {
      let aCard;

      beforeEach(() => {
        // Create a new Card before every test.
        aCard = new Card(VALUE, SUIT);
      });

      it('should be defined', (done) => {
        expect(Card.prototype).to.have.ownProperty('valueOf');
        expect(Card.prototype).to.have.property('valueOf').that.is.a('Function');
        done();
      });

      it('should return a number', (done) => {
        expect(Card.prototype).to.have.ownProperty('valueOf');
        expect(aCard.valueOf()).to.be.a('number');
        done();
      });

      it('should return correct value', (done) => {
        expect(aCard.valueOf()).to.equal(10);
        done();
      });

      it('should return valid result when card is a joker', (done) => {
        aCard = new Card('JOKER');
        expect(aCard.valueOf()).to.equal(-1);
        done();
      });

    });
  });

  describe('Static properties', () => {
    describe('suits', () => {
      it('should be defined', (done) => {
        expect(Card).to.have.property('suits');
        done();
      });

      it('should return an Array', (done) => {
        expect(Card.suits).to.be.an.instanceof(Array);
        done();
      });

      it('should return a copy', (done) => {
        let suits = Card.suits;
        suits = ['HEJ', 'DÅ'];
        expect(Card.suits).to.not.equal(suits);
        done();
      });

      it('should throw an Error if the isOverdue is set (should be read-only!)', (done) => {
        expect(() => {
          Card.suits = ['HEJ', 'DÅ'];
        }).to.throw(Error);
        done();
      });
    });

    describe('values', () => {
      it('should be defined', (done) => {
        expect(Card).to.have.property('values');
        done();
      });

      it('should return an Array', (done) => {
        expect(Card.values).to.be.an.instanceof(Array);
        done();
      });

      it('should return a copy', (done) => {
        let values = Card.values;
        values = ['HEJ', 'DÅ'];
        expect(Card.values).to.not.equal(values);
        done();
      });

      it('should throw an Error if the isOverdue is set (should be read-only!)', (done) => {
        expect(() => {
          Card.values = ['HEJ', 'DÅ'];
        }).to.throw(Error);
        done();
      });
    });

  });

  describe('Static methods', () => {
    describe('isValid method', () => {
      it('should be defined', (done) => {
        expect(Card).to.have.property('isValid').that.is.a('Function');
        done();
      });

      it('should return true', (done) => {
        let aCard = new Card(VALUE, SUIT);
        expect(Card.isValid(aCard)).to.equal(true);
        done();
      });

      it('should return false when it doesn\'t receive a Card', (done) => {
        expect(Card.isValid(undefined)).to.equal(false);
        expect(Card.isValid(null)).to.equal(false);
        expect(Card.isValid([])).to.equal(false);
        expect(Card.isValid(42)).to.equal(false);
        expect(Card.isValid('Hej')).to.equal(false);
        expect(Card.isValid(true)).to.equal(false);
        expect(Card.isValid({suit: 'HEARTS', value: 'TEN'})).to.equal(false);
        done();
      });

      it('should throw an Error if tries to be reassigned', (done) => {
        expect(() => {
          Card.isValid = ['HEJ', 'DÅ'];
        }).to.throw(Error);
        done();
      });
    });
  });
});
