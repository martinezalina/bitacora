angular.module('bit.services', [])
 .factory('Camera', ['$q', function($q) {
  return {
    getPicture: function(options) {
      var q = $q.defer();
      navigator.camera.getPicture(function(result) {
        //Do 
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);
      return q.promise;
    }
  }
}])
.factory('Bitacora', function() {
  return {
    all: function() {
      var tripString = window.localStorage['bitacora'];
      if(tripString) {
        return angular.fromJson(tripString);
      }
      return [];
    },
    save: function(bitacora) {
      window.localStorage['bitacora'] = angular.toJson(bitacora);
    },
    newTrip: function(tripTitle) {
      // Add a new trip
      return {
        title: tripTitle,
        posts: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveTrip']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveTrip'] = index;
    }
  }
})