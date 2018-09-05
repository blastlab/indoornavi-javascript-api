/**
 * Class representing a Border,
 */

class Border {
    /**
     * Border object
     * @param {number} width of the border
     * @param {string} color of the border, supports color in hex format '#AABBCC' and rgb format 'rgb(255,255,255)'
     */
    constructor(width, color) {
        this.width = width;
        this.color = color;
    }
}
