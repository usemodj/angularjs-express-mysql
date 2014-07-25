'use strict';

angular.module('frontendApp')
  .controller('AdminUserCtrl', ['$scope', '$http','$state', '$stateParams', 'UserFactory', 'RoleFactory',
        function ($scope, $http, $state, $stateParams, UserFactory, RoleFactory) {
    $scope.page = $stateParams.page;
    $scope.data = {};
    $scope.conditions = {};

    RoleFactory.query(function(roles){
        //console.log('>>RoleFactory:'+ JSON.stringify(roles));
        $scope.roles = roles;
    });

    $scope.pageChanged = function() {

        $scope.searchUsers();
        //$state.go('admin.user.home',{page: $scope.page});
        //$location.path('/users/page/'+$scope.page);
    };

//    $scope.listUsers = function() {
//        $http.get('/users/page/'+$scope.page).success(function(results){
//            //console.log('>>results:'+ JSON.stringify(results));
//            $scope.data.users = results.users;
//            $scope.totalItems = results.count;
//            $scope.page = results.page;
//        });
//    };
/*
    $scope.deleteUser = function(user) {
        user.$delete().then(function(){
            $scope.data.users.splice($scope.users.indexOf(user), 1);
        });
        $location.path('/admin/users/');
    };

    $scope.createUser = function(user){
        new UserFactory(user).$save().then(function(newUser){
            $scope.data.users.push(newUser);
            $location.path('/admin/users');
        })
    };
*/
    $scope.searchUsers = function(){
        $http.post('/users/page/'+$scope.page,{
            email: $scope.conditions.email,
            role_id: $scope.conditions.role_id,
            active: $scope.conditions.active
        }).success(function(results, status){
            console.log('>> status:'+ status);
            $scope.data.users = results.users;
            $scope.totalItems = results.count;
            $scope.page = results.page;
        });
    };

    $scope.searchUsers();
  }])
    .controller('UserEditCtrl', ['$scope', '$state', '$stateParams', 'AuthFactory', 'UserFactory', 'user', 'roles',
        function ($scope, $state, $stateParams, AuthFactory,UserFactory, user, roles) {
        $scope.currentUser = user;
        $scope.roles = roles;
        $scope.page = $stateParams.page;

        $scope.updateRole = function(){
            console.log('>> currentUser:'+ JSON.stringify($scope.currentUser));
            AuthFactory.changeRole({
                id: $scope.currentUser.id,
                email: $scope.currentUser.email,
                role_id: $scope.currentUser.role_id,
                active: $scope.currentUser.active
            }, function(err) {
                if(err){
                    console.log('>> changeRole error: ');
                    console.log(err);
                } else {
                    //$state.go('admin.user.home');
                    $state.go('admin.users.list',{page: $scope.page});
                }
            });
        };

//        $scope.updateUserRole = function(user){
//            //user.$update({role_id: user.role_id});
//            //user.$update();
//            UserFactory.update({
//                id: user.id,
//                email: user.email,
//                role_id: user.role_id,
//                active: user.active
//            }, function(user) {
//                console.log('updateUserRole changed');
//                console.log('>> user: ' + user);
//
//            }, function(err) {
//                console.log('>> updateUserRole error: ');
//                console.log(err);
//
//            });
//
//            //$location.path('/admin/users');
//            //$state.go('admin.users.list');
//        };

//        $scope.editUser = function(user){
//            $scope.currentUser = user;
//            $state.go('/admin/users/edit',{id: user.id});
//
//        };

//        $scope.saveEdit = function(user){
//            if(angular.isDefined(user.id)){
//                $scope.updateUser(user);
//            } else {
//                $scope.createUser(user);
//            }
//            $scope.currentUser = {};
//        };

        $scope.cancelEdit = function(){
            if($scope.currentUser && $scope.currentUser.$get){
                $scope.currentUser.$get();
            }
            $scope.currentUser = {};
            //$location.path('/admin/users');
            //$state.go('admin.users.list');
            $state.go('admin.users.list',{page: $scope.page});
        };

    }]);
