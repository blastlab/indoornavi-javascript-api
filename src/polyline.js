/**
 * Class representing a INPolyline,
 * creates the INPolyline object in iframe that communicates with indoornavi frontend server and draws INPolyline
 * @extends INMapObject
 */

class INPolyline extends INMapObject {
    /**
     * @constructor
     * @param {Object} navi - instance of a INPolyline class needs the Indoornavi instance object injected to the constructor, to know where INPolyline object is going to be created
     */
    constructor(navi) {
        super(navi);
        this._type = 'POLYLINE';
    }

    /**
     * Draws polyline for given array of points.
     * @param {array} points - representing polyline points position in real world. Coordinates are calculated to the map scale and than displayed.
     * @example
     * const poly = new INPolyline(navi);
     * poly.ready().then(() => poly.points(points).place());
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
     * Place polyline on the map with all given settings. There is necessary to use points() method before place() method to indicate where polyline should to be located.
     * Use of this method is indispensable to draw polyline with set configuration in the IndoorNavi Map.
     * @example
     * const poly = new INPolyline(navi);
     * poly.ready().then(() => poly.points(points).place());
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
     * @param {string} color - string that specifies the color. Supports color in hex format '#AABBCC' and 'rgb(255,255,255)';
     * @example
     * poly.ready().then(() => poly.setLineColor('#AABBCC'));
     */
    setLineColor(color) {
        this._setColor(color, 'stroke');
        return this;
    }

    isWithin(point) {
        if (this._type === 'INPolyline') {
            throw new Error('Method not implemented yet for INPolyline');
        }
        return false;
    }

}
