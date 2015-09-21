## Install Backend Express module
Ubuntu:
```
$ sudo apt-get install nodejs npm imagemagick

$ sudo ln -s /usr/bin/nodejs /usr/bin/node
```

```
$ cd backend
$ backend> npm install
```

## Install Frontend AngularJS module
- Install bower:

 $ sudo npm install -g bower

```
$ cd ../frontend
$ frontend> npm install
$ frontend> bower install
$ frontend> mkdir app/uploads
```

- Setting site info:
```
$ frontend> vi app/scripts/common/settings.js
```

- Paygate Card Payment Infomation:
```
$ frontend> vi app/views/partials/orders/orders.paygate.html

 <input type="hidden" name="mid" value="CHANGE_TO_PAYGATE_MERCHANT_ID" /><!--Merchant ID-->

```

## Run server to backgroud
- Create database:
```
CREATE DATABASE nodesoft2 DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
```

-- Setting Database Info:
```
$ backend> vim config/settings.js
   ...
    database: {
        database: "nodesoft2",
        user: "root",
        password: "",
    }
   ...
```

- Install pm2, production process manager for NodeJS applications:
```
$ sudo npm install -g pm2 grunt grunt-cli

$ backend> pm2 start ./bin/forever
```

- Run production mode:
```
// ngminify:
$ frontend> grunt build
$ frontend> mkdir dist/uploads

$ backend> NODE_ENV=production pm2 start ./bin/forever
$ backend> NODE_ENV=production pm2 list
$ backend> NODE_ENV=production pm2 stop forever

```

## Login web server

```
URL:  http://localhost:3000
Login Email: admin@example.com
Login Password: admin
```

## Demo Site

[nodesoft.co.kr](http://nodesoft.co.kr)


---------------------
On Windows:

 - Install grunt-cli instead of grunt

 $ npm install -g grunt-cli

## Grunt test

```
$ grunt 
$ grunt test
```
## Run Grunt server

```
$ grunt serve
```

Browser connection

 http://localhost:9000



---------------
## Yeoman AngularJS Generator
Available generators:

angular (aka angular:app)
angular:controller
angular:directive
angular:filter
angular:route
angular:service
angular:provider
angular:factory
angular:value
angular:constant
angular:decorator
angular:view


### yo angular:factory [options] <name>

```
Usage:
  yo angular:factory [options] <name>

Options:
  -h,   --help    # Print generator's options and usage  Default: false
        --coffee  # Description for coffee               Default: false

Arguments:
  name  # Type: String  Required: true
```

> $ yo angular:factory  UserFactory

### yo angular:controller [options] <name>

```
Usage:
  yo angular:controller [options] <name>

Options:
  -h,   --help    # Print generator's options and usage  Default: false
        --coffee  # Description for coffee               Default: false

Arguments:
  name  # Type: String  Required: true
```
