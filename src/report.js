class INReport {

    static parseDate(date) {
        return date.toISOString().slice(0, -5);
    }

    /**
     * Report object containing methods to retrieve historical data
     * @param {string} targetHost - address to the IndoorNavi backend server
     * @param {string} apiKey - the API key created on IndoorNavi server (must be assigned to your domain)
     */
    constructor(targetHost, apiKey) {
        const authHeader = 'Token ' + apiKey;
        this.targetHost = targetHost;
        this.baseUrl = '/rest/v1/reports';
        this.http = new Http();
        this.http.setAuthorization(authHeader);
    }

    /**
     * Get list of historical coordinates
     * @param {number} floorId id of the floor you want to get coordinates from
     * @param {Date} from starting closed range
     * @param {Date} to ending closed range
     * @return {Promise} promise that will be resolved when {@link Coordinates} list is retrieved
     */
    getCoordinates(floorId, from, to) {
        return new Promise((function(resolve) {
            this.http.doPost(`${this.targetHost}${this.baseUrl}/coordinates`, {floorId: floorId, from: INReport.parseDate(from), to: INReport.parseDate(to)}, function (data) {
                resolve(Coordinates.toJSON(data));
            });
        }).bind(this));
    }

    /**
     * Get list of historical INArea events
     * @param {number} floorId id of the floor you want to get INArea events from
     * @param {Date} from starting closed range
     * @param {Date} to ending closed range
     * @return {Promise} promise that will be resolved when {@link AreaEvent} list is retrieved
     */
    getAreaEvents(floorId, from, to) {
        return new Promise((function(resolve) {
            this.http.doPost(`${this.targetHost}${this.baseUrl}/events`, {floorId: floorId, from: INReport.parseDate(from), to: INReport.parseDate(to)}, function (data) {
                resolve(AreaEvent.toJSON(data));
            });
        }).bind(this));
    }
}