class Communication {
    static send(iFrame, host, data) {
        iFrame.contentWindow.postMessage(data, host);
    }

    static listen(eventName, callback) {
        window.addEventListener('message', function (event) {
            if ('type' in event.data && event.data.type === eventName) {
                callback(event.data);
            }
        }, false);
    }

    static listenOnce(eventName, callback, resolve) {
        function handler(event) {
            if ('type' in event.data && event.data.type === eventName && !!event.data.mapObjectId) {
                window.removeEventListener('message', handler, false);
                callback(event.data.mapObjectId);
                resolve();
            }
        }

        window.addEventListener('message', handler, false);
    }

    static remove(handler) {
        window.removeEventListener('message', handler, false);
    }

}

class DOM {
    static getById(id) {
        return document.getElementById(id);
    }

    static getByTagName(tagName, container) {
        if (!container) {
            container = window;
        }
        return container.getElementsByTagName(tagName)[0];
    }
}

class Http {

    constructor() {
        this.authHeader = null;
    }

    setAuthorization(authHeader) {
        this.authHeader = authHeader;
    }

    doGet(url, callback) {
        this.doRequest(url, 'GET', null, callback);
    }

    doPost(url, body, callback) {
        this.doRequest(url, 'POST', body, callback);
    }

    doRequest(url, method, body, callback) {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                callback(xmlHttp.responseText);
        };
        xmlHttp.open(method, url, true); // true for asynchronous
        if (!!this.authHeader) {
            xmlHttp.setRequestHeader('Authorization', this.authHeader);
        }
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.setRequestHeader('Accept', 'application/json');
        xmlHttp.send(JSON.stringify(body));
    }
}

/**
 * Class representing an AreaEvent,
 */

class AreaEvent {
    static toJSON(eventsArrayString) {
        const events = [];
        JSON.parse(eventsArrayString).forEach(function(_events) {
            events.push(new AreaEvent(
                _events['tagId'],
                new Date(_events['date']),
                _events['areaId'],
                _events['areaName'],
                _events['mode']
            ));
        });
        return events;
    };

    /**
     * AreaEvent object
     * @param {number} tagId short id of the tag that entered/left this INArea
     * @param {Date} date when tag appeared in this INArea
     * @param {number} areaId
     * @param {string} areaName
     * @param {string} mode can be ON_LEAVE or ON_ENTER
     */
    constructor(tagId, date, areaId, areaName, mode) {
        this.tagId = tagId;
        this.date = date;
        this.areaId = areaId;
        this.areaName = areaName;
        this.mode = mode;
    }
}

/**
 * Class representing a Coordinates,
 */

class Coordinates {
    static toJSON(coordinatesArrayString) {
        const coordinates = [];
        JSON.parse(coordinatesArrayString).forEach(function(_coordinates) {
            coordinates.push(new Coordinates(
               _coordinates['point']['x'],
               _coordinates['point']['y'],
               _coordinates['tagShortId'],
               new Date(_coordinates['date'])
            ));
        });
        return coordinates;
    };

    /**
     * Coordinates object
     * @param {number} x
     * @param {number} y
     * @param {number} tagId short id of the tag
     * @param {Date} date when tag appeared in this coordinates
     */
    constructor(x, y, tagId, date) {
        this.x = x;
        this.y = y;
        this.tagId = tagId;
        this.date = date;
    }
}

/**
 * Global object representing events,
 * @namespace
 * @property {object} MOUSE - mouse events, ENUM like, object
 * @property {string} MOUSE.CLICK - click event
 * @property {string} MOUSE.MOUSEOVER - mouseover event
 * @property {object} LISTENER - listener events, ENUM like, object.
 * Representation of listener type, added to {@link INMap} object
 * @property {string} LISTENER.AREA - area event sets listener to listen to {@link INArea} object events
 * @property {string} LISTENER.COORDINATES - coordinates event sets listener to listen to {@link INMap} object events
 *
 */

const Event = {
    MOUSE: {
            CLICK: 'click',
            MOUSEOVER: 'mouseover'
            },
    LISTENER: {
            AREA: 'area',
            COORDINATES: 'coordinates'
            }
};

/**
 * Class representing a Point,
 */

class Point {
    /**
     * Point object
     * @param {number} x - number is required to be an integer
     * @param {number} y - number is required to be an integer
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Global object representing position regarding to related {@link INMap} object,
 * @namespace
 * @property {object} PositionIt - position, ENUM like, object
 * @property {string} PositionIt.TOP - top side position in regard to related object
 * @property {string} PositionIt.RIGHT - right side position in regard to related object
 * @property {string} PositionIt.BOTTOM - bottom side position in regard to related object
 * @property {string} PositionIt.LEFT - left side position in regard to related object
 * @property {string} PositionIt.TOP_RIGHT - top right side position in regard to related object
 * @property {string} PositionIt.TOP_LEFT - top left side position in regard to related object
 * @property {string} PositionIt.BOTTOM_RIGHT - bottom right side position in regard to related object
 * @property {string} PositionIt.BOTTOM_LEFT - bottom left side position in regard to related object
 *
 */
PositionIt = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3,
    TOP_RIGHT: 4,
    TOP_LEFT: 5,
    BOTTOM_RIGHT: 6,
    BOTTOM_LEFT: 7
};

/**
 * Abstract class that communicates with indoornavi frontend server.
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
        this._navi.checkIsReady();
        this._navi.setIFrame();
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

        function setObject(id) {
            self._id = id;
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
                hexToSend = `#${parseInt(rgb[0], 10).toString(16).slice(-2)}${parseInt(rgb[1], 10).toString(16).slice(-2)}${parseInt(rgb[2], 10).toString(16).slice(-2)}`;
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

/**
 * Class representing a INPolyline,
 * creates the INPolyline instance in iframe that communicates with indoornavi frontend server and draws INPolyline
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

/**
 * Class representing an INArea,
 * creates the INArea object in iframe that communicates with indoornavi frontend server and draws Area
 * @extends INMapObject
 */

class INArea extends INMapObject {
    /**
     * @constructor
     * @param {Object} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        super(navi);
        this._type = 'AREA';
        this._opacity = null;
    }

    /**
     * Locates area at given coordinates. Coordinates needs to be given as real world dimensions that map is representing. Use of this method is indispensable.
     * @param {Object[]} points - array of {@link Point}'s that are describing area in real world dimensions.
     * Coordinates are calculated to the map scale and than displayed.
     * For less than 3 points supplied to this method, Area isn't going to be drawn.
     * @example
     * const area = new INArea(navi);
     * area.ready().then(() => area.points(points).draw());
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
     * Place area on the map with all given settings. There is necessary to use points() method before draw() method to indicate where area should to be located.
     * Use of this method is indispensable to draw area with set configuration in the IndoorNavi Map.
     * @example
     * const area = new INArea(navi);
     * area.ready().then(() => area.points(points).draw());
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
     * Fills Area with given color.
     * Use of this method is optional.
     * @param {string} color - string that specifies the color. Supports color in hex format '#AABBCC' and rgb format 'rgb(255,255,255)';
     * @example
     * area.ready().then(() => area.setFillColor('#AABBCC'));
     */
    setFillColor(color) {
        this._setColor(color, 'fill');
        return this;
    }

    /**
     * Sets Area opacity.
     * Use of this method is optional.
     * @param {number} value - Float between 1.0 and 0. Set it to 1.0 for no opacity, 0 for maximum opacity.
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

/**
 * Class representing a Marker,
 * creates the INMarker object in iframe that communicates with indoornavi frontend server and places a marker.
 * @extends INMapObject
 */

class INMarker extends INMapObject {
    /**
     * @constructor
     * @param {Object} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        super(navi);
        this._type = 'MARKER';
        this._points = [];
        this._icon = null;
        this._infoWindow = {
            content: null,
            position: null
        };
        this._label = null;
        this._events = new Set();
    }

    /**
     * Sets marker label. Use of this method is optional.
     * @param {string} label - string that will be used as a marker label. If label method isn't used than no label is going to be displayed.
     * To reset label to a new string call this method again passing new label as a string and call draw() method.
     * @return {INMarker} - returns INMarker instance class;
     * @example
     * const marker = new INMarker(navi);
     * marker.ready().then(() => marker.setLabel('Marker Label'));
     */

    setLabel(label) {
        if (typeof label === 'string' || typeof label === 'number') {
            this._label = label;
        }
        return this;
    }

    /**
     * Removes marker label.
     * @return {INMarker} - returns INMarker instance class;
     * @example
     * const marker = new INMarker(navi);
     * marker.ready().then(() => marker.point({x: 100, y: 100}).setLabel('Marker Label').draw());
     * marker.ready().then(() => marker.removeLabel().draw());
     * There is indispensable to use draw() method after removeLabel()
     * to update changes in to frontend server
     */

    removeLabel() {
        this._label = null;
        return this;
    }

    /**
     * Sets marker icon. Use of this method is optional.
     * @param {string} path - url path to your icon;
     * @return {INMarker} - returns INMarker instance class
     * @example
     * const path = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png'
     * const marker = new INMarker(navi);
     * marker.ready().then(() => marker.setIcon(icon));
     */

    setIcon(path) {
        if (typeof path !== 'string') {
            throw new Error('Invalid value supplied as an icon path argument');
        }
        this._icon = path;
        return this;
    }

    /**
     * Add listener to listen when icon is clicked. Use of this method is optional.
     * @param {Event.MOUSE} event - {@link Event}
     * @param {function} callback - function that is going to be executed when event occurs.
     * @return {INMarker} - returns INMarker instance class;
     * example
     * const marker = new INMarker(navi);
     * marker.ready(() => marker.addEventListener(Event.MOUSE.CLICK, () => marker.displayInfoWindow()));
     */

    addEventListener(event, callback) {
        this._events.add(event);
        Communication.listen(`${event.toString(10)}-${this._id}`, callback);
        return this;
    }

    /**
     * Removes listener if listener exists. Use of this method is optional.
     * @param {Event.MOUSE} event - {@link Event}
     * @param {callback} callback - callback function that was added to event listener to be executed when event occurs.
     * @return {INMarker} - returns INMarker instance class;
     * example
     * const marker = new INMarker(navi);
     * marker.ready(() => marker.removeEventListener(Event.MOUSE.CLICK));
     */

    removeEventListener(event, callback) {
        if (this._events.has(event)) {
            Communication.remove(callback)
        }
        return this;
    }

    /**
     * Locates marker at given coordinates. Coordinates needs to be given as real world dimensions that map is representing. Use of this method is indispensable.
     * @param {object} point - object {@link Point} representing marker position in real world. Coordinates are calculated to the map scale and than displayed.
     * Position will be clipped to the point in the bottom center of marker icon.
     * @return {INMarker} - returns INMarker instance class;
     * @example
     * const marker = new INMarker(navi);
     * marker.ready().then(() => marker.point({x: 100, y: 100}).draw());
     */

    point(point) {
        if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
            throw new Error('Given point is in wrong format or coordinates x an y are not integers');
        }
        this._points = [point];
        return this;
    }

    /**
     * Place market on the map with all given settings. There is necessary to use point() method before draw() method to indicate the point where market should to be located.
     * Use of this method is indispensable to display market with set configuration in the IndoorNavi Map.
     * @example
     * const marker = new INMarker(navi);
     * marker.ready().then(() => marker.point({x: 100, y: 100}).draw());
     */

    draw() {
        if (this._points.length < 1) {
            throw new Error('No point for marker placement has been specified');
        }
        if (!!this._id) {
            const events = [];
            this._events.forEach(event => events.push(event));
            Communication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'drawObject',
                args: {
                    type: this._type,
                    object: {
                        id: this._id,
                        points: this._points,
                        icon: this._icon,
                        label: this._label,
                        infoWindow: this._infoWindow,
                        events: events
                    }
                }
            });
        } else {
            throw new Error('Marker is not created yet, use ready() method before executing any other method');
        }
    }

}

/**
 * Class representing a InfoWindow,
 * creates the INInfoWindow object in iframe that communicates with indoornavi frontend server and adds info window to a given INObject child.
 * @extends INMapObject
 */

class INInfoWindow extends INMapObject {
    /**
     * @constructor
     * @param {Object} navi -constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        super(navi);
        this._type = 'INFO_WINDOW';
        this._points = null;
        this._content = null;
        this._position = 0;
        this._width = null;
        this._height = null;
    }

    /**
     * Sets info window content.
     * @param {string} content - text or html template in string format that will be passed in to info window as text.
     * To reset label to a new content call this method again passing new content as a string and call draw() method.
     * @return {INInfoWindow} - returns INInfoWindow instance class;
     * @example
     * const infoWindow = new INInfoWindow(navi);
     * infoWindow.ready().then(() => infoWindow.setInnerHtml('<p>text in paragraph</p>'));
     */

    setInnerHTML(content) {
        if (typeof content !== 'string') {
            throw new Error('Wrong argument passed for info window content');
        }
        this._content = content;
        return this;
    }

    /**
     * Sets position of info window regarding to object that info window will be appended to. Use of this method is optional.
     * Default position for info window is TOP.
     * @param {PositionIt} position - {@link PositionIt}
     * Available settings: TOP, LEFT, RIGHT, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT.
     * return {INInfoWindow} - returns INInfoWindow instance class;
     * @example
     * const infoWindow = new INInfoWindow(navi);
     * infoWindow.ready(() => infoWindow.setPosition(PositionIt.TOP_RIGHT));
     */

    setPosition(position) {
        if (Object.values(PositionIt).indexOf(position) < 0) {
            throw new Error('Wrong argument passed for info window position');
        }
        this._position = position;
        return this;
    }

    /**
     * Sets height dimension of info window. Use of this method is optional.
     * Default dimensions for info window height is 250px.
     * @param {number} height - info window height given in pixels, min available dimension is 50px.
     * return {INInfoWindow} - returns INInfoWindow instance class;
     * @example
     * const infoWindow = new INInfoWindow(navi);
     * infoWindow.ready(() => infoWindow.height(200));
     */

    height(height) {
        if (!Number.isInteger(height) || height < 50) {
            throw new Error('Wrong height argument passed for info window position');
        }
        this._height = height;
        return this;
    }

    /**
     * Sets width dimension of info window. Use of this method is optional.
     * Default dimension for info window width is 250px, min available dimension is 50px.
     * @param {number} width - info window width given in pixels
     * return {INInfoWindow} - returns INInfoWindow instance class;
     * @example
     * const infoWindow = new INInfoWindow(navi);
     * infoWindow.ready(() => infoWindow.width(200));
     */

    width(width) {
        if (!Number.isInteger(width) || width < 50) {
            throw new Error('Wrong width argument passed for info window position');
        }
        this._width = width;
        return this;
    }

    /**
     * Displays info window in iframe.
     * @param {object} mapObject - {@link INMapObject} map object to append info window to.
     * @example
     * const infoWindow = new INInfoWindow(navi);
     * const marker = new INMarker(navi);
     * marker.ready().then(() => {
     *  marker.point({x: 100, y: 100}).draw();
     *  infoWindow.ready(() => infoWindow.setInnerHTML('text for info window').open(marker));
     * });
     */

    open(mapObject) {
        if (!mapObject || !Number.isInteger(mapObject.getID())) {
            throw new Error('Passed object is null, undefined or has not been initialized in indoor navi iframe');
        }
        this._relatedObjectId = mapObject.getID();
        if (!!this._id) {
            Communication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'drawObject',
                args: {
                    type: this._type,
                    object: {
                        id: this._id,
                        points: null,
                        relatedObjectId: this._relatedObjectId,
                        content: this._content,
                        position: this._position,
                        width: this._width,
                        height: this._height
                    }
                }
            });
        } else {
            throw new Error('Info Window is not created yet, use ready() method before executing any other method');
        }
    }
}

/**
* Class representing a INMap,
* creates the INMap object to communicate with INMap frontend server
*/
class INMap {
    /**
     * @constructor
     * @param {string} targetHost - address to the INMap server
     * @param {string} apiKey - the API key created on INMap server (must be assigned to your domain)
     * @param {string} containerId of DOM element which will be used to create iframe with map
     * @param {object} config {width: number, height: number} of the iframe in pixels
     */
    constructor(targetHost, apiKey, containerId, config) {
        this.targetHost = targetHost;
        this.apiKey = apiKey;
        this.containerId = containerId;
        this.isReady = false;
        this.config = config;
    }

    /**
     * Load map with specific id
     * @param {number} mapId
     * @returns {Promise} promise that will resolve when connection to WebSocket will be established
     * @example
     * const mapId = 2;
     * const navi = new INMap( 'http://localhost:4200', 'TestAdmin', 'map', { width: 800, height: 600});
     * navi.load(mapId).then(() => console.log(`Map ${mapId} is loaded`));
     */
    load(mapId) {
      const self = this;
      const iFrame = document.createElement('iframe');
      iFrame.style.width = `${!!this.config.width ? this.config.width : 640}px`;
      iFrame.style.height = `${!!this.config.height ? this.config.height : 480}px`;
      iFrame.setAttribute('src', `${this.targetHost}/embedded/${mapId}?api_key=${this.apiKey}`);
      DOM.getById(this.containerId).appendChild(iFrame);
      return new Promise(function(resolve) {
          iFrame.onload = function() {
              self.isReady = true;
              resolve();
          }
      });
    }

    /**
     * Toggle the tag visibility
     * @param tagShortId
     * @example
     * const tagShortId = data.coordinates.tagShortId;
     * navi.toggleTagVisibility(tagShortId);
     */
    toggleTagVisibility(tagShortId) {
      this.checkIsReady();
      this.setIFrame();
        Communication.send(this.iFrame, this.targetHost, {
            command: 'toggleTagVisibility',
            args: tagShortId
        });
      return this;
    }

    /**
     * Add listener to react when the specific event occurs
     * @param {Event.LISTENER} event - name of the specific event {@link Event}
     * @param {function} callback - this method will be called when the specific event occurs
     * example
     * navi.addEventListener('coordinates', data => doSomethingWithINCoordinates(data.coordinates.point));
     */
    addEventListener(event, callback) {
      this.checkIsReady();
      this.setIFrame();
        Communication.send(this.iFrame, this.targetHost, {
            command: 'addEventListener',
            args: event
        });
      Communication.listen(event, callback);
      return this;
    }

     checkIsReady() {
       if (!this.isReady) {
           throw new Error('INMap is not ready. Call load() first and then when promise resolves INMap will be ready.');
       }
     }

     setIFrame () {
      this.iFrame = DOM.getByTagName('iframe', DOM.getById(this.containerId));
      return this;
     }

}

class Report {

    static parseDate(date) {
        return date.toISOString().slice(0, -5);
    }

    /**
     * Report object containing methods to retrieve historical data
     * @param {string} targetHost - address to the INMap backend server
     * @param {string} apiKey - the API key created on INMap server (must be assigned to your domain)
     */
    constructor(targetHost, apiKey) {
        const authHeader = 'Token ' + apiKey;
        this.targetHost = targetHost;
        this.baseUrl = '/rest/v1/reports';
        this.http = new Http();
        this.http.setAuthorization(authHeader);
    }

    /**
     * Get list of historical coordinates
     * @param {number} floorId id of the floor you want to get coordinates from
     * @param {Date} from starting closed range
     * @param {Date} to ending closed range
     * @return {Promise} promise that will be resolved when {@link Coordinates} list is retrieved
     */
    getCoordinates(floorId, from, to) {
        return new Promise((function(resolve) {
            this.http.doPost(`${this.targetHost}${this.baseUrl}/coordinates`, {floorId: floorId, from: Report.parseDate(from), to: Report.parseDate(to)}, function (data) {
                resolve(Coordinates.toJSON(data));
            });
        }).bind(this));
    }

    /**
     * Get list of historical INArea events
     * @param {number} floorId id of the floor you want to get INArea events from
     * @param {Date} from starting closed range
     * @param {Date} to ending closed range
     * @return {Promise} promise that will be resolved when {@link AreaEvent} list is retrieved
     */
    getAreaEvents(floorId, from, to) {
        return new Promise((function(resolve) {
            this.http.doPost(`${this.targetHost}${this.baseUrl}/events`, {floorId: floorId, from: Report.parseDate(from), to: Report.parseDate(to)}, function (data) {
                resolve(AreaEvent.toJSON(data));
            });
        }).bind(this));
    }
}