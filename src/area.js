class Area extends Geometric {
  /**
   * Creates the area object in iframe that communicates with indoornavi frontend server
   * @extends GeometricObject
   * @param {Object} navi - instance of a Area class needs the Indoornavi class injected to the constructor, to know where Area object is going to be created
   */
  constructor(navi) {
    super(navi);
    this._type = 'AREA';
  }

  /**
   * Draws area for given array of points.
   * @param {array} points - array of points which will describe area to be drawn, coordinates(x, y) of the point are given in centimeters from real distances (scale 1:1). For less than 3 points supplied to this method, area isn't going to be drawn.
   */
  draw (points) {
    let xStart = null;
    let yStart = null;
    let xEnd = null;
    let yEnd = null;
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

}
