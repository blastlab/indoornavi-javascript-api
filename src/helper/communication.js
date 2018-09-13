class Communication {
    static send(iFrame, host, data) {
        iFrame.contentWindow.postMessage(data, host);
    }

    static listen(eventName, callback) {
        window.addEventListener('message', function (event) {
            if (event.data.hasOwnProperty('type') && event.data.type === eventName) {
                callback(event.data);
            }
        }, false);
    }

    static listenOnce(eventName, callback, resolve) {
        function handler(event) {
            if (event.data.hasOwnProperty('type') && event.data.type === eventName && !!event.data['mapObjectId']) {
                window.removeEventListener('message', handler, false);
                callback(event.data);
                resolve();
            }
        }

        window.addEventListener('message', handler, false);
    }

    static remove(handler) {
        window.removeEventListener('message', handler, false);
    }

}
