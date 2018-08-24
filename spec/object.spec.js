describe('Object tests', function() {
    it('Should throw an error when You try to create an INMapObject instance', () => {
        // given
        let map = new INMap();
        map.isReady = true;

        // when
        function makeObject() {
            new INMapObject(map);
        }

        // then
        expect(makeObject).toThrow(new TypeError("Cannot construct INMapObject instances directly"));
    });
});