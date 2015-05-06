angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('ko', {"Forums":"포럼","Support":"지원","Login":"로그인","My Order":"내주문","News":"뉴스","Signup":"회원가입"});
/* jshint +W100 */
}]);