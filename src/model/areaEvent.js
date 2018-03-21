/**
 * Class representing an areaEvent,
 */

class INAreaEvent {
    static toJSON(eventsArrayString) {
        const events = [];
        JSON.parse(eventsArrayString).forEach(function(_events) {
            events.push(new INAreaEvent(
                _events['tagId'],
                new Date(_events['date']),
                _events['INAreaId'],
                _events['INAreaName'],
                _events['mode']
            ));
        });
        return events;
    };

    /**
     * INAreaEvent object
     * @param {number} tagId short id of the tag that entered/left this INArea
     * @param {Date} date when tag appeared in this INArea
     * @param {number} INAreaId
     * @param {string} INAreaName
     * @param {string} mode can be ON_LEAVE or ON_ENTER
     */
    constructor(tagId, date, INAreaId, INAreaName, mode) {
        this.tagId = tagId;
        this.date = date;
        this.INAreaId = INAreaId;
        this.INAreaName = INAreaName;
        this.mode = mode;
    }
}
