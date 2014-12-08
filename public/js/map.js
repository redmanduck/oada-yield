var OADAMap = {
        map: null,
        polygons: [],
        polygon_count: 0,
        status_controlId: null,
        follow_controlId: null,
        autopan: true,
        update_status: function(str){
          var m = document.getElementById(this.status_controlId);
          m.innerHTML = str;
        }
}

//refers to the position of the combine
var combine_marker = null; 

//min,max value of yield we expect
var MINIMUM_EFFECTIVE_YIELD = 0.01;
var MAXIMUM_EFFECTIVE_YIELD = 1.0;  

var cmapper = new colorMapper(MINIMUM_EFFECTIVE_YIELD, MAXIMUM_EFFECTIVE_YIELD, 1.0,1.0);

var OADAStreams = {
  location: [],
    getNext: function(){
      return this.location[OADAMap.polygon_count++];
    },
    getTail: function(){
      return this.location[OADAMap.polygon_count - 1];
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
      //queue points to be drawn on the map
      OADAStreams.location.push(ev.data.object);
   }else if(ev.data.message == "status_update"){
      //update status text on screen
      OADAMap.update_status(ev.data.object);
   }
}


function toggle_follow(){
  OADAMap.autopan = !OADAMap.autopan;
  var m = document.getElementById(OADAMap.follow_controlId);
  if(OADAMap.autopan) m.innerHTML = "<strong>Stop</strong> following tractor";
  if(!OADAMap.autopan) m.innerHTML = "<strong>Start</strong> following tractor";
}
/**
 * Start the background fetch worker.
 */
function startWorker(){
  var endpoint_url =  $("#modal_setup input[name=endpoint]").val();
  var starttime_text = $("#modal_setup input[name=start]").val();
  var endtime_text = $("#modal_setup input[name=end]").val();
  var starttime = moment(starttime_text).unix()
  var endtime = moment(endtime_text).unix()

  OADAMap.update_status("Attempting to connect..");
  var threquest = {
        start: starttime,
        end: endtime,
        realtime: (endtime_text == ""),
        base_url: endpoint_url
      }
  console.log(threquest)
  pfetch.postMessage(threquest);
}

/**
 * Initializes the map. 
 * Setups UI.
 */
function initialize() {

  var INIT_ZOOMLEVEL = 18;
  var INIT_LATLNG = new google.maps.LatLng(45.00495,-90.00052);

  var options = {
    center: INIT_LATLNG,
    zoom: INIT_ZOOMLEVEL,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },

  };

  //create the 'status' button 
  var disconnect_btn_div = document.createElement('div');
  var follow_btn_div = document.createElement('div');
  var control = new Control("Not connected!", null, disconnect_btn_div, OADAMap.map);
  OADAMap.status_controlId = "control_" + UIManager.control_count;

  var follow_control = new Control("<strong>Stop</strong> following tractor", toggle_follow, follow_btn_div, OADAMap.map);
  OADAMap.follow_controlId = "control_" + UIManager.control_count;

  disconnect_btn_div.index = 1;
  follow_control.index = 2;


  OADAMap.map = new google.maps.Map(document.getElementById('map-canvas'), options);
  OADAMap.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(disconnect_btn_div);
  OADAMap.map.controls[google.maps.ControlPosition.TOP_LEFT].push(follow_btn_div);

  //some tool for debugging, right click to see detail about polygon
  google.maps.event.addListener(OADAMap.map, "rightclick", function(event){
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    console.log({lat: lat, lng: lng});
  });

  //periodically update map with new incoming point
  myInterval = setInterval(function() { updateMap(); }, 25); 

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
  var k = OADAStreams.getTail();
  var v = OADAStreams.getNext();
  draw(v);

  // if(k !== undefined){
  //   var dist = Utils.haversine(v.point.lat, v.point.lng, k.point.lat, k.point.lng);
  //   //if the distance is greater than 1 km (out of field), move there otherwise we stay where we are
  //   if(dist > 1){
  //     OADAMap.map.panTo(v.point); 
  //   }
  // }
   if(OADAMap.autopan) OADAMap.map.panTo(v.point); 
}

/**
 * Draw the polygon on map
 * @param {array} data - array of 2 or more 
 *                       latlon points as vertices to construct polygon 
 */
function draw(data){
    var rgb = cmapper.map(data.yield);
    var fillcol = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    if(combine_marker != null) combine_marker.setMap(null);

    //if yield is lower than min yield we dont draw but just show combine position
    if(data.yield < MINIMUM_EFFECTIVE_YIELD){
      combine_marker = new google.maps.Marker({
          position: data.point,
          map: OADAMap.map,
          title: 'Combine Position'
      });

      return; 
    }
    
    OADAMap.polygons.push(
            new google.maps.Polygon({
                paths: data.polygon,
                strokeColor: fillcol,
                strokeOpacity: 0.9,
                strokeWeight: 1,
                fillColor: fillcol,
                fillOpacity: 0.7
            })
    );
    var obj = OADAMap.polygons[OADAMap.polygons.length - 1];
    obj.setMap(OADAMap.map);
    var clck_callback = function(){
      console.log(data);
    }
    google.maps.event.addListener(obj, 'click', clck_callback);
    
}


google.maps.event.addDomListener(window, 'load', initialize);
