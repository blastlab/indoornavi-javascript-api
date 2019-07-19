/**
 * Class representing a Coordinates,
 */

class Coordinates {
    static toJSON(coordinatesArrayString) {
        const coordinates = [];
        JSON.parse(coordinatesArrayString).forEach(function (_coordinates) {
            coordinates.push(new Coordinates(
                _coordinates['point']['x'],
                _coordinates['point']['y'],
                _coordinates['point']['z'],
                _coordinates['tagShortId'],
                new Date(_coordinates['date'])
            ));
        });
        return coordinates;
    };

    /**
     * Coordinates object
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} tagId short id of the tag
     * @param {Date} date when tag appeared in this coordinates
     */
    constructor(x, y, z, tagId, date) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.tagId = tagId;
        this.date = date;
    }
}
