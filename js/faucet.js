app.controller('FaucetCtrl', function($scope, $timeout, $q, $http) {
  $scope.demoGet = function() {
    $scope.demoGetResp = -1;
    $http.get("http://faucet.royalforkblog.com").success(function(data, status, headers, config) {
      $scope.demoGetResp = {
        code: status,
        url: "http://faucet.royalforkblog.com",
        resp: data 
      };
    }).error(function(data, status, headers, config) {
      alert("Error with request. Please contact site administrator.");
    });
  };
  $scope.demoPost = function() {
    $scope.demoPostResp = -1;
    var post = $scope.post || {};
    $http.post("http://faucet.royalforkblog.com", {"address": post.address, "amount": post.amount}).success(function(data, status, headers, config) {
      $scope.demoPostResp = {
        code: status,
        url: "http://faucet.royalforkblog.com",
        resp: data 
      };
    }).error(function(data, status, headers, config) {
      $scope.demoPostResp = {
        code: status,
        url: "http://faucet.royalforkblog.com",
        resp: data 
      };
    });
  };
});
