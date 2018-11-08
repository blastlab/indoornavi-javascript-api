/**
 * Class representing an NavigationPoint
 */
class NavigationPoint {
    /**
     * Navigation point parameters
     *  @param {number} radius of the circle
     *  @param {Border} Border object
     *  @param {number} opacity of the circle
     *  @param {String} color of the circle
     */
    constructor(radius, border, opacity, color) {
        this.radius = radius;
        this.border = border;
        this.opacity = opacity
        this.color = color;
    }
}