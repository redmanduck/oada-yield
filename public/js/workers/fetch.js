//TODO: use superagent
importScripts("/vendors/ubilabs/kdTree-min.js");

var config = {
	base_url: "",
	playbackmode: "1x"
}
var API = {
	location: "/resources/LOC4727",
	wmf: "/resources/WMF4727"
};

var responses = {
	location: {}
}

//use these to construct view parameter
var _STARTDATE = 1416488428; 
var _ENDDATE = 1416506428;  


/*
* Other declarations
*/
var stream_pts = []; //sorted stream TODO: we should throw old data away at some point
var polyoffset = 0;  //iterator offset for stream_pts
var dLAT = 0.00005284466; //the width of a polygon (will replace with swath_width)
var dLON =  0.00002284466;


var url_params = {
	"view": { "stream": { "$each": { "t": { "$gt": _STARTDATE, "$lt":  _ENDDATE } } } }
}

function rebuild_view_param(start,end){
	_STARTDATE = start;
  	_ENDDATE = end;

	url_params = {
		"view": { "stream": { "$each": { "t": { "$gt": _STARTDATE, "$lt":  _ENDDATE } } } }
	}
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
var wmftree = new kdTree([], time_diff, ["t"]);

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


var last_t = 1418050060;
/*
*  Make OADA CORS request with view parameter and auth header
*  @param {string} uri - path of the OADA API
*  @param {function} done_request - callback function 
*/
function make_request(uri, done_request, without_param){

  COMPLETED_WMF = false; //barrier that blocks location request from proceeded if its done before WMF

  var xhr = new XMLHttpRequest();
  var url = config.base_url + uri + "?view=" + encodeURIComponent(JSON.stringify(url_params.view));

  //use no view parameter
  if(without_param === true){
  	  rebuild_view_param(last_t, last_t+3000); //3000 seconds window size
  	  url = config.base_url + uri + "?view=" + encodeURIComponent(JSON.stringify(url_params.view));;
  }

  xhr.open("GET", url, true);
  console.log("making request to " + url);
  xhr.setRequestHeader("Authorization","Bearer 123456789");

	if (!xhr) {
		postMessage({
	    	message: "status_update",
	    	object: "Unsupported Browser!"
	    });
	}

	xhr.onload = function() {

	 var responseText = xhr.responseText;

	 done_request(responseText);

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
* Callback function for wet mass flow stream request
* given a response text 
* returns nothing
*/
var YIELD_DELAY_OFFSET = 12; //seconds
function done_wmf(rtext){
	var jsonres = null;
	try{
		jsonres = JSON.parse(rtext);
	}catch(ex){
		console.error("Unable to parse response : " + rtext);
	}
	var streamdata = jsonres.stream;
	for(var i = 0; i < streamdata.length ; i++){
		streamdata[i].flow = parseFloat(streamdata[i].flow)
		streamdata[i].t = parseInt(streamdata[i].t) - YIELD_DELAY_OFFSET;
		wmftree.insert(streamdata[i]); //insert into kD-tree
	}
	console.log("WMF Data length: " + streamdata.length);
	COMPLETED_WMF = true;

	postMessage({
	    	message: "status_update",
	    	object: "Waiting for location stream"
	});

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

    postMessage({
	    	message: "status_update",
	    	object: "Disconnect (Stop)"
	});

	//make to more parallel request
  	make_request(API.wmf, done_wmf, true); 
  	make_request(API.location, done_location, true);
  	last_t = _ENDDATE;
}


var connector = {
  reload: function(){},
  sendstream : function(){
  	if(polyoffset > stream_pts.length - 1) return;

    var mypt = stream_pts[polyoffset];

  	if(config.playbackmode == "1x"){
  		//add real delays
  		var prevpt = stream_pts[polyoffset - 1];
  		if(prevpt !== undefined){
  			var delay = mypt.t - prevpt.t;
  			console.log("Adding " + delay + " sec delay"); 
  			//Looks like eveyr points are 1 sec apart! The wats teh point!
  		}
  	} 

    var b = polygonify(mypt, dLAT, dLON);

    var yieldpt = { "flow": 0 };
    if(wmftree.nearest(mypt, 1) !== undefined && wmftree.nearest(mypt, 1) != null){
    	yieldpt = wmftree.nearest(mypt, 1)[0][0];
    }

    wmftree.remove(yieldpt); //once we use it, we throw it away

    /* if(stream_pts[polyoffset - 1] !== undefined){
     	//if there is a previous point connect the it with the next point
     	var a = polygonify(stream_pts[polyoffset - 1], dLAT, dLON);

     	// var joint = join_polygons(a,b);
     	// postMessage(joint);
     } 
    */

    /*
    * polygon: N-vertices Polygon is an array of N latlng
    * point: center lat lng point as recieved
    * yield: bushel per second (wet)
    */
    var wrapper = {
    	"polygon": b,
    	"point": mypt,
    	"yield": parseFloat(yieldpt.flow) * 0.0159
    }

    console.log("bu/sec (wet): " + wrapper.yield);

    polyoffset++;
    //tell the main thread we are ready
    postMessage({
    	message: "location_push",
    	object: wrapper
    });
  }
}


//wait for init from main thread
self.addEventListener('message', function(ev) {
  config.base_url = ev.data.base_url;
  rebuild_view_param(ev.data.start, ev.data.end);

  var BASE_INTERVAL = 25;

  setInterval(connector.sendstream, BASE_INTERVAL);

  //make to parallel request
  make_request(API.wmf, done_wmf, ev.data.realtime); 
  make_request(API.location, done_location, ev.data.realtime);

}, false);
