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
        Validation.isString(label, 'Label must be string or number');
        Validation.isNumber(label, 'Label must be string or number');
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
