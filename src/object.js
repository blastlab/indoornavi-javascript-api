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
