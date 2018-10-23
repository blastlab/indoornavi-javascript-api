describe('INMap module tests', function () {
    it('Should throw an error when you try to toggle tag visibility when iFrame is not ready', function () {
        // given
        let map = new INMap();

        // when
        const toTest = function () {
            map.toggleTagVisibility(1);
        };

        // then
        expect(toTest).toThrow(new Error('INMap is not ready. Call load() first and then when promise resolves, INMap will be ready.'));
    });

    it('Should send message to iFrame when iFrame is ready and toggle tag is called', function () {
        // given
        let map = new INMap();
        map.parameters = {};
        map.iFrame = {};
        spyOn(Communication, 'send').and.stub();
        spyOn(DOM, 'getById').and.stub();
        spyOn(DOM, 'getByTagName').and.stub();

        // when
        map.toggleTagVisibility(1);

        // then
        expect(Communication.send).toHaveBeenCalled();
        expect(DOM.getById).toHaveBeenCalled();
        expect(DOM.getByTagName).toHaveBeenCalled();
    });

    it('Should throw an error when you try to add event listener when iFrame is not ready', function () {
        // given
        let map = new INMap();

        // when
        const toTest = function () {
            map.addEventListener(Event.LISTENER.AREA, function () {
            });
        };

        // then
        expect(toTest).toThrow(new Error('INMap is not ready. Call load() first and then when promise resolves, INMap will be ready.'));
    });

    it('Should send message to iFrame and start listening on events when iFrame is ready and add event listener is called', function () {
        // given
        let map = new INMap();
        map.parameters = {};
        map.iFrame = {};

        spyOn(Communication, 'send').and.stub();
        spyOn(DOM, 'getById').and.stub();
        spyOn(DOM, 'getByTagName').and.stub();
        spyOn(Communication, 'listen').and.stub();

        // when
        map.addEventListener(Event.LISTENER.AREA, function () {
        });

        // then
        expect(Communication.send).toHaveBeenCalled();
        expect(DOM.getById).toHaveBeenCalled();
        expect(DOM.getByTagName).toHaveBeenCalled();
        expect(Communication.listen).toHaveBeenCalled();
    });
});