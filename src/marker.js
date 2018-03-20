/**
 * Class representing a Marker,
 * creates the polyline object in iframe that communicates with indoornavi frontend server and draws polyline
 * @extends Geometry
 */

class Marker extends Geometry {
  /**
  * @constructor
  * @param {Object} navi - instance of a Marker class needs the Indoornavi instance object injected to the constructor, to know where polyline object is going to be created
  */
  constructor(navi) {
    super(navi);
    this._type = 'MARKER';
    this._positionEnum = {
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
  * @param {string} - string that will be used as a marker label. If label method isn't used than no label is going to be displayed.
  * To reset label to new string call this method again passing new label as a string.
  * To reset label to not being displayed call this method with no argument passed in to it.
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.setLable(label));
  */

  

  /**
  * Sets marker label. Use of this method is optional.
  * @param {string} - string that will be used as a marker label. If label method isn't used than no label is going to be displayed.
  * To reset label to new string call this method again passing new label as a string.
  * To reset label to not being displayed call this method with no argument passed in to it.
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.setLable(label));
  */

  setLable(label) {
    if (!!string && typeof label === 'string') {
      Communication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'setMarkerLabel',
        args: {
          type: this._type,
          object: {
            id: this._id,
            label: label
          }
        }
      });
    } else {
      Communication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'removeMarkerLabel',
        args: {
          type: this._type,
          object: {
            id: this._id,
            label: null
          }
        }
      });
    }
  }

  /**
  * Sets marker icon. Use of this method is optional.
  * @param {string} - url path to the icon that is going to be used as a marker. If this comment isn't used default icon is going to be used.
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.useIcon(url));
  */

  useIcon(url) {
    if (!this._validateURL(url)) {
      throw new Error('please specify valid url.');
    }
    if (!!this._id) {
      Communication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'setMarkerIcon',
        args: {
          type: this._type,
          object: {
            id: this._id,
            url: url
          }
        }
      });
    } else {
      throw new Error('Marker is not created yet, use ready() method before executing any other method');
    }

  }

  /**
  * Draws marker at given point.
  * @param {object} point - object holding { x: int, y: int } representing marker position
  * Marker will be cliped to the point int the bottom center of marker icon
  * @example
  * const marker = new Marker(navi);
  * marker.ready().then(() => marker.draw(point));
  */
  draw (point) {
    this._point = point;
    if(!Number.isInteger(point.x) || !Number.isInteger(point.y)) {
      throw new Error('Given points are in wrong format or coordianets x an y are not integers')
    }
    if (!!this._id) {
      Communication.send(this._navi.iFrame, this._navi.targetHost, {
        command: 'drawObject',
        args: {
          type: this._type,
          object: {
            id: this._id,
            points: point
          }
        }
      });
    } else {
      throw new Error('Marker is not created yet, use ready() method before executing any other method');
    }

  _validateURL(url) {
      var pattern = new RegExp('^(https?:\/\/)?'+
        '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+
        '((\d{1,3}\.){3}\d{1,3}))'+
        '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+
        '(\?[;&a-z\d%_.~+=-]*)?'+
        '(\#[-a-z\d_]*)?$','i');
      if(!pattern.test(url)) {
        return false;
      } else {
        return true;
      }
    }


 }
