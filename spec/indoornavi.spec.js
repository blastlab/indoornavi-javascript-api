describe('INMap main module tests', function () {
    it('Should throw an error when you try to toggle tag visibility when iFrame is not ready', function () {
        // given
        let indoorNavi = new INMap();

        // when
        const toTest = function () {
            indoorNavi.toggleTagVisibility(1);
        };

        // then
        expect(toTest).toThrow(new Error('INMap is not ready. Call load() first and then when promise resolves INMap will be ready.'));
    });

    it('Should send message to iFrame when iFrame is ready and toggle tag is called', function() {
        // given
        let indoorNavi = new INMap();
        indoorNavi.isReady = true;
        spyOn(INCommunication, 'send').and.stub();
        spyOn(INDOM, 'getById').and.stub();
        spyOn(INDOM, 'getByTagName').and.stub();

        // when
        indoorNavi.toggleTagVisibility(1);

        // then
        expect(INCommunication.send).toHaveBeenCalled();
        expect(INDOM.getById).toHaveBeenCalled();
        expect(INDOM.getByTagName).toHaveBeenCalled();
    });

    it('Should throw an error when you try to add event listener when iFrame is not ready', function() {
        // given
        let indoorNavi = new INMap();

        // when
        const toTest = function () {
            indoorNavi.addEventListener('INArea', function() {});
        };

        // then
        expect(toTest).toThrow(new Error('INMap is not ready. Call load() first and then when promise resolves INMap will be ready.'));
    });

    it('Should send message to iFrame and start listening on events when iFrame is ready and add event listener is called', function() {
        // given
        let indoorNavi = new INMap();
        indoorNavi.isReady = true;
        spyOn(INCommunication, 'send').and.stub();
        spyOn(INDOM, 'getById').and.stub();
        spyOn(INDOM, 'getByTagName').and.stub();
        spyOn(INCommunication, 'listen').and.stub();

        // when
        indoorNavi.addEventListener('INArea', function() {});

        // then
        expect(INCommunication.send).toHaveBeenCalled();
        expect(INDOM.getById).toHaveBeenCalled();
        expect(INDOM.getByTagName).toHaveBeenCalled();
        expect(INCommunication.listen).toHaveBeenCalled();
    });

    it('Should throw an error when You try to create an INMapObject instance', () => {
      // given
      let indoorNavi = new INMap();
      indoorNavi.isReady = true;
      //then
      const marker = new INMapObject(indoorNavi);
      // expect

      expect(marker).toThrow(new TypeError("Cannot construct INMapObject instances directly"));
    });

    it('Should create marker and comunicate with IFrame', () => {
      // given
      let indoorNavi = new INMap();
      indoorNavi.isReady = true;
      spyOn(INCommunication, 'send').and.stub();

      //then
      const marker = new Marker(indoorNavi);

      // expect

      marker.ready(() => {
        expect(INCommunication.send).toHaveBeenCalled();
      });
    });
});
