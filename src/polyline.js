class Polyline {
  /**
   * Create the polyline object in iframe that communicates with indoornavi frontend server
   * @param {IndoorNavi} indornavi - instance of a Polyline class needs the Indornavi class injected to the constractor, to know where Polyline object is going to be created
   */
  constructor(Navi) {
    this.navi = Navi;
    this._id = null;
  }

  /**
  * Returns a promise, that assures that instance of Polyline has been created on the injected Indornavi class, this method should be executed before calling draw() or remove() methods and those methods shuld be executed inside injected callback to after promise is resolved
  */
  ready() {
    const self = this;
    function setPolyline (id) {
      this._id = id;
    }
    if (!!this._id) {
      // resolve imedietly
      return new Promise(resolve => {
        resolve();
      })
    }
    return new Promise(resolve => {
        // create listener for event that will fire only once
        Communication.listenOnce('createObject', setPolyline.bind(self), resolve);
        // then send message
        Communication.send(self.navi.iFrame, self.navi.targetHost, {
          command: 'createObject'
        });
      }
    );
  }

  /**
   * Draws polyline for given array of points, this method can be executed multiple times and always starts drawing polyline from the last placed point
   * @param {array} array - array containing points between which lines are going to be drawn, coordinates(x, y) of the point are given in centimeters from real distances (scale 1:1)
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
      Communication.send(this.navi.iFrame, this.navi.targetHost, {
        command: 'drawObject',
        args: {
          type: 'POLYLINE',
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
   * Removes polyline and distroys it instance in the frontend server, but do not destroys Polyline class instance in your app
   */
  remove(){
    if(!!this._id) {
      Communication.send(this.navi.iFrame, this.navi.targetHost, {
        command: 'removeObject',
        args: {
          type: 'POLYLINE',
          object: {
            id: this._id
          }
        }
      });
    } else {
      throw new Error('Polyline is not created yet, use ready() method before executing draw(), or remove()');
    }
  }

}
