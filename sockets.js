'use strict';
var io = require( 'socket.io' )();
var req = require( 'request' );
var fs = require( 'fs' );
var url = "http://localhost:3001"
var config = JSON.parse( fs.readFileSync( __dirname + "/config/monitor.json", "utf8" ) );
var mysql = require( 'mysql' );
var exec = require( 'child_process').exec;
var commify = require( "comma-it" );


config.sections.forEach( function( section ){
  section.items.forEach( function( item ){
    if( item.type == "web" ){
      monitorWebServer( section,item );
    }
    else if( item.type = "mysqldb" ){
      monitorMysqlDb( section, item );
    }
  })
})

function shellCommand( cmd, cb ){
  exec( cmd, function( err, stdout, stderr ){
    cb( stdout );
  });
}

function monitorMysqlDb( section, conf ){
  setInterval(function(){
    var conn = mysql.createConnection({ user: conf.connect.user, password: conf.connect.password, host: conf.connect.host, port: conf.connect.port })
    var data = { id: conf.id }
    section.keys.forEach( function( key ){
      data[key] = conf[key];
    })
    conn.connect(function(error){
      if( error ){
        data.error = true;
        data.errorMessage = "ERROR: Unable to connect to database";
        data.lastChecked = new Date().toLocaleTimeString();
        io.emit( 'update', data)
      }
      else{
        data.error = false;
        data.errorMessage = "";
        conf.queries.forEach( function( query ){
          conn.query( query.sql, function( err, rows, fields ){
            if( !err ){
              data.lastChecked = new Date().toLocaleTimeString();
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
            else{
              console.log( err.stack );
            }
          })
        })
        conn.end( function( err ){
          if( conf.checkReplicationDelay ){
            shellCommand( conf.replicationDelayCmd, function( delay ){
              data.delay = commify(delay, {thousandSeperator: ',', decimalSeperator: "." } ) + " seconds";
              if( delay > conf.maxDelay ){
                data.error = true;
                data.errorMessage = "ERROR: Replication delay is greater than max allowed value: " + conf.maxDelay + " seconds";
              }
              data.lastChecked = new Date().toLocaleTimeString();
              io.emit( 'update', data );
            })
          }
          else{
            data.lastChecked = new Date().toLocaleTimeString();
            io.emit( 'update', data );
          }
        })
      }
    })
  },5000 );
}
function monitorWebServer( section, conf ){
  setInterval( function(){
    var data = { id: conf.id }
    section.keys.forEach( function( key ){
      data[key] = conf[key];
    })
    req.head(conf.url, function( error, response, body ){
      if( !error && response.statusCode ){
        data.status = response.statusCode;
        data.error = (response.statusCode != conf.expectedValue );
        data.lastChecked = new Date().toLocaleTimeString();
        io.emit( 'update', data );
      }
      else{
        data.error = true;
        data.status = 'XXX';
        data.lastChecked = new Date().toLocaleTimeString();
        io.emit( 'update', data );
      }
    })
  }, 3000)

}
module.exports = io;
