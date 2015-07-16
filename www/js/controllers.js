angular.module('bit.controllers', [])
.controller('bitacoraCtrl', function(
  $scope,
  $ionicModal,
  Bitacora,
  Camera,
  $ionicSideMenuDelegate,
  $timeout,
  $ionicPopup,
  $ionicActionSheet,
  $ionicLoading,
  $compile,
  $cordovaSocialSharing) {
 
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


  //Inicia las variales lat, lng, city, country
  $scope.getUbicacion = function(){
    var onSuccessGeo = function(position) {
      $scope.lat = position.coords.latitude;
      $scope.lng = position.coords.longitude;
      
      geocoder = new google.maps.Geocoder();
      latlng =  new google.maps.LatLng($scope.lat,$scope.lng)
      geocoder.geocode({'latLng': latlng}, function(results, status) {
     
      if (status == google.maps.GeocoderStatus.OK) { // if ok
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
          //No se encontraron ciudades
          $scope.lat = "";
          $scope.lng = "";
          $scope.city = "";
          $scope.country = "";
        }
      } else { 
          //alert('Geocoder falló');
          $scope.lat = "";
          $scope.lng = "";
          $scope.city = "";
          $scope.country = "";
      }
    });

    }; //Fin onSuccessGeo
    function onErrorGeo(error) {
      $scope.lat = "";
      $scope.lng = "";
      $scope.city = "";
      $scope.country = "";
      alert('Unable to get location: ' + error.message);
    }
    navigator.geolocation.getCurrentPosition(onSuccessGeo, onErrorGeo);
  }

  // Called when Form is submitted
  $scope.createPost = function(post) {
    if (!$scope.activeTrip || !post) {
      return;
    }
    var ubicacion = '';
    if($scope.city){
        if($scope.country){
          ubicacion = $scope.city +', '+$scope.country;
        }
        else{
          ubicacion = $scope.city;
        }
    }
    else{
      if($scope.country){ ubicacion = $scope.country;}
      else{ ubicacion = '';}
    }
    var tienePic = false;
    if($scope.imageURI){tienePic = true;}
    var tieneMapa = false;
    if($scope.lat){tieneMapa = true;}

    $scope.activeTrip.posts.push({
      comentario: post.comentario,
      createDate: (new Date()).toISOString(),
      lat:$scope.lat,
      lng:$scope.lng,
      ubicacion: ubicacion,
      tienePic:tienePic,
      tieneMapa:tieneMapa,
      myPic:$scope.imageURI
    });
    $scope.postModal.hide();

    $scope.orderTripPosts($scope.activeTrip);
    Bitacora.save($scope.bitacora);
    
    post.comentario = "";
    post.myPic = "";
    $scope.imageURI ="";
  };

  // Open New PostModal
  $scope.newPost = function() {
    $scope.post = {comentario:"", myPic:""};
    $scope.imageURI = "";
    //alert('$scope.imageURI in newPost '+$scope.imageURI );
    $scope.postModal.show();
  };

  $scope.imageBlank = function(){
    $scope.imageURI = "./";
  };


  // Called when Form is submitted
  $scope.updatePost = function(i, post) {
    if (!$scope.activeTrip || !post) {
      return;
    }
    $scope.activeTrip.posts[i] = post;
    $scope.editPostModal.hide();

    $scope.orderTripPosts($scope.activeTrip);
    Bitacora.save($scope.bitacora);
  };

  // Open Edit PostModal
  $scope.editPost = function(i, post) {
    $scope.post = {
      comentario: post.comentario, 
      createDate: post.createDate, 
      lat:post.lat, 
      lng:post.lng, 
      ubicacion:post.ubicacion,
      tieneMapa:post.tieneMapa,
      tienePic:post.tienePic,
      myPic:post.myPic
    };
    $scope.postIndex = i;
    $scope.editPostModal.show();
  };




  //Open View PostModal 
  $scope.viewPost =  function(i, post) {
      $scope.post = {
        comentario: post.comentario,
        createDate: post.createDate, 
        ubicacion: post.ubicacion,
        tieneMapa:post.tieneMapa,
        lat:post.lat, lng:post.lng,
        tienePic: post.tienePic, 
        myPic:post.myPic
      };
      $scope.postIndex = i;
 
      $scope.viewPostModal.show();
    


      var myLatlng = new google.maps.LatLng(post.lat,post.lng);
      var mapOptions = {
        zoom: 16,
        center: myLatlng
      }
      /*
      var mapOptions = {
        center: { lat: post.lat, lng:post.lng}, zoom: 14
      };
      */
      var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);


      var marker = new google.maps.Marker({
        position: myLatlng,
          title:"Aqui"
      });

      // To add the marker to the map, call setMap();
      marker.setMap(map);
  };

   

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
    $scope.showConfirm('Eliminar', 'Estas seguro/a que deseas borrar el viaje?',function() {
      console.log("confirmed to delete trip and all its posts "+i);
      $scope.bitacora.splice(i,1);
      Bitacora.save($scope.bitacora);
    });
  };

  // Delete selected post
  $scope.deletePost = function(i, post) {
    if (!$scope.activeTrip || !post ) {
      return;
    }
    console.log("start deleting post");
    $scope.showConfirm('Eliminar', 'Estás seguro/a que deseas borrar la nota?', function() {
      console.log("confirmed to delete post "+i);
      $scope.viewPostModal.hide();
      $scope.activeTrip.posts.splice(i,1);
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
      $scope.activeTrip.posts[i].myPic = imageURI;
      Bitacora.save($scope.bitacora);
    },function(err) {
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
    $cordovaSocialSharing.share($scope.post.comentario, "Bitácora de Viaje", $scope.post.myPic, "");
  }

/*
<!-- start facebook on iOS (same as `shareViaFacebook`), if Facebook is not installed, the errorcallback will be invoked with message 'not available' -->
<button onclick="window.plugins.socialsharing.shareVia('com.apple.social.facebook', 'Message via FB', null, null, null, function(){console.log('share ok')}, function(msg) {alert('error: ' + msg)})">message via Facebook</button>
<!-- start twitter on iOS (same as `shareViaTwitter`), if Twitter is not installed, the errorcallback will be invoked with message 'not available' -->
<button onclick="window.plugins.socialsharing.shareVia('com.apple.social.twitter', 'Message via Twitter', null, null, 'http://www.x-services.nl', function(){console.log('share ok')}, function(msg) {alert('error: ' + msg)})">message and link via Twitter on iOS</button>

 $scope.whatsappShare=function(){
    window.plugins.socialsharing.shareViaWhatsApp('Digital Signature Maker', img, "https://play.google.com/store/apps/details?id=com.prantikv.digitalsignaturemaker", null, function(errormsg){alert("Error: Cannot Share")});
  }
   $scope.twitterShare=function(){
    window.plugins.socialsharing.shareViaTwitter('Digital Signature Maker', img, 'https://play.google.com/store/apps/details?id=com.prantikv.digitalsignaturemaker', null, function(errormsg){alert("Error: Cannot Share")});
  }
   $scope.OtherShare=function(){
     window.plugins.socialsharing.share('Digital Signature Maker', null, null, 'https://play.google.com/store/apps/details?id=com.prantikv.digitalsignaturemaker');
  }
*/



  /******/
// Triggered on a button click, or some other target
 $scope.shareAla = function() {
   // Show the action sheet
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: '<b>Share</b> via Twitter' },
       { text: '<b>Share</b> via Facebook' },
       { text: '<b>Share</b> via Email' }
     ],
     titleText: 'Compartir',
     cancelText: 'Cancelar',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index, $scope, $cordovaSocialSharing) {
       if(index==0) {
         //Twitter
         //alert('tw');
         $cordovaSocialSharing.shareVia('com.apple.social.twitter', 
          $scope.post.comentario,
           null,
           $scope.post.myPic, 
          null,
          function(){console.log('share ok')}, function(msg) {alert('error: ' + msg)});

          //$cordovaSocialSharing.shareViaTwitter($scope.post.comentario, $scope.post.myPic, null);
       }
       if(index==1) {
        //Facebook
        //alert('via FB');
        $cordovaSocialSharing.shareViaFacebook(
        $scope.post.comentario,
        $scope.post.myPic,
        null);
       }
       if(index==2) {
        //Email
        //alert('via email');
        $scope.shareAnywhere();

       }
       /*
       if(index==3) {
        //Email
        //alert('via email');
        $cordovaSocialSharing.shareViaEmail($scope.post.comentario, 'Nota de Bitácora',null, null, null, $scope.post.myPic)
        //$cordovaSocialSharing.shareViaEmail($scope.post.comentario, 'Nota de Bitácora', null);
       }
       */
       return true;
     }
     /*
     ,
     destructiveButtonClicked: function() {
       alert("Hey All");
       return true;
     }
     */
   });

   // For example's sake, hide the sheet after two seconds
   $timeout(function() {
     hideSheet();
   }, 2000);

 };


/*

 $scope.shareAla = function() {
    var options = {
        'title': 'What do you want with this image?',
        'buttonLabels': ['Share via Facebook', 'Share via Twitter'],
        'addCancelButtonWithLabel': 'Cancel',
        'position': [20, 40] // for iPad pass in the [x, y] position of the popover
    };
    // Depending on the buttonIndex, you can now call shareViaFacebook or shareViaTwitter
    // of the SocialSharing plugin (https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin)
    window.plugins.actionsheet.show(options, callback);
  };
  */


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

/*
.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {
      function initialize() {
       
      $scope.onCreate({map: map});

      }

      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
});*/




