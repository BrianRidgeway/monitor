var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require( 'fs' );
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {});
});

router.get( '/config', function( req, res, next ){
  res.json( JSON.parse( fs.readFileSync( __dirname + '/../config/monitor.json', 'utf8' )) );
})
module.exports = router;
