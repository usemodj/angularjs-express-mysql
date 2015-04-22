var path = require('path');
//console.log(process.env);
var settings = {

    upload_path: (process.env.NODE_ENV == 'production')? path.normalize(path.join(__dirname, './../../frontend/dist/uploads/'))
                    : path.normalize(path.join(__dirname, './../../frontend/app/uploads/')),
    port: process.env.NODE_PORT || 3000,
    database: {
        protocol: "mysql", // or  "postgresql"
        query: {
            debug: false, //prints queries to console
            pool: true
        },
        host: "127.0.0.1",
        port: 3306,
        database: "nodestore2",
        user: "root",
        password: "root",
        timezone: "Asia/Seoul"
    }
};

module.exports = settings;
