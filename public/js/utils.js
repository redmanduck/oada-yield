
var Utils = {
  haversine: function() {
    /*
		* Haversine formula implementation
		* adapted from http://rosettacode.org
		*/
       var radians = Array.prototype.map.call(arguments, function(deg) { return deg/180.0 * Math.PI; });
       var lat1 = radians[0], lon1 = radians[1], lat2 = radians[2], lon2 = radians[3];
       var R = 6372.8; // km
       var dLat = lat2 - lat1;
       var dLon = lon2 - lon1;
       var a = Math.sin(dLat / 2) * Math.sin(dLat /2) + Math.sin(dLon / 2) * Math.sin(dLon /2) * Math.cos(lat1) * Math.cos(lat2);
       var c = 2 * Math.asin(Math.sqrt(a));
       return R * c;
  },
  rgbToHex: function(rgb){
    var red = rgb[2];
    var green = rgb[1];
    var blue = rgb[0];
    var decColor =0x1000000+ blue + 0x100 * green + 0x10000 *red ;
    return '#'+decColor.toString(16).substr(1).split(".")[0];
  }
}