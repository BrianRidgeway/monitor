'use strict';
var io = require( 'socket.io' )();
var req = require( 'request' );

var url = "http://localhost:3001"

setInterval( function(){
  req(url, function( error, response, body ){
    if( !error && response.statusCode ){
      io.emit( 'update', { url: url, status: response.statusCode, counter: new Date().toLocaleTimeString()})
    }
    else{
      io.emit( 'update', { url: url, status: "XXX", counter: new Date().toLocaleTimeString()})
    }
  })
}, 3000)
module.exports = io;
