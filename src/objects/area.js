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
        this._events = new Set();
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
        return MapUtils.pointIsWithinGivenArea(point, this._points);
    }

    /**
     * Add listener to listen when area is clicked. Use of this method is optional.
     * @param {Event.MOUSE} event - {@link Event}
     * @param {function} callback - function that is going to be executed when event occurs.
     * @return {INArea} self to let you chain methods
     * @example
     * const area = new INArea(navi);
     * area.ready(() => area.addEventListener(Event.MOUSE.CLICK, () => console.log('event occurred!'));
     */
    addEventListener(event, callback) {
        this._events.add(event);
        const eventID = `${event}-${this._id}`;
        Communication.listen(eventID, callback);
        return this;
    }

    /**
     * Removes listener if listener exists. Use of this method is optional.
     * @param {Event.MOUSE} event - {@link Event}
     * @param {callback} callback - callback function that was added to event listener to be executed when event occurs.
     * @return {INArea} self to let you chain methods
     * @example
     * const area = new INArea(navi);
     * area.ready(() => area.removeEventListener(Event.MOUSE.CLICK); );
     */
    removeEventListener(event, callback) {
        if (this._events.has(event)) {
            Communication.remove(callback)
        }
        return this;
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
                        color: this._color,
                        events: this._events
                    }
                }
            });
        } else {
            throw new Error('INArea is not created yet, use ready() method before executing draw(), or remove()');
        }
    }
}
