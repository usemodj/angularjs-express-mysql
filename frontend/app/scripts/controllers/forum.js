'use strict';

angular.module('frontendApp')
    .controller('ForumCtrl', ['$scope', '$state', '$stateParams', 'forums', function ($scope,$state, $stateParams, forums) {
        $scope.page = $stateParams.page;
        $scope.data = {};
        $scope.conditions = {};

        $scope.pageChanged = function() {
            $scope.searchForums();
            //$state.go('admin.user.home',{page: $scope.page});
            //$location.path('/users/page/'+$scope.page);
        };

        $scope.searchForums = function(form){
            forums.searchForums({
                name: $scope.conditions.name,
                description: $scope.conditions.description,
                page: $scope.page
            }, function(err, data){
                //console.log('>> data:'+ JSON.stringify(data));
                if(!err && err === null) {
                    $scope.data.forums = data.forums;
                    $scope.totalItems = data.count;
                    $scope.page = data.page;
                }
            });
        };

        $scope.searchForums();
    }])
