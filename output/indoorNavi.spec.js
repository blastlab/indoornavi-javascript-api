class INCommunication {
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

class INDOM {
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

class INHttp {

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
        const xmlINHttp = new XMLINHttpRequest();
        xmlINHttp.onreadystatechange = function() {
            if (xmlINHttp.readyState === 4 && xmlINHttp.status === 200)
                callback(xmlINHttp.responseText);
        };
        xmlINHttp.open(method, url, true); // true for asynchronous
        if (!!this.authHeader) {
            xmlINHttp.setRequestHeader('Authorization', this.authHeader);
        }
        xmlINHttp.setRequestHeader('Content-Type', 'application/json');
        xmlINHttp.setRequestHeader('Accept', 'application/json');
        xmlINHttp.send(JSON.stringify(body));
    }
}

/**
 * Class representing an areaEvent,
 */

class INAreaEvent {
    static toJSON(eventsArrayString) {
        const events = [];
        JSON.parse(eventsArrayString).forEach(function(_events) {
            events.push(new INAreaEvent(
                _events['tagId'],
                new Date(_events['date']),
                _events['INAreaId'],
                _events['INAreaName'],
                _events['mode']
            ));
        });
        return events;
    };

    /**
     * INAreaEvent object
     * @param {number} tagId short id of the tag that entered/left this INArea
     * @param {Date} date when tag appeared in this INArea
     * @param {number} INAreaId
     * @param {string} INAreaName
     * @param {string} mode can be ON_LEAVE or ON_ENTER
     */
    constructor(tagId, date, INAreaId, INAreaName, mode) {
        this.tagId = tagId;
        this.date = date;
        this.INAreaId = INAreaId;
        this.INAreaName = INAreaName;
        this.mode = mode;
    }
}

/**
 * Class representing a INCoordinates,
 */

class INCoordinates {
    static toJSON(coordinatesArrayString) {
        const coordinates = [];
        JSON.parse(coordinatesArrayString).forEach(function(_coordinates) {
            coordinates.push(new INCoordinates(
               _coordinates['point']['x'],
               _coordinates['point']['y'],
               _coordinates['tagShortId'],
               new Date(_coordinates['date'])
            ));
        });
        return coordinates;
    };

    /**
     * INCoordinates object
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
* Abstract class that communicates with indoornavi frontend server to create INMapObject object in iFrame.
* @abstract
*/

class INMapObject {
  /**
   * Instance of a INMapObject class cennot be created directly, INMapObject class is an abstract class.
   * @abstract
   * @constructor
   * @param {Indornavi} navi needs the Indoornavi instance object injected to the constructor, to know where INMapObject is going to be created
   */
  constructor(navi) {
    if (new.target === INMapObject) {
      throw new TypeError("Cannot construct INMapObject instances directly");
    }
    this._navi = navi;
    this._id = null;
    this._type = 'OBJECT'
    this._navi.checkIsReady();
    this._navi.setIFrame();
  }

  /**
  * @returns {Promise} Promise that will resolve when connection to WebSocket will be established, assures that instance of INMapObject has been created on the injected Indornavi class, this method should be executed before calling any other method. Those methods should to be executed inside callback, after promise is resolved
  * @exapmle
  * 'inheritedObjectFromINMapObject'.ready().then(() => 'inheritedObjectFromINMapObject'.'method()');
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
        INCommunication.listenOnce('createObject', setObject.bind(self), resolve);
        // then send message
        INCommunication.send(self._navi.iFrame, self._navi.targetHost, {
          command: 'createObject'
        });
      }
    );
  }

  /**
   * Draws object for given array of points.
   * @param {array} points - array of points between which lines are going to be drawn, coordinates(x, y) of the point are given in centimeters from real distances (scale 1:1)
   */
  draw (points) {
    return this;
  }

  /**
   * Removes object and destroys it instance in the frontend server, but do not destroys object class instance in your app.
   * inheritedObjectFromINMapObject is a child object of abstract class INMapObject
   * @example
   * 'inheritedObjectFromINMapObject'.ready().then(() => 'inheritedObjectFromINMapObject'.remove());
   */
  remove(){
    if(!!this._id) {
      INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
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

  /**
  * Checks, is point of given coordinates inside of the created object.
  * @returns {boolean} true if given coordinates are inside the object, false otherwise;
  * @param {coordinates} object - object with x and y members given as integers;
  * @example
  * 'inheritedObjectFromINMapObject.ready().then(() => 'inheritedObjectFromINMapObject.isWithin({x: 100, y: 50}));
  */
  // Semi-infinite ray horizontally (increasing x, fixed y) out from the test point, and count how many edges it crosses.
  // At each crossing, the ray switches between inside and outside. This is called the Jordan curve theorem.

  isWithin (coordinates) {
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
      INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
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
 * Class representing a INPolyline,
 * creates the INPolyline object in iframe that communicates with indoornavi frontend server and draws INPolyline
 * @extends INMapObject
 */

class INPolyline extends INMapObject {
  /**
  * @constructor
  * @param {Object} navi - instance of a INPolyline class needs the Indoornavi instance object injected to the constructor, to know where INPolyline object is going to be created
  */
   constructor(navi) {
     super(navi);
     this._type = 'POLYLINE';
   }

  /**
  * Draws polyline for given array of points.
  * @param {array} points - array of points between which lines are going to be drawn, coordinates(x, y) of the point are given in centimeters as integers from real distances (scale 1:1)
  * @example
  * const poly = new INPolyline(navi);
  * poly.ready().then(() => poly.draw(points));
  */
  draw (points) {
    if (!Array.isArray(points)) {
      throw new Error('Given argument is not na array');
    }
    this._points = points;
    points.forEach(point => {
      if(!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
        throw new Error('Given points are in wrong format or coordianets x an y are not integers')
      }
    });
    if (!!this._id) {
      INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
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
      throw new Error('INPolyline is not created yet, use ready() method before executing draw(), or remove()');
    }
    return this;
  }

  /**
   * Sets polyline lines and points color.
   * @param {color} string - string that specifies the color. Supports color in hex format '#AABBCC' and 'rgb(255,255,255)';
   * @example
   * poly.ready().then(() => poly.setLineColor('#AABBCC'));
   */
  setLineColor(color) {
    this._setColor(color, 'stroke');
    return this;
  }

  isWithin (point) {
    throw new Error('Method not implemented yet for INPolyline');
  }

}

/**
 * Class representing an INArea,
 * creates the INArea object in iframe that communicates with indoornavi frontend server and draws INArea
 * @extends INMapObject
 */

class INArea extends INMapObject {
  /**
   * @constructor
   * @param {Object} navi - instance of an INArea class needs the Indoornavi instance object injected to the constructor, to know where INArea object is going to be created
   */
  constructor(navi) {
    super(navi);
    this._type = 'AREA';
  }

  /**
   * Draws Area for given array of points.
   * @param {array} points - array of points which will describe the Area, coordinates members such as x and y of the point are given in centimeters as integers from real distances (scale 1:1).
   * For less than 3 points supplied to this method, Area isn't going to be drawn.
   * @example
   * const area = new INArea(navi);
   * area.ready().then(() => area.draw(points));
   */
  draw (points) {
    if (arguments.length !== 1) {
      throw new Error('Wrong number of arguments passed');
    }
    if (!Array.isArray(points)) {
      throw new Error('Given argument is not na array');
    } else if (points.length < 3) {
      throw new Error('Not enought points to draw an INArea');
    }
    points.forEach(point => {
      if(!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
        throw new Error('Given points are in wrong format or coordianets x an y are not integers');
      }
      return this;
    });

    this._points = points;

    if (!!this._id) {
      INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
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
      throw new Error('INArea is not created yet, use ready() method before executing draw(), or remove()');
    }
    return this;
  }

  /**
   * Fills Area whit given color.
   * @param {color} string - string that specifies the color. Supports color in hex format '#AABBCC' and 'rgb(255,255,255)';
   * @example
   * area.ready().then(() => area.setFillColor('#AABBCC'));
   */
  setFillColor (color) {
    this._setColor(color, 'fill');
    return this;
  }

  /**
   * Sets Area opacity.
   * @param {float} float. Float between 1.0 and 0. Set it to 1.0 for no oppacity, 0 for maximum opacity.
   * @example
   * area.ready().then(() => area.setOpacity(0.3));
   */

  setOpacity(value) {
    if(isNaN(value) || value > 1 || value < 0) {
      throw new Error('Wrong value passed to setTransparency() method, only numbers between 0 and 1 are allowed');
    }
    if(!!this._id) {
      INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
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
    return this;
  }

}

/**
 * Class representing a Marker,
 * creates the INMarker object in iframe that communicates with indoornavi frontend server and draws INMarker.
 * @extends INMapObject
 */

class INMarker extends INMapObject {
  /**
  * @constructor
  * @param {Object} navi - instance of a Marker class needs the Indoornavi instance object injected to the constructor, to know where INMarker object is going to be created
  */
  constructor(navi) {
    super(navi);
    this._type = 'MARKER';
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
  * Sets marker info window and position. Use of this method is optional.
  * Method does not draws marker on the map, it simply changes the info window set for the marker for the next draw({x: 100, y: 100}) method call.
  * If draw({x: 100, y: 100}) method has been called before than info window will be reset when setInfoWindow('<p>text in paragraf</p>', marker.positionEnum.TOP) method is called;
  * @param {string} - string of data or html template in string format that will be passed in to info window as text.
  * To reset label to a new content call this method again passing new content as a string.
  * @param {INPolyline.positionEnum.'POSITION'} - enum property representing infowindow position.
  * Avaliable POSITION settings: TOP, LEFT, RIGHT, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT.
  * @return {this} - returns INMarker instace class;
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.setInfoWindow('<p>text in paragraf</p>', marker.positionEnum.TOP).draw({x: 100, y: 100}}));
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.draw({x: 100, y: 100}}).setInfoWindow('<p>text in paragraf</p>', marker.positionEnum.TOP));
  */

  setInfoWindow(content, position) {
    if (typeof content !== 'string') {
      throw new Error('Wrong argument passed for info window content');
    }
    if (!Number.isInteger(position) || position < 0 || position > 7) {
      throw new Error('Wrong argument passed for info window position');
    }
    const dto = {
      content: content,
      positon: position
    }
    INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
      command: 'setInfoWindow',
      args: {
        type: this._type,
        object: {
          id: this._id,
          infoWindow: dto
        }
      }
    });
    return this;
  }

  /**
  * Removes marker info window.
  * @return {this} - returns INMarker instace class;
  * @example
  * marker.ready().then(() => marker.removeInfoWindow());
  */

  removeInfoWindow() {
    INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
      command: 'removeInfoWindow',
      args: {
        type: this._type,
        object: {
          id: this._id,
          infoWindow: null
        }
      }
    });
    return this;
  }

  /**
  * Sets marker label. Use of this method is optional.
  * Method does not draws marker on the map, it simply changes the lebel for the marker for the next draw({x: 100, y: 100}) method call.
  * If draw({x: 100, y: 100}) method has been called before than label will be reset when setLable('label to display') method is called;
  * @param {string} - string that will be used as a marker label. If label method isn't used than no label is going to be displayed.
  * @param {object} - point {x: number, y: number} where x and y are integers representing distance from marker placment point where text should to start. This is optional, if argument is not specified label text will start {x: 5 , y: 5} pixels below the marker placment point.
  * To reset label to a new string call this method again passing new label as a string.
  * @return {this} - returns INMarker instace class;
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.setLable('label to display', {x: -15 , y: 15}).draw({x: 100, y: 100}));
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.draw({x: 100, y: 100}).setLable('label to display'));
  *
  */

  setLabel(label, point) {
    let labelDto;
    const points = [];
    if (typeof label === 'string' && !!point) {
      points.push(point);
      labelDto = {
        label: label,
        points: points
      };
    } else if (typeof label === 'string'){
      labelDto = {
        label: label,
        points: points
      };
    } else {
      labelDto = {
        label: null,
        points: points
      };
    }
    INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
      command: 'setLabel',
      args: {
        type: this._type,
        object: {
          id: this._id,
          labelDto: labelDto
        }
      }
    });
    return this;
  }

  /**
  * Removes marker label.
  * @return {this} - returns INMarker instace class;
  * @example
  * marker.ready().then(() => marker.removeLabel());
  */

  removeLabel() {
    INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
      command: 'deleteLabel',
      args: {
        type: this._type,
        object: {
          id: this._id,
          label: null
        }
      }
    });
    return this;
  }

  /**
  * Sets marker icon. Use of this method is optional.
  * Method does not place icon or draws marker on the map, it simply changes the icon for the marker for the next draw({x: 100, y: 100}) method call.
  * If draw({x: 100, y: 100}) method has been called before than icon will be redrawn when useIcon(icon) method is called;
  * @param {string} - url path to your icon;
  * @return {this} - returns INMarker instace class;
  * @example
  * const path = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png'
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.useIcon(icon).draw({x: 100, y: 100})));
  * @example
  * const path = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png'
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.draw({x: 100, y: 100})).useIcon(icon));
  */

  useIcon(path) {
    if (typeof path !== 'string') {
      throw new Error('Invalid value supplied as an icon path argument');
    }
    if (!!this._id) {
      INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'setIcon',
        args: {
          type: this._type,
          object: {
            id: this._id,
            icon: path
          }
        }
      });
    } else {
      throw new Error('Marker is not created yet, use ready() method before executing any other method');
    }
    return this;
  }

  /**
  * Draws marker at given point.
  * @param {object} point - object holding { x: int, y: int } representing marker position
  * Marker will be cliped to the point int the bottom center of marker icon.
  * @return {this} - returns INMarker instace class;
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.draw({x: 100, y: 100})));
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => {
  * marker.draw({x: 100, y: 100}));
  * // if something is going to happend then:
  * marker.remove();
  * });
  * marker.ready().then(() => marker.draw({x: 120, y: 120})); // draws a new marker in given point with default settings
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => {
  * marker.draw({x: 100, y: 100}));
  * // if something is going to happend then:
  * marker.draw({x: 200, y: 200}); // redraws marker in givent point with all settings it arleady has
  * });
  */
  draw (point) {
    this._point = point;
    if(!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
      throw new Error('Given point is in wrong format or coordianets x an y are not integers');
    }
    if (!!this._id) {
      INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'drawObject',
        args: {
          type: this._type,
          object: {
            id: this._id,
            points: [point]
          }
        }
      });
    } else {
      throw new Error('Marker is not created yet, use ready() method before executing any other method');
    }
    return this;
  }

 }

class Report {

    static parseDate(date) {
        return date.toISOString().slice(0, -5);
    }

    /**
     * Report object containing methods to retrieve historical data
     * @param {string} targetHost - address to the INMap backend server
     * @param {string} apiKey - the API key created on INMap server (must be assigned to your domain)
     */
    constructor(targetHost, apiKey) {
        const authHeader = 'Token ' + apiKey;
        this.targetHost = targetHost;
        this.baseUrl = '/rest/v1/reports';
        this.http = new INHttp();
        this.http.setAuthorization(authHeader);
    }

    /**
     * Get list of historical coordinates
     * @param {number} floorId id of the floor you want to get coordinates from
     * @param {Date} from starting closed range
     * @param {Date} to ending closed range
     * @return {Promise} promise that will be resolved when {@link INCoordinates} list is retrieved
     */
    getINCoordinates(floorId, from, to) {
        return new Promise((function(resolve) {
            this.http.doPost(`${this.targetHost}${this.baseUrl}/coordinates`, {floorId: floorId, from: Report.parseDate(from), to: Report.parseDate(to)}, function (data) {
                resolve(INCoordinates.toJSON(data));
            });
        }).bind(this));
    }

    /**
     * Get list of historical INArea events
     * @param {number} floorId id of the floor you want to get INArea events from
     * @param {Date} from starting closed range
     * @param {Date} to ending closed range
     * @return {Promise} promise that will be resolved when {@link INAreaEvent} list is retrieved
     */
    getINAreaEvents(floorId, from, to) {
        return new Promise((function(resolve) {
            this.http.doPost(`${this.targetHost}${this.baseUrl}/events`, {floorId: floorId, from: Report.parseDate(from), to: Report.parseDate(to)}, function (data) {
                resolve(INAreaEvent.toJSON(data));
            });
        }).bind(this));
    }
}
describe('INMap main module tests', function () {
    it('Should throw an error when you try to toggle tag visibility when iFrame is not ready', function () {
        // given
        let indoorNavi = new INMap();

        // when
        const toTest = function () {
            indoorNavi.toggleTagVisibility(1);
        };

        // then
        expect(toTest).toThrow(new Error('INMap is not ready. Call load() first and then when promise resolves INMap will be ready.'));
    });

    it('Should send message to iFrame when iFrame is ready and toggle tag is called', function() {
        // given
        let indoorNavi = new INMap();
        indoorNavi.isReady = true;
        spyOn(INCommunication, 'send').and.stub();
        spyOn(INDOM, 'getById').and.stub();
        spyOn(INDOM, 'getByTagName').and.stub();

        // when
        indoorNavi.toggleTagVisibility(1);

        // then
        expect(INCommunication.send).toHaveBeenCalled();
        expect(INDOM.getById).toHaveBeenCalled();
        expect(INDOM.getByTagName).toHaveBeenCalled();
    });

    it('Should throw an error when you try to add event listener when iFrame is not ready', function() {
        // given
        let indoorNavi = new INMap();

        // when
        const toTest = function () {
            indoorNavi.addEventListener('INArea', function() {});
        };

        // then
        expect(toTest).toThrow(new Error('INMap is not ready. Call load() first and then when promise resolves INMap will be ready.'));
    });

    it('Should send message to iFrame and start listening on events when iFrame is ready and add event listener is called', function() {
        // given
        let indoorNavi = new INMap();
        indoorNavi.isReady = true;
        spyOn(INCommunication, 'send').and.stub();
        spyOn(INDOM, 'getById').and.stub();
        spyOn(INDOM, 'getByTagName').and.stub();
        spyOn(INCommunication, 'listen').and.stub();

        // when
        indoorNavi.addEventListener('INArea', function() {});

        // then
        expect(INCommunication.send).toHaveBeenCalled();
        expect(INDOM.getById).toHaveBeenCalled();
        expect(INDOM.getByTagName).toHaveBeenCalled();
        expect(INCommunication.listen).toHaveBeenCalled();
    });

    it('Should throw an error when You try to create an INMapObject instance', () => {
      // given
      let indoorNavi = new INMap();
      indoorNavi.isReady = true;
      //then
      const marker = new INMapObject(indoorNavi);
      // expect

      expect(marker).toThrow(new TypeError("Cannot construct INMapObject instances directly"));
    });

    it('Should create marker and comunicate with IFrame', () => {
      // given
      let indoorNavi = new INMap();
      indoorNavi.isReady = true;
      spyOn(INCommunication, 'send').and.stub();

      //then
      const marker = new Marker(indoorNavi);

      // expect

      marker.ready(() => {
        expect(INCommunication.send).toHaveBeenCalled();
      });
    });
});
