/**
 * Class representing an AreaEvent,
 */

class AreaEvent {
    static toJSON(eventsArrayString) {
        const events = [];
        JSON.parse(eventsArrayString).forEach(function (_events) {
            events.push(new AreaEvent(
                _events['tagId'],
                new Date(_events['date']),
                _events['areaId'],
                _events['areaName'],
                _events['mode']
            ));
        });
        return events;
    };

    /**
     * AreaEvent object
     * @param {number} tagId short id of the tag that entered/left this INArea
     * @param {Date} date when tag appeared in this INArea
     * @param {number} areaId
     * @param {string} areaName
     * @param {string} mode can be ON_LEAVE or ON_ENTER
     */
    constructor(tagId, date, areaId, areaName, mode) {
        this.tagId = tagId;
        this.date = date;
        this.areaId = areaId;
        this.areaName = areaName;
        this.mode = mode;
    }
}
