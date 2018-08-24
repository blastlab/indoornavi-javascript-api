/**
 * Class representing a Polyline,
 * creates the INPolyline object in iframe that communicates with IndoorNavi frontend server and draws INPolyline
 * @extends INMapObject
 */
class INPolyline extends INMapObject {
    /**
     * @constructor
     * @param {INMap} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        super(navi);
        this._type = 'POLYLINE';
        this._color = '#111';
    }

    /**
     * Locates polyline at given coordinates. Coordinates needs to be given as real world dimensions that map is representing. Use of this method is indispensable
     * @param {Point[]} points - array of {@link Point}'s that are describing polyline in real world dimensions.
     * Coordinates are calculated to the map scale and then displayed.
     * @example
     * const poly = new INPolyline(navi);
     * poly.ready().then(() => poly.setPoints(points).draw(); );
     */
    setPoints(points) {
        Validation.isArray(points, 'Given argument is not an array');
        points.forEach(point => {
            Validation.isInteger(point.x, 'Given points are in wrong format or coordinates x and y are not integers');
            Validation.isInteger(point.y, 'Given points are in wrong format or coordinates x and y are not integers');
        });
        this._points = points;
        return this;
    }

    /**
     * Gets points of the polyline
     * @return {Point[]} points of the polyline
     */
    getPoints() {
        return this._points;
    }

    /**
     * Sets polyline lines and points color.
     * Use of this method is optional.
     * @param {string} color - string that specifies the color. Supports color in hex format '#AABBCC' and rgb format 'rgb(255,255,255)';
     * @example
     * const poly = new INPolyline(navi);
     * poly.ready().then(() => poly.setLineColor('#AABBCC').draw(); );
     */
    setLineColor(color) {
        Validation.isColor(color, 'Must be valid color format: hex or rgb');
        this._color = color;
        return this;
    }

    /**
     * Gets color of the lines in polyline
     * @return {string} color of the lines in polyline
     */
    getLineColor() {
        return this._color;
    }

    /**
     * Place polyline on the map with all given settings. There is necessary to use points() method before draw() method to indicate where polyline should to be located.
     * Use of this method is indispensable to draw polyline with set configuration in the IndoorNavi Map.
     * @example
     * const poly = new INPolyline(navi);
     * poly.ready().then(() => poly.setPoints(points).draw(); );
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
                        stroke: this._stroke
                    }
                }
            });
        } else {
            throw new Error('INPolyline is not created yet, use ready() method before executing draw(), or remove()');
        }
    }
}
