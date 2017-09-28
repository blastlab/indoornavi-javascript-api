describe('IndoorNavi main module tests', function () {
    it('Should throw an error when you try to toggle tag visibility when iFrame is not ready ', function () {
        // given
        let indoorNavi = new IndoorNavi();

        // when
        const toTest = function () {
            indoorNavi.toggleTagVisibility(1);
        };

        // then
        expect(toTest).toThrow(new Error('IndoorNavi is not ready'));
    });

    it('Should send message to iFrame when iFrame is ready', function() {
        // given
        let indoorNavi = new IndoorNavi();
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
});