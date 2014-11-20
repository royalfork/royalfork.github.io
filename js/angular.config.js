var app = angular.module('app', [], function($interpolateProvider) {
  $interpolateProvider.startSymbol('``');
  $interpolateProvider.endSymbol('``');
});
