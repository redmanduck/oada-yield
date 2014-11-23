var OADAMap = {
        map: null,
        polygons: [],
        polygon_count: 0,
        status_controlId: null,
        update_status: function(str){
          var m = document.getElementById(this.status_controlId);
          m.innerHTML = str;
        }
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
   if(ev.data.message == "location_push"){
      OADAStreams.location.push(ev.data.object);
   }else if(ev.data.message == "status_update"){
      OADAMap.update_status(ev.data.object);
   }
}

/**
 * Start the background fetch worker.
 */
function startWorker(){
  OADAMap.update_status("Attempting to connect..");
  pfetch.postMessage({base_url: "https://provider.oada-dev.com/tierra/oada"});
}

/**
 * Initializes the map. Setups UI.
 */
function initialize() {

  var INIT_ZOOMLEVEL = 18;
  var INIT_LATLNG = new google.maps.LatLng(45.00495,-90.00052);

  var options = {
    center: INIT_LATLNG,
    zoom: INIT_ZOOMLEVEL,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    disableDefaultUI: true,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },

  };


  var disconnect_btn_div = document.createElement('div');
  var control = new Control("Not connected!", null, disconnect_btn_div, OADAMap.map);
  disconnect_btn_div.index = 1;
  OADAMap.status_controlId = "control_" + UIManager.control_count;

  OADAMap.map = new google.maps.Map(document.getElementById('map-canvas'), options);
  OADAMap.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(disconnect_btn_div);

  //some tool for debugging
  google.maps.event.addListener(OADAMap.map, "rightclick", function(event){
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    console.log({lat: lat, lng: lng});
  });

  //periodically update map with new incoming point
  myInterval = setInterval(function() { updateMap(); }, 500);

  //display setup modal dialog
  setTimeout(function(){
    $('#modal_setup').modal({
      'backdrop': 'static',
      'keyboard': false
    });

    $('#datepicker .input-sm').datetimepicker({
            pickDate: true,
            defaultDate: new Date()
     });

    $("#datepicker .date-nofill").val("");


  }, 500);

}

/**
 * Update map if possible
 * based on the stream
 */
function updateMap(){
  if(!OADAStreams.hasNext()) return;
  var v = OADAStreams.getNext();
  draw(v);
  if(OADAStreams.size() == 1){
    OADAMap.map.panTo(v[0]);
  }
}

/**
 * Draw the polygon on map
 * @param {array} data - array of 2 or more 
 *    latlon points to construct polygon from
 */
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
