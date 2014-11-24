function colorMapper(float min, float max, float saturation, float value){
	this.mMin = min;
    this.mMax = max;
    this.mSat = saturation;
    this.mVal = value;
}

colorMapper.prototype.map = function(){
	var hsv = [0.00, 0.00, 0.00];
	hsv[2] = this.mVal;
	hsv[1] = this.mSat;
	hsv[0] = parseFloat(120.0 / parseFloat(this.mMax) * (num));
}