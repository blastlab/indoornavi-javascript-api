/**
 * Class representing a InfoWindow,
 * creates the INInfoWindow object in iframe that communicates with indoornavi frontend server and draws INInfoWindow.
 * @extends INMapObject
 */

class INInfoWindow extends INMapObject {
    /**
     * @constructor
     * @param {Object} navi - instance of a Marker class needs the Indoornavi instance object injected to the constructor, to know where INMarker object is going to be created
     */
    constructor(navi) {
        super(navi);
        this._type = 'INFO_WINDOW';
        this._points = null;
        this._content = null;
        this._position = 0;
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
    }
    /**
     * Sets info window content.
     * @param {string} content - of data or html template in string format that will be passed in to info window as text.
     * To reset label to a new content call this method again passing new content as a string and call place method().
     * @return {INInfoWindow} - returns INInfoWindow instance class;
     * @example
     * const infoWindow = new INInfoWindow(navi);
     * infoWindow.ready().then(() => infoWindow.setInnerHtml('<p>text in paragraf</p>'));
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
     * @param {number} position - given as INMarker.positionEnum.'POSITION' property representing info window position.
     * Available POSITION settings: TOP, LEFT, RIGHT, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT.
     * return {INInfoWindow} - returns INInfoWindow instance class;
     * @example
     * const infoWindow = INInfoWindow(navi);
     * infoWindow.ready(() => infoWindow.setPosition(infoWindow.positionEnum.TOP));
     */

    setPositon(position) {
        if (!Number.isInteger(position) || position < 0 || position > 7) {
            throw new Error('Wrong argument passed for info window position');
        }
        this._position = position;
        return this;
    }

    /**
     * Displays info window in iframe.
     * Default position for info window is TOP.
     * @param {object} mapObject - map object to append info window to.
     * @example
     * const infoWindow = INInfoWindow(navi);
     * const marker = INMarker();
     * marker.ready().then(() => {
     *  marker.coordinates({x: 100, y: 100}).place();
     *  infoWindow.ready(() => infoWindow.setInnerHTML('text for info window').open(marker));
     * });
     */

    open(mapObject) {
        if (!mapObject || !Number.isInteger(mapObject.getID())) {
            throw new Error('Passed object is null, undefined or has not been initialized in indoor navi iframe');
        }
        this._points = mapObject.getPoints();
        if (!this._points || this._points.length < 1) {
            throw new Error('No points given for info window placement has been specified');
        }
        if (!!this._id) {
            INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'drawObject',
                args: {
                    type: this._type,
                    object: {
                        id: this._id,
                        points: this._points,
                        content: this._content,
                        position: this._position,
                    }
                }
            });
        } else {
            throw new Error('Info Window is not created yet, use ready() method before executing any other method');
        }
    }
}