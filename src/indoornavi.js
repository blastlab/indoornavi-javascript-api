class IndoorNavi {
    /**
     * Create the IndoorNavi object to communicate with IndoorNavi frontend server
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
     @param {number} mapId
     @returns {Promise} promise that will resolve when connection to WebSocket will be established
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
     */
    toggleTagVisibility(tagShortId) {
      this.checkIsReadyAndActivateIFrame();
        Communication.send(this.iFrame, this.targetHost, {
            command: 'toggleTagVisibility',
            args: tagShortId
        });
    }

    /**
     * Add listener to react when the specific event occurs
     * @param {string} eventName - name of the specific event (i.e. 'area', 'coordinates')
     * @param {function} callback - this method will be called when the specific event occurs
     */
    addEventListener(eventName, callback) {
      this.checkIsReadyAndActivateIFrame();
        Communication.send(this.iFrame, this.targetHost, {
            command: 'addEventListener',
            args: eventName
        });

        Communication.listen(eventName, callback);
    }

     checkIsReadyAndActivateIFrame() {
       if (!this.isReady) {
           throw new Error('IndoorNavi is not ready. Call load() first and then when promise resolves IndoorNavi will be ready.');
       }
      this.iFrame = DOM.getByTagName('iframe', DOM.getById(this.containerId));
     }

}
