var express = require('express');
var router = express.Router();
var request = require('superagent');

function comparator(a,b) {
  if (Number(a.t) < Number(b.t))
     return -1;
  if (Number(a.t) > Number(b.t))
    return 1;
  return 0;
}

/* GET home page. */
router.get('/', function(req, res) {
  // var url = "https://beta.caseihconnect.com:8443/oada/resources/LOC4727";
  // var raw  = require('../public/data.json');
  //TODO: move this to /raw endpoint
  // var points = raw.locations.sort(comparator);
  res.render('index', { title: 'OADA Y' });
});

module.exports = router;
