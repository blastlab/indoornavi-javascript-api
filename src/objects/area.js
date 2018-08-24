/**
 * Class representing an Area,
 * creates the INArea object in iframe that communicates with indoornavi frontend server and draws the Area
 * @extends INMapObject
 */
class INArea extends INMapObject {
    /**
     * @constructor
     * @param {INMap} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        super(navi);
        this._type = 'AREA';
        this._opacity = 1;
        this._color = '#ff2233';
    }

    /**
     * Locates area at given coordinates. Coordinates needs to be given as real world dimensions that map is representing. Use of this method is indispensable.
     * @param {Point[]} points - array of {@link Point}s that are describing area in real world dimensions.
     * Coordinates are calculated to the map scale and than displayed.
     * For less than 3 points supplied to this method, Area isn't going to be drawn.
     * @example
     * const area = new INArea(navi);
     * area.ready().then(() => area.setPoints(points).draw(); );
     */
    setPoints(points) {
        if (arguments.length !== 1) {
            throw new Error('Wrong number of arguments passed');
        }
        Validation.isArray(points, 'Given argument is not na array');
        Validation.isGreaterThan(3, points.length, 'Not enough points to draw an INArea');
        points.forEach(point => {
            Validation.isInteger(point.x, 'Given points are in wrong format or coordinates x an y are not integers');
            Validation.isInteger(point.y, 'Given points are in wrong format or coordinates x an y are not integers');
        });
        this._points = points;
        return this;
    }

    /**
     * Gets points of the area
     * @return {Point[]} points of the circle
     */
    getPoints() {
        return this._points;
    }

    /**
     * Fills Area with given color.
     * Use of this method is optional.
     * @param {string} color - string that specifies the color. Supports color in hex format '#AABBCC' and rgb format 'rgb(255,255,255)';
     * @return {INArea} self to let you chain methods
     * @example
     * area.ready().then(() => area.setColor('#AABBCC').draw(); );
     */
    setColor(color) {
        Validation.isColor(color, 'Must be valid color format: hex or rgb');
        this._color = color;
        return this;
    }

    /**
     * Gets color of the area
     * @return {string} color of the area
     */
    getColor() {
        return this._color;
    }

    /**
     * Sets Area opacity.
     * Use of this method is optional.
     * @param {number} value - Float between 1.0 and 0. Set it to 1.0 for no opacity, 0 for maximum opacity.
     * @example
     * area.ready().then(() => area.setOpacity(0.3).draw(); );
     */
    setOpacity(value) {
        Validation.isBetween(0, 1, value, 'Wrong value passed to setOpacity() method, only numbers between 0 and 1 are allowed');
        this._opacity = value;
        return this;
    }

    /**
     * Gets opacity of the area
     * @return {number} opacity of the area
     */
    getOpacity() {
        return this._opacity;
    }

    /**
     * Checks, is point of given coordinates inside of the created object.
     * Use of this method is optional.
     * @param {Point} point - coordinates in {@link Point} format that are described in real world dimensions.
     * Coordinates are calculated to the map scale.
     * @returns {boolean} true if given coordinates are inside the object, false otherwise;
     * @example
     * area.ready().then(() => area.isWithin({x: 100, y: 50}); );
     */
    isWithin(point) {
        // Semi-infinite ray horizontally (increasing x, fixed y) out from the test point, and count how many edges it crosses.
        // At each crossing, the ray switches between inside and outside. This is called the Jordan curve theorem.
        let inside = false;
        let intersect = false;
        let xi, yi, xj, yj = null;

        if (this._points === null) {
            throw new Error('points of the object are null');
        }
        for (let i = 0, j = this._points.length - 1; i < this._points.length; j = i++) {
            xi = this._points[i].x;
            yi = this._points[i].y;

            xj = this._points[j].x;
            yj = this._points[j].y;

            intersect = ((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }

    /**
     * Place area on the map with all given settings. There is necessary to use setPoints() method before draw() method to indicate where area should to be located.
     * Use of this method is indispensable to draw area with set configuration in the IndoorNavi Map.
     * @example
     * const area = new INArea(navi);
     * area.ready().then(() => area.setPoints(points).draw(); );
     */
    draw() {
        if (!!this._id) {
            Communication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'drawObject',
                args: {
                    type: this._type,
                    object: {
                        id: this._id,
                        points: this._points,
                        opacity: this._opacity,
                        color: this._color
                    }
                }
            });
        } else {
            throw new Error('INArea is not created yet, use ready() method before executing draw(), or remove()');
        }
    }

}
