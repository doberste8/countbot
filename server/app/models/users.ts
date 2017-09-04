// app/models/users.js

import * as db from '../../config/db';

function users() {

    //get list of users, filtered by name or id if specified.
    this.get = function(id, name, res) {
        db.acquire(function(err, con) {
            if (err) throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('select * from users where id like ? and name like ?', [id, name],
                function(err, result) {
                    con.release();
                    if (err) {
                        // throw err;
                        console.error(err);
                        res.status(400).send({
                            status: 1,
                            message: 'Failed to get users!',
                            error: err
                        });
                    } else {
                        res.send(result);
                    }
                });
        });
    };

    //create new user with provided data.
    this.create = function(data, res) {
        db.acquire(function(err, con) {
            if (err) throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('INSERT INTO users (id, name) VALUES ? ON DUPLICATE KEY UPDATE name=VALUES(name)', [data],
                function(err, result) {
                    con.release();
                    if (err) {
                        // throw err
                        console.error(err);
                        res.status(400).send({
                            status: 1,
                            message: 'Item creation failed',
                            error: err
                        });
                    } else {
                        res.status(200).send({
                            status: 0,
                            message: 'Item created successfully'
                        });
                    }
                });
        });
    };

    //update user with provided data.
    this.update = function(data, res) {
        db.acquire(function(err, con) {
            if (err) throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('UPDATE users SET ? WHERE id like ?', [data, data.id],
                function(err, result) {
                    con.release();
                    if (err) {
                        // throw err
                        console.error(err);
                        res.status(400).send({
                            status: 1,
                            message: 'Item creation failed',
                            error: err
                        });
                    } else {
                        res.status(200).send({
                            status: 0,
                            message: 'Item created successfully'
                        });
                    }
                });
        });
    };

}

module.exports = new users();