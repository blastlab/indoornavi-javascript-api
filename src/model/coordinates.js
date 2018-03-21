/**
 * Class representing a INCoordinates,
 */

class INCoordinates {
    static toJSON(coordinatesArrayString) {
        const coordinates = [];
        JSON.parse(coordinatesArrayString).forEach(function(_coordinates) {
            coordinates.push(new INCoordinates(
               _coordinates['point']['x'],
               _coordinates['point']['y'],
               _coordinates['tagShortId'],
               new Date(_coordinates['date'])
            ));
        });
        return coordinates;
    };

    /**
     * INCoordinates object
     * @param {number} x
     * @param {number} y
     * @param {number} tagId short id of the tag
     * @param {Date} date when tag appeared in this coordinates
     */
    constructor(x, y, tagId, date) {
        this.x = x;
        this.y = y;
        this.tagId = tagId;
        this.date = date;
    }
}
