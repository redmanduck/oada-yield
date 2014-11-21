var theoreticalStream = [
   [
   	{lat: 45.00504600631333, lng: -89.99988198280334},
   	{lat: 45.00502893834048, lng: -89.99987661838531},
   	{lat: 45.00502988656133, lng: -89.99968215823174},
   	{lat: 45.00504979919547, lng: -89.99967947602272}
   ],
   [{lat: 45.00504126521025, lng: -89.99965935945511},
   {lat: 45.00501850791015, lng: -89.99966740608215},
   {lat: 45.00502988656133, lng: -89.99959230422974},
   {lat: 45.00504885097497, lng: -89.99960035085678}]
]
var last_t = 0;
var connector = {
  reload : function(){
  	var tset = [];
    // for(var i = 0; i < 4;i++){
    // 	var newpt = {
	   //    lat: Math.random()*-20,
	   //    lng: Math.random()*10
	   //  }
	   //  tset.push(newpt);
    // }
    tset.push(theoreticalStream[last_t++])
    postMessage(tset);
  }
}

setInterval(connector.reload, 1000);