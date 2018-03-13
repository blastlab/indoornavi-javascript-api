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

  static listenOnce(eventName, callback, resolve) {
    function handler(event) {
      if ('type' in event.data && event.data.type === eventName && event.data.mapObjectId) {
        window.removeEventListener('message', handler, false)
        callback(event.data.mapObjectId);
        resolve();
      }
    }
    window.addEventListener('message', handler, false);
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
        return container.getElementsByTagName(tagName)[0];
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

/**
* Abstract class that communicates with indoornavi frontend server to create Geometric objects in iFrame.
* @abstract
*/

class Geometric {
  /**
   * Instance of a Geometric class cennot be created directly, Geometric class is an abstract class.
   * @abstract
   * @constructor
   * @param {Indornavi} navi needs the Indoornavi class injected to the constructor, to know where geometric object is going to be created
   */
  constructor(navi) {
    if (new.target === Geometric) {
      throw new TypeError("Cannot construct Geometric instances directly");
    }
    this._navi = navi;
    this._id = null;
    this._type = 'OBJECT'
    this._navi.checkIsReady();
    this._navi.setIFrame();
  }

  /**
  * @returns {Promise} Promise that will resolve when connection to WebSocket will be established, assures that instance of Geometric has been created on the injected Indornavi class, this method should be executed before calling any method and those method should to be executed inside callback, after promise is resolved
  */
  ready() {
    const self = this;
    function setObject (id) {
      self._id = id;
    }
    if (!!self._id) {
      // resolve immediately
      return new Promise(resolve => {
        resolve();
      })
    }
    return new Promise(resolve => {
        // create listener for event that will fire only once
        Communication.listenOnce('createObject', setObject.bind(self), resolve);
        // then send message
        Communication.send(self._navi.iFrame, self._navi.targetHost, {
          command: 'createObject'
        });
      }
    );
  }

  /**
   * Draws object for given array of points.
   * @param {array} points - array of points between which lines are going to be drawn, coordinates(x, y) of the point are given in centimeters from real distances (scale 1:1)
   */
  draw (points) {}

  /**
   * Removes object and destroys it instance in the frontend server, but do not destroys object class instance in your app
   * @example
   * inheritedClassFromGeometric.ready().then(() => inheritedClassFromGeometric.remove());
   */
  remove(){
    if(!!this._id) {
      Communication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'removeObject',
        args: {
          type: this._type,
          object: {
            id: this._id
          }
        }
      });
    } else {
      throw new Error(`Object ${this._type} is not created yet, use ready() method before executing other methods`);
    }
  }

  _setColor(color, attribute) {
    let hexToSend = null;
    const isValidColor = /(^[a-zA-Z]+$)|(#(?:[0-9a-f]{2}){2,4}|#[0-9a-f]{3}|(?:rgba?|hsla?)\((?:\d+%?(?:deg|rad|grad|turn)?(?:,|\s)+){2,3}[\s\/]*[\d\.]+%?\))/i.test(color);
    if (!isValidColor) {
      throw new Error('Wrong color value or/and type');
    }
    if (!!this._id) {
      if (/rgb/i.test(color)) {
        const rgb = color.slice(4, color.length - 1).split(',');
        hexToSend = `#${parseInt(rgb[0], 10).toString(16).slice(-2)}${parseInt(rgb[1],10).toString(16).slice(-2)}${parseInt(rgb[2],10).toString(16).slice(-2)}`;
      } else if (/#/i.test(color)) {
        hexToSend = color;
      }
      Communication.send(this._navi.iFrame, this._navi.targetHost, {
        command: `${attribute}Color`,
        args: {
          type: this._type,
          object: {
            id: this._id,
            color: hexToSend
          }
        }
      });
    } else {
      throw new Error(`Object ${this._type} is not created yet, use ready() method before executing other methods`);
    }
  }

}

/**
 * Class representing a Polyline,
 * creates the polyline object in iframe that communicates with indoornavi frontend server and draws polyline
 * @extends Geometric
 */

class Polyline extends Geometric {
  /**
  * @constructor
  * @param {Object} navi - instance of a Polyline class needs the Indoornavi class injected to the constructor, to know where polyline object is going to be created
  * @example
  * const poly = new Polyline(navi);
  */
   constructor(navi) {
     super(navi);
     this._type = 'POLYLINE';
   }

  /**
  * Draws polyline for given array of points.
  * @param {array} points - array of points between which lines are going to be drawn, coordinates(x, y) of the point are given in centimeters as integers from real distances (scale 1:1)
  * @example
  * poly.ready().then(() => poly.draw(points));
  */
  draw (points) {
    if (!Array.isArray(points)) {
      throw new Error('Given argument is not na array');
    }
    points.forEach(point => {
      if(!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
        throw new Error('Given points are in wrong format or coordianets x an y are not integers')
      }
    });
    if (!!this._id) {
      Communication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'drawObject',
        args: {
          type: this._type,
          object: {
            id: this._id,
            points: points
          }
        }
      });
    } else {
      throw new Error('Polyline is not created yet, use ready() method before executing draw(), or remove()');
    }
  }

  /**
   * Sets polyline lines and points color.
   * @param {color} string - string that specifies the color. Supports color in hex format '#AABBCC' and 'rgb(255,255,255)';
   * @example
   * poly.ready().then(() => poly.setLineColor('#AABBCC'));
   */
  setLineColor(color) {
    this._setColor(color, 'stroke');
  }

}

/**
 * Class representing an Area,
 * creates the area object in iframe that communicates with indoornavi frontend server and draws area
 * @extends Geometric
 */

class Area extends Geometric {
  /**
   * @constructor
   * @param {Object} navi - instance of an Area class needs the Indoornavi class injected to the constructor, to know where area object is going to be created
   * @example
   * const area = new Area(navi);
   */
  constructor(navi) {
    super(navi);
    this._type = 'AREA';
  }

  /**
   * Draws area for given array of points.
   * @param {array} points - array of points which will describe the area, coordinates members such as x and y of the point are given in centimeters as integers from real distances (scale 1:1).
   * For less than 3 points supplied to this method, area isn't going to be drawn.
   * @example
   * area.ready().then(() => area.draw(points));
   */
  draw (points) {
    if (arguments.length !== 1) {
      throw new Error('Wrong number of arguments passed');
    }
    if (!Array.isArray(points)) {
      throw new Error('Given argument is not na array');
    } else if (points.length < 3) {
      throw new Error('Not enought points to draw an area');
    }
    points.forEach(point => {
      if(!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
        throw new Error('Given points are in wrong format or coordianets x an y are not integers');
      }
    });

    this._points = points;

    if (!!this._id) {
      Communication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'drawObject',
        args: {
          type: this._type,
          object: {
            id: this._id,
            points: points
          }
        }
      });
    } else {
      throw new Error('Area is not created yet, use ready() method before executing draw(), or remove()');
    }
  }

  /**
   * Fills area whit given color.
   * @param {color} string - string that specifies the color. Supports color in hex format '#AABBCC' and 'rgb(255,255,255)';
   * @example
   * area.ready().then(() => area.setFillColor('#AABBCC'));
   */
  setFillColor (color) {
    this._setColor(color, 'fill');
  }

  /**
   * Sets opacity.
   * @param {float} float, float between 1.0 and 0. Set it to 1.0 for no oppacity, 0 for maximum opacity.
   * @example
   * area.ready().then(() => area.setOpacity(0.3));
   */

  setOpacity(value) {
    if(isNaN(value) || value > 1 || value < 0) {
      throw new Error('Wrong value passed to setTransparency() method, only numbers between 0 and 1 are allowed');
    }
    if(!!this._id) {
      Communication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'setOpacity',
        args: {
          type: this._type,
          object: {
            id: this._id,
            opacity: value
          }
        }
      });
    } else {
      throw new Error(`Object ${this._type} is not created yet, use ready() method before executing other methods`);
    }

  }

  /**
  * Check is point of given coordinates inside of the created area.
  * @returns {boolean} true if given coordinates are inside the area, false otherwise;
  * @param {coordinates} object - object with x and y members given as integers;
  * @example
  * area.ready().then(() => area.checkIsInside({x: 100, y: 50}));
  */
  // Semi-infinite ray horizontally (increasing x, fixed y) out from the test point, and count how many edges it crosses.
  // At each crossing, the ray switches between inside and outside. This is called the Jordan curve theorem.

  checkIsInside (coordinates) {
    let inside = false;
    let intersect = false;
    let xi, yi, xj, yj = null;

    for (let i = 0, j = this._points.length - 1; i < this._points.length; j = i++) {
      xi = this._points[i].x;
      yi = this._points[i].y;

      xj = this._points[j].x;
      yj = this._points[j].y;

      intersect = ((yi > coordinates.y) !== (yj > coordinates.y)) && (coordinates.x < (xj - xi) * (coordinates.y - yi) / (yj - yi) + xi);
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }


}

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