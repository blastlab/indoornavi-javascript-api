class Communication {
    static send(iFrame, host, data) {
        iFrame.contentWindow.postMessage(data, host);
    }

    static listen(eventName, callback) {
        window.addEventListener('message', function (event) {
            if ('type' in event.data && event.data.type === eventName) {
                callback(event.data);
            }
        }, false);
    }

    static listenOnce(eventName, callback, resolve) {
        function handler(event) {
            if ('type' in event.data && event.data.type === eventName && !!event.data.mapObjectId) {
                window.removeEventListener('message', handler, false);
                callback(event.data.mapObjectId);
                resolve();
            }
        }

        window.addEventListener('message', handler, false);
    }

}
