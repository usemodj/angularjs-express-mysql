var path = require('path');

var settings = {

    upload_path: path.normalize(path.join(__dirname, './../../frontend/app/uploads/')),
    port: process.env.NODE_PORT || 3000,
    database: {
        protocol: "mysql", // or  "postgresql"
        query: {
            debug: true, //prints queries to console
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
