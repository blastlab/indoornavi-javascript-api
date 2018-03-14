/**
* Abstract class that communicates with indoornavi frontend server to create Geometry objects in iFrame.
* @abstract
*/

class Geometry {
  /**
   * Instance of a Geometry class cennot be created directly, Geometry class is an abstract class.
   * @abstract
   * @constructor
   * @param {Indornavi} navi needs the Indoornavi class injected to the constructor, to know where geometry object is going to be created
   */
  constructor(navi) {
    if (new.target === Geometry) {
      throw new TypeError("Cannot construct Geometry instances directly");
    }
    this._navi = navi;
    this._id = null;
    this._type = 'OBJECT'
    this._navi.checkIsReady();
    this._navi.setIFrame();
  }

  /**
  * @returns {Promise} Promise that will resolve when connection to WebSocket will be established, assures that instance of Geometry has been created on the injected Indornavi class, this method should be executed before calling any method and those method should to be executed inside callback, after promise is resolved
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
   * Removes object and destroys it instance in the frontend server, but do not destroys object class instance in your app.
   * inheritedObjectFromGeometry is a child object of abstract class Geometry
   * @example
   * 'inheritedObjectFromGeometry'.ready().then(() => 'inheritedObjectFromGeometry'.remove());
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
