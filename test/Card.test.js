/**
 * Tests for the Card type.
 *
 * @author Molly Arhammar
 * @version 1.16.1
 */

'use strict';

const expect = require('chai').expect;

describe('Card', () => {
    const SUIT = 'clubs';
    const VALUE = 'ten';

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
            // Create a new ToDoItem before every test.
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

});
