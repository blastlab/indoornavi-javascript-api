/**
 * Class representing an INArea,
 * creates the INArea object in iframe that communicates with indoornavi frontend server and draws INArea
 * @extends INMapObject
 */

class INArea extends INMapObject {
    /**
     * @constructor
     * @param {Object} navi - instance of an INArea class needs the Indoornavi instance object injected to the constructor, to know where INArea object is going to be created
     */
    constructor(navi) {
        super(navi);
        this._type = 'AREA';
        this._opacity = null;
    }

    /**
     * Draws Area for given array of points.
     * @param {array} points - representing area points position in real world. Coordinates are calculated to the map scale and than displayed.
     * For less than 3 points supplied to this method, Area isn't going to be drawn.
     * @example
     * const area = new INArea(navi);
     * area.ready().then(() => area.points(points).place());
     */
    points(points) {
        if (arguments.length !== 1) {
            throw new Error('Wrong number of arguments passed');
        }
        if (!Array.isArray(points)) {
            throw new Error('Given argument is not na array');
        } else if (points.length < 3) {
            throw new Error('Not enough points to draw an INArea');
        }
        points.forEach(point => {
            if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
                throw new Error('Given points are in wrong format or coordinates x an y are not integers');
            }
            return this;
        });
        this._points = points;
        return this;
    }

    /**
     * Place area on the map with all given settings. There is necessary to use points() method before place() method to indicate where area should to be located.
     * Use of this method is indispensable to draw area with set configuration in the IndoorNavi Map.
     * @example
     * const area = new INArea(navi);
     * area.ready().then(() => area.points(points).place());
     */

    place() {
        if (!!this._id) {
            INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'drawObject',
                args: {
                    type: this._type,
                    object: {
                        id: this._id,
                        points: points,
                        opacity: this._opacity,
                        fill: this._fill
                    }
                }
            });
        } else {
            throw new Error('INArea is not created yet, use ready() method before executing draw(), or remove()');
        }
    }

    /**
     * Fills Area whit given color.
     * @param {string} color - string that specifies the color. Supports color in hex format '#AABBCC' and 'rgb(255,255,255)';
     * @example
     * area.ready().then(() => area.setFillColor('#AABBCC'));
     */
    setFillColor(color) {
        this._setColor(color, 'fill');
        return this;
    }

    /**
     * Sets Area opacity.
     * @param {number} value. Float between 1.0 and 0. Set it to 1.0 for no opacity, 0 for maximum opacity.
     * @example
     * area.ready().then(() => area.setOpacity(0.3));
     */

    setOpacity(value) {
        if (isNaN(value) || value > 1 || value < 0) {
            throw new Error('Wrong value passed to setTransparency() method, only numbers between 0 and 1 are allowed');
        }
        if (!!this._id) {
            this._opacity = value;
        } else {
            throw new Error(`Object ${this._type} is not created yet, use ready() method before executing other methods`);
        }
        return this;
    }

}
