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
