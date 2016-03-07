angular.module( 'monitorApp', [ ] )
.controller( 'monitorCtrl', function( $scope, $http, socket ){
  $scope.data = {};
  $scope.sections = [];
  $scope.title = "";
  socket.on( 'update', function( data ){
    $scope.data[data.id] = data;
  })
  $http.get( "/config" ).success( function( data ){
    $scope.title = data.title;
    $scope.sections = data.sections;
    data.sections.forEach( function( section ){
      section.items.forEach( function( item ){
        $scope.data[item.id] = {};
        section.keys.forEach( function( key ){
          $scope.data[item.id][key] = item[key];
        })
      })
    })
  })
})
.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
})
