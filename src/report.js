class Report {

    static parseDate(date) {
        return date.toISOString().slice(0, -5);
    }

    /**
     * Report object containing methods to retrieve historical data
     * @param {string} targetHost - address to the INMap backend server
     * @param {string} apiKey - the API key created on INMap server (must be assigned to your domain)
     */
    constructor(targetHost, apiKey) {
        const authHeader = 'Token ' + apiKey;
        this.targetHost = targetHost;
        this.baseUrl = '/rest/v1/reports';
        this.http = new INHttp();
        this.http.setAuthorization(authHeader);
    }

    /**
     * Get list of historical coordinates
     * @param {number} floorId id of the floor you want to get coordinates from
     * @param {Date} from starting closed range
     * @param {Date} to ending closed range
     * @return {Promise} promise that will be resolved when {@link INCoordinates} list is retrieved
     */
    getINCoordinates(floorId, from, to) {
        return new Promise((function(resolve) {
            this.http.doPost(`${this.targetHost}${this.baseUrl}/coordinates`, {floorId: floorId, from: Report.parseDate(from), to: Report.parseDate(to)}, function (data) {
                resolve(INCoordinates.toJSON(data));
            });
        }).bind(this));
    }

    /**
     * Get list of historical INArea events
     * @param {number} floorId id of the floor you want to get INArea events from
     * @param {Date} from starting closed range
     * @param {Date} to ending closed range
     * @return {Promise} promise that will be resolved when {@link INAreaEvent} list is retrieved
     */
    getINAreaEvents(floorId, from, to) {
        return new Promise((function(resolve) {
            this.http.doPost(`${this.targetHost}${this.baseUrl}/events`, {floorId: floorId, from: Report.parseDate(from), to: Report.parseDate(to)}, function (data) {
                resolve(INAreaEvent.toJSON(data));
            });
        }).bind(this));
    }
}