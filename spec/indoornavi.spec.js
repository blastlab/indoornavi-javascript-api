describe('INMap main module tests', function () {
    it('Should throw an error when you try to toggle tag visibility when iFrame is not ready', function () {
        // given
        let indoorNavi = new INMap();

        // when
        const toTest = function () {
            indoorNavi.toggleTagVisibility(1);
        };

        // then
        expect(toTest).toThrow(new Error('INMap is not ready. Call load() first and then when promise resolves, INMap will be ready.'));
    });

    it('Should send message to iFrame when iFrame is ready and toggle tag is called', function () {
        // given
        let indoorNavi = new INMap();
        indoorNavi.isReady = true;
        spyOn(Communication, 'send').and.stub();
        spyOn(DOM, 'getById').and.stub();
        spyOn(DOM, 'getByTagName').and.stub();

        // when
        indoorNavi.toggleTagVisibility(1);

        // then
        expect(Communication.send).toHaveBeenCalled();
        expect(DOM.getById).toHaveBeenCalled();
        expect(DOM.getByTagName).toHaveBeenCalled();
    });

    it('Should throw an error when you try to add event listener when iFrame is not ready', function () {
        // given
        let indoorNavi = new INMap();

        // when
        const toTest = function () {
            indoorNavi.addEventListener('INArea', function () {
            });
        };

        // then
        expect(toTest).toThrow(new Error('INMap is not ready. Call load() first and then when promise resolves, INMap will be ready.'));
    });

    it('Should send message to iFrame and start listening on events when iFrame is ready and add event listener is called', function () {
        // given
        let indoorNavi = new INMap();
        indoorNavi.isReady = true;
        spyOn(Communication, 'send').and.stub();
        spyOn(DOM, 'getById').and.stub();
        spyOn(DOM, 'getByTagName').and.stub();
        spyOn(Communication, 'listen').and.stub();

        // when
        indoorNavi.addEventListener('INArea', function () {
        });

        // then
        expect(Communication.send).toHaveBeenCalled();
        expect(DOM.getById).toHaveBeenCalled();
        expect(DOM.getByTagName).toHaveBeenCalled();
        expect(Communication.listen).toHaveBeenCalled();
    });

    it('Should throw an error when You try to create an INMapObject instance', () => {
        // given
        let indoorNavi = new INMap();
        indoorNavi.isReady = true;

        //then
        function makeObject() {
            let object = new INMapObject(indoorNavi);
        }

        // expect
        expect(makeObject).toThrow(new TypeError("Cannot construct INMapObject instances directly"));
    });

    it('Should create marker', () => {
        // given
        let indoorNavi = new INMap();
        indoorNavi.isReady = true;
        spyOn(Communication, 'send').and.stub();
        spyOn(DOM, 'getById').and.stub();
        spyOn(DOM, 'getByTagName').and.stub();
        spyOn(Communication, 'listen').and.stub();
        // then
        let marker = new INMarker(indoorNavi);
        marker.isReady = true;
        // expect
        expect(marker).toBeTruthy();
    });

    it('Should throw an error when color parameter passed as argument to setColor is not valid', () => {
        // given
        let indoorNavi = new INMap();
        indoorNavi.isReady = true;
        spyOn(Communication, 'send').and.stub();
        spyOn(DOM, 'getById').and.stub();
        spyOn(DOM, 'getByTagName').and.stub();
        spyOn(Communication, 'listen').and.stub();
        // then
        let poly = new INPolyline(indoorNavi);
        poly.isReady = true;

        // expect
        poly.ready(() => expect(toTest).toThrow(new Error('Wrong color value or/and type')));
    });
});
