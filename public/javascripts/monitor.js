angular.module( 'monitorApp', [ ] )
.controller( 'monitorCtrl', function( $scope, $http, socket ){
  socket.on( 'update', function( data ){
    $scope.data[data.id] = data;
  })
  $http.get( "/config" ).success( function( data ){
    $scope.title = data.title;
    $scope.sections = data.sections;
    $scope.data = {};
    data.sections.forEach( function( section ){
      section.items.forEach( function( item ){
        data[item.id] = {};
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
