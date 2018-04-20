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
     * marker.ready().then(() => marker.setLabel('label to display'));
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
