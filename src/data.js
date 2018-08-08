class INData {
    /**
     * Data object containing methods to retrieve data
     * @param {string} targetHost - address to the IndoorNavi backend server
     * @param {string} apiKey - the API key created on IndoorNavi server (must be assigned to your domain)
     */
    constructor(targetHost, apiKey) {
        const authHeader = 'Token ' + apiKey;
        this.targetHost = targetHost;
        this.baseUrl = '/rest/v1/';
        this.http = new Http();
        this.http.setAuthorization(authHeader);
    }

    /**
     * Get list of paths
     * @param {number} floorId id of the floor you want to get paths from
     * @return {Promise} promise that will be resolved when {@link Path} list is retrieved
     */
    getPaths(floorId) {
        return new Promise((function(resolve) {
            this.http.doGet(`${this.targetHost}${this.baseUrl}paths/${floorId}`, function(data) {
                resolve(JSON.parse(data));
            });
        }).bind(this));
    }
}