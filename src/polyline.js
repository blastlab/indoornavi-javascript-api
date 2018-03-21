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
