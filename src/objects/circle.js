/**
 * Class representing a Circle,
 * creates the INArea object in iframe that communicates with indoornavi frontend server and draws Area
 * @extends INMapObject
 */
class INCircle extends INMapObject {
    /**
     * @constructor
     * @param {INMap} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        super(navi);
        this._type = 'CIRCLE';
        this._radius = 5;
        this._opacity = 1;
        this._border = {width: 0, color: '#111'};
        this._color = '#111';
        this._position = {x: 0, y: 0};
    }

    /**
     * Sets position of the circle
     * @param {Point} position where the center of the circle will be located
     * @return {INCircle} self to let you chain methods
     */
    setPosition(position) {
        if (!(!!position.x) || !(!!position.y)) {
            throw new Error('Point must have x and y');
        }
        this._position = position;
        return this;
    }

    /**
     * Gets position of the circle
     * @return {Point} position of the circle
     */
    getPosition() {
        return this._position;
    }

    /**
     * Sets radius of the circle
     * @param {number} radius of the circle
     * @return {INCircle} self to let you chain methods
     */
    setRadius(radius) {
        if (!Number.isInteger(radius)) {
            throw new Error('Radius must be an integer');
        }
        this._radius = radius;
        return this;
    }

    /**
     * Gets radius of the circle
     * @return {number} radius of the circle
     */
    getRadius() {
        return this._radius;
    }

    /**
     * Sets color of the circle
     * @param {string} color of the circle, supports color in hex format '#AABBCC' and rgb format 'rgb(255,255,255)'
     * @return {INCircle} self to let you chain methods
     */
    setColor(color) {
        this._color = color;
        return this;
    }

    /**
     * Gets color of the circle
     * @return {string} color of the circle
     */
    getColor() {
        return this._color;
    }

    /**
     * Sets opacity of the circle
     * @param {number} opacity of the circle - float between 1.0 and 0.0. Set it to 1.0 for no opacity, 0.0 for maximum opacity
     * @return {INCircle} self to let you chain methods
     */
    setOpacity(opacity) {
        if (!(Number(opacity) === opacity && opacity % 1 !== 0) || opacity > 1 || opacity < 0) {
            throw new Error('Wrong value passed to setTransparency() method, only numbers between 0 and 1 are allowed');
        }
        this._opacity = opacity;
        return this;
    }

    /**
     * Gets opacity of the circle
     * @return {number} opacity of the circle
     */
    getOpacity() {
        return this._opacity;
    }

    /**
     * Sets border of the circle
     * @param {Border} border of the circle
     * @return {INCircle} self to let you chain methods
     */
    setBorder(border) {
        if (!(!!border.color) && !(!!border.width)) {
            throw new Error('Border must have at least color and/or width');
        }
        this._border = border;
        return this;
    }

    /**
     * Gets border of the circle
     * @return {Border} border of the circle
     */
    getBorder() {
        return this._border;
    }

    /**
     * This method ends the methods chain, it actually draw circle on the map with all given settings
     * @example
     * const circle = new INCircle(navi);
     * circle.ready().then( () => circle.setPosition({x: 10, y: 10}).draw(); );
     */
    draw() {
        if (!!this._id) {
            Communication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'drawObject',
                args: {
                    type: this._type,
                    object: {
                        id: this._id,
                        position: this._position,
                        opacity: this._opacity,
                        border: this._border,
                        radius: this._radius,
                        color: this._color
                    }
                }
            });
        } else {
            throw new Error('INCircle is not created yet, use ready() method before executing draw(), or remove()');
        }
    }
}