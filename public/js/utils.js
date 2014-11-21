
var Utils = {
  dist: function(a,b){
    var R  = 6371; 
    var phi1 = Utils.rad(Number(a.latitude));
    var phi2 = Utils.rad(Number(b.latitude));
    var dphi = Utils.rad(Number(b.latitude) - Number(a.latitude));
    var dlambda = Utils.rad(Number(b.longitude) - Number(a.longitude));
    var a = Math.sin(dphi/2) * Math.sin(dphi/2) + Math.cos(phi1) * Math.cos(phi2) *  Math.sin(dlambda/2) * Math.sin(dlambda/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
  rad: function(x){
    return x * Math.PI / 180;
  }

}