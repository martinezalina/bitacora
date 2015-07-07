angular.module('bit.controllers', [])
.controller('bitacoraCtrl', function($scope, $ionicModal, Bitacora, Camera, $ionicSideMenuDelegate, $timeout, $ionicPopup, $ionicActionSheet,  $ionicLoading, $compile, $cordovaSocialSharing) {
 
  // new post
  $ionicModal.fromTemplateUrl('templates/new-post.html', function(modal) {
    $scope.postModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  // edit post
  $ionicModal.fromTemplateUrl('templates/edit-post.html', function(modal) {
    $scope.editPostModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });
  
  // view post
  $ionicModal.fromTemplateUrl('templates/post-detail.html', function(modal) {
    $scope.viewPostModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-right'
  });

  //edit trip
  $ionicModal.fromTemplateUrl('templates/edit-viaje.html', function(modal) {
    $scope.editTripModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  // Load or initialize Bitacora
  $scope.bitacora = Bitacora.all();

  // New trip with tripTitle
  var createTrip = function(tripTitle) {
    var newTrip = Bitacora.newTrip(tripTitle);
    $scope.bitacora.push(newTrip);
    Bitacora.save($scope.bitacora);
    $scope.selectTrip(newTrip, $scope.bitacora.length-1);
  };

  // Grab the last active, or the first trip
  $scope.activeTrip = $scope.bitacora[Bitacora.getLastActiveIndex()];

  // Called to create a new trip
  $scope.newTrip = function() {
    var tripTitle = prompt('Viaje');
    if(tripTitle) {
      createTrip(tripTitle);
    }
  };

  // Called to select the given trip
  $scope.selectTrip = function(trip, index) {
    $scope.activeTrip = trip;
    Bitacora.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
  };


  // Called when the form is submitted
  $scope.createPost = function(post) {
    if (!$scope.activeTrip || !post) {
      return;
    }
    
    $scope.activeTrip.posts.push({
      comentario: post.comentario,
      createDate: (new Date()).toISOString(),
      lat:$scope.lat,
      lng:$scope.lng,
      ubicacion:$scope.city +', '+$scope.country,
      imageURI:$scope.imageURI
    });
    $scope.postModal.hide();

    $scope.orderTripPosts($scope.activeTrip);
    Bitacora.save($scope.bitacora);
    post.comentario = "";
    $scope.imageURI = "";
    $scope.lat = "";
    $scope.lng = "";
    $scope.city = "";
    $scope.country = "";
  };

// Called when the form is submitted
  $scope.updatePost = function(i, post) {
    if (!$scope.activeTrip || !post) {
      return;
    }
    $scope.activeTrip.posts[i] = post;
    $scope.editPostModal.hide();

    $scope.orderTripPosts($scope.activeTrip);
    Bitacora.save($scope.bitacora);
  };

  // Open our new post modal
  $scope.newPost = function() {
    var onSuccessGeo = function(position) {
      $scope.lat = position.coords.latitude;
      $scope.lng = position.coords.longitude;
      //console.log('init latlng')


       geocoder = new google.maps.Geocoder();

      latlng =  new google.maps.LatLng($scope.lat,$scope.lng)
      geocoder.geocode({'latLng': latlng}, function(results, status) {
     
      if (status == google.maps.GeocoderStatus.OK) { // Si todo salió bien
        if (results[0]) {
          var arrAddress = results[0].address_components;
          arrAddress.forEach(function(address_component) {
            if (address_component.types[0] == "locality") {
              $scope.city = address_component.long_name;
            } else if (address_component.types[0] == "country") {
              $scope.country = address_component.long_name;
            }
            
          });
        } else {
          // ¡No se encontraron resultados!
        }
      } else {
        // Geocoder falló
      }
    });

    };
    function onErrorGeo(error) {
       alert('Unable to get location: ' + error.message);
    }
    navigator.geolocation.getCurrentPosition(onSuccessGeo, onErrorGeo);
    

    $scope.post = {comentario:""};
    $scope.postModal.show();
  };

  // Open our new post modal
  $scope.editPost = function(i, post) {
    $scope.post = {comentario: post.comentario, createDate: post.createDate, lat:post.lat, lng:post.lng, myPic:post.myPic};
    $scope.postIndex = i;
    $scope.editPostModal.show();
  };


 


  //Mostrar en pagina 
  $scope.viewPost =  function(i, post) {
      $scope.post = {comentario: post.comentario, createDate: post.createDate, lat:post.lat, lng:post.lng, myPic:post.myPic};
      $scope.postIndex = i;
 
     
     
      $scope.viewPostModal.show();
      var mapOptions = {
        center: { lat: post.lat, lng:post.lng}, zoom: 14
      };
      var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  };


  

  // A confirm dialog delete post
  $scope.showConfirm = function(onYes, onNo) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Borrar Post',
     template: 'Estas seguro?'
   });
   confirmPopup.then(function(res) {
     if(res) {
       onYes();
     } else {
       if (onNo)
        onNo();
     }
   });
  };

  // delete selected post
  $scope.deletePost = function(i, post) {
    if (!$scope.activeTrip || !post ) {
      return;
    }
    console.log("start deleting");
    $scope.showConfirm(function() {
      console.log("confirmed to delete post "+i);
      $scope.activeTrip.posts.splice(i,1);
      Bitacora.save($scope.bitacora);
    });
    $scope.viewPostModal.hide();
  } 

  // Close the new post modal
  $scope.closeNewPost = function() {
    $scope.postModal.hide();
  };

  // Close the edit post modal
  $scope.closeEditPost = function() {
    $scope.editPostModal.hide();
  };

  // Close the view post modal
  $scope.closeViewPost = function() {
    $scope.viewPostModal.hide();
  };

  // Close the edit trip modal
  $scope.closeEditTrip = function() {
    $scope.editTripModal.hide();
  };

  $scope.toggleProjects = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  // Open our edit trip modal
  $scope.editTrip = function(i, trip) {
    $scope.trip = {title: $scope.bitacora[i].title, posts: $scope.bitacora[i].posts};
    $scope.tripIndex = i;
    $scope.editTripModal.show();
  };
  

   // Called when the form is submitted
  $scope.updateTrip = function(i, trip) {
    if (!$scope.bitacora || !trip) {
      return;
    }
    $scope.bitacora[i] = trip;
    $scope.editTripModal.hide();
    Bitacora.save($scope.bitacora);
  };

  // Called to select the given trip
  $scope.orderTripPosts = function(trip) {
    /*
    var orderBy = $filter('orderBy');
    $scope.predicate = 'createDate';
    $scope.reverse = true;
    trip.posts = orderBy(trip.posts,$scope.predicate,$scope.reverse);
    */
  };


  // delete selected trip
  $scope.deleteTrip = function(i, trip) {
    if (!$scope.activeTrip || !trip ) {
      return;
    }
    console.log("start deleting");
    $scope.showConfirm('Borrar Viaje', 'Estas seguro?',function() {
      console.log("confirmed to delete trip and all its posts "+i);
      $scope.bitacora.splice(i,1);
      Bitacora.save($scope.bitacora);
    });
  };

  // delete selected post
  $scope.deletePost = function(i, post) {
    if (!$scope.activeTrip || !post ) {
      return;
    }
    console.log("start deleting");
    $scope.showConfirm('Borrar Post', 'Estas seguro?', function() {
      console.log("confirmed to delete post "+i);
      $scope.viewPostModal.hide();
      $scope.activvieTrip.posts.splice(i,1);
      Bitacora.save($scope.bitacora);
    }); 
  };

  // A confirm dialog
  $scope.showConfirm = function(title, message, onYes, onNo) {
   var confirmPopup = $ionicPopup.confirm({
     title: title,
     template: message
   });
   confirmPopup.then(function(res) {
     if(res) {
       onYes();
     } else {
       if (onNo)
        onNo();
     }
   });
  };


  
  

  // Imagenes
  $scope.getPhoto = function(i, post) {
    if (!$scope.activeTrip || !post ) {
      return;
    }
    $scope.postIndex = i;
    console.log(post.comentario);
    Camera.getPicture({
      quality: 100,
      targetWidth: 320,
      targetHeight: 320,
      saveToPhotoAlbum: true
    }).then(function(imageURI) {
      console.log(imageURI);
      //$scope.lastPhoto = imageURI;
      
      $scope.activeTrip.posts[i].myPic = imageURI;
      
      Bitacora.save($scope.bitacora);
    }, function(err) {
      console.err(err);
    });
    //$scope.viewPostModal.hide();
    //$scope.viewPost(i, post);
  };

  $scope.addPhoto = function(){
    Camera.getPicture({
      quality: 100,
      targetWidth: 320,
      targetHeight: 320,
      saveToPhotoAlbum: true
    }).then(function(imageURI) {
      $scope.imageURI = imageURI;
    }, function(err) {
      console.err(err);
    });
    return false;
  };



  /* Share */
  $scope.shareAnywhere = function() {
    var message = $scope.post.comentario;
    var image = $scope.post.myPic;
    var link = "";
    $cordovaSocialSharing.share(message, image, link);
  }
  /******/


  $timeout(function() {
      if($scope.bitacora.length == 0) {
        while(true) {
          var tripTitle = 'Mi Viaje';
          if(tripTitle) {
            createTrip(tripTitle);
            break;
          }
        }
      }
    });



  })

.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {
      function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(43.07493, -89.381388),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map($element[0], mapOptions);
  
        $scope.onCreate({map: map});

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });
      }

      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
});



