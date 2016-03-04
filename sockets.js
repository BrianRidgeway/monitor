'use strict';
var io = require( 'socket.io' )();
var req = require( 'request' );
var fs = require( 'fs' );
var url = "http://localhost:3001"
var config = JSON.parse( fs.readFileSync( __dirname + "/config/monitor.json", "utf8" ) );

config.sections.forEach( function( section ){
  section.items.forEach( function( item ){
    if( item.type == "web" ){
      monitorWebServer( item );
    }
  })
})

function monitorWebServer( conf ){
  setInterval( function(){
    req(conf.url, function( error, response, body ){
      if( !error && response.statusCode ){
        if( response.statusCode != "200" )
          console.log( body );
        io.emit( 'update', { url: conf.url, id: conf.id, status: response.statusCode, counter: new Date().toLocaleTimeString()})
      }
      else{
        io.emit( 'update', { url: conf.url, id: conf.id, status: "XXX", counter: new Date().toLocaleTimeString()})
      }
    })
  }, 3000)

}
module.exports = io;
