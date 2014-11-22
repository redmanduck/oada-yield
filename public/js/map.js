var OADAMap = {
        map: null,
        polygons: [],
        polygon_count: 0
}

var OADAStreams = {
  location: [],
    getNext: function(){
      return this.location[OADAMap.polygon_count++];
    },
    hasNext: function(){
      if(OADAMap.polygon_count == this.location.length) return false;
      return true;
    },
    size: function(){
      return this.location.length;
    }
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
  var v = OADAStreams.getNext();
  draw(v);
  if(OADAStreams.size() == 1){
    OADAMap.map.panTo(v[0]);
  }
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
    
}


google.maps.event.addDomListener(window, 'load', initialize);


