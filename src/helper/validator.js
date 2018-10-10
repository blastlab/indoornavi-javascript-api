class Validation {
    static required(object, key, errorMessage) {
        if (!object.hasOwnProperty(key) || object[key] === undefined) {
            throw new Error(errorMessage);
        }
    }

    static requiredAny(object, keys, errorMessage) {
        let found = false;
        keys.forEach((key) => {
            if (object.hasOwnProperty(key) && object[key] !== undefined) {
                found = true;
            }
        });
        if (!found) {
            throw Error(errorMessage);
        }
    }

    static isInteger(value, errorMessage) {
        Number.isInteger = Number.isInteger || function (value) {
            return typeof value === 'number' &&
                isFinite(value) &&
                Math.floor(value) === value;
        };
        if (!Number.isInteger(value)) {
            throw new Error(errorMessage);
        }
    }

    static isString(value, errorMessage) {
        if (typeof value !== 'string') {
            throw new Error(errorMessage);
        }
    }

    static isNumber(value, errorMessage) {
        if (typeof value !== 'number') {
            throw new Error(errorMessage);
        }
    }

    static isBetween(min, max, value, errorMessage) {
        if (value < min || value > max) {
            throw new Error(errorMessage);
        }
    }

    static isColor(value, errorMessage) {
        const isValidRgb = /[R][G][B][A]?[(]([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])[)]/i.test(value);
        const isValidHex = /^#(?:[0-9a-fA-F]{3}){1,2}$/i.test(value);
        if (!isValidHex && !isValidRgb) {
            throw new Error(errorMessage);
        }
    }

    static isArray(value, errorMessage) {
        if (!Array.isArray(value)) {
            throw new Error(errorMessage);
        }
    }

    static isGreaterThan(min, value, errorMessage) {
        if (value < min) {
            throw new Error(errorMessage);
        }
    }

    static isInArray(array, value, errorMessage) {
        if (array.indexOf(value) < 0) {
            throw new Error(errorMessage);
        }
    }

    static isPoint(point, errorMessage) {
        if (point.x === null || point.y === null || point.x === undefined || point.y === undefined) {
            throw new Error(errorMessage);
        }
        Validation.isInteger(point.x, errorMessage);
        Validation.isInteger(point.y, errorMessage);
    }

    static isFunction(callback, errorMessage) {
        if (typeof callback !== "function") {
            throw new Error(errorMessage)
        }
    }
}
