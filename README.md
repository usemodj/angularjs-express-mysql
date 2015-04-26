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

- Run production mode:
```
// ngminify:
$ frontend> grunt build
$ frontend> mkdir dist/uploads

$ backend> NODE_ENV=production pm2 start ./bin/forever
```

## Login web server
````
URL:  http://localhost:3000
Login Email: admin@nodesoft.co.kr
Login Password: admin


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
ref. Yeoman + Express + Angular = Full-Stack Workflow
	http://blog.omkarpatil.com/

The process is quite simple and involves generating an application using Yeoman Angular generator in the usual manner and then a little modification of Gruntfile.js. Here are the steps - 

1. Create an Angular application using Yeoman Angular generator in usual way.

2. Install express, grunt-contrib-watch and grunt-express-server using npm install and use the save flags as shown below so that the package.json file is updated automatically.

```
npm install express --save
npm install grunt-contrib-watch --save-dev
npm install grunt-express-server --save-dev
```

3. Uninstall grunt-contrib-livereload, grunt-regarde and grunt-contrib-connect using npm uninstall. These are not needed anymore and the plugins installed in previous step will provide the necessary functionality.

```
npm uninstall grunt-contrib-livereload --save-dev
npm uninstall grunt-regarde --save-dev
npm uninstall grunt-contrib-connect --save-dev
```

4. Now comes the modification of Gruntfile.js file. You'll need to remove configuration related to the plugins mentioned in the previous step and add configuration for plugins added in step 1. You can find the exact changes in the embedded gist by doing a diff between revisions.

5. Add an Express server at the root of the directory. You can take server.js from the gist and build upon it. 	


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
