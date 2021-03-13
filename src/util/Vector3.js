const LOCATION_JITTER = 10;

function getPosNeg() {
    return Math.random() > 0.5 ? -1 : 1;
}

function getRandomPosition() {
    return getPosNeg() * LOCATION_JITTER * Math.random();
}

export default class Vector2 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static build() {
        const x = 180 + getRandomPosition();
        const y = getRandomPosition();
        return new Vector2(x, y);
    }

    getX() {
        return this.x;
    }

    setX(x) {
        this.x = x;
    }

    getY() {
        return this.y;
    }

    setY(y) {
        this.y = y;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `<${this.x},${this.y}>`;
    }

    distanceTo(vector) {
        const a = this.x - vector.x;
        const b = this.y - vector.y;

        return Math.sqrt(a * a + b * b);
    }
}
