class Polyline {
  /**
   * Create the polyline object in iframe that communicates with indoornavi frontend server for drawing polyline
   */

  constructor(Navi) {
    this.navi = Navi;
    this._id = null;
  }

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
      throw new Error('Polyline is not created yet');
    }
  }

  remove() {;
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
      throw new Error('Polyline is not created yet, use ready() method executing draw(), or remove()');
    }
  }

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

}
