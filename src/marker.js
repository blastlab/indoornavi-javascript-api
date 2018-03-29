/**
 * Class representing a Marker,
 * creates the INMarker object in iframe that communicates with indoornavi frontend server and draws INMarker.
 * @extends INMapObject
 */

class INMarker extends INMapObject {
    /**
     * @constructor
     * @param {Object} navi - instance of a Marker class needs the Indoornavi instance object injected to the constructor, to know where INMarker object is going to be created
     */
    constructor(navi) {
        super(navi);
        this._type = 'MARKER';
        this._point = null;
        this._icon = null;
        this._infoWindow = {
            content: null,
            position: null
        };
        this._label = null;
        this._events = new Set();
        this.positionEnum = {
            TOP: 0,
            RIGHT: 1,
            BOTTOM: 2,
            LEFT: 3,
            TOP_RIGHT: 4,
            TOP_LEFT: 5,
            BOTTOM_RIGHT: 6,
            BOTTOM_LEFT: 7
        };
        this.eventsEnum = {
            CLICK: 0,
            MOUSEOVER: 1,
        };
    }

    /**
     * Sets marker info window and position. Use of this method is optional.
     * @param {string} content - of data or html template in string format that will be passed in to info window as text.
     * To reset label to a new content call this method again passing new content as a string and call place method().
     * @param {number} position - given as INMarker.positionEnum.'POSITION' property representing info window position.
     * Available POSITION settings: TOP, LEFT, RIGHT, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT.
     * @return {INMarker} - returns INMarker instance class;
     * @example
     * const marker = new Marker(navi);
     * marker.ready().then(() => marker.setInfoWindow('<p>text in paragraf</p>', marker.positionEnum.TOP));
     */

    setInfoWindow(content, position) {
        if (typeof content !== 'string') {
            throw new Error('Wrong argument passed for info window content');
        }
        if (!Number.isInteger(position) || position < 0 || position > 7) {
            throw new Error('Wrong argument passed for info window position');
        }
        this._infoWindow = {
            content: content,
            positon: position
        };
        return this;
    }

    /**
     * Removes marker info window.
     * @return {INMarker} - returns INMarker instance class;
     * @example
     * marker.ready().then(() => marker.removeInfoWindow());
     */

    removeInfoWindow() {
        this._infoWindow = {
            content: null,
            position: null
        };
        return this;
    }

    /**
     * Sets marker label. Use of this method is optional.
     * @param {string} value - string that will be used as a marker label. If label method isn't used than no label is going to be displayed.
     * To reset label to a new string call this method again passing new label as a string and call place() method.
     * @return {INMarker} - returns INMarker instance class;
     * @example
     * const marker = new Marker(navi);
     * marker.ready().then(() => marker.setLabel('label to display'));
     */

    setLabel(value) {
        if (typeof value === 'string' || typeof value === 'number') {
            this._label = value;
        }
        return this;
    }

    /**
     * Removes marker label.
     * @return {INMarker} - returns INMarker instance class;
     * @example
     * marker.ready().then(() => marker.removeLabel());
     */

    removeLabel() {
        this._label = null;
        return this;
    }

    /**
     * Sets marker icon. Use of this method is optional.
     * @param {string} path - url path to your icon;
     * @return {INMarker} - returns INMarker instance class;
     * @example
     * const path = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png'
     * const marker = new Marker(navi);
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
     * Add listener to react when icon is clicked. Use of this method is optional.
     * @param {number} event - as INMarker.eventsEnum.'EVENT' property representing event to listen to. Available events are: ONCLICK, ONMOUSEOVER ...
     * @param {function} callback - function that is going to be executed when event occurs.
     * @return {INMarker} - returns INMarker instance class;
     * example
     * marker.ready(() => marker.addEventListener(marker.eventsEnum.CLICK, () => marker.displayInfoWindow()));
     */

    addEventListener(event, callback) {
        this._events.add(event);
        INCommunication.listen(event, callback);
        return this;
    }

    /**
     * Removes listener if listener exists. Use of this method is optional.
     * @param {number} event - as INMarker.eventsEnum.'EVENT' property representing event to listen to. Available events are: ONCLICK, ONMOUSEOVER ...
     * @return {INMarker} - returns INMarker instance class;
     * example
     * marker.ready(() => marker.removeEventListener(marker.eventsEnum.CLICK));
     */

    removeEventListener(event) {
        if (this._events.has(event)) {
            INCommunication.remove(event)
        }
        return this;
    }

    /**
     * Locates marker at given point coordinates. Coordinates needs to be given as real world dimensions that map is representing. Use of this method is indispensable.
     * @param {object} point -object { x: int, y: int } representing marker position in rel world. Coordinates are calculated to the map scale and than displayed.
     * Marker will be clipped to the point in the bottom center of marker icon.
     * @return {INMarker} - returns INMarker instance class;
     * @example
     * const marker = new Marker(navi);
     * marker.ready().then(() => marker.coordinates({x: 100, y: 100}));
     */

    coordinates(point) {
        if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
            throw new Error('Given point is in wrong format or coordinates x an y are not integers');
        }
        this._point = point;
        return this;
    }

    /**
     * Place market on the map with all given settings. There is necessary to use coordinates() method before place() method to indicate where market should to be located.
     * Use of this method is indispensable to draw market with set configuration in the IndoorNavi Map.
     * @example
     * const marker = new Marker(navi);
     * marker.ready().then(() => marker.coordinates({x: 100, y: 100}).place());
     */

    place() {
        if (!this._point) {
            throw new Error('No point for marker placement has been specified');
        }
        if (!!this._id) {
            const events = [];
            this._events.forEach(event => events.push(event));
            INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'drawObject',
                args: {
                    type: this._type,
                    object: {
                        id: this._id,
                        points: [this._point],
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
