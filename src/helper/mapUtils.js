class MapUtils {

	static pixelsToCentimeters(navi, point) {
		
		if(!!navi.parameters) {
			var xDifferenceInPix = navi.parameters.scale.start.x - navi.parameters.scale.stop.x;;
			var yDifferenceInPix = navi.parameters.scale.start.y - navi.parameters.scale.stop.y;

			var scaleLengthInPixels = Math.sqrt( xDifferenceInPix*xDifferenceInPix + yDifferenceInPix*yDifferenceInPix );
			var centimetersPerPixel = navi.parameters.scale.realDistance / scaleLengthInPixels;
			return {x: Math.round(centimetersPerPixel*point.x), y: Math.round(centimetersPerPixel*point.y)};
		}
    }
	
	static centimetersToPixels(navi, point) {
		
		if(!!navi.parameters) {
			var xDifferenceInPix = navi.parameters.scale.start.x - navi.parameters.scale.stop.x;;
			var yDifferenceInPix = navi.parameters.scale.start.y - navi.parameters.scale.stop.y;

			var scaleLengthInPixels = Math.sqrt( xDifferenceInPix*xDifferenceInPix + yDifferenceInPix*yDifferenceInPix );
			var pixelsPerCentimeter = scaleLengthInPixels / navi.parameters.scale.realDistance;
			return {x: Math.round(pixelsPerCentimeter*point.x), y: Math.round(pixelsPerCentimeter*point.y)};
		}
	}
}
