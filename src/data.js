class INData {
    /**
     * Data object containing methods to retrieve data
     * @param {string} targetHost - address to the IndoorNavi backend server
     * @param {string} apiKey - the API key created on IndoorNavi server (must be assigned to your domain)
     */
    constructor(targetHost, apiKey) {
        const authHeader = 'Token ' + apiKey;
        this._targetHost = targetHost;
        this._baseUrl = '/rest/v1/';
        this._http = new Http();
        this._http.setAuthorization(authHeader);
    }

    /**
     * Get list of paths
     * @param {number} floorId id of the floor you want to get paths from
     * @return {Promise} promise that will be resolved when {@link Path} list is retrieved
     */
    getPaths(floorId) {
        return new Promise((function(resolve) {
            this._http.doGet(`${this._targetHost}${this._baseUrl}paths/${floorId}`, function(data) {
                resolve(JSON.parse(data));
            });
        }).bind(this));
    }

    /**
     * Get list of areas
     * @param {number} floorId id of the floor you want to get paths from
     * @return {Promise} promise that will be resolved when {@link AreaPayload} list is retrieved
     */
    getAreas(floorId) {
        return new Promise((function(resolve) {
            this._http.doGet(`${this._targetHost}${this._baseUrl}areas/${floorId}`, function(data) {
                const payloads = JSON.parse(data);
                const areas = payloads.map(payload => {
                    return {
                        id: payload.name,
                        name: payload.name,
                        points: payload.points
                    }
                });
                resolve(areas);
            });
        }).bind(this));
    }
}