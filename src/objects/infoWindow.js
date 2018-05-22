/**
 * Class representing an InfoWindow,
 * creates the INInfoWindow object in iframe that communicates with InndoorNavi frontend server and adds info window to a given INObject child.
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
     * @return {INInfoWindow} - returns INInfoWindow instance class;
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
     * @return {INInfoWindow} - returns INInfoWindow instance class;
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
     * @return {INInfoWindow} - returns INInfoWindow instance class;
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
