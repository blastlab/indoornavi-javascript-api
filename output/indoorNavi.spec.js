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