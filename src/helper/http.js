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
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                callback(xmlHttp.responseText);
        };
        xmlHttp.open(method, url, true); // true for asynchronous
        if (!!this.authHeader) {
            xmlHttp.setRequestHeader('Authorization', this.authHeader);
        }
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.setRequestHeader('Accept', 'application/json');
        xmlHttp.send(JSON.stringify(body));
    }
}
