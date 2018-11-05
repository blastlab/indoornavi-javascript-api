class Communication {
    static send(iFrame, host, data) {
        iFrame.contentWindow.postMessage(data, host);
    }

    static listen(eventName, callback) {
        window.addEventListener('message', function (event) {
            if (event.data.hasOwnProperty('type') && event.data.type === eventName) {
                callback(event.data);
            }
        }, false);
    }

    static listenOnce(eventName, callback, resolve, tempId) {
        function handler(event) {
            if (event.data.hasOwnProperty('type') &&
                event.data.type === eventName &&
                event.data.tempId === tempId
            ) {
                window.removeEventListener('message', handler, false);
                callback(event.data);
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
        xmlHttp.onreadystatechange = function () {
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

class MapUtils {

	static pixelsToRealDimensions(navi, point) {
		
		if(!!navi.parameters) {
			let xDifferenceInPix = navi.parameters.scale.start.x - navi.parameters.scale.stop.x;
            let yDifferenceInPix = navi.parameters.scale.start.y - navi.parameters.scale.stop.y;

            let scaleLengthInPixels = Math.sqrt( xDifferenceInPix*xDifferenceInPix + yDifferenceInPix*yDifferenceInPix );
            let centimetersPerPixel = navi.parameters.scale.realDistance / scaleLengthInPixels;
			return {x: Math.round(centimetersPerPixel*point.x), y: Math.round(centimetersPerPixel*point.y)};
		}
		else {
			throw new Error('Unable to calculate coordinates. Missing information about map scale!');
		}
    }
	
	static realDimensionsToPixels(navi, point) {
		
		if(!!navi.parameters) {
            let xDifferenceInPix = navi.parameters.scale.start.x - navi.parameters.scale.stop.x;
            let yDifferenceInPix = navi.parameters.scale.start.y - navi.parameters.scale.stop.y;

            let scaleLengthInPixels = Math.sqrt( xDifferenceInPix*xDifferenceInPix + yDifferenceInPix*yDifferenceInPix );
            let pixelsPerCentimeter = scaleLengthInPixels / navi.parameters.scale.realDistance;
			return {x: Math.round(pixelsPerCentimeter*point.x), y: Math.round(pixelsPerCentimeter*point.y)};
		}
		else {
			throw new Error('Unable to calculate coordinates. Missing information about map scale!');
		}
	}

	static pointIsWithinGivenArea(point, areaPoints) {
        let inside = false;
        let intersect = false;
        let xi, yi, xj, yj = null;

        if (areaPoints === null) {
            throw new Error('points of the object are null');
        }
        for (let i = 0, j = areaPoints.length - 1; i < areaPoints.length; j = i++) {
            xi = areaPoints[i].x;
            yi = areaPoints[i].y;

            xj = areaPoints[j].x;
            yj = areaPoints[j].y;

            intersect = ((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
	}
}

class Validation {
    static required(object, key, errorMessage) {
        if (!object.hasOwnProperty(key) || object[key] === undefined) {
            throw new Error(errorMessage);
        }
    }

    static requiredAny(object, keys, errorMessage) {
        let found = false;
        keys.forEach((key) => {
            if (object.hasOwnProperty(key) && object[key] !== undefined) {
                found = true;
            }
        });
        if (!found) {
            throw Error(errorMessage);
        }
    }

    static isInteger(value, errorMessage) {
        Number.isInteger = Number.isInteger || function (value) {
            return typeof value === 'number' &&
                isFinite(value) &&
                Math.floor(value) === value;
        };
        if (!Number.isInteger(value)) {
            throw new Error(errorMessage);
        }
    }

    static isString(value, errorMessage) {
        if (typeof value !== 'string') {
            throw new Error(errorMessage);
        }
    }

    static isNumber(value, errorMessage) {
        if (typeof value !== 'number') {
            throw new Error(errorMessage);
        }
    }

    static isBetween(min, max, value, errorMessage) {
        if (value < min || value > max) {
            throw new Error(errorMessage);
        }
    }

    static isColor(value, errorMessage) {
        const isValidRgb = /[R][G][B][A]?[(]([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])[)]/i.test(value);
        const isValidHex = /^#(?:[0-9a-fA-F]{3}){1,2}$/i.test(value);
        if (!isValidHex && !isValidRgb) {
            throw new Error(errorMessage);
        }
    }

    static isArray(value, errorMessage) {
        if (!Array.isArray(value)) {
            throw new Error(errorMessage);
        }
    }

    static isGreaterThan(min, value, errorMessage) {
        if (value < min) {
            throw new Error(errorMessage);
        }
    }

    static isInArray(array, value, errorMessage) {
        if (array.indexOf(value) < 0) {
            throw new Error(errorMessage);
        }
    }

    static isPoint(point, errorMessage) {
        if (point.x === null || point.y === null || point.x === undefined || point.y === undefined) {
            throw new Error(errorMessage);
        }
        Validation.isInteger(point.x, errorMessage);
        Validation.isInteger(point.y, errorMessage);
    }

    static isFunction(callback, errorMessage) {
        if (typeof callback !== "function") {
            throw new Error(errorMessage)
        }
    }
}

/**
 * Class representing an AreaEvent,
 */

class AreaEvent {
    static toJSON(eventsArrayString) {
        const events = [];
        JSON.parse(eventsArrayString).forEach(function (_events) {
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
 * Class representing an AreaPayload
 */
class AreaPayload {
    /**
     * Area payload
     *  @param {number} id unique given area id number
     *  @param {string} name not unique given area name
     *  @param {array} points as array of {@link Point}
     */
    constructor(id, name, points) {
        this.id = id;
        this.name = name;
        this.points = points
    }
}

/**
 * Class representing a Border,
 */

class Border {
    /**
     * Border object
     * @param {number} width of the border
     * @param {string} color of the border, supports color in hex format '#AABBCC' and rgb format 'rgb(255,255,255)'
     */
    constructor(width, color) {
        this.width = width;
        this.color = color;
    }
}

/**
 * Class representing a Coordinates,
 */

class Coordinates {
    static toJSON(coordinatesArrayString) {
        const coordinates = [];
        JSON.parse(coordinatesArrayString).forEach(function (_coordinates) {
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
 * Class representing an NavigationPoint
 */
class NavigationPoint {
    /**
     * Navigation point parameters
     *  @param {number} radius of the circle
     *  @param {Border} Border object
     *  @param {number} opacity of the circle
     *  @param {String} color of the circle
     */
    constructor(radius, border, opacity, color) {
        this.radius = radius;
        this.border = border;
        this.opacity = opacity
        this.color = color;
    }
}
/**
 * Class representing a Path
 */
class Path {
    /**
     * Path object
     * @param {Point} startPoint it's where path starts
     * @param {Point} endPoint it's where path ends
     */
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }
}

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
 * @property {object} Position - position, ENUM like, object
 * @property {string} Position.TOP - top side position in regard to related object
 * @property {string} Position.RIGHT - right side position in regard to related object
 * @property {string} Position.BOTTOM - bottom side position in regard to related object
 * @property {string} Position.LEFT - left side position in regard to related object
 * @property {string} Position.TOP_RIGHT - top right side position in regard to related object
 * @property {string} Position.TOP_LEFT - top left side position in regard to related object
 * @property {string} Position.BOTTOM_RIGHT - bottom right side position in regard to related object
 * @property {string} Position.BOTTOM_LEFT - bottom left side position in regard to related object
 *
 */
Position = {
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
 * Abstract class that communicates with IndoorNavi frontend server.
 * @abstract
 */

class INMapObject {
    /**
     * Instance of a INMapObject class cannot be created directly, INMapObject class is an abstract class.
     * @abstract
     * @constructor
     * @param {INMap} navi - constructor needs an instance of {@link INMap} object injected
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
     * 'inheritedObjectFromINMapObject'.ready().then(() => 'inheritedObjectFromINMapObject'.method(); );
     */
    ready() {
        const self = this;

        function setObject(data) {
            if(data.hasOwnProperty('mapObjectId')) {
                this._id = data.mapObjectId;
            } else {
                throw new Error(`Object ${this._type} doesn't contain id. It may not be created correctly.`);
            }
        }

        if (!!self._id) {
            // resolve immediately
            return new Promise(resolve => {
                resolve();
            })
        }
        return new Promise(resolve => {
                const tempId = Math.round(Math.random() * 10000);
                // create listener for event that will fire only once
                Communication.listenOnce(`createObject-${self._type}`, setObject.bind(self), resolve, tempId);
                // then send message
                Communication.send(self._navi.iFrame, self._navi.targetHost, {
                    command: 'createObject',
                    object: self._type,
                    tempId: tempId
                });
            }
        );
    }

    /**
     * Removes object and destroys its instance in the frontend server, but do not destroys object class instance in your app.
     * inheritedObjectFromINMapObject is a child object of abstract class INMapObject
     * @example
     * 'inheritedObjectFromINMapObject'.ready().then(() => 'inheritedObjectFromINMapObject'.remove(); );
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
}

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


/**
 * Class representing a Circle,
 * creates the INCircle object in iframe that communicates with indoornavi frontend server and draws the Circle
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
        Validation.required(position, 'x', 'Point must have x');
        Validation.required(position, 'y', 'Point must have y');
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
     * @param {number} radius of the circle, must be an integer
     * @return {INCircle} self to let you chain methods
     */
    setRadius(radius) {
        Validation.isInteger(radius, 'Radius must be an integer');
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
        Validation.isColor(color, 'Must be valid color format: hex or rgb');
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
        Validation.isBetween(0, 1, opacity, 'Opacity must be between 0.0 and 1.0');
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
        Validation.requiredAny(border, ['color', 'width'], 'Border must have at least color and/or width');
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
/**
 * Class representing an InfoWindow,
 * creates the INInfoWindow object in iframe that communicates with InndoorNavi frontend server and adds info window to a given INObject child.
 * @extends INMapObject
 */
class INInfoWindow extends INMapObject {
    /**
     * @constructor
     * @param {INMap} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        super(navi);
        this._type = 'INFO_WINDOW';
        this._content = null;
        this._positionAt = 0;
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
     * infoWindow.ready().then(() => infoWindow.setInnerHtml('<p>text in paragraph</p>').open(); );
     */
    setContent(content) {
        Validation.isString(content, 'Wrong argument passed for info window content');
        this._content = content;
        return this;
    }

    /**
     * Gets content of the info window
     * @return {string} content of the info window
     */
    getContent() {
        return this._content;
    }

    /**
     * Sets position of info window regarding to object that info window will be appended to. Use of this method is optional.
     * Default position for info window is TOP.
     * @param {Position} position - {@link Position}
     * Available settings: TOP, LEFT, RIGHT, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT.
     * @return {INInfoWindow} - returns INInfoWindow instance class;
     * @example
     * const infoWindow = new INInfoWindow(navi);
     * infoWindow.ready(() => infoWindow.setPositionAt(Position.TOP_RIGHT).open(); );
     */
    setPositionAt(position) {
        Validation.isInArray(Object.values(Position), position, 'Wrong argument passed for info window position');
        this._positionAt = position;
        return this;
    }

    /**
     * Gets position at of the info window
     * @return {Position} position at of the info window
     */
    getPositionAt() {
        return this._positionAt;
    }

    /**
     * Sets height dimension of info window. Use of this method is optional.
     * Default dimensions for info window height is 250px.
     * @param {number} height - info window height given in pixels, min available dimension is 50px.
     * @return {INInfoWindow} - returns INInfoWindow instance class;
     * @example
     * const infoWindow = new INInfoWindow(navi);
     * infoWindow.ready(() => infoWindow.setHeight(200).open(); );
     */
    setHeight(height) {
        Validation.isInteger(height, 'Wrong height argument passed for info window position');
        Validation.isGreaterThan(50, height, 'Wrong height argument passed for info window position');
        this._height = height;
        return this;
    }

    /**
     * Gets height of the info window
     * @return {number} height of the info window
     */
    getHeight() {
        return this._height;
    }

    /**
     * Sets width dimension of info window. Use of this method is optional.
     * Default dimension for info window width is 250px, min available dimension is 50px.
     * @param {number} width - info window width given in pixels
     * @return {INInfoWindow} - returns INInfoWindow instance class;
     * @example
     * const infoWindow = new INInfoWindow(navi);
     * infoWindow.ready(() => infoWindow.width(200).open(); );
     */
    setWidth(width) {
        Validation.isInteger(width, 'Wrong height argument passed for info window position');
        Validation.isGreaterThan(50, width, 'Wrong height argument passed for info window position');
        this._width = width;
        return this;
    }

    /**
     * Gets width of the info window
     * @return {number} width of the info window
     */
    getWidth() {
        return this._width;
    }

    /**
     * Displays info window in iframe.
     * @param {INMapObject} mapObject - {@link INMapObject} map object to append info window to.
     * @example
     * const infoWindow = new INInfoWindow(navi);
     * const marker = new INMarker(navi);
     * marker.ready().then(() => {
     *  marker.point({x: 100, y: 100}).draw();
     *  infoWindow.ready(() => infoWindow.setContent('text for info window').open(marker); );
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
                        relatedObjectId: this._relatedObjectId,
                        content: this._content,
                        position: this._positionAt,
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
 * Class representing a Marker,
 * creates the INMarker object in iframe that communicates with IndoorNavi frontend server and places a marker.
 * @extends INMapObject
 */
class INMarker extends INMapObject {
    /**
     * @constructor
     * @param {INMap} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        super(navi);
        this._type = 'MARKER';
        this._position = {x: 0, y: 0};
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
     * @return {INMarker} self to let you chain methods
     * @example
     * const marker = new INMarker(navi);
     * marker.ready().then(() => marker.setLabel('Marker Label').draw(); );
     */
    setLabel(label) {
        Validation.isString(label, 'Label must be a string');
        this._label = label;
        return this;
    }

    /**
     * Gets label of the marker
     * @return {string} label of the marker
     */
    getLabel() {
        return this._label;
    }

    /**
     * Removes marker label.
     * @return {INMarker} - returns INMarker instance class;
     * @example
     * const marker = new INMarker(navi);
     * marker.ready().then(() => marker.removeLabel().draw(); );
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
     * @return {INMarker} self to let you chain methods
     * @example
     * const path = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png'
     * const marker = new INMarker(navi);
     * marker.ready().then(() => marker.setIcon(icon).draw(); );
     */
    setIcon(path) {
        Validation.isString(path, 'Invalid value supplied as an icon path argument');
        this._icon = path;
        return this;
    }

    /**
     * Add listener to listen when icon is clicked. Use of this method is optional.
     * @param {Event.MOUSE} event - {@link Event}
     * @param {function} callback - function that is going to be executed when event occurs.
     * @return {INMarker} self to let you chain methods
     * @example
     * const marker = new INMarker(navi);
     * marker.ready(() => marker.addEventListener(Event.MOUSE.CLICK, () => marker.displayInfoWindow(); ); );
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
     * @return {INMarker} self to let you chain methods
     * @example
     * const marker = new INMarker(navi);
     * marker.ready(() => marker.removeEventListener(Event.MOUSE.CLICK); );
     */
    removeEventListener(event, callback) {
        if (this._events.has(event)) {
            Communication.remove(callback)
        }
        return this;
    }

    /**
     * Locates marker at given coordinates. Coordinates needs to be given as real world dimensions that map is representing. Use of this method is indispensable.
     * @param {Point} position - object {@link Point} representing marker position in real world. Coordinates are calculated to the map scale and than displayed.
     * Position will be clipped to the point in the bottom center of marker icon.
     * @return {INMarker} self to let you chain methods
     * @example
     * const marker = new INMarker(navi);
     * marker.ready().then(() => marker.setPosition({x: 100, y: 100}).draw(); );
     */
    setPosition(position) {
        Validation.isInteger(position.x, 'Given point is in wrong format or coordinates x an y are not integers');
        Validation.isInteger(position.y, 'Given point is in wrong format or coordinates x an y are not integers');
        this._position = position;
        return this;
    }

    /**
     * Gets position of the marker
     * @return {Point} position of the marker
     */
    getPosition() {
        return this._position;
    }

    /**
     * Place market on the map with all given settings. There is necessary to use point() method before draw() method to indicate the point where market should to be located.
     * Use of this method is indispensable to display market with set configuration in the IndoorNavi Map.
     * @example
     * const marker = new INMarker(navi);
     * marker.ready().then(() => marker.setPosition({x: 100, y: 100}).draw(); );
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
                        icon: this._icon,
                        label: this._label,
                        infoWindow: this._infoWindow,
                        events: this._events
                    }
                }
            });
        } else {
            throw new Error('Marker is not created yet, use ready() method before executing any other method');
        }
    }

}

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
        this._lineType = 'solid';

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
     * poly.ready().then(() => poly.setColor('#AABBCC').draw(); );
     */
    setColor(color) {
        Validation.isColor(color, 'Must be valid color format: hex or rgb');
        this._color = color;
        return this;
    }

    /**
     * Gets color of the lines and points in polyline
     * @return {string} color of the lines in polyline
     */
    getColor() {
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
                        color: this._color
                    }
                }
            });
        } else {
            throw new Error('INPolyline is not created yet, use ready() method before executing draw(), or remove()');
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
     * @param {string} targetHost - address to the IndoorNavi frontend server
     * @param {string} apiKey - the API key created on IndoorNavi server (must be assigned to your domain)
     * @param {string} containerId of DOM element which will be used to create iframe with map
     * @param {object} config {width: number, height: number} of the iframe in pixels
     */
    constructor(targetHost, apiKey, containerId, config) {
        this.targetHost = targetHost;
        this.apiKey = apiKey;
        this.containerId = containerId;
        this.config = config;
        this.parameters = null;
        this.iFrame = null;
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
        this._setIFrame(mapId);
        return new Promise(function (resolve) {
            self.iFrame.onload = function () {
                self.getMapDimensions(data => {
                    self.parameters = {height: data.height, width: data.width, scale: data.scale};
                    resolve();
                });
            }
        });
    }

    /**
     * Getter for map dimensions and scale
     * @param {function} callback - this method will be called when the event occurs. Returns object which contains height and width of the map given in pixels,
     * and {object} scale which contains unit, real distance and other parameters.
     * @example
     * navi.getMapDimensions(data => doSomethingWithMapDimensions(data.height, data.width, data.scale));
     */
    getMapDimensions(callback) {
        Validation.isFunction(callback);
        this._setIFrame();
        return new Promise(resolve => {
                const tempId = Math.round(Math.random() * 10000);
                Communication.listenOnce(`getMapDimensions`, callback, resolve, tempId);
                Communication.send(this.iFrame, this.targetHost, {
                    command: 'getMapDimensions',
                    tempId: tempId
                });
            }
        );
    }

    /**
     * Add listener to react when the long click event occurs
     * @param {function} callback - this method will be called when the event occurs
     * @example
     * navi.addMapLongClickListener(data => doSomethingOnLongClick(data.position.x, data.position.y));
     */
    addMapLongClickListener(callback) {
        Validation.isFunction(callback);
        this._checkIsReady();
        this._setIFrame();
        Communication.send(this.iFrame, this.targetHost, {
            command: 'addClickEventListener',
            args: 'click'
        });
        Communication.listen('click', callback);
    }

    /**
     * Toggle the tag visibility
     * @param tagShortId
     * @example
     * const tagShortId = data.coordinates.tagShortId;
     * navi.toggleTagVisibility(tagShortId);
     */
    toggleTagVisibility(tagShortId) {
        this._checkIsReady();
        this._setIFrame();
        Communication.send(this.iFrame, this.targetHost, {
            command: 'toggleTagVisibility',
            args: tagShortId
        });
    }

    /**
     * Add listener to react when the specific event occurs
     * @param {Event.LISTENER} event - name of the specific event {@link Event}
     * @param {function} callback - this method will be called when the specific event occurs
     * @example
     * navi.addEventListener(Event.LISTENER.COORDINATES, data => doSomethingWithCoordinates(data.coordinates.point));
     */
    addEventListener(event, callback) {
        Validation.isFunction(callback);
        this._checkIsReady();
        this._setIFrame();
        Communication.send(this.iFrame, this.targetHost, {
            command: 'addEventListener',
            args: event
        });
        Communication.listen(event, callback);
    }

    /**
     * Get closest coordinates on floor path for given point
     * @param {@link Point} point coordinates
     * @param {number} accuracy of path pull
     * @return {Promise} promise that will be resolved when {@link Point} is retrieved
     */
    pullToPath(point, accuracy) {
        const self = this;
        return new Promise(resolve => {
            Communication.listen(`getPointOnPath`, resolve);
            Communication.send(self.iFrame, self.targetHost, {
                command: 'getPointOnPath',
                args: {
                    point: point,
                    accuracy: accuracy
                }
            });
        });
    }

    /**
     * Get list of complex, buildings and floors.
     * @returns {Promise} promise that will be resolved when complex list is retrieved.
     */
    getComplexes(callback) {
        Validation.isFunction(callback);
        const self = this;
        return new Promise(resolve => {
            Communication.listenOnce(`getComplexes`, callback, resolve);
            Communication.send(self.iFrame, self.targetHost, {
                command: 'getComplexes'
            });
        });
    }

    _checkIsReady() {
        if (!this.parameters) {
            throw new Error('INMap is not ready. Call load() first and then when promise resolves, INMap will be ready.');
        }
    }

    _setIFrame(mapId) {
        if (!this.iFrame) {
            const iFrame = document.createElement('iframe');
            iFrame.style.width = `${!!this.config.width ? this.config.width : 640}px`;
            iFrame.style.height = `${!!this.config.height ? this.config.height : 480}px`;
            DOM.getById(this.containerId).appendChild(iFrame);
            this.iFrame = iFrame;
        } else {
            this.iFrame = DOM.getByTagName('iframe', DOM.getById(this.containerId));
        }

        if (!!mapId) {
            this.iFrame.setAttribute('src', `${this.targetHost}/embedded/${mapId}?api_key=${this.apiKey}`);
        }
    }

}

class INReport {

    static parseDate(date) {
        return date.toISOString().slice(0, -5);
    }

    /**
     * Report object containing methods to retrieve historical data
     * @param {string} targetHost - address to the IndoorNavi backend server
     * @param {string} apiKey - the API key created on IndoorNavi server (must be assigned to your domain)
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
            this.http.doPost(`${this.targetHost}${this.baseUrl}/coordinates`, {floorId: floorId, from: INReport.parseDate(from), to: INReport.parseDate(to)}, function (data) {
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
            this.http.doPost(`${this.targetHost}${this.baseUrl}/events`, {floorId: floorId, from: INReport.parseDate(from), to: INReport.parseDate(to)}, function (data) {
                resolve(AreaEvent.toJSON(data));
            });
        }).bind(this));
    }
}
describe('INMap module tests', function () {
    it('Should throw an error when you try to toggle tag visibility when iFrame is not ready', function () {
        // given
        let map = new INMap();

        // when
        const toTest = function () {
            map.toggleTagVisibility(1);
        };

        // then
        expect(toTest).toThrow(new Error('INMap is not ready. Call load() first and then when promise resolves, INMap will be ready.'));
    });

    it('Should send message to iFrame when iFrame is ready and toggle tag is called', function () {
        // given
        let map = new INMap();
        map.parameters = {};
        map.iFrame = {};
        spyOn(Communication, 'send').and.stub();
        spyOn(DOM, 'getById').and.stub();
        spyOn(DOM, 'getByTagName').and.stub();

        // when
        map.toggleTagVisibility(1);

        // then
        expect(Communication.send).toHaveBeenCalled();
        expect(DOM.getById).toHaveBeenCalled();
        expect(DOM.getByTagName).toHaveBeenCalled();
    });

    it('Should throw an error when you try to add event listener when iFrame is not ready', function () {
        // given
        let map = new INMap();

        // when
        const toTest = function () {
            map.addEventListener(Event.LISTENER.AREA, function () {
            });
        };

        // then
        expect(toTest).toThrow(new Error('INMap is not ready. Call load() first and then when promise resolves, INMap will be ready.'));
    });

    it('Should send message to iFrame and start listening on events when iFrame is ready and add event listener is called', function () {
        // given
        let map = new INMap();
        map.parameters = {};
        map.iFrame = {};

        spyOn(Communication, 'send').and.stub();
        spyOn(DOM, 'getById').and.stub();
        spyOn(DOM, 'getByTagName').and.stub();
        spyOn(Communication, 'listen').and.stub();

        // when
        map.addEventListener(Event.LISTENER.AREA, function () {
        });

        // then
        expect(Communication.send).toHaveBeenCalled();
        expect(DOM.getById).toHaveBeenCalled();
        expect(DOM.getByTagName).toHaveBeenCalled();
        expect(Communication.listen).toHaveBeenCalled();
    });
});
describe('Object tests', function() {
    it('Should throw an error when You try to create an INMapObject instance', () => {
        // given
        let map = new INMap();
        map.isReady = true;

        // when
        function makeObject() {
            new INMapObject(map);
        }

        // then
        expect(makeObject).toThrow(new TypeError("Cannot construct INMapObject instances directly"));
    });
});

describe('Validation module tests', function() {
    it('should throw an error when required field is undefined', function() {
        // given
        const requiredField = 'test';
        const object = {

        };

        // when
        const toTest = function () {
            Validation.required(object, requiredField, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should throw an error when required field value is undefined', function() {
        // given
        const requiredField = 'test';
        const object = {
            'test': undefined
        };

        // when
        const toTest = function () {
            Validation.required(object, requiredField, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when required field is defined', function() {
        // given
        const requiredField = 'test';
        const object = {
            test: 'test'
        };
        const spy = spyOn(Validation, 'required').and.callThrough();

        // when
        Validation.required(object, requiredField, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when all of the required fields are undefined', function() {
        // given
        const requiredFields = ['test', 'mama'];
        const object = {

        };

        // when
        const toTest = function() {
            Validation.requiredAny(object, requiredFields, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when any of the required fields is defined', function() {
        // given
        const requiredFields = ['test', 'mama'];
        const object = {
            'test': false
        };
        const spy = spyOn(Validation, 'requiredAny').and.callThrough();

        // when
        Validation.requiredAny(object, requiredFields, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given number is NOT an integer', function() {
        // given
        const num = 1.1;

        // when
        const toTest = function() {
            Validation.isInteger(num, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given number is an integer', function() {
        // given
        const num = 5;
        const spy = spyOn(Validation, 'isInteger').and.callThrough();

        // when
        Validation.isInteger(num, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given number is NOT in given range', function() {
        // given
        const min = 1;
        const max = 5;

        // when
        const toTest = function() {
            Validation.isBetween(min, max, 6, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given number is in given range', function() {
        // given
        const min = 5;
        const max = 10;
        const spy = spyOn(Validation, 'isBetween').and.callThrough();

        // when
        Validation.isBetween(min, max, 6, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is NOT in the proper color format', function() {
        // given
        const wrongColorFormat = 'rb(19,91,9)';

        // when
        const toTest = function() {
            Validation.isColor(wrongColorFormat, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is in the proper color format', function() {
        // given
        const goodColorFormat = '#ff0000';
        const spy = spyOn(Validation, 'isColor').and.callThrough();

        // when
        Validation.isColor(goodColorFormat, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is NOT a string', function() {
        // given
        const notAString = false;

        // when
        const toTest = function() {
            Validation.isString(notAString, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is a string', function() {
        // given
        const value = 'test';
        const spy = spyOn(Validation, 'isString').and.callThrough();

        // when
        Validation.isString(value, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is NOT a number', function() {
        // given
        const notANumber = false;

        // when
        const toTest = function() {
            Validation.isNumber(notANumber, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is a number', function() {
        // given
        const value = 1.1;
        const spy = spyOn(Validation, 'isNumber').and.callThrough();

        // when
        Validation.isNumber(value, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is NOT an array', function() {
        // given
        const notAnArray = false;

        // when
        const toTest = function() {
            Validation.isArray(notAnArray, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is an array', function() {
        // given
        const value = ['test'];
        const spy = spyOn(Validation, 'isArray').and.callThrough();

        // when
        Validation.isArray(value, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is NOT in an array', function() {
        // given
        const value = 89;

        // when
        const toTest = function() {
            Validation.isInArray([11, 22, 33], value, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is in an array', function() {
        // given
        const value = 89;
        const spy = spyOn(Validation, 'isInArray').and.callThrough();

        // when
        Validation.isInArray([11, 22, 33, 89], value, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is lower than min', function() {
        // given
        const value = 89;

        // when
        const toTest = function() {
            Validation.isGreaterThan(100, value, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is greater than min', function() {
        // given
        const value = 89;
        const spy = spyOn(Validation, 'isGreaterThan').and.callThrough();

        // when
        Validation.isGreaterThan(82, value, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });
});
/**
 * Class representing a Navigation,
 * creates the InNavigator service
 * Navigation calculates path, draws path and updates path length according to given location
 */
class INNavigation {
    /**
     * @constructor
     * @param {INMap} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        this._navi = navi;
        this._navi._checkIsReady();
        this._navi._setIFrame();
        this._callback_event = null;
    }

    /**
     * Calculates shortest path for given beginning coordinates and destination coordinates
     * @param {Point} location - object {@link Point} representing starting location from which navigation is going to begin.
     * @param {Point} destination - object {@link Point} representing destination to which navigation is going to calculate and draw path.
     * @param {number} margin - number representing margin for which navigation will pull point to the nearest path
     * @return {INNavigation} self to let you chain methods
     * @example
     * const navigation = new INNavigation(navi);
     * navigation.start({x: 100, y: 100}, {x: 800, y: 800}, 10);
     */
    start(location, destination, margin) {
        Validation.isPoint(location, 'Given argument is not a Point');
        Validation.isPoint(destination, 'Given argument is not a Point');
        Validation.isInteger(margin, 'Pull width value is not an integer');
        this._sendToIFrame('start', {
            location: location,
            destination: destination,
            accuracy: margin
        });
        return this;
    }

    addEventListener(callback) {
        this._callback_event = callback;
        Communication.listen('navigation', this._callbackDispatcher.bind(this));
        return this;
    }

    /**
     * Removes listener if listener exists. Use of this method is optional.
     * @return {INNavigation} self to let you chain methods
     * @example
     * const navigation = new INNavigation(navi);
     * navigation.removeEventListener();
     */
    removeEventListener() {
        if (!!this._callback_event) {
            Communication.remove(this._callbackDispatcher);
            this._callback_event = null;
        }
        return this;
    }

    /**
     * Updates actual location on navigation path
     * @param {Point} position - object {@link Point} representing updated location
     * @return {INNavigation} self to let you chain methods
     * @example
     * const navigation = new INNavigation(navi);
     * navigation.start({x: 100, y: 100}, {x: 800, y: 800}, 10)
     * navigation.update({x: 120, y: 120})
     */
    updatePosition(position) {
        Validation.isPoint(position, 'Position value is not an integer');
        this._sendToIFrame('update', {
            position: position
        });
        return this;
    }

    /**
     * Stop navigation process on demand.
     * @example
     * navigation.stop();
     */
    stop() {
        this._sendToIFrame('stop', {});
        return this;
    }

    /**
     * Disable drawing starting point of navigation.
     * @param state {boolean} enable or disable circle visibility, false by default
     * @returns {INNavigation} self to let you chain methods
     * @example
     * const navigation = new INNavigation(navi);
     * navigation.disableStartPoint(true);
     */
    disableStartPoint(state) {
        this._sendToIFrame('disableStart', {state: state});
        return this;
    }

    /**
     * Disable drawing destination point of navigation.
     * @param state {boolean} enable or disable circle visibility, false by default
     * @returns {INNavigation} self to let you chain methods
     * @example
     * const navigation = new INNavigation(navi);
     * navigation.disableEndPoint(true);
     */
    disableEndPoint(state) {
        this._sendToIFrame('disableEnd', {state: state});
        return this;
    }

    /**
     * Sets graphic properties of the starting point
     * @param startPointObject {NavigationPoint} point parameters
     * @returns {INNavigation} self to let you chain methods
     */
    setStartPoint(startPointObject) {
        this._sendToIFrame('startPoint', {navigationPoint: startPointObject});
        return this;
    }

    /**
     * Sets graphic properties of the destination point
     * @param startPointObject {NavigationPoint} point parameters
     * @returns {INNavigation} self to let you chain methods
     */
    setEndPoint(endPointObject) {
        this._sendToIFrame('endPoint', {navigationPoint: endPointObject});
        return this;
    }

    /**
     * Sets color of the navigation path
     * @param pathColor desired color
     * @returns {INNavigation} self to let you chain methods
     */
    setPathColor(pathColor) {
        this._sendToIFrame('setPathColor', {pathColor: pathColor});
        return this;
    }


    /**
     * Sets width of the navigation path
     * @param pathWidth desired width
     * @returns {INNavigation} self to let you chain methods
     */
    setPathWidth(pathWidth) {
        this._sendToIFrame('setPathWidth', {pathWidth: pathWidth});
        return this;
    }



    _sendToIFrame(action, payload) {
        Communication.send(this._navi.iFrame, this._navi.targetHost, {
            command: 'navigation',
            args: {
                object: Object.assign({
                    action: action
                }, payload)
            }
        });
    }

    _callbackDispatcher(event) {
        if (!!this._callback_event) {
            this._callback_event(event);
        }
    }
}

/**
 * Class representing a BLE,
 * creates the INBle object to handle Bluetooth related events
 */

class INBle {
    /**
     * @constructor
     * @param {number} floor - floor to which Bluetooth events are related
     * @param {string} targetHost - address to the IndoorNavi backend server
     * @param {string} apiKey - the API key created on IndoorNavi server (must be assigned to your domain)
     */
    constructor(floor, targetHost, apiKey) {
        Validation.isInteger(floor, 'Floor number must be integer');
        Validation.isString(targetHost, 'Target host parameter should be type of string');
        Validation.isString(apiKey, 'apiKey parameter should be type of string');
        this._dataProvider = new INData(targetHost, apiKey);
        this._floor = floor;
        this._areaEventsMap = new Map();
    }

    /**
     * Sets callback function to react for position update event
     * @param {function} callback - function that will be executed when new area event is triggered, callback takes {@link AreaPayload} as argument
     * @return {Promise} promise that will be resolved when {@link AreaPayload} list is retrieved
     * @example
     * const ble = new INBle(4);
     * ble.updatePosition((areaPayload) => console.log(areaPayload)).then(() => console.log('areas fetched'));
     */
    addCallbackFunction(callback) {
        Validation.isFunction(callback);
        return new Promise(resolve => {
            this._dataProvider.getAreas(this._floor).then(areas => {
                this._areas = areas;
                this._callback = callback;
                resolve();
            });
        });
    }

    /**
     * Updates Bluetooth position for area events check, if position is inside area callback function passed to addCallbackFunction() method is triggered
     * @param {Point} position from bluetooth module
     * @example
     * const ble = new INBle(4);
     * ble.updatePosition((areaPayload) => console.log(areaPayload)).then(ble.updatePosition({x: 1, y: 1}));
     */
    updatePosition(position) {
        Validation.isPoint(position, 'Updated position is not a Point');
        if (!!this._areas && this._areas.length > 0) {
            this._areas.forEach(area => {
                if (MapUtils.pointIsWithinGivenArea(position, area.points)) {
                    if (this._shouldSendOnEnterEvent(area)) {
                        this._areaEventsMap.set(area, new Date());
                        this._sendAreaEvent(area, 'ON_ENTER');
                    } else {
                        this._updateTime(area)
                    }
                } else if (this._shouldSendOnLeaveEvent(area)) {
                    this._areaEventsMap.delete(area);
                    this._sendAreaEvent(area, 'ON_LEAVE');
                }
            });
        }
    }

    _sendAreaEvent(area, mode) {
        this._callback({
            area: area,
            date: new Date(),
            mode: mode
        });
    }

    _shouldSendOnEnterEvent(area) {
        return !this._areaEventsMap.has(area);
    }

    _shouldSendOnLeaveEvent(area) {
        return this._areaEventsMap.has(area);
    }

    _updateTime(area) {
        this._areaEventsMap.set(area, new Date());
    }

    /**
     * Returns areas that are checked for Bluetooth events
     * @return {AreaPayload[]} areas if areas are fetched else null
     * */
    getAreas() {
        if (!!this._areas) {
            return this._areas;
        }
        return null;
    }
}
