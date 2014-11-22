var OADAMap = {
        map: null,
        polygons: [],
        polygon_count: 0
}

var OADAStreams = {
  location: [
    [
       { lat: 45.00504885097497, lng: -90.0000362098217 },
       { lat: 45.00502419723603, lng: -90.0000362098217 },
       { lat: 45.00502514545694, lng: -89.99988868832588 },
       { lat: 45.005045058092726, lng: -89.99988868832588 }
    ]
    ],
    getNext: function(){
      return this.location[OADAMap.polygon_count++];
    },
    hasNext: function(){
      if(OADAMap.polygon_count == this.location.length) return false;
      return true;
    }
}


/*
* Take a {lat, lng} object, and a width and height
* and return a polygon (array of 4 points) 
*/
function toPolygon(pt, wid, len){

}

//Use this web worker to update points
var pfetch = new Worker("/js/workers/fetch.js");
pfetch.onmessage = function(ev){
   OADAStreams.location.push(ev.data)
}

function initialize() {

  var INIT_ZOOMLEVEL = 18;
  var INIT_LATLNG = new google.maps.LatLng(45.00495,-90.00052);

  var options = {
    center: INIT_LATLNG,
    zoom: INIT_ZOOMLEVEL,
    mapTypeId: google.maps.MapTypeId.SATELLITE
  };

  OADAMap.map = new google.maps.Map(document.getElementById('map-canvas'), options);
  //some tool for debugging
  google.maps.event.addListener(OADAMap.map, "rightclick", function(event){
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    console.log({lat: lat, lng: lng});
  });
  myInterval = setInterval(function() { updateMap(); }, 500);
}


function updateMap(){
  if(!OADAStreams.hasNext()) return;
  console.log("Updating map")
  draw(OADAStreams.getNext());
}


function draw(data){
    OADAMap.polygons.push(
            new google.maps.Polygon({
                paths: data,
                strokeColor: '#00ff00',
                strokeOpacity: 0.8,
                strokeWeight: 1,
                fillColor: '#00ff00',
                fillOpacity: 0.6
            })
    );
    var obj = OADAMap.polygons[OADAMap.polygons.length - 1];
    obj.setMap(OADAMap.map);
    
    // google.maps.event.addListener(obj, 'click', alert());
}


google.maps.event.addDomListener(window, 'load', initialize);


var request = window.superagent;
var url = 'https://provider.oada-dev.com/tierra/oada/resources/LOC4727';
request
  .get(url)
  .set('Authorization', 'Bearer 123456789')
  .end(function(error, res){
    console.log(res);
  });
