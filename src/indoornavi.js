/**
* Class representing a IndoorNavi,
* creates the IndoorNavi object to communicate with IndoorNavi frontend server
*/
class IndoorNavi {
    /**
     * @constructor
     * @param {string} targetHost - address to the IndoorNavi server
     * @param {string} apiKey - the API key created on IndoorNavi server (must be assigned to your domain)
     * @param {string} containerId of DOM element which will be used to create iframe with map
     * @param {object} config of the iframe
     * @param {number} config.width of the iframe
     * @param {number} config.height of the iframe
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
    }

    /**
     * Add listener to react when the specific event occurs
     * @param {string} eventName - name of the specific event (i.e. 'area', 'coordinates')
     * @param {function} callback - this method will be called when the specific event occurs
     * example
     * navi.addEventListener('coordinates', data => doSomthingWithCoordinates(data.coordinates.point));
     */
    addEventListener(eventName, callback) {
      this.checkIsReady();
      this.setIFrame();
        Communication.send(this.iFrame, this.targetHost, {
            command: 'addEventListener',
            args: eventName
        });

        Communication.listen(eventName, callback);
    }

     checkIsReady() {
       if (!this.isReady) {
           throw new Error('IndoorNavi is not ready. Call load() first and then when promise resolves IndoorNavi will be ready.');
       }
     }

     setIFrame () {
      this.iFrame = DOM.getByTagName('iframe', DOM.getById(this.containerId));
     }

}
