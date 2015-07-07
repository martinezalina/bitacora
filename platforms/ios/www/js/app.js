angular.module('bit', ['ionic','ngCordova', 'bit.services', 'bit.controllers'])

  .config(function($stateProvider, $urlRouterProvider) {
  
    $stateProvider
  
    .state('home', {
      url: '/',
      templateUrl: 'templates/my-list.html',
      controller: 'bitacoraCtrl'
    });
  
    $urlRouterProvider.otherwise('/');
  
  });