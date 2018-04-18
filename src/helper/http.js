class Http {

    constructor() {
        this.authHeader = null;
    }

    setAuthorization(authHeader) {
        this.authHeader = authHeader;
    }

    doGet(url, callback) {
        this.doRequest(url, 'GET', null, callback);
    }

    doPost(url, body, callback) {
        this.doRequest(url, 'POST', body, callback);
    }

    doRequest(url, method, body, callback) {
        const xmlINHttp = new XMLINHttpRequest();
        xmlINHttp.onreadystatechange = function() {
            if (xmlINHttp.readyState === 4 && xmlINHttp.status === 200)
                callback(xmlINHttp.responseText);
        };
        xmlINHttp.open(method, url, true); // true for asynchronous
        if (!!this.authHeader) {
            xmlINHttp.setRequestHeader('Authorization', this.authHeader);
        }
        xmlINHttp.setRequestHeader('Content-Type', 'application/json');
        xmlINHttp.setRequestHeader('Accept', 'application/json');
        xmlINHttp.send(JSON.stringify(body));
    }
}
