angular.module( 'monitorApp', [ ] )
.controller( 'monitorCtrl', function( $scope, $http, socket ){
  socket.on( 'update', function( data ){
    $scope.counter = data.counter;
    $scope.statusCode = data.status;
    $scope.urlName = data.url;
  })
  $scope.checkUrl = function(){
    $http.post( 'webstatus', { url: $scope.url }).success( function( data ){
      $scope.urlName = $scope.url;
      $scope.statusCode = data.status;
    })
  }
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
