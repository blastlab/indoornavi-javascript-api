/**
 * Class representing a BLE,
 * creates the INBle object to handle Bluetooth related events
 */

class INBle {
    /**
     * @constructor
     * @param {number} floor - floor to which Bluetooth events are related
     * @param {string} targetHost - address to the IndoorNavi backend server
     * @param {string} apiKey - the API key created on IndoorNavi server (must be assigned to your domain)
     */
    constructor(floor, targetHost, apiKey) {
        Validation.isInteger(floor, 'Floor number must be integer');
        Validation.isString(targetHost, 'Target host parameter should be type of string');
        Validation.isString(apiKey, 'apiKey parameter should be type of string');
        this._dataProvider = new INData(targetHost, apiKey);
        this._floor = floor;
    }

    /**
     * Sets callback function to react for position update event
     * @param {function} callback - function that will be executed when new area event is triggered, callback takes {@link AreaPayload} as argument
     * @return {Promise} promise that will be resolved when {@link AreaPayload} list is retrieved
     * @example
     * const ble = new INBle(4);
     * ble.updatePosition((areaPayload) => console.log(areaPayload)).then(() => console.log('areas fetched'));
     */
    addCallbackFunction(callback) {
        Validation.isFunction(callback);
        return new Promise(resolve => {
            this._dataProvider.getAreas(this._floor).then(areas => {
                this._areas = areas;
                this._callback = callback;
                resolve();
            });
        });

    }

    /**
     * Updates Bluetooth position for area events check, if position is inside area callback function passed to addCallbackFunction() method is triggered
     * @param {Point} position from bluetooth module
     * @example
     * const ble = new INBle(4);
     * ble.updatePosition((areaPayload) => console.log(areaPayload)).then(ble.updatePosition({x: 1, y: 1}));
     */
    updatePosition(position) {
        Validation.isPoint(position, 'Updated position is not a Point');
        if (!!this._areas && this._areas.length > 0) {
            const areaIndex = this._areas.findIndex(area => {
                return MapUtils.pointIsWithinGivenArea(position, area.points);
            });
            if (areaIndex > 0) {
                this._callback(this._areas[areaIndex]);
            }
        }
    }

    /**
     * Returns areas that are checked for Bluetooth events
     * @return {AreaPayload[]} areas if areas are fetched else null
     * */
    getAreas() {
        if (!!this._areas) {
            return this._areas;
        }
        return null;
    }
}
