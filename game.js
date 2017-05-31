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

        Object.defineProperty(this, 'type', {
            value: 'actor',
            writable: false,
            configurable: true
        });

        Object.defineProperty(this, 'left', {
            get: () => {
                return this.pos.x;
            }
        });

        Object.defineProperty(this, 'right', {
            get: () => {
                return this.pos.x + this.size.x;
            }
        });

        Object.defineProperty(this, 'top', {
            get: () => {
                return this.pos.y;
            }
        });

        Object.defineProperty(this, 'bottom', {
            get: () => {
                return this.pos.y + this.size.y;
            }
        });
    }

    act() {

    }

    isIntersect(actor) {
        if (!Actor.prototype.isPrototypeOf(actor) || !actor) {
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
    constructor(grid = [], actors = []) {
        this.grid = grid;
        this.actors = actors;
        this.height = grid.length;

        Object.defineProperty(this, 'width', {
            get: () => {
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

        this.player = this.actors.find(actor => {
            if (actor.type === 'player') return actor;
        })
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
            if (actor.isIntersect(object) && !intersectingObject) {
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
        let left = Math.round(intersectingObject.left);

        let obstacle = undefined;

        for (let x = top; x < bottom; x++) {
            for (let y = left; y < right; y++) {
                if (this.grid[x][y] && !obstacle) {
                    obstacle = this.grid[x][y];
                }
            }
        }

        return obstacle
    }

    removeActor(actor) {
        let actorIndex = this.actors.findIndex(element => {
            if (element === actor) {
                return element
            }
        });
        this.actors.splice(actorIndex, 1)
    }

    noMoreActors(type) {
        let noMoreActors = true;

        let actorsLeft = this.actors.find(actor => {
            if (actor.type === type) {
                return actor;
            }
        })

        if (actorsLeft) {
            noMoreActors = false;
        }

        return noMoreActors
    }

    playerTouched(obstacleType, actor) {
        if (this.status !== null) {
            return
        }

        if (obstacleType === 'lava' || obstacleType === 'fireball') {
            this.status = 'lost';
            return
        }

        if (obstacleType === 'coin' && actor.type === 'coin') {
            this.removeActor(actor)
        }

        let coinsLeft = this.actors.find(actor => {
            if (actor.type === 'coin') {
                return actor
            }
        });

        if (!coinsLeft) {
            this.status = 'won';
            return
        }
    }
}

class LevelParser {
    constructor(dictionary) {
        this.dictionary = dictionary;
    }

    actorFromSymbol(symbol) {
        if (!symbol) return undefined;
        return this.dictionary[symbol]
    }

    obstacleFromSymbol(symbol) {
        if (symbol === 'x') return 'wall';
        if (symbol === '!') return 'lava';
        return undefined
    }

    createGrid(gridSource) {
        if (gridSource.length === 0) return [];

        let grid = [];

        gridSource.forEach(row => {
            let gridRowUnprocessed = row.split('');
            let gridRow = gridRowUnprocessed.map(this.obstacleFromSymbol)
            grid.push(gridRow)
        })

        return grid;
    }

    createActors(plan) {
        if (!this.dictionary) return [];
        if (plan.length === 0) return [];

        let actors = [];

        let x = 0;
        let y = 0;

        plan.forEach(row => {
            for (let symbol of row) {
                let constr = this.actorFromSymbol(symbol);

                // При этом, если этот конструктор не является экземпляром Actor, то такой символ игнорируется, и объект не создается. ???????????
                // В таком случае валится тест

                if (constr) {
                    let pos = new Vector(x, y);
                    let test = new constr(pos);
                    actors.push(test);
                }

                x++;
                if (x >= row.length) {
                    x = 0;
                }
            }
            y++;
        });

        return actors;
    }

    parse(levelPlan) {
        let grid = this.createGrid(levelPlan);
        let actors = this.createActors(levelPlan)
        let level = new Level(grid, actors);
        return level
    }
}

class Fireball extends Actor {
    constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
        super(pos, undefined, speed);

        Object.defineProperty(this, 'type', {
            value: 'fireball',
            writable: false,
            configurable: true
        });
    }

    getNextPosition(time = 1) {
        if (!time) {
            return this.pos
        }
        let nextX = this.pos.x + (this.speed.x * time);
        let nextY = this.pos.y + (this.speed.y * time);
        let nextPos = new Vector(nextX, nextY);
        return nextPos;
    }

    handleObstacle() {
        this.speed = this.speed.times(-1)
    }

    act(time, level) {
        let nextPos = this.getNextPosition(time);
        if (!level.obstacleAt(nextPos, this.size)) {
            this.pos = nextPos;
        } else {
            this.handleObstacle();
        }
    }
}

class HorizontalFireball extends Fireball {
    constructor(pos) {
        let speed = new Vector (2, 0);
        super (pos, speed);
    }
}

class VerticalFireball extends Fireball {
    constructor(pos) {
        let speed = new Vector (0, 2);
        super (pos, speed);
    }
}

class FireRain extends Fireball {
    constructor(pos) {
        let speed = new Vector (0, 3);
        super (pos, speed);
        this.initPos = pos;
    }

    handleObstacle() {
        this.speed = this.speed;
        this.pos = this.initPos;
    }
}

class Coin extends Actor {
    constructor(pos = new Vector(0, 0)) {

        let size = new Vector(0.6, 0.6);
        let shift = new Vector(0.2, 0.1);

        pos.x += shift.x;
        pos.y += shift.y;

        super (pos, size);

        Object.defineProperty(this, 'type', {
            value: 'coin',
            writable: false,
            configurable: true
        });

        this.springSpeed = 8;
        this.springDist = 0.07;

        function getRandom(min, max) {
            return Math.random() * (max - min) + min;
        }

        let spring = getRandom(0, 2 * Math.PI)

        this.spring = spring;
    }

    updateSpring(time) {
        if (!time) {
            this.spring += this.springSpeed;
            return
        }
        this.spring += (this.springSpeed * time);
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
