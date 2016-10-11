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

});
