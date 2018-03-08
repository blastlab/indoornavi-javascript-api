class Geometric {
  /**
   * Creates the geometric object in iframe that communicates with indoornavi frontend server
   * @param {Object} navi - instance of a Geometric class needs the Indoornavi class injected to the constructor, to know where geometric object is going to be created
   */
  constructor(navi) {
    this._navi = navi;
    this._id = null;
    this._type = 'OBJECT'
    this._navi.checkIsReady();
    this._navi.setIFrame();
  }

  /**
  * @returns {Promise} promise that will resolve when connection to WebSocket will be established, assures that instance of Geometric has been created on the injected Indornavi class, this method should be executed before calling any method and those method should to be executed inside callback, after promise is resolved
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

  setTransparency(number) {
    if(!isNaN(number) || number > 1 || number < 0) {
      throw new Error('Wrong value passed to setTransparency() method, only numbers between 0 and 1 are allowed');
    }
    if(!!this._id) {
      Communication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'setTransparency',
        args: {
          type: this._type,
          object: {
            id: this._id,
            transparency: number
          }
        }
      });
    } else {
      throw new Error(`Object ${this._type} is not created yet, use ready() method before executing other methods`);
    }

  }

  _setColor(color, attribute) {
    let hexToSend = null;
    // todo: set valid regex testing
    console.log(color);
    console.log(typeof color, (/rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/i.test(color)), (/^#[0-9A-F]{6}$/i.test(color)));
    if (!!this._id) {
      if (typeof color === 'string' && (/^#[0-9A-F]{6}$/i.test(color))) {
        hexToSend = color;
      } else if (typeof color === 'string' && /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/i.test(color)) {
        const rgb = color.slice(4, color.length - 1).split(',');
        hexToSend = `#${parseInt(rgb[0], 10).toString(16).slice(-2)}${parseInt(rgb[1],10).toString(16).slice(-2)}${parseInt(rgb[2],10).toString(16).slice(-2)}`;
      } else {
        throw new Error('Wrong value passed to setColor() method');
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
