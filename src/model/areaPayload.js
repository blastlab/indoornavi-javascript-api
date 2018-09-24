/**
 * Class representing an AreaPayload
 */
class AreaPayload {
    /**
     * Area payload
     *  @param {number} id unique given area id number
     *  @param {string} name not unique given area name
     *  @param {array} pointsList as array of {@link Point}
     */
    constructor(id, name, pointsList) {
        this.id = id;
        this.name = name;
        this.points = pointsList
    }
}
