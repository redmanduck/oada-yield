var API = {
	location: "https://provider.oada-dev.com/tierra/oada/resources/LOC4727"
};

var responses = {
	location: {}
}

function blobify(coord, width, height){
  return [
	   	{lat: coord.lat, lng: coord.lng},
	   	{lat: coord.lat, lng: coord.lng + width},
	   	{lat: coord.lat - height, lng: coord.lng + width},
	   	{lat: coord.lat - height, lng: coord.lng},
	   	
   ]
}

function make_request(){
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open("GET", API.location, true);
  xhr.setRequestHeader("Authorization","Bearer 123456789");

	if (!xhr) {
		console.error("CORS is not supported on your browser");
	    throw new Error('CORS not supported');
	}
	xhr.onload = function() {
	 var responseText = xhr.responseText;
	 console.log(responseText);
	};
	xhr.onerror = function() {
	  console.log('CORS: There was an error!');
	};
	xhr.send();

}

function done_request(){
	console.log("done API request")
}

var theoreticalStream = [
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
]
var last_t = 0;
var connector = {
  reload : function(){
  	var tset = [];
  	if(last_t > theoreticalStream.length - 1) return;
    // for(var i = 0; i < 4;i++){
    // 	var newpt = {
	   //    lat: Math.random()*-20,
	   //    lng: Math.random()*10
	   //  }
	   //  tset.push(newpt);
    // }
    tset.push(blobify(theoreticalStream[last_t++],  0.00005284466, 0.00002284466))
    postMessage(tset);
  }
}

setInterval(connector.reload, 1000);
