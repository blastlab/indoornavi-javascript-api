/**
 * Abstract class that communicates with IndoorNavi frontend server.
 * @abstract
 */

class INMapObject {
    /**
     * Instance of a INMapObject class cannot be created directly, INMapObject class is an abstract class.
     * @abstract
     * @constructor
     * @param {Object} navi -constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        if (new.target === INMapObject) {
            throw new TypeError("Cannot construct INMapObject instances directly");
        }
        this._navi = navi;
        this._id = null;
        this._type = 'OBJECT';
        this._navi._checkIsReady();
        this._navi._setIFrame();
        this._points = null;
        this._stroke = null;
        this._fill = null;
    }

    /**
     * Getter for object points coordinates
     * @returns {point[]} - returns array of {@link Point} describing object
     */
    getPoints() {
        return this._points;
    }

    /**
     * Getter for object id
     * @returns {number} id - returns object id;
     */
    getID() {
        return this._id;
    }

    /**
     * @returns {Promise} Promise - that will resolve when connection to the frontend will be established, assures that instance of INMapObject has been created on the injected INMap class, this method should be executed before calling any other method on this object children.
     * @example
     * 'inheritedObjectFromINMapObject'.ready().then(() => 'inheritedObjectFromINMapObject'.method());
     */
    ready() {
        const self = this;

        function setObject(data) {
            if(!!data.mapObjectId) {
                self._id = data.mapObjectId;
            } else {
                throw new Error(`Object ${self._type} doesn't contain id. It may not be created correctly.`);
            }
        }

        if (!!self._id) {
            // resolve immediately
            return new Promise(resolve => {
                resolve();
            })
        }
        return new Promise(resolve => {
                // create listener for event that will fire only once
                Communication.listenOnce(`createObject-${this._type}`, setObject.bind(self), resolve);
                // then send message
                Communication.send(self._navi.iFrame, self._navi.targetHost, {
                    command: 'createObject',
                    object: this._type
                });
            }
        );
    }

    /**
     * Removes object and destroys its instance in the frontend server, but do not destroys object class instance in your app.
     * inheritedObjectFromINMapObject is a child object of abstract class INMapObject
     * @example
     * 'inheritedObjectFromINMapObject'.ready().then(() => 'inheritedObjectFromINMapObject'.remove());
     */
    remove() {
        if (!!this._id) {
            Communication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'removeObject',
                args: {
                    type: this._type,
                    object: {
                        id: this._id
                    }
                }
            });
        } else {
            throw new Error(`Object ${this._type} is not created yet, use ready() method before executing other methods`);
        }
    }

    /**
     * Checks, is point of given coordinates inside of the created object.
     * Use of this method is optional.
     * @param {object} point - coordinates in {@link Point} format that are described in real world dimensions.
     * Coordinates are calculated to the map scale.
     * @returns {boolean} true if given coordinates are inside the object, false otherwise;
     * @example
     * 'inheritedObjectFromINMapObject'.ready().then(() => 'inheritedObjectFromINMapObject.isWithin({x: 100, y: 50}));
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

    _setColor(color, attribute) {
        let hexToSend = null;
        const isValidColor = /(^[a-zA-Z]+$)|(#(?:[0-9a-f]{2}){2,4}|#[0-9a-f]{3}|(?:rgba?|hsla?)\((?:\d+%?(?:deg|rad|grad|turn)?(?:,|\s)+){2,3}[\s\/]*[\d]+%?\))/i.test(color);
        if (!isValidColor) {
            throw new Error('Wrong color value or/and type');
        }
        if (!!this._id) {
            if (/rgb/i.test(color)) {
                const rgb = color.slice(4, color.length - 1).split(',');
                const red = parseInt(rgb[0], 10) === 0 ? '00' : `${parseInt(rgb[0], 10).toString(16).slice(-2)}`;
                const green = parseInt(rgb[1], 10) === 0 ? '00' : `${parseInt(rgb[1], 10).toString(16).slice(-2)}`;
                const blue = parseInt(rgb[2], 10) === 0 ? '00' : `${parseInt(rgb[2], 10).toString(16).slice(-2)}`;
                hexToSend = '#' + red + green + blue;
            } else if (/#/i.test(color)) {
                hexToSend = color;
            }
            switch (attribute) {
                case 'stroke':
                    this._stroke = hexToSend;
                    break;
                case 'fill':
                    this._fill = hexToSend;
                    break;
            }
        } else {
            throw new Error(`Object ${this._type} is not created yet, use ready() method before executing other methods`);
        }
    }

}
