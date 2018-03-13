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
