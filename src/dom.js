class DOM {
    static getById(id) {
        return document.getElementById(id).getElementsByTagName('iframe')[0];
    }
}