class Polyline extends Geometric {
  /**
   * Creates the area object in iframe that communicates with indoornavi frontend server
   * @extends GeometricObject
   * @param {Object} navi - instance of a Area class needs the Indoornavi class injected to the constructor, to know where Area object is going to be created
   */
   constructor(navi) {
     super(navi);
     this._type = 'POLYLINE';
   }

  /**
   * Draws polyline for given array of points.
   * @param {array} points - array of points between which lines are going to be drawn, coordinates(x, y) of the point are given in centimeters from real distances (scale 1:1)
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

}
