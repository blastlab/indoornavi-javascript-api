class Communication {
    static send(iFrame, host, data) {
        iFrame.contentWindow.postMessage(data, host);
    }

    static listen(eventName, callback) {
        window.addEventListener('message', function(event) {
            if ('type' in event.data && event.data.type === eventName) {
                callback(event.data);
            }
        }, false);
    }
}

class DOM {
    static getById(id) {
        return document.getElementById(id);
    }

    static getByTagName(tagName, container) {
        if (!container) {
            container = window;
        }
        return container.getElementsByTagName(tagName)[0]
    }
}

class Http {

    constructor() {
        this.authHeader = null;
    }

    setAuthorization(authHeader) {
        this.authHeader = authHeader;
    }

    doGet(url, callback) {
        this.doRequest(url, 'GET', null, callback);
    }

    doPost(url, body, callback) {
        this.doRequest(url, 'POST', body, callback);
    }

    doRequest(url, method, body, callback) {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                callback(xmlHttp.responseText);
        };
        xmlHttp.open(method, url, true); // true for asynchronous
        if (!!this.authHeader) {
            xmlHttp.setRequestHeader('Authorization', this.authHeader);
        }
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.setRequestHeader('Accept', 'application/json');
        xmlHttp.send(JSON.stringify(body));
    }
}

class AreaEvent {
    static toJSON(eventsArrayString) {
        const events = [];
        JSON.parse(eventsArrayString).forEach(function(_events) {
            events.push(new AreaEvent(
                _events['tagId'],
                new Date(_events['date']),
                _events['areaId'],
                _events['areaName'],
                _events['mode']
            ));
        });
        return events;
    };

    /**
     * AreaEvent object
     * @param {number} tagId short id of the tag that entered/left this area
     * @param {Date} date when tag appeared in this area
     * @param {number} areaId
     * @param {string} areaName
     * @param {string} mode can be ON_LEAVE or ON_ENTER
     */
    constructor(tagId, date, areaId, areaName, mode) {
        this.tagId = tagId;
        this.date = date;
        this.areaId = areaId;
        this.areaName = areaName;
        this.mode = mode;
    }
}

class Coordinates {
    static toJSON(coordinatesArrayString) {
        const coordinates = [];
        JSON.parse(coordinatesArrayString).forEach(function(_coordinates) {
            coordinates.push(new Coordinates(
               _coordinates['point']['x'],
               _coordinates['point']['y'],
               _coordinates['tagShortId'],
               new Date(_coordinates['date'])
            ));
        });
        return coordinates;
    };

    /**
     * Coordinates object
     * @param {number} x
     * @param {number} y
     * @param {number} tagId short id of the tag
     * @param {Date} date when tag appeared in this coordinates
     */
    constructor(x, y, tagId, date) {
        this.x = x;
        this.y = y;
        this.tagId = tagId;
        this.date = date;
    }
}


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
      this._checkIsReadyAndActivateIFrame();
        Communication.send(this._iFrame, this.targetHost, {
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
      this._checkIsReadyAndActivateIFrame();
        Communication.send(this._iFrame, this.targetHost, {
            command: 'addEventListener',
            args: eventName
        });

        Communication.listen(eventName, callback);
    }

    /**
     * Create polyline object
     * @param id - unique id for the polyline svg group that will be placed on the map as DOM element
     */
     createPolyline(id) {
       this._checkIsReadyAndActivateIFrame();
       Communication.send(this._iFrame, this.targetHost, {
           command: 'createPolyline',
           args: id
       });
       // Communication.listen(eventName, object);
     }

     _checkIsReadyAndActivateIFrame() {
       if (!this.isReady) {
           throw new Error('IndoorNavi is not ready. Call load() first and then when promise resolves IndoorNavi will be ready.');
       }
      this._iFrame = DOM.getByTagName('iframe', DOM.getById(this.containerId));
     }

}


class Report {

    static parseDate(date) {
        return date.toISOString().slice(0, -5);
    }

    /**
     * Report object containing methods to retrieve historical data
     * @param {string} targetHost - address to the IndoorNavi backend server
     * @param {string} apiKey - the API key created on IndoorNavi server (must be assigned to your domain)
     */
    constructor(targetHost, apiKey) {
        const authHeader = 'Token ' + apiKey;
        this.targetHost = targetHost;
        this.baseUrl = '/rest/v1/reports';
        this.http = new Http();
        this.http.setAuthorization(authHeader);
    }

    /**
     * Get list of historical coordinates
     * @param {number} floorId id of the floor you want to get coordinates from
     * @param {Date} from starting closed range
     * @param {Date} to ending closed range
     * @return {Promise} promise that will be resolved when {@link Coordinates} list is retrieved
     */
    getCoordinates(floorId, from, to) {
        return new Promise((function(resolve) {
            this.http.doPost(`${this.targetHost}${this.baseUrl}/coordinates`, {floorId: floorId, from: Report.parseDate(from), to: Report.parseDate(to)}, function (data) {
                resolve(Coordinates.toJSON(data));
            });
        }).bind(this));
    }

    /**
     * Get list of historical area events
     * @param {number} floorId id of the floor you want to get area events from
     * @param {Date} from starting closed range
     * @param {Date} to ending closed range
     * @return {Promise} promise that will be resolved when {@link AreaEvent} list is retrieved
     */
    getAreaEvents(floorId, from, to) {
        return new Promise((function(resolve) {
            this.http.doPost(`${this.targetHost}${this.baseUrl}/events`, {floorId: floorId, from: Report.parseDate(from), to: Report.parseDate(to)}, function (data) {
                resolve(AreaEvent.toJSON(data));
            });
        }).bind(this));
    }
}
describe('IndoorNavi main module tests', function () {
    it('Should throw an error when you try to toggle tag visibility when iFrame is not ready', function () {
        // given
        let indoorNavi = new IndoorNavi();

        // when
        const toTest = function () {
            indoorNavi.toggleTagVisibility(1);
        };

        // then
        expect(toTest).toThrow(new Error('IndoorNavi is not ready. Call load() first and then when promise resolves IndoorNavi will be ready.'));
    });

    it('Should send message to iFrame when iFrame is ready and toggle tag is called', function() {
        // given
        let indoorNavi = new IndoorNavi();
        indoorNavi.isReady = true;
        spyOn(Communication, 'send').and.stub();
        spyOn(DOM, 'getById').and.stub();
        spyOn(DOM, 'getByTagName').and.stub();

        // when
        indoorNavi.toggleTagVisibility(1);

        // then
        expect(Communication.send).toHaveBeenCalled();
        expect(DOM.getById).toHaveBeenCalled();
        expect(DOM.getByTagName).toHaveBeenCalled();
    });

    it('Should throw an error when you try to add event listener when iFrame is not ready', function() {
        // given
        let indoorNavi = new IndoorNavi();

        // when
        const toTest = function () {
            indoorNavi.addEventListener('area', function() {});
        };

        // then
        expect(toTest).toThrow(new Error('IndoorNavi is not ready. Call load() first and then when promise resolves IndoorNavi will be ready.'));
    });

    it('Should send message to iFrame and start listening on events when iFrame is ready and add event listener is called', function() {
        // given
        let indoorNavi = new IndoorNavi();
        indoorNavi.isReady = true;
        spyOn(Communication, 'send').and.stub();
        spyOn(DOM, 'getById').and.stub();
        spyOn(DOM, 'getByTagName').and.stub();
        spyOn(Communication, 'listen').and.stub();

        // when
        indoorNavi.addEventListener('area', function() {});

        // then
        expect(Communication.send).toHaveBeenCalled();
        expect(DOM.getById).toHaveBeenCalled();
        expect(DOM.getByTagName).toHaveBeenCalled();
        expect(Communication.listen).toHaveBeenCalled();
    });
});