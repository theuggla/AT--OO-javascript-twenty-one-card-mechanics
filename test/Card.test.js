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

    let Card;

    describe('Type', () => {
        it('should be defined', (done) => {
            Card = require('../src/Card');
            done();
        });
    });

    describe('Constructor', () => {
        let aCard;

        beforeEach(() => {
            // Create a new Card before every test.
            aCard = new Card(SUIT, VALUE);
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
                aCard = new Card(SUIT, VALUE);
            });

            it('should return the suit', (done) => {
                expect(aCard.suit).to.equal(SUIT);
                done();
            });

            it('should throw an Error if the suit tries to be changed', (done) => {
                expect(() => {
                    aCard.suit = 'spades';
                }).to.throw(Error);
                done();
            });

            it('should throw a TypeError if the suit is initially set to an invalid value', (done) => {
                expect(() => {
                    new Card('hej', VALUE);
                }).to.throw(Error);
                done();
            });

        });

        describe('value', () => {
            let aCard;

            beforeEach(() => {
                // Create a new Card before every test.
                aCard = new Card(SUIT, VALUE);
            });

            it('should return the value', (done) => {
                expect(aCard.value).to.equal(VALUE);
                done();
            });

            it('should throw an Error if the value tries to be changed', (done) => {
                expect(() => {
                    aCard.value = 'five';
                }).to.throw(Error);
                done();
            });

            it('should throw a TypeError if the value is initially set to an invalid value', (done) => {
                expect(() => {
                    new Card(SUIT, 'hej');
                }).to.throw(Error);
                done();
            });

        });
    });

    describe('Prototype methods', () => {
        let aCard;

        beforeEach(() => {
            // Create a new Card before every test.
            aCard = new Card(SUIT, VALUE);
        });

        describe('clone method', () => {
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
        });

        describe('toJSON method', () => {
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
                aCard = new Card(undefined, 'JOKER');
                expect(aCard.toString()).to.equal('JOKER');
                done();
            });

        });

        describe('equals method', () => {
            it('should be defined', (done) => {
                expect(Card.prototype).to.have.ownProperty('equals');
                expect(Card.prototype).to.have.property('equals').that.is.a('Function');
                done();
            });

            it('should return true', (done) => {
                let anotherCard = new Card(SUIT, VALUE);
                expect(aCard.equals(anotherCard)).to.equal(true);
                done();
            });

            it('should return false', (done) => {
                let anotherCard = new Card('spades', 'four');
                expect(aCard.equals(anotherCard)).to.equal(false);
                expect(aCard.equals({suit: 'HEARTS', value: 'TEN'})).to.equal(false);
                expect(aCard.equals([])).to.equal(false);
                expect(aCard.equals(42)).to.equal(false);
                expect(aCard.equals('Hej')).to.equal(false);
                done();
            });

        });

        describe('compareTo method', () => {
            it('should be defined', (done) => {
                expect(Card.prototype).to.have.ownProperty('compareTo');
                expect(Card.prototype).to.have.property('compareTo').that.is.a('Function');
                done();
            });

            it('should throw a TypeError when called to compare not-a-Card', (done) => {
                expect( () => {
                    aCard.compareTo({});
                }).to.throw(TypeError);
                expect( () => {
                    aCard.compareTo(42);
                }).to.throw(TypeError);
                expect( () => {
                    aCard.compareTo([]);
                }).to.throw(TypeError);
                expect( () => {
                    aCard.compareTo({suit: 'HEARTS', value: 'TEN'});
                }).to.throw(TypeError);
                expect( () => {
                    aCard.compareTo('hej');
                }).to.throw(TypeError);
                done();
            });

            it('should return valid result when card is a Joker', (done) => {
                let anotherCard = new Card(undefined, 'JOKER');
                expect(aCard.compareTo(anotherCard)).to.equal(11);
                done();
            });

            it('should return equal', (done) => {
                let anotherCard = new Card(SUIT, VALUE);
                expect(aCard.compareTo(anotherCard)).to.equal(0);
                done();
            });

            it('should return negative', (done) => {
                let anotherCard = new Card('HEARTS', 'KING');
                expect(aCard.compareTo(anotherCard)).to.equal(-3);
                done();
            });

            it('should return positive', (done) => {
                let anotherCard = new Card('HEARTS', 'TWO');
                expect(aCard.compareTo(anotherCard)).to.equal(8);
                done();
            });

        });

        describe('valueOf method', () => {
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
                aCard = new Card(undefined, 'JOKER');
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
                let aCard = new Card(SUIT, VALUE);
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
