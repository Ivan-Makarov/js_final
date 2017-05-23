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

    isIntersect(actor) {
        if (!Actor.prototype.isPrototypeOf(actor) || actor === undefined) {
            throw new Error('Not an actor')
        }
        if (actor === this) {
            return false
        }
        if ((this.right > actor.left && this.left < actor.right) && (this.bottom > actor.top && this.top < actor.bottom)) {
            return true
        } else return false
    }
}

class Level {
    constructor(grid = [], actors) {
        this.grid = grid;
        this.actors = actors;
        this.height = grid.length;

        Object.defineProperty(this, 'width', {
            get: function () {
                let longestLine = 0;
                this.grid.forEach(item => {
                    if (item.length > longestLine) {
                        longestLine = item.length;
                    }
                });
                return longestLine
            }
        });

        this.status = null;
        this.finishDelay = 1;

        this.player = new Actor();
    }
}
