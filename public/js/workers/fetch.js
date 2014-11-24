//TODO: use superagent
importScripts("/vendors/ubilabs/kdTree-min.js");

var config = {
	base_url: ""
}
var API = {
	location: "/resources/LOC4727",
	wmf: "/resources/WMF4727"
};

var responses = {
	location: {}
}

var _STARTDATE = 1416488428;
var _ENDDATE = 1416506428;
var stream_pts = [];
var last_t = 0;
var dLAT = 0.00005284466; //the width of a polygon
var dLON =  0.00002284466;
var url_params = {
	"view": { "stream": { "$each": { "t": { "$gt": _STARTDATE, "$lt":  _ENDDATE } } } }
}


function time_diff(a,b){
	return Math.abs(b.t - a.t);
}
function time_compare(a,b){
  if (a.t < b.t) {
    return -1;
  }
  if (a.t > b.t) {
    return 1;
  }
  return 0;
}

//kdtree for wet mass flow points so we can search
var wmftree = kdTree([], time_diff, ["t"]);

/*
*  Generate a polygon 
*  given a point and how big you want that polygon to be
*/
function polygonify(coord, width, height){
  return [
	   	{lat: coord.lat, lng: coord.lng},
	   	{lat: coord.lat, lng: coord.lng + width},
	   	{lat: coord.lat - height, lng: coord.lng + width},
	   	{lat: coord.lat - height, lng: coord.lng},
	   	
   ]
}

/*
* Generate a polygon to join
* two polygons together
*/
function join_polygons(blobA, blobB){
	return [
	   	blobA[1],
	   	blobA[2],
	   	blobB[1],
	   	blobB[2]
   ]
}
var COMPLETED_WMF = false; 

function make_request(uri, done_request){
  COMPLETED_WMF = false;

  var xhr = new XMLHttpRequest();
  var url = config.base_url + uri + "?view=" + encodeURIComponent(JSON.stringify(url_params.view));
  xhr.open("GET", url, true);
  console.log("making request to " + url);
  xhr.setRequestHeader("Authorization","Bearer 123456789");

	if (!xhr) {
		console.error("CORS is not supported on your browser");
	    throw new Error('CORS not supported');
	}
	xhr.onload = function() {

	 var responseText = xhr.responseText;

	 done_request(responseText);

	  postMessage({
	    	message: "status_update",
	    	object: "Disconnect (Stop)"
	  });

	};
	xhr.onerror = function() {
	  postMessage({
	    	message: "status_update",
	    	object: "XHR Error!"
	  });
	};
	xhr.send();

}

/*
* Callback function for Wet mass flow stream request
* given a response text 
* returns nothing
*/
function done_wmf(rtext){
	var jsonres = null;
	try{
		jsonres = JSON.parse(rtext);
	}catch(ex){
		console.error("Unable to parse response : " + rtext);
	}
	var streamdata = jsonres.stream;

	REQUEST_STATES = 
	console.log("WMF Data length: " + streamdata.length);
	COMPLETED_WMF = true;
}

/*
* Callback function for location stream request
* given a response text 
* returns nothing
*/
function done_location(rtext){
	//if location request is done before wmf request
	//wait
	while(COMPLETED_WMF != 1);
	console.log("Ok google");
	var jsonres = null;
	try{
		jsonres = JSON.parse(rtext);
	}catch(ex){
		console.error("Unable to parse response : " + rtext);
	}
	var streamdata = jsonres.stream;
	for(var i = 0; i < streamdata.length ; i++){
		streamdata[i].lat = parseFloat(streamdata[i].lat)
		streamdata[i].lng = parseFloat(streamdata[i].lon)
		streamdata[i].t = parseInt(streamdata[i].t);
	}
	console.log("Location Data length: " + streamdata.length);

	stream_pts = stream_pts.concat(streamdata.sort(time_compare));
}


var connector = {
  reload: function(){},
  sendstream : function(){
  	if(last_t > stream_pts.length - 1) return;

    // for(var i = 0; i < 4;i++){
    // 	var newpt = {
	   //    lat: Math.random()*-20,
	   //    lng: Math.random()*10
	   //  }
	   //  tset.push(newpt);
    // }
    var b = polygonify(stream_pts[last_t], dLAT, dLON);

    if(stream_pts[last_t - 1] !== undefined){
    	//if there is a previous point
    	//connect the it with the next point
    	var a = polygonify(stream_pts[last_t - 1], dLAT, dLON);

    	// var joint = join_polygons(a,b);
    	// postMessage(joint);
    }
    //connect previous point
    last_t++;
    postMessage({
    	message: "location_push",
    	object: b
    });
  }
}

//wait for init from main thread
self.addEventListener('message', function(ev) {
  config.base_url = ev.data.base_url;
  setInterval(connector.sendstream, 25);

  //make to parallel request
  make_request(API.wmf, done_wmf); 
  make_request(API.location, done_location);

}, false);
