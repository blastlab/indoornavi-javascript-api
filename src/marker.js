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
    this.eventsEnum = {
      ONCLICK: 0,
      ONMOUSEOVER:1,
    }
  }

  /**
  * Sets marker info window and position. Use of this method is optional.
  * Method does not draws marker on the map, it simply changes the info window set for the marker for the next draw({x: 100, y: 100}) method call.
  * If draw({x: 100, y: 100}) method has been called before than info window will be reset when setInfoWindow('<p>text in paragraf</p>', marker.positionEnum.TOP) method is called;
  * @param {string} content - of data or html template in string format that will be passed in to info window as text.
  * To reset label to a new content call this method again passing new content as a string.
  * @param {number} position - given as INMarker.positionEnum.'POSITION' property representing info window position.
  * Avaliable POSITION settings: TOP, LEFT, RIGHT, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT.
  * @return {INMarker} - returns INMarker instance class;
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
  * @return {Promise} - returns;
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
  * @param {string} value - string that will be used as a marker label. If label method isn't used than no label is going to be displayed.
  * To reset label to a new string call this method again passing new label as a string.
  * @return {INMarker} - returns INMarker instance class;
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.setLabel('label to display').draw({x: 100, y: 100}));
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.draw({x: 100, y: 100}).setLabel('label to display'));
  *
  */

  setLabel(value) {
    let label = null;
    if (typeof value === 'string' || typeof value === 'number') {
      label = value;
    }
    INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
      command: 'setLabel',
      args: {
        type: this._type,
        object: {
          id: this._id,
          label: label
        }
      }
    });
    return this;
  }

  /**
  * Removes marker label.
  * @return {INMarker} - returns INMarker instance class;
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
  * @param {string} path - url path to your icon;
  * @return {INMarker} - returns INMarker instance class;
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
   * Add listener to react when icon is clicked.
   * @param {number} eventName - as INMarker.eventsEnum.'EVENT' property representing event to listen to. Available events are: ONCLICK, ONMOUSEOVER ...
   * @param {function} callback - this method will be called when the specific event occurs
   * example
   * marker.addEventListener('coordinates', data => marker.setInfoWindow('<p>text in paragraf</p>', marker.positionEnum.TOP));
   */

  addEventListener(eventName, callback) {
    if (!!this._id) {
      INCommunication.send(this._navi.iFrame, this._navi.targetHost, {
          command: 'addMarkerEventListener',
          args: {
            type: this._type,
            object: {
              id: this._id,
              eventName: eventName
            }
          }
      });
    INCommunication.listen(eventName, callback);
    }
    return this;
  }

  /**
  * Draws marker at given point.
  * @param {object} point -object { x: int, y: int } representing marker position
  * Marker will be clipped to the point int the bottom center of marker icon.
  * @return {INMarker} - returns INMarker instance class;
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.draw({x: 100, y: 100})));
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => {
  * marker.draw({x: 100, y: 100}));
  * // if something is going to happen then:
  * marker.remove();
  * });
  * marker.ready().then(() => marker.draw({x: 120, y: 120})); // draws a new marker in given point with default settings
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => {
  * marker.draw({x: 100, y: 100}));
  * // if something is going to happen then:
  * marker.draw({x: 200, y: 200}); // redraws marker in given point with all settings it already has
  * });
  */
  draw ([point]) {
    this.point = point;
    if(!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
      throw new Error('Given point is in wrong format or coordinates x an y are not integers');
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
