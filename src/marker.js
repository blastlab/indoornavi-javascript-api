/**
 * Class representing a Marker,
 * creates the INMarker object in iframe that communicates with indoornavi frontend server and draws INMarker.
 * @extends INMapObject
 */

class INMarker extends INMapObject {
  /**
  * @constructor
  * @param {Object} navi - instance of a Marker class needs the Indoornavi instance object injected to the constructor, to know where INMarker object is going to be created
  */
  constructor(navi) {
    super(navi);
    this._type = 'MARKER';
    this.positionEnum = {
      TOP: 0,
      RIGHT: 1,
      BOTTOM: 2,
      LEFT: 3,
      TOP_RIGHT: 4,
      TOP_LEFT: 5,
      BOTTOM_RIGHT: 6,
      BOTTOM_LEFT: 7
    };
  }

  /**
  * Sets marker info window and position. Use of this method is optional.
  * Method does not draws marker on the map, it simply changes the info window set for the marker for the next draw({x: 100, y: 100}) method call.
  * If draw({x: 100, y: 100}) method has been called before than info window will be reset when setInfoWindow('<p>text in paragraf</p>', marker.positionEnum.TOP) method is called;
  * @param {string} - string of data or html template in string format that will be passed in to info window as text.
  * To reset label to a new content call this method again passing new content as a string.
  * @param {INPolyline.positionEnum.'POSITION'} - enum property representing infowindow position.
  * Avaliable POSITION settings: TOP, LEFT, RIGHT, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT.
  * @return {this} - returns INMarker instace class;
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.setInfoWindow('<p>text in paragraf</p>', marker.positionEnum.TOP).draw({x: 100, y: 100}}));
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.draw({x: 100, y: 100}}).setInfoWindow('<p>text in paragraf</p>', marker.positionEnum.TOP));
  */

  setInfoWindow(content, position) {
    if (typeof content !== 'string') {
      throw new Error('Wrong argument passed for info window content');
    }
    if (!Number.isInteger(position) || position < 0 || position > 7) {
      throw new Error('Wrong argument passed for info window position');
    }
    const dto = {
      content: content,
      positon: position
    }
    INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
      command: 'setInfoWindow',
      args: {
        type: this._type,
        object: {
          id: this._id,
          infoWindow: dto
        }
      }
    });
    return this;
  }

  /**
  * Removes marker info window.
  * @return {this} - returns INMarker instace class;
  * @example
  * marker.ready().then(() => marker.removeInfoWindow());
  */

  removeInfoWindow() {
    INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
      command: 'removeInfoWindow',
      args: {
        type: this._type,
        object: {
          id: this._id,
          infoWindow: null
        }
      }
    });
    return this;
  }

  /**
  * Sets marker label. Use of this method is optional.
  * Method does not draws marker on the map, it simply changes the lebel for the marker for the next draw({x: 100, y: 100}) method call.
  * If draw({x: 100, y: 100}) method has been called before than label will be reset when setLable('label to display') method is called;
  * @param {string} - string that will be used as a marker label. If label method isn't used than no label is going to be displayed.
  * @param {object} - point {x: number, y: number} where x and y are integers representing distance from marker placment point where text should to start. This is optional, if argument is not specified label text will start {x: 5 , y: 5} pixels below the marker placment point.
  * To reset label to a new string call this method again passing new label as a string.
  * @return {this} - returns INMarker instace class;
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.setLable('label to display', {x: -15 , y: 15}).draw({x: 100, y: 100}));
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.draw({x: 100, y: 100}).setLable('label to display'));
  *
  */

  setLabel(label, point) {
    let labelDto;
    const points = [];
    if (typeof label === 'string' && !!point) {
      points.push(point);
      labelDto = {
        label: label,
        points: points
      };
    } else if (typeof label === 'string'){
      labelDto = {
        label: label,
        points: points
      };
    } else {
      labelDto = {
        label: null,
        points: points
      };
    }
    INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
      command: 'setLabel',
      args: {
        type: this._type,
        object: {
          id: this._id,
          labelDto: labelDto
        }
      }
    });
    return this;
  }

  /**
  * Removes marker label.
  * @return {this} - returns INMarker instace class;
  * @example
  * marker.ready().then(() => marker.removeLabel());
  */

  removeLabel() {
    INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
      command: 'deleteLabel',
      args: {
        type: this._type,
        object: {
          id: this._id,
          label: null
        }
      }
    });
    return this;
  }

  /**
  * Sets marker icon. Use of this method is optional.
  * Method does not place icon or draws marker on the map, it simply changes the icon for the marker for the next draw({x: 100, y: 100}) method call.
  * If draw({x: 100, y: 100}) method has been called before than icon will be redrawn when useIcon(icon) method is called;
  * @param {string} - url path to your icon;
  * @return {this} - returns INMarker instace class;
  * @example
  * const path = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png'
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.useIcon(icon).draw({x: 100, y: 100})));
  * @example
  * const path = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png'
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.draw({x: 100, y: 100})).useIcon(icon));
  */

  useIcon(path) {
    if (typeof path !== 'string') {
      throw new Error('Invalid value supplied as an icon path argument');
    }
    if (!!this._id) {
      INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'setIcon',
        args: {
          type: this._type,
          object: {
            id: this._id,
            icon: path
          }
        }
      });
    } else {
      throw new Error('Marker is not created yet, use ready() method before executing any other method');
    }
    return this;
  }

  /**
  * Draws marker at given point.
  * @param {object} point - object holding { x: int, y: int } representing marker position
  * Marker will be cliped to the point int the bottom center of marker icon.
  * @return {this} - returns INMarker instace class;
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.draw({x: 100, y: 100})));
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => {
  * marker.draw({x: 100, y: 100}));
  * // if something is going to happend then:
  * marker.remove();
  * });
  * marker.ready().then(() => marker.draw({x: 120, y: 120})); // draws a new marker in given point with default settings
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => {
  * marker.draw({x: 100, y: 100}));
  * // if something is going to happend then:
  * marker.draw({x: 200, y: 200}); // redraws marker in givent point with all settings it arleady has
  * });
  */
  draw (point) {
    this._point = point;
    if(!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
      throw new Error('Given point is in wrong format or coordianets x an y are not integers');
    }
    if (!!this._id) {
      INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'drawObject',
        args: {
          type: this._type,
          object: {
            id: this._id,
            points: [point]
          }
        }
      });
    } else {
      throw new Error('Marker is not created yet, use ready() method before executing any other method');
    }
    return this;
  }

 }
