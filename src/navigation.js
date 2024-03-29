/**
 * Class representing a Navigation,
 * creates the InNavigator service
 * Navigation calculates path, draws path and updates path length according to given location
 */
class INNavigation {
    /**
     * @constructor
     * @param {INMap} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        this._navi = navi;
        this._navi._checkIsReady();
        this._navi._setIFrame();
    }

    /**
     * Calculates shortest path for given beginning coordinates and destination coordinates
     * @param {Point} location - object {@link Point} representing starting location from which navigation is going to begin.
     * @param {Point} destination - object {@link Point} representing destination to which navigation is going to calculate and draw path.
     * @param {number} margin - number representing margin for which navigation will pull point to the nearest path
     * @return {INNavigation} self to let you chain methods
     * @example
     * const navigation = new INNavigation(navi);
     * navigation.start({x: 100, y: 100}, {x: 800, y: 800}, 10);
     */
    start(location, destination, margin) {
        Validation.isPoint(location, 'Given argument is not a Point');
        Validation.isPoint(destination, 'Given argument is not a Point');
        Validation.isInteger(margin, 'Pull width value is not an integer');
        this._sendToIFrame('start', {
            location: location,
            destination: destination,
            accuracy: margin
        });
        return this;
    }

    /**
     * Updates actual location on navigation path
     * @param {Point} position - object {@link Point} representing updated location
     * @return {INNavigation} self to let you chain methods
     * @example
     * const navigation = new INNavigation(navi);
     * navigation.start({x: 100, y: 100}, {x: 800, y: 800}, 10)
     * navigation.update({x: 120, y: 120})
     */
    updatePosition(position) {
        Validation.isPoint(position, 'Position value is not an integer');
        this._sendToIFrame('update', {
            position: position
        });
        return this;
    }

    /**
     * Stop navigation process on demand.
     * @example
     * navigation.stop();
     */
    stop() {
        this._sendToIFrame('stop', {});
        return this;
    }

    _sendToIFrame(action, payload) {
        Communication.send(this._navi.iFrame, this._navi.targetHost, {
            command: 'navigation',
            args: {
                object: Object.assign({
                    action: action
                }, payload)
            }
        });
    }
}
