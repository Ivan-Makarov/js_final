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
        return new Vector(this.x + vector.x, this.y + vector.y)
    }

    times(multiplier) {
        return new Vector(this.x * multiplier, this.y * multiplier)
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
    }

    get type() {
        return "actor";
    }

    get left() {
        return this.pos.x;
    }

    get right() {
        return this.pos.x + this.size.x;
    }

    get top() {
        return this.pos.y;
    }

    get bottom() {
        return this.pos.y + this.size.y;
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
        } else {
            return false
        }
    }
}

class Level {
    constructor(grid = [], actors = []) {
        this.grid = grid;
        this.actors = actors;
        this.height = grid.length;
        this.status = null;
        this.finishDelay = 1;

        function isPlayer(actor) {
            return actor.type === 'player'
        }

        this.player = this.actors.find(isPlayer)
    }

    get width() {
        function findLongestLine(longest, line) {
            const current = line.length;
            if (current > longest) {
                return current
            } else {
                return longest
            }
        }

        return this.grid.reduce(findLongestLine, 0)
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

        function isIntersectingObject(actor) {
            if (actor.isIntersect(object)) {
                return actor;
            }
        }

        return this.actors.find(isIntersectingObject);
    }

    obstacleAt(pos, size) {
        const intersectingObject = new Actor(pos, size);

        if (intersectingObject.left < 0 || intersectingObject.right > this.width || intersectingObject.top < 0) {
            return 'wall'
        }

        if (intersectingObject.bottom > this.height) {
            return 'lava'
        }

        const bottom = Math.ceil(intersectingObject.bottom);
        const top = Math.floor(bottom - intersectingObject.size.y);
        const left = Math.round(intersectingObject.left);
        const right = Math.round(left + intersectingObject.size.x);

        let obstacle = undefined;

        for (let y = top; y < bottom; y++) {
            for (let x = left; x < right; x++) {
                if (this.grid[y][x] && !obstacle) {
                    obstacle = this.grid[y][x];
                }
            }
        }

        return obstacle
    }

    removeActor(actor) {
        function isElementToRemove(element) {
            if (element === actor) {
                return element
            }
        }

        const actorIndex = this.actors.findIndex(isElementToRemove);
        this.actors.splice(actorIndex, 1)
    }

    noMoreActors(type) {
        let noMoreActors = true;

        function isType(actor) {
            if (actor.type === type) {
                return actor;
            }
        }

        const actorsLeft = this.actors.find(isType);

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

        if (obstacleType === 'coin' && actor instanceof Actor) {
            this.removeActor(actor)
        }

        function isCoin(actor) {
            if (actor.type === 'coin') {
                return actor
            }
        }

        const coinsLeft = this.actors.find(isCoin);

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
        if (!symbol) {
            return undefined
        }

        return this.dictionary[symbol]
    }

    obstacleFromSymbol(symbol) {
        if (symbol === 'x') return 'wall';
        if (symbol === '!') return 'lava';
        return undefined
    }

    createGrid(gridSource) {
        if (gridSource.length === 0) return [];

        const thisParser = this;

        function getGrid(row) {
            return row.split('').map(thisParser.obstacleFromSymbol)
        }

        return gridSource.map(getGrid)
    }

    createActors(plan) {
        if (!this.dictionary) return [];
        if (plan.length === 0) return [];

        let actors = [];

        let x = 0;
        let y = 0;

        const thisParser = this;

        function getActors(row) {
            const rowLength = row.length;

            for (let symbol of row) {
                const constr = thisParser.actorFromSymbol(symbol);

                if (constr && (constr === Actor || constr.prototype instanceof Actor)) {
                    actors.push(new constr(new Vector(x, y)));
                }

                x++;
                if (x >= rowLength) {
                    x = 0;
                }
            }
            y++;
        }

        plan.forEach(getActors);

        return actors;
    }

    parse(levelPlan) {
        return new Level(this.createGrid(levelPlan), this.createActors(levelPlan));
    }
}

class Fireball extends Actor {
    constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
        super(pos, undefined, speed);
    }

    get type() {
        return 'fireball'
    }

    getNextPosition(time = 1) {
        if (!time) {
            return this.pos
        }
        return this.pos.plus(this.speed.times(time));
    }

    handleObstacle() {
        this.speed = this.speed.times(-1)
    }

    act(time, level) {
        const nextPos = this.getNextPosition(time);
        if (!level.obstacleAt(nextPos, this.size)) {
            this.pos = nextPos;
        } else {
            this.handleObstacle();
        }
    }
}

class HorizontalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(2, 0));
    }
}

class VerticalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 2));
    }
}

class FireRain extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 3));
        this.initPos = pos;
    }

    handleObstacle() {
        this.speed = this.speed;
        this.pos = this.initPos;
    }
}

class Coin extends Actor {
    constructor(pos = new Vector(0, 0)) {
        super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));

        this.initPos = new Vector(this.pos.x, this.pos.y)
        this.springSpeed = 8;
        this.springDist = 0.07;

        function getRandom(min, max) {
            return Math.random() * (max - min) + min;
        }

        this.spring = getRandom(0, 2 * Math.PI);
    }

    get type() {
        return 'coin'
    }

    updateSpring(time = 1) {
        this.spring += this.springSpeed * time;
    }

    getSpringVector() {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1) {
        this.updateSpring(time)

        return this.initPos.plus(this.getSpringVector());
    }

    act(time = 1) {
        this.pos = this.getNextPosition(time);
    }
}

class Player extends Actor {
    constructor(pos = new Vector(0, 0)) {
        pos.y += -0.5;
        super(pos, new Vector(0.8, 1.5), new Vector(0, 0));
    }

    get type() {
        return 'player'
    }
}

const schemas = [
    [
        '  z      ',
        '    f    ',
        '    =    ',
        '       o ',
        '    x!xxx',
        ' @       ',
        'xxx!     ',
        '         '
    ],
    [
        '      v  ',
        '         ',
        '  v      ',
        '        o',
        '        x',
        '@   x    ',
        'x        ',
        '         '
    ],
    [
        '  z f    ',
        'o       o',
        'xx    zxx',
        '    @    ',
        '   xx    ',
        'o   f   o',
        'xx     xx',
        '         '
    ]
];
const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    'f': HorizontalFireball,
    'z': VerticalFireball
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
    .then(() => console.log('Вы выиграли приз!'));
