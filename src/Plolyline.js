class Polyline {

  constructor() {
    // create object -> add event listner -> on event get id and set id -> delete event listener
  }

  /**
   * Create polyline object
   * @param id - unique id for the polyline svg group that will be placed on the map as DOM element
   */
    _createObject() {
      this._checkIsReadyAndActivateIFrame();
      Communication.send(this._iFrame, this.targetHost, {
        command: 'createObject'
      });
      Communication.listen('createObject', (data) => console.log(data));
   }

}
