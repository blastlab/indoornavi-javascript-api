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
