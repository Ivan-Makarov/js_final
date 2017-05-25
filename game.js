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
            configurable: true
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

class Player extends Actor {
    constructor(pos = new Vector(0, 0)) {
        pos.y -= 0.5;
        super(pos, new Vector(0.8, 1.5), new Vector(0, 0));

        Object.defineProperty(this, 'type', {
            value: 'player',
            writable: false,
            configurable: true
        });
    }
}

class Level {
    constructor(grid = [], actors = []) {
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

        this.player = new Player();
    }

    isFinished() {
        if (this.status !== null && this.finishDelay < 0) {
            return true
        } else {
            return false
        };
    }

    actorAt(object) {
        if (!Actor.prototype.isPrototypeOf(object)) {
            throw new Error('Not an actor');
        }
        let intersectingObject;
        this.actors.forEach(actor => {
            if (actor.isIntersect(object) && intersectingObject === undefined) {
                intersectingObject = actor;
            }
        });
        return intersectingObject;
    }

    obstacleAt(pos, size) {
        if (!Vector.prototype.isPrototypeOf(pos) || !Vector.prototype.isPrototypeOf(size)) {
            throw new Error('Not a vector');
        }

        let intersectingObject = new Actor(pos, size);

        if (intersectingObject.left < 0 || intersectingObject.right > this.width || intersectingObject.top < 0) {
            return 'wall'
        }

        if (intersectingObject.bottom > this.height) {
            return 'lava'
        }

        let top = Math.round(intersectingObject.top);
        let bottom = Math.round(intersectingObject.bottom);
        let right = Math.round(intersectingObject.right);
        let left = Math.round(intersectingObject.left)

        let obstacle = undefined

        for (let i = top; i < bottom; i++) {
            for (let j = left; j < right; j++) {
                if (this.grid[i][j] !== undefined) {
                    obstacle = this.grid[i][j];
                }
            }
        }

        return obstacle
    }

    removeActor(actor) {
        let actorIndex = this.actors.findIndex(function(element) {
            if (element === actor) {
                return element
            }
        });
        this.actors.splice(actorIndex, 1)
    }
}
