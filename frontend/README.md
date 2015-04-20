
## bootstrap - AngularJS directives specific to Bootstrap
https://github.com/angular-ui/bootstrap

Install: bower install angular-bootstrap --save
index.html:
<script src="bower_components/angular-bootstrap/ui-bootstrap-tpls.js"></script>

app.js:
angular.module('myModule', ['ui.bootstrap']);

## angular-ui/ui-select2 - An AngularJS wrapper for select2
An AngularJS wrapper for select2

Install:
 $ bower install angular-ui-select2 --save
 $ bower install

app.js:
 var myAppModule = angular.module('MyApp', ['ui.select2']);

## angular-i18n locale

 $ bower install angular-i18n --save
index.html:
  <script src="bower_components/angular-i18n/angular-locale_ko.js"></script>

## ng-clip : Copy to clipboard using AngularJS
  https://github.com/asafdav/ng-clip
  
## angular-gettext
http://lostechies.com/gabrielschenker/2014/02/11/angularjspart-12-multi-language-support/
  $ bower install angular-gettext --save
 Usage: https://lostechies.com/gabrielschenker/2014/02/11/angularjspart-12-multi-language-support/
 
 1. frontend> grunt nggettext_extract
 
 2. Open template.pot file and translate text to local language:
  virtaal lang/template.pot   

 3. Save to 'lang/ko.po'
 
 4. frontend> grunt nggettext_compile
    update app/scripts/translations.js file

## Run production mode:
// ngminify
$ frontend> grunt build

### Ubuntu:
$ backend> NODE_ENV=production ./bin/forever

### Windows
// PowerShell 
$ backend> $env:NODE_ENV="production"
$ backend> node ./bin/forever

// cmd.exe
$ backend> set NODE_ENV=production
$ backend> node ./bin/forever

