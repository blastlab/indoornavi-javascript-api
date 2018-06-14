class MapUtils {

	static pixelsToRealDimensions(navi, point) {
		
		if(!!navi.parameters) {
			let xDifferenceInPix = navi.parameters.scale.start.x - navi.parameters.scale.stop.x;
            let yDifferenceInPix = navi.parameters.scale.start.y - navi.parameters.scale.stop.y;

            let scaleLengthInPixels = Math.sqrt( xDifferenceInPix*xDifferenceInPix + yDifferenceInPix*yDifferenceInPix );
            let centimetersPerPixel = navi.parameters.scale.realDistance / scaleLengthInPixels;
			return {x: Math.round(centimetersPerPixel*point.x), y: Math.round(centimetersPerPixel*point.y)};
		}
		else {
			throw new Error('Unable to calculate coordinates. Missing information about map scale!');
		}
    }
	
	static realDimensionsToPixels(navi, point) {
		
		if(!!navi.parameters) {
            let xDifferenceInPix = navi.parameters.scale.start.x - navi.parameters.scale.stop.x;
            let yDifferenceInPix = navi.parameters.scale.start.y - navi.parameters.scale.stop.y;

            let scaleLengthInPixels = Math.sqrt( xDifferenceInPix*xDifferenceInPix + yDifferenceInPix*yDifferenceInPix );
            let pixelsPerCentimeter = scaleLengthInPixels / navi.parameters.scale.realDistance;
			return {x: Math.round(pixelsPerCentimeter*point.x), y: Math.round(pixelsPerCentimeter*point.y)};
		}
		else {
			throw new Error('Unable to calculate coordinates. Missing information about map scale!');
		}
	}
}
