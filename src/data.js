class INData {
    /**
     * Data object containing methods to retrieve data
     * @param {string} targetHost - address to the IndoorNavi backend server
     * @param {string} apiKey - the API key created on IndoorNavi server (must be assigned to your domain)
     * @param {Object} navi - constructor needs an instance of {@link INMap} object injected
     */
    constructor(targetHost, apiKey, navi) {
        const authHeader = 'Token ' + apiKey;
        this._targetHost = targetHost;
        this._baseUrl = '/rest/v1/';
        this._http = new Http();
        this._http.setAuthorization(authHeader);
        this._navi = navi;
    }

    /**
     * Get list of paths
     * @param {number} floorId id of the floor you want to get paths from
     * @return {Promise} promise that will be resolved when {@link Path} list is retrieved
     */
    getPaths(floorId) {
        return new Promise((function(resolve) {
            this._http.doGet(`${this._targetHost}${this._baseUrl}paths/${floorId}`, function (data) {
                resolve(JSON.parse(data));
            });
        }).bind(this));
    }

    /**
     * Get closest coordinates on floor path for given point
     * @param {@link Point} point coordinates
     * @param {number} accuracy of path pull
     * @return {Promise} promise that will be resolved when {@link Point} is retrieved
     */
    pullToPath(point, accuracy) {
        const self = this;
        return new Promise(resolve => {
            // create listener for event that will fire only once
            Communication.listen(`getPointOnPath`, resolve);
            // then send message
            Communication.send(self._navi.iFrame, self._navi.targetHost, {
                command: 'getPointOnPath',
                args: {
                    point: point,
                    accuracy: accuracy
                }
            });
        });
    }

}