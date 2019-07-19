/**
 * Class representing an AreaPayload
 */
class AreaPayload {
    /**
     * Area payload
     *  @param {number} id unique given area id number
     *  @param {string} name not unique given area name
     *  @param {array} points as array of {@link Point}
     *  @param {number} heightMin vertical start of the area
     *  @param {number} heightMax vertical end of the area
     */
    constructor(id, name, points, heightMin, heightMax) {
        this.id = id;
        this.name = name;
        this.points = points;
        this.heightMin = heightMin;
        this.heightMax = heightMax;
    }
}
