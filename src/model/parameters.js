/**
 * Parameters set to INMap object
 */
class Parameters {
    /**
     * Parameters object
     * @param width of the map
     * @param height of the map
     * @param scale set to the map
     * @param error if any
     * @param zoomExtent minimum and maximum value for zoom
     */
    constructor(width, height, scale, error, zoomExtent) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.error = error;
        this.zoomExtent = zoomExtent;
    }
}
