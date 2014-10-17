var express = require('express');
var router = express.Router();
var request = require('superagent');

/* GET home page. */
router.get('/', function(req, res) {
  var url = "http://oada-test.herokuapp.com/resources/1237/";
  var points  = [];
  //TODO: move this to /raw endpoint
  request.get(url, function(jres){
  	points = jres.body.locations;
  	res.render('index', { title: 'OADA visual tool',
  						oada_location_stream: points });
  });
});

module.exports = router;
