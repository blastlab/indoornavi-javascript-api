describe('Validation module tests', function() {
    it('should throw an error when required field is undefined', function() {
        // given
        const requiredField = 'test';
        const object = {

        };

        // when
        const toTest = function () {
            Validation.required(object, requiredField, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should throw an error when required field value is undefined', function() {
        // given
        const requiredField = 'test';
        const object = {
            'test': undefined
        };

        // when
        const toTest = function () {
            Validation.required(object, requiredField, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when required field is defined', function() {
        // given
        const requiredField = 'test';
        const object = {
            test: 'test'
        };
        const spy = spyOn(Validation, 'required').and.callThrough();

        // when
        Validation.required(object, requiredField, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when all of the required fields are undefined', function() {
        // given
        const requiredFields = ['test', 'mama'];
        const object = {

        };

        // when
        const toTest = function() {
            Validation.requiredAny(object, requiredFields, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when any of the required fields is defined', function() {
        // given
        const requiredFields = ['test', 'mama'];
        const object = {
            'test': false
        };
        const spy = spyOn(Validation, 'requiredAny').and.callThrough();

        // when
        Validation.requiredAny(object, requiredFields, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given number is NOT an integer', function() {
        // given
        const num = 1.1;

        // when
        const toTest = function() {
            Validation.isInteger(num, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given number is an integer', function() {
        // given
        const num = 5;
        const spy = spyOn(Validation, 'isInteger').and.callThrough();

        // when
        Validation.isInteger(num, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given number is NOT in given range', function() {
        // given
        const min = 1;
        const max = 5;

        // when
        const toTest = function() {
            Validation.isBetween(min, max, 6, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given number is in given range', function() {
        // given
        const min = 5;
        const max = 10;
        const spy = spyOn(Validation, 'isBetween').and.callThrough();

        // when
        Validation.isBetween(min, max, 6, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is NOT in the proper color format', function() {
        // given
        const wrongColorFormat = 'rb(19,91,9)';

        // when
        const toTest = function() {
            Validation.isColor(wrongColorFormat, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is in the proper color format', function() {
        // given
        const goodColorFormat = '#ff0000';
        const spy = spyOn(Validation, 'isColor').and.callThrough();

        // when
        Validation.isColor(goodColorFormat, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is NOT a string', function() {
        // given
        const notAString = false;

        // when
        const toTest = function() {
            Validation.isString(notAString, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is a string', function() {
        // given
        const value = 'test';
        const spy = spyOn(Validation, 'isString').and.callThrough();

        // when
        Validation.isString(value, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is NOT a number', function() {
        // given
        const notANumber = false;

        // when
        const toTest = function() {
            Validation.isNumber(notANumber, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is a number', function() {
        // given
        const value = 1.1;
        const spy = spyOn(Validation, 'isNumber').and.callThrough();

        // when
        Validation.isNumber(value, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is NOT an array', function() {
        // given
        const notAnArray = false;

        // when
        const toTest = function() {
            Validation.isArray(notAnArray, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is an array', function() {
        // given
        const value = ['test'];
        const spy = spyOn(Validation, 'isArray').and.callThrough();

        // when
        Validation.isArray(value, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is NOT in an array', function() {
        // given
        const value = 89;

        // when
        const toTest = function() {
            Validation.isInArray([11, 22, 33], value, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is in an array', function() {
        // given
        const value = 89;
        const spy = spyOn(Validation, 'isInArray').and.callThrough();

        // when
        Validation.isInArray([11, 22, 33, 89], value, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error when given value is lower than min', function() {
        // given
        const value = 89;

        // when
        const toTest = function() {
            Validation.isGreaterThan(100, value, 'Test');
        };

        // then
        expect(toTest).toThrow(new Error('Test'));
    });

    it('should NOT throw an error when given value is greater than min', function() {
        // given
        const value = 89;
        const spy = spyOn(Validation, 'isGreaterThan').and.callThrough();

        // when
        Validation.isGreaterThan(82, value, 'Test');

        // then
        expect(spy).toHaveBeenCalled();
    });
});