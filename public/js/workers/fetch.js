var config = {
	base_url: ""
}
var API = {
	location: "/resources/LOC4727"
};

var responses = {
	location: {}
}

var url_params = {
	"view": { "stream": { "$each": { "t": { "$gt": 1416441600  } } } }
}

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

function make_request(){
  var xhr = new XMLHttpRequest();
  var url = config.base_url + API.location + "?view=" + encodeURIComponent(JSON.stringify(url_params.view));
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

function done_request(rtext){
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
	}
	console.log(streamdata);
	theoreticalStream = theoreticalStream.concat(streamdata);
}
/*
{lat: 45.00503367944457, lng: -89.99988198280334},
	   	{lat: 45.00503367944457, lng: -89.99981492757797},
	   	{lat: 45.00503367944457, lng: -89.99976933002472},
	   	{lat: 45.00503367944457, lng: -89.99972239136696},
	   	{lat: 45.00503367944457, lng: -89.99966204166412},
	   	{lat: 45.00503367944457, lng: -89.99960035085678},
	   	{lat: 45.00503367944457, lng: -89.99955475330353},
	   	{lat: 45.00503367944457, lng: -89.99949306249619},
	   	{lat: 45.00503367944457, lng: -89.99943941831589},
	   	{lat: 45.00503367944457, lng: -89.99938309192657},
	   	{lat: 45.00503367944457, lng: -89.99934688210487},
	   	{lat: 45.00503367944457, lng: -89.99930396676064},
	   	{lat: 45.00503367944457, lng: -89.99925434589386}
	   	*/
var theoreticalStream = [
	   	
]
var last_t = 0;
var dLAT = 0.00005284466;
var dLON =  0.00002284466;
var connector = {
  reload : function(){
  	if(last_t > theoreticalStream.length - 1) return;

    // for(var i = 0; i < 4;i++){
    // 	var newpt = {
	   //    lat: Math.random()*-20,
	   //    lng: Math.random()*10
	   //  }
	   //  tset.push(newpt);
    // }
    var b = polygonify(theoreticalStream[last_t], dLAT, dLON);

    if(theoreticalStream[last_t - 1] !== undefined){
    	//if there is a previous point
    	//connect the it with the next point
    	var a = polygonify(theoreticalStream[last_t - 1], dLAT, dLON);

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
  setInterval(connector.reload, 1000);
  make_request();
}, false);
