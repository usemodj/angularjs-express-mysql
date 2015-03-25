angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('ko', {"Forums":"포럼","Login":"로그인","My Order":"내주문","Signup":"회원가입"});
/* jshint +W100 */
}]);