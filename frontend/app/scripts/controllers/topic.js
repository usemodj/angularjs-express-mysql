'use strict';

angular.module('frontendApp')
    .controller('TopicCtrl', ['$scope', '$state', '$stateParams', 'topics', function ($scope,$state, $stateParams, topics) {
        $scope.page = $stateParams.page;
        $scope.data = {};
        $scope.conditions = {};

        $scope.pageChanged = function() {
            $scope.searchForums();
            //$state.go('admin.user.home',{page: $scope.page});
            //$location.path('/users/page/'+$scope.page);
        };

        $scope.sticky = function(item){
            item.sticky = true;
            topics.setSticky(item, function(err){

            });
        };
        $scope.unsticky = function(item){
            item.sticky = false;
            topics.setSticky(item, function(err){

            });
        };

        $scope.searchTopics = function(form){
            topics.searchTopics({
                forum_id: $stateParams.forum_id,
                name: $scope.conditions.name,
                email: $scope.conditions.email,
                page: $scope.page
            }, function(err, data){
                //console.log('>> data:'+ JSON.stringify(data));
                if(!err && err === null) {
                    $scope.data.forums = data.forums;
                    $scope.data.sticky_topics = data.sticky_topics;
                    $scope.data.topics = data.topics;
                    $scope.totalItems = data.count;
                    $scope.page = data.page;
                }
            });
        };

        $scope.searchTopics();
    }])
    .controller('NewTopicCtrl', ['$scope', '$state', '$stateParams', 'topics', function ($scope,$state, $stateParams, topics) {
        $scope.newTopic = {};

//        topics.getForums($stateParams.forum_id, function( err, data){
//            $scope.forums = data;
//        });

        $scope.addTopic = function(form){
            $scope.newTopic.forum_id = $stateParams.forum_id;
            topics.save($scope.newTopic, function(err, data){
                //console.log('>> data:'+ JSON.stringify(data));
                if(err) {
                    $scope.error = err;
                } else {
                    $state.go('forums.topics.list', {forum_id: $stateParams.forum_id});
                }
            });
        };


    }])
    .controller('ViewTopicCtrl', ['$scope', '$state', '$stateParams', 'topics', function ($scope,$state, $stateParams, topics) {
        $scope.data = {};

//        forums.getAncesters($stateParams.forum_id, function( err, data){
//            $scope.forums = data;
//        });

        $scope.viewTopic = function(form){
            topics.get({
                forum_id: $stateParams.forum_id,
                id: $stateParams.id
            }, function(err, data){
                //console.log('>> data:'+ JSON.stringify(data));
                if(err) {
                    $scope.error = err;
                } else {
                    $scope.data = data;
                }
            });
        };

        $scope.replyPost = function(form){
            topics.replyPost({
                forum_id: $stateParams.forum_id,
                topic_id: $stateParams.id,
                name: $scope.newPost.name,
                content: $scope.newPost.content
            }, function(err, data){
                //console.log('>> data:'+ JSON.stringify(data));
                if(err) {
                    $scope.error = err;
                } else {
                    $scope.data = data;
                    $state.go('forums.topics.view',{forum_id: $stateParams.forum_id, id: $stateParams.id}, {reload:true});
                }
            });
        };
        $scope.deletePost = function(item){
            topics.deletePost( item, function(err, data){
                console.log('>> data:'+ JSON.stringify(data));
                if(err) {
                    $scope.error = err;
                } else {
                    $scope.data.posts.splice($scope.data.posts.indexOf(item),1);
                }
                console.log('test deletePost')
                $state.go('forums.topics.view',{forum_id: $stateParams.forum_id, id: $stateParams.id}, {reload:true});
            });
        };

        $scope.viewTopic();
    }]);
