/**
 * Tests for the Dealer type.
 *
 * @author Molly Arhammar
 * @version 1.16.1
 */

'use strict';

const expect = require('chai').expect;
const Card = require('../src/Card.js');
const CardPlayer = require('../src/CardPlayer.js');
const BlackJackPlayer = require('../src/BlackJackPlayer.js');

describe('Dealer', () => {
    const aceHAND = [new Card('ACE', 'spades'), new Card('ace', 'hearts'), new Card('five', 'diamonds')];
    const HAND = [new Card('five', 'spades'), new Card('two', 'hearts'), new Card('five', 'diamonds')];
    const ACE = new Card('ace', 'hearts');
    const TEN = new Card('ten', 'hearts');
    const NAME = 'Arthur Dent';

    let Dealer;

    describe('Type', () => {
        it('should be defined', (done) => {
            Dealer = require('../src/Dealer.js');
            done();
        });
    });

    describe('Constructor', () => {
        let aPlayer;

        beforeEach(() => {
            // Create a new Dealer before every test.
            aPlayer = new Dealer();
        });

        it('should be instance of Dealer', (done) => {
            expect(aPlayer).to.be.an.instanceOf(Dealer);
            done();
        });

        it('should have constructor Dealer', (done) => {
            expect(aPlayer.constructor).to.equal(Dealer);
            done();
        });

        it('should be instance of CardPlayer', (done) => {
            expect(aPlayer).to.be.an.instanceOf(CardPlayer);
            done();
        });

        it('should not be instance of BlackJackPlayer', (done) => {
            expect(aPlayer).not.to.be.an.instanceOf(BlackJackPlayer);
            done();
        });
    });

    describe('Inherited Properties', () => {
        describe('name', () => {
            let aDealer;

            beforeEach(() => {
                // Create a new Dealer before every test.
                aDealer = new Dealer(NAME);
            });

            it('should return the name', (done) => {
                expect(aDealer.name).to.equal(NAME);
                done();
            });

            it('should set the name to The Dealer if no name is given', (done) => {
                let anotherDealer = new Dealer();
                expect(anotherDealer.name).to.equal('The Dealer');
                done();
            });

            it('should be able to be changed', (done) => {
                aDealer.name = 'Karlsson';
                expect(aDealer.name).to.equal('Karlsson');
                done();
            });

            it('should throw a TypeError if the text is set to a non-string value', (done) => {
                expect(() => {
                    aDealer.name = undefined;
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.name = null;
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.name = 42;
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.name = {};
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.name = [];
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.name = new String(NAME);
                }).to.throw(TypeError);
                done();
            });

            it('should throw an Error when if the name is set to an empty string', (done) => {
                expect(() => {
                    aDealer.name = '';
                }).to.throw(Error);
                done();
            });

            it('should throw an Error if the text is to a string of a length greater than 20.', (done) => {
                expect(() => {
                    aDealer.name = 'A'.repeat(21);
                }).to.throw(Error);
                done();
            });

        });

        describe('hand', () => {
            let aDealer;

            beforeEach(() => {
                // Create a new Dealer before every test.
                aDealer = new Dealer(NAME);
            });

            it('should return the hand', (done) => {
                expect(aDealer.hand).to.deep.equal([]);
                aDealer.hand = HAND;
                expect(aDealer.hand).to.deep.equal(HAND);
                done();
            });

            it('should set a copy of the hand', (done) => {
                aDealer.hand = HAND;
                expect(aDealer.hand).to.not.equal(HAND);
                done();
            });

            it('should return a copy of the hand', (done) => {
                aDealer.hand = HAND;
                let myHand = aDealer.hand;
                myHand = aceHAND;
                expect(aDealer.hand).to.not.deep.equal(aceHAND);
                done();
            });

            it('should throw a TypeError if the hand is set no a non Array value', (done) => {
                expect(() => {
                    aDealer.hand = 42;
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.hand = new Card();
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.hand = null;
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.hand = undefined;
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.hand = 'hej';
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.hand = false;
                }).to.throw(TypeError);
                done();
            });

            it('should throw an Error if the hand is set to an Array of non valid cards', (done) => {
                expect(() => {
                    aDealer.hand = [42];
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.hand = [{suit: 'sppdes', value: 'ace'}];
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.hand = [undefined];
                }).to.throw(TypeError);
                expect(() => {
                    aDealer.hand = [new Card(), undefined];
                }).to.throw(TypeError);
                done();
            });

        });
        describe('points', () => {
            let aDealer;

            beforeEach(() => {
                // Create a new Dealer before every test.
                aDealer = new Dealer(NAME);
            });

            it('should be defined', (done) => {
                expect(aDealer).to.have.property('points');
                done();
            });
            it('should return the points', (done) => {
                expect(aDealer.points).to.equal(0);
                aDealer.hand = HAND;
                expect(aDealer.points).to.equal(12);
                done();
            });
            it('should automatically change the acevalue if points go over 21', (done) => {
                aDealer.hand = aceHAND;
                expect(aDealer.points).to.equal(20);
                expect(aDealer.hand[1].acevalue).to.equal(1);
                done();
            });
            it('should not change the acevalue of more cards than necessary', (done) => {
                aDealer.hand = aceHAND;
                expect(aDealer.points).to.equal(20);
                expect(aDealer.hand[1].acevalue).to.equal(1);
                expect(aDealer.hand[0].acevalue).to.equal(14);
                done();
            });
            it('should change the next acevalue when necessary', (done) => {
                aDealer.hand = aceHAND;
                expect(aDealer.points).to.equal(20);
                aDealer.addToHand(new Card('ace', 'clubs'));
                expect(aDealer.points).to.equal(21);
                expect(aDealer.hand[1].acevalue).to.equal(1);
                expect(aDealer.hand[0].acevalue).to.equal(1);
                expect(aDealer.hand[3].acevalue).to.equal(14);
                done();
            });
        });
    });

    describe('Own Properties', () => {
        describe('inPlay', () => {
            let aDealer;

            beforeEach(() => {
                // Create a new Dealer before every test.
                aDealer = new Dealer(NAME);
            });

            it('should have property', (done) => {
                expect(aDealer).to.have.property('inPlay');
                done();
            });

            it('should return true', (done) => {
                expect(aDealer).to.have.property('inPlay', true);
                aDealer.hand = aceHAND;
                expect(aDealer).to.have.property('inPlay', true);
                done();
            });

            it('should return false', (done) => {
                aDealer.hand = HAND;
                aDealer.addToHand(TEN);
                expect(aDealer).to.have.property('inPlay', false);
                done();
            });

            it('should throw an Error if the inPlay is set (should be read-only!)', (done) => {
                expect(() => {
                    aDealer.inPlay = true;
                }).to.throw(Error);
                done();
            });
        });
    });

    describe('Inherited prototype methods', () => {
        describe('valueOf', () => {
            let aDealer;

            beforeEach(() => {
                // Create a new Dealer before every test.
                aDealer = new Dealer(NAME);
            });

            it('should be defined', (done) => {
                expect(aDealer).to.have.property('valueOf').that.is.a('Function');
                done();
            });
            it('should return the points', (done) => {
                expect(aDealer.valueOf()).to.equal(0);
                aDealer.hand = aceHAND;
                expect(aDealer.valueOf()).to.equal(20);
                done();
            });
        });
        describe('equals', () => {
            let aDealer;

            beforeEach(() => {
                // Create a new Dealer before every test.
                aDealer = new Dealer(NAME);
            });

            it('should be defined', (done) => {
                expect(aDealer).to.have.property('equals').that.is.a('Function');
                done();
            });

            it('should return true', (done) => {
                let anotherDealer = new Dealer(NAME);
                expect(aDealer.equals(anotherDealer)).to.equal(true);
                expect(aDealer.equals(new Dealer(NAME))).to.equal(true);
                done();
            });

            it('should return false', (done) => {
                let anotherDealer = new Dealer('Inte Karlsson');
                expect(aDealer.equals(anotherDealer)).to.equal(false);
                expect(aDealer.equals([])).to.equal(false);
                expect(aDealer.equals(42)).to.equal(false);
                expect(aDealer.equals('Hej')).to.equal(false);
                expect(aDealer.equals(null)).to.equal(false);
                expect(aDealer.equals(true)).to.equal(false);
                done();
            });
        });

        describe('addToHand', () => {
            let aDealer;

            beforeEach(() => {
                // Create a new Dealer before every test.
                aDealer = new Dealer(NAME);
            });

            it('should be defined', (done) => {
                expect(aDealer).to.have.property('addToHand').that.is.a('Function');
                done();
            });

            it('should add a card to the hand', (done) => {
                aDealer.addToHand(ACE);
                expect(aDealer.hand).to.deep.equal([ACE]);
                done();
            });

            it('should add a copy of the card to the hand', (done) => {
                aDealer.addToHand(ACE);
                expect(aDealer.hand).to.not.equal([ACE]);
                done();
            });

            it('should throw Error if non valid card is added to hand.', (done) => {
                expect(() => {
                    aDealer.addToHand(undefined);
                }).to.throw(Error);
                expect(() => {
                    aDealer.addToHand('hej');
                }).to.throw(Error);
                expect(() => {
                    aDealer.addToHand({});
                }).to.throw(Error);
                expect(() => {
                    aDealer.addToHand([]);
                }).to.throw(Error);
                expect(() => {
                    aDealer.addToHand({suit: 'spades', value:'ace'});
                }).to.throw(Error);
                done();
            });
        });

        describe('reset', () => {
            let aDealer;

            beforeEach(() => {
                // Create a new Dealer before every test.
                aDealer = new Dealer(NAME);
            });

            it('should be defined', (done) => {
                expect(aDealer).to.have.property('reset').that.is.a('Function');
                done();
            });

            it('should set hand to empty array', (done) => {
                aDealer.hand = HAND;
                aDealer.reset()
                expect(aDealer.hand).to.deep.equal([]);
                done();
            });

            it('should return the hand', (done) => {
                aDealer.hand = HAND;
                let theHand = aDealer.reset();
                expect(theHand).to.deep.equal(HAND);
                done();
            });
        });
    });

    describe('Own prototype methods', () => {
        describe('clone', () => {
            let aDealer;

            beforeEach(() => {
                // Create a new Dealer before every test.
                aDealer = new Dealer(NAME);
            });

            it('should be defined', (done) => {
                expect(Dealer.prototype).to.have.ownProperty('clone');
                expect(aDealer).to.have.property('clone').that.is.a('Function');
                done();
            });

            it('should return a Dealer object', (done) => {
                expect(aDealer.clone()).to.be.an.instanceof(Dealer);
                done();
            });

            it('should return a copy', (done) => {
                expect(aDealer.clone()).to.not.equal(aDealer);
                expect(aDealer.clone()).to.deep.equal(aDealer);
                done();
            });

            it('should copy the hand (non privacy-leakish)', (done) => {
                expect(aDealer.clone().hand).to.deep.equal(aDealer.hand);
                expect(aDealer.clone().hand).to.not.equal(aDealer.hand);
                done();
            });
        });

        describe('requestCard', () => {
            let aDealer;

            beforeEach(() => {
                // Create a new Dealer before every test.
                aDealer = new Dealer(NAME);
            });

            it('should be defined', (done) => {
                expect(Dealer.prototype).to.have.ownProperty('requestCard');
                expect(aDealer).to.have.property('requestCard').that.is.a('Function');
                done();
            });

            it('should return false when player is not in play', (done) => {
                aDealer.hand = HAND;
                aDealer.addToHand(TEN);
                expect(aDealer.requestCard()).to.equal(false);
                done();
            });
        });

        describe('toString', () => {
            let aDealer;

            beforeEach(() => {
                // Create a new Dealer before every test.
                aDealer = new Dealer(NAME);
            });

            it('should be defined', (done) => {
                expect(Dealer.prototype).to.have.ownProperty('toString');
                expect(aDealer).to.have.property('toString').that.is.a('Function');
                done();
            });

            it('should return a string', (done) => {
                expect(typeof aDealer.toString()).to.equal('string');
                done();
            });

        });
    });
});

