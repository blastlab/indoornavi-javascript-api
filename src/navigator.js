/**
 * Class representing a Navigator,
 * creates the InNavigator service
 * Navigation calculates path, draws path and updates path length according to given location
 */
class INNavigator {
    /**
     * @constructor
     * @param {INMap} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        this._navi = navi;
        this._id = null;
        this._navi._checkIsReady();
        this._navi._setIFrame();
        this._type = 'NAVIGATION';
        this._navigationStarted = false;
    }

    /**
     * Calculates shortest path for given beginning coordinates and destination coordinates
     * @param {Point} location - object {@link Point} representing starting location from which navigation is going to begin.
     * @param {Point} destination - object {@link Point} representing destination to which navigation is going to calculate and draw path.
     * @param {number} pullToPathWidth - number representing width of the navigating belt for which navigator will pull given coordinate to path
     * @return {INNavigator} self to let you chain methods
     * @example
     * const navigator = new INNavigator(navi);
     * navigator.startNavigation({x: 100, y: 100}, {x: 800, y: 800}, 10);
     */
    start(location, destination, pullToPathWidth) {
        if (!!this._id) {
            Validation.isPoint(location, 'Given argument is not a Point');
            Validation.isPoint(destination, 'Given argument is not a Point');
            Validation.isInteger(pullToPathWidth, 'Pull width value is not an integer');
            Communication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'startNavigation',
                args: {
                    type: this._type,
                    object: {
                        id: this._id,
                        location: location,
                        destination: destination,
                        pullToPathWidth: pullToPathWidth
                    }
                }
            });
            this._navigationStarted = true;
        } else {
            this._ready().then(this.start(location, destination, pullToPathWidth).bind(this));
        }
        return this;
    }

    /**
     * Updates actual location on navigation path
     * @param {Point} position - object {@link Point} representing updated location
     * @return {INNavigator} self to let you chain methods
     * @example
     * const navigator = new INNavigator(navi);
     * navigator.start({x: 100, y: 100}, {x: 800, y: 800}, 10)
     * navigator.update({x: 120, y: 120})
     */
    updatePosition(position) {
        Validation.isInteger(position, 'Position value is not an integer');
        if (!!this._id && this._navigationStarted) {
            Communication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'updateNavigationPosition',
                args: {
                    type: this._type,
                    object: {
                        id: this._id,
                        position: position
                    }
                }
            });
        } else {
            // set Timeout instead of async callback to avoid race between object creation
            setTimeout(this.updatePosition(position).bind(this), 250);
        }
        return this;
    }

    /**
     * Stop navigation process on demand.
     * @example
     * navigator.stop();
     */
    stop() {
        if (!!this._id && this._navigationStarted) {
            Communication.send(this._navi.iFrame, this._navi.targetHost, {
                command: 'removeObject',
                args: {
                    type: this._type,
                    object: {
                        id: this._id
                    }
                }
            });
        } else {
            // set Timeout instead of async callback to avoid race between object creation
            setTimeout(this.updatePosition().bind(this), 250);
        }
    }

    _ready() {
        const self = this;

        function setObject(data) {
            if(data.hasOwnProperty('mapObjectId')) {
                self._id = data.mapObjectId;
            } else {
                throw new Error(`Object ${self._type} doesn't contain id. It may not be created correctly.`);
            }
        }

        if (!!self._id) {
            // resolve immediately
            return new Promise(resolve => {
                resolve();
            })
        }
        return new Promise(resolve => {
                // create listener for event that will fire only once
                Communication.listenOnce(`createObject-${this._type}`, setObject.bind(self), resolve);
                // then send message
                Communication.send(self._navi.iFrame, self._navi.targetHost, {
                    command: 'createObject',
                    object: this._type
                });
            }
        );
    }
}
