/**
 * Class representing a INPolyline,
 * creates the INPolyline instance in iframe that communicates with IndoorNavi frontend server and draws INPolyline
 * @extends INMapObject
 */

class INPolyline extends INMapObject {
    /**
     * @constructor
     * @param {Object} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        super(navi);
        this._type = 'POLYLINE';
    }

    /**
     * Locates polyline at given coordinates. Coordinates needs to be given as real world dimensions that map is representing. Use of this method is indispensable
     * @param {Object[]} points - array of {@link Point}'s that are describing polyline in real world dimensions.
     * Coordinates are calculated to the map scale and then displayed.
     * @example
     * const poly = new INPolyline(navi);
     * poly.ready().then(() => poly.points(points).draw());
     */
    points(points) {
        if (!Array.isArray(points)) {
            throw new Error('Given argument is not na array');
        }
        points.forEach(point => {
            if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
                throw new Error('Given points are in wrong format or coordinates x an y are not integers')
            }
        });
        this._points = points;
        return this;
    }

    /**
     * Place polyline on the map with all given settings. There is necessary to use points() method before draw() method to indicate where polyline should to be located.
     * Use of this method is indispensable to draw polyline with set configuration in the IndoorNavi Map.
     * @example
     * const poly = new INPolyline(navi);
     * poly.ready().then(() => poly.points(points).draw());
     */

    draw() {
        if (!!this._id) {
            Communication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'drawObject',
                args: {
                    type: this._type,
                    object: {
                        id: this._id,
                        points: points,
                        stroke: this._stroke
                    }
                }
            });
        } else {
            throw new Error('INPolyline is not created yet, use ready() method before executing draw(), or remove()');
        }
    }

    /**
     * Sets polyline lines and points color.
     * Use of this method is optional.
     * @param {string} color - string that specifies the color. Supports color in hex format '#AABBCC' and rgb format 'rgb(255,255,255)';
     * @example
     * const poly = new INPolyline(navi);
     * poly.ready().then(() => poly.setLineColor('#AABBCC'));
     */
    setLineColor(color) {
        this._setColor(color, 'stroke');
        return this;
    }

    /**
     * This method is not implemented for polyline yet.
     */

    isWithin(point) {
        if (this._type === 'INPolyline') {
            throw new Error('Method not implemented yet for INPolyline');
        }
        return false;
    }

}
