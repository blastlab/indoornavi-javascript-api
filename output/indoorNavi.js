class Http {

    constructor() {
    }

    doGet(url, callback) {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                callback(xmlHttp.responseText);
        };
        xmlHttp.open("GET", url, true); // true for asynchronous
        xmlHttp.send(null);
    }
}

class Communication {
    static send(iFrame, host, data) {
        iFrame.contentWindow.postMessage(data, host);
    }
}

class DOM {
    static getById(id) {
        return document.getElementById(id).getElementsByTagName('iframe')[0];
    }
}
class IndoorNavi {

    /**
     * Create the IndoorNavi object to communicate with IndoorNavi server
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
     @returns {Promise} promise that will resolve when connection to WebSocket has been established
     */
    load(mapId) {
        const iFrame = document.createElement('iframe');
        const self = this;
        iFrame.style.width = `${!!this.config.width ? this.config.width : 640}px`;
        iFrame.style.height = `${!!this.config.height ? this.config.height : 480}px`;
        iFrame.setAttribute('src', `${this.targetHost}/embedded/${mapId}?api_key=${this.apiKey}`);
        document.getElementById(this.containerId).appendChild(iFrame);
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
        if (!this.isReady) {
            throw new Error('IndoorNavi is not ready');
        }
        const iFrame = DOM.getById(this.containerId);
        // const communication = new Communication();
        Communication.send(iFrame, {
            command: 'toggleTagVisibility',
            args: tagShortId
        }, this.targetHost);
    }
}