/**
 * Abstract class that communicates with IndoorNavi frontend server.
 * @abstract
 */

class INMapObject {
    /**
     * Instance of a INMapObject class cannot be created directly, INMapObject class is an abstract class.
     * @abstract
     * @constructor
     * @param {INMap} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(navi) {
        if (new.target === INMapObject) {
            throw new TypeError("Cannot construct INMapObject instances directly");
        }
        this._navi = navi;
        this._id = null;
        this._type = 'OBJECT';
        this._navi._checkIsReady();
        this._navi._setIFrame();
    }

    /**
     * Getter for object id
     * @returns {number} id - returns object id;
     */
    getID() {
        return this._id;
    }

    /**
     * @returns {Promise} Promise - that will resolve when connection to the frontend will be established, assures that instance of INMapObject has been created on the injected INMap class, this method should be executed before calling any other method on this object children.
     * @example
     * 'inheritedObjectFromINMapObject'.ready().then(() => 'inheritedObjectFromINMapObject'.method(); );
     */
    ready() {
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

    /**
     * Removes object and destroys its instance in the frontend server, but do not destroys object class instance in your app.
     * inheritedObjectFromINMapObject is a child object of abstract class INMapObject
     * @example
     * 'inheritedObjectFromINMapObject'.ready().then(() => 'inheritedObjectFromINMapObject'.remove(); );
     */
    remove() {
        if (!!this._id) {
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
            throw new Error(`Object ${this._type} is not created yet, use ready() method before executing other methods`);
        }
    }
}
