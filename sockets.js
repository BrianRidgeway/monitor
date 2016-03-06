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
    else if( item.type = "mysqldb" ){
      monitorMysqlDb( item );
    }
  })
})

function monitorMysqlDb( conf ){
  var conn = mysql.createConnection({conf.connect.user, conf.connect.password, conf.connect.host, conf.connect.port })
  conn.connect(function(error){
    if( error ){
      io.emit( 'update', { id: conf.id, error: true, errorMessage: error.stack })
    }
    else{
      var data = { id: conf.id, error: false, errorMessage: "" }
      conf.queries.forEach( function( query ){
        conn.query( query.sql, function( err, rows, fields ){
          if( !err ){
            data[query.key] = rows[0][query.field]
            if( query.checkType == "equals" && data[query.key] != query.checkValue ){
              data.error = true;
              data.errorMessage = data.errorMessage  + query.key + " does not equal expected value " + query.checkValue + ". ";
            }
            else if( query.checkType == "less than" && data[query.key] >= query.checkalue ){
              data.error = true;
              data.errorMessage = data.errorMessage + query.key + " is greater than expected value " + query.checkValue + ". ";
            }
            else if( query.checkType == "greater than" && data[query.key] <= query.checkalue ){
              data.error = true;
              data.errorMessage = data.errorMessage + query.key + " is less than expected value " + query.checkValue + ". ";
            }
          }
        })
      })
      conn.end( function( err ){
        io.emit( 'update', data );
      })
    }
  })
}
function monitorWebServer( conf ){
  setInterval( function(){
    req(conf.url, function( error, response, body ){
      if( !error && response.statusCode ){
        if( response.statusCode != "200" )
          console.log( body );
        io.emit( 'update', {
          url: conf.url,
          id: conf.id,
          status: response.statusCode,
          error: (response.statusCode != conf.expectedValue),
          lastChecked: new Date().toLocaleTimeString()
        })
      }
      else{
        io.emit( 'update', { url: conf.url, error: true, id: conf.id, status: "XXX", lastChecked: new Date().toLocaleTimeString()})
      }
    })
  }, 3000)

}
module.exports = io;
