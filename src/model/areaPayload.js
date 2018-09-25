/**
 * Class representing an AreaPayload
 */
class AreaPayload {
    /**
     * Area payload
     *  @param {number} id unique given area id number
     *  @param {string} name not unique given area name
     *  @param {array} points as array of {@link Point}
     */
    constructor(id, name, points) {
        this.id = id;
        this.name = name;
        this.points = points
    }
}
