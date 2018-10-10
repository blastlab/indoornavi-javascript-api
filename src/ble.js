/**
 * Class representing a BLE,
 * creates the INBle object to handle BlueTooth related events
 */

class INBle {
    _floor = null;
    _event = null;
    _dataProvider = null;
    _areas = null;

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
        this._event = new Event('bleAreaEvent');
    }

    /**
     * Sets callback
     * @param {function} callback - function that will be executed when new area event is triggered, callback takes area index as parameter
     * @return {Promise} promise that will be resolved when {@link AreaPayload} list is retrieved
     * @example
     * const ble = new INBle(4);
     * ble.addAreaEventListener((floorIndex) => console.log(floorIndex)).then(() => console.log('areas fetched'));
     */
    addAreaEventListener(callback) {
        Validation.isFunction(callback);
        return new Promise(resolve => {
            this._dataProvider.getPaths(this._floor).then(areas => {
                this._areas = areas;
                this._event.addEventListener('bleAreaEvent', callback, false);
                resolve();
            });
        });

    }

    /**
     * Updates bluetooth position
     * @param {Point} position from bluetooth module
     * @example
     * const ble = new INBle(4);
     * ble.addAreaEventListener((floorIndex) => console.log(floorIndex)).then(() => console.log('areas fetched'));
     * ble.updatePosition({x: 1, y: 1});
     */
    updatePosition(position) {
        Validation.isPoint(position, 'Updated position is not a Point');
        const areaIndex = this._areas.findIndex(area => {
            return MapUtils.pointIsWithinGivenArea(position, area);
        });
        if (!!areaIndex && !!this._areas) {
            this._event.dispatchEvent(areaIndex);
        }
    }

    /**
     * Updates bluetooth position
     * @return {AreaPayload} areas if areas are fetched or null
     * */
    getAreas() {
        if (!!this._areas) {
            return this._areas;
        }
        return null;
    }
}
