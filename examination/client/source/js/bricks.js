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
            return "/image/0.png";
        } else {
            return "/image/" + this.value + ".png";
        }
    }
}

module.exports = Brick;
