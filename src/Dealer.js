/**
 * Module for Dealer.
 * @augments Player
 *
 * @author Molly Arhammar
 * @version 1.0.0
 */

'use strict';

const Card = require('../src/Card.js');
const Player = require('../src/Player.js');

function Dealer(name = 'a dealer') {
    Player.call(this, name);
}

Dealer.prototype = Object.create(Player.prototype);
Dealer.prototype.constructor = Dealer;

Dealer.prototype.requestCard = function() {
    return this.inPlay;
};

module.exports = Dealer;
