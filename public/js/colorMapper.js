/**
 * Convert HSV to RGB
 * @constructor
 * @param {float} min - Minimum range of number to normalize
 * @param {float} max - Maximum range of number to normalize
 * @param {float} saturation - Constant Saturation 
 * @param {float} value - Constant Value
 */

function colorMapper(min, max, saturation, value){
	this.mMin = min;
    this.mMax = max;
    this.mSat = saturation;
    this.mVal = value;
}


/**
 * Map number to HSV
 * @param {float} num - Number that falls within min,max parameter
 */

colorMapper.prototype.map = function(num){
	var hsv = [0.00, 0.00, 0.00];
	hsv[2] = this.mVal;
	hsv[1] = this.mSat;
	hsv[0] = parseFloat(120.0 / parseFloat(this.mMax) * (num));
	// console.log("HSV " + hsv);
	return hsvToRgb(hsv[0], hsv[1], hsv[2]);
}

/**
 * Convert HSV to RGB
 * @param {float} h - Hue
 * @param {float} s - Saturation
 * @param {float} v - Value
 */

function hsvToRgb(h , s , v ) {
	var C = v * s;
	var X = C * (1 - Math.abs((h/60) % 2 - 1))
	var m = v - C;
	var rgb_prime = [0,0,0]
	var rgb = [0,0,0]

	if(h >= 0 && h < 60){
		rgb_prime = [C + m,X + m, m];
	}else if(h >= 60 && h < 120){
		rgb_prime = [X + m ,C + m,m];
	}else if(h >= 120 && h < 180){
		rgb_prime = [m ,C + m,X + m];
	}else if(h >= 180 && h < 240){
		rgb_prime = [m,m+X,C+m];
	}else if(h >= 240 && h < 300){
		rgb_prime = [X+m,m,C+m];
	}else if(h >= 300 && h < 360){
		rgb_prime = [C+m,m,X+m];
	}

	for(var i in rgb_prime){
		rgb[i] = Math.floor( 255*rgb_prime[i]);
	}
	return rgb;
}