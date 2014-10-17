var express = require('express');
var router = express.Router();
var request = require('superagent');

/* GET users listing. */
router.get('/', function(req, res) {
  var points  = [];
  request.get(url, function(res){
  	points = res.body.locations;
  });
  
});

module.exports = router;
