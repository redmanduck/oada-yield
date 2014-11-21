function pushPoint(){
   /*
   *  This is periodically called
   *  push point into polypath
   */

   console.log("Checking for next available point..");

   var plot_next = OADAStreams.location.getNext();
   if(plot_next == null){
     return;
   }
   console.log(plot_next);
   //push new point to be drawn
   // OADAMap.pathpoints.push(new google.maps.LatLng(Number(plot_next.latitude), 
   //                                                Number(plot_next.longitude)));
   // refreshPolyline();
   postMessage(plot_next);
}

setInterval(pushPoint, 3000);