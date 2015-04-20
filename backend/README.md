# Express backend server
## Install Express' application generator.
https://github.com/expressjs/generator

$ sudo npm install -g express-generator

## Generate expressjs project
$ express backend && cd backend

## Install dependencies:

$ npm install

## Start express server

$ npm start
or
$ ./bin/forever

or production mode:
$ NODE_ENV=production ./bin/forever

or development environment:
$ nodemon ./bin/forever

## Install node packages

$ npm install mysql --save

$ npm install orm --save

$ npm install crypto --save

$ npm install connect-multiparty --save

## GraphicMagick
First install either GraphicsMagick or ImageMagick. Then:
$ npm install gm --save