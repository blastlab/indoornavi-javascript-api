/**
* Creates the area object in iframe that communicates with indoornavi frontend server and draws area
 * Class representing a Area.
 * @extends Geometric
 */

class Area extends Geometric {
  /**
   * @constructor
   * @param {Object} navi - instance of a Area class needs the Indoornavi class injected to the constructor, to know where Area object is going to be created
   */
  constructor(navi) {
    super(navi);
    this._type = 'AREA';
  }

  /**
   * Draws area for given array of points.
   * @param {array} points - array of points which will describe the area to be drawn, coordinates members such as x and y of the point are given in centimeters as integers from real distances (scale 1:1).
   * For less than 3 points supplied to this method, area isn't going to be drawn.
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
   */
  setFillColor (color) {
    this._setColor(color, 'fill');
  }

  /**
  * Checks are given coordinates inside of created area.
  * @returns {boolean} true if given coordinates are inside the area, false otherwise;
  * @param {coordinates} object - object with x and y members given as integers;
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
