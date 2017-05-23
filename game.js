'use strict';

class Vector {
    constructor(coordX = 0, coordY = 0) {
        this.x = coordX;
        this.y = coordY;
    }

    plus(vector) {
        if (!Vector.prototype.isPrototypeOf(vector)) {
            throw new Error('Можно прибавлять к вектору только вектор типа Vector');
        }

        let newX = this.x + vector.x;
        let newY = this.y + vector.y;
        return new Vector(newX, newY)
    }

    times(multiplier) {
        let newX = this.x * multiplier;
        let newY = this.y * multiplier;
        return new Vector(newX, newY)
    }
}

class Actor {
    constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
        if (!Vector.prototype.isPrototypeOf(pos) || !Vector.prototype.isPrototypeOf(size) || !Vector.prototype.isPrototypeOf(speed)) {
            throw new Error('Not a vector')
        }

        this.pos = pos;
        this.size = size;
        this.speed = speed;

        this.act = function () {};

        Object.defineProperty(this, 'type', {
            value: 'actor',
            writable: false,
            configurable: false
        });

        Object.defineProperty(this, 'left', {
            get: function () {
                return this.pos.x;
            }
        });

        Object.defineProperty(this, 'right', {
            get: function () {
                return this.pos.x + this.size.x;
            }
        });

        Object.defineProperty(this, 'top', {
            get: function () {
                return this.pos.y;
            }
        });

        Object.defineProperty(this, 'bottom', {
            get: function () {
                return this.pos.y + this.size.y;
            }
        });
    }
}
