/**
 * Global object representing events,
 * @namespace
 * @property {object} MOUSE - mouse events, ENUM like, object
 * @property {string} MOUSE.CLICK - click event
 * @property {string} MOUSE.MOUSEOVER - mouseover event
 * @property {object} LISTENER - listener events, ENUM like, object.
 * Representation of listener type, added to {@link INMap} object
 * @property {string} LISTENER.AREA - area event sets listener to listen to {@link INArea} object events
 * @property {string} LISTENER.COORDINATES - coordinates event sets listener to listen to {@link INMap} object events
 *
 */

const Event = {
    MOUSE: {
        CLICK: 'click',
        MOUSEOVER: 'mouseover'
    },
    LISTENER: {
        AREA: 'area',
        COORDINATES: 'coordinates'
    }
};
