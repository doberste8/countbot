"use strict";
// app/models/likes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const db = require("../../config/db");
function likes() {
    //get list of likes, filtered by message_id or user_id if specified.
    this.get = function (message_id, user_id, res) {
        db.acquire(function (err, con) {
            if (err)
                throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('select * from likes where message_id like ? and user_id like ?', [message_id, user_id], function (err, result) {
                con.release();
                if (err) {
                    // throw err;
                    console.error(err);
                    res.status(400).send({
                        status: 1,
                        message: 'Failed to get like matrix!',
                        error: err
                    });
                }
                else {
                    res.send(result);
                }
            });
        });
    };
    //get matrix of likes, filtered by startDate and endDate if specified.
    this.getMatrix = function (startDate, endDate, res) {
        db.acquire(function (err, con) {
            if (err)
                throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('call LikeMatrix(?,?)', [startDate, endDate], function (err, result) {
                con.release();
                if (err) {
                    // throw err;
                    console.error(err);
                    res.status(400).send({
                        status: 1,
                        message: 'Failed to get like matrix!',
                        error: err
                    });
                }
                else {
                    res.send(result);
                }
            });
        });
    };
    //create new like with provided data.
    this.create = function (data, res) {
        db.acquire(function (err, con) {
            if (err)
                throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('INSERT INTO likes (message_id, user_id) VALUES ? ON DUPLICATE KEY UPDATE message_id=message_id', [data], function (err, result) {
                con.release();
                if (err) {
                    // throw err
                    console.error(err);
                    res.status(400).send({
                        status: 1,
                        message: 'Item creation failed',
                        error: err
                    });
                }
                else {
                    res.status(200).send({
                        status: 0,
                        message: 'Item created successfully'
                    });
                }
            });
        });
    };
}
module.exports = new likes();
