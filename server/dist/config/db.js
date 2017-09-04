// server/config/db.ts
const mysql = require('mysql');
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbDatabase = process.env.DB_DATABASE;
function Connection() {
    this.pool = null;
    this.init = function () {
        this.pool = mysql.createPool({
            connectionLimit: 20,
            host: dbHost,
            user: dbUser,
            password: dbPassword,
            database: dbDatabase,
            charset: 'UTF8MB4'
        });
    };
    this.acquire = function (callback) {
        this.pool.getConnection(function (err, connection) {
            callback(err, connection);
        });
    };
}
module.exports = new Connection();
