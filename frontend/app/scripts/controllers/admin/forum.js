'use strict';

angular.module('frontendApp')
  .controller('AdminForumCtrl', ['$scope', '$state', '$stateParams', 'forums', function ($scope,$state, $stateParams, forums) {
    $scope.page = $stateParams.page;
    $scope.data = {};
    $scope.conditions = {};

    $scope.deleteForum = function(item){
        forums.remove(item);
        //$scope.data.forums.splice($scope.data.forums.indexOf(item), 1);
        $state.go('admin.forums.list',{}, {reload: true});
    };

    $scope.rebuildTree = function(){
        forums.rebuildTree(function(err, data){
            if(err) $scope.error = err;
        });
        $state.go('admin.forums.list', {page: $scope.page},{reload: true});
    };

    $scope.pageChanged = function() {

        $scope.searchForums();
        //$state.go('admin.user.home',{page: $scope.page});
        //$location.path('/users/page/'+$scope.page);
    };

    $scope.searchForums = function(form){
        forums.searchForums({
            name: $scope.conditions.name,
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
    .controller('NewForumCtrl', ['$scope', '$state', '$stateParams', 'forums', function ($scope,$state, $stateParams, forums) {
        $scope.page = $stateParams.page;
        $scope.newForum = {
            id: $stateParams.id
        };

        $scope.addForum = function(myform) {

            forums.addForum($scope.newForum, function(err, data){
                if(err){
                    console.log(err);
                    $scope.error = err;
                } else {
                    $state.go('admin.forums.list', {page: $scope.page});
                }
            });
        };

    }])
    .controller('EditForumCtrl', ['$scope', '$state', '$stateParams', 'forums', function ($scope,$state, $stateParams, forums) {
        $scope.page = $stateParams.page;
        $scope.forum = {
            id: $stateParams.id
        };

        forums.get({id:$stateParams.id}, function(err, data){
            $scope.forum = data;

        });


        $scope.updateForum = function(myform) {
            forums.update($scope.forum, function(err, data){
                if(err){
                    console.log(err);
                    $scope.error = err;
                } else {
                    $state.go('admin.forums.list', {page: $scope.page});
                }
            });
        };


    }]);
