"use strict";
// app/models/messages.ts
Object.defineProperty(exports, "__esModule", { value: true });
const db = require("../../config/db");
function messages() {
    //get list of messages, filtered by user_id, date range, and containing message text if specified.
    this.get = function (user_id, startDate, endDate, text, res) {
        db.acquire(function (err, con) {
            if (err)
                throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('SELECT * FROM messages WHERE user_id IN (SELECT id FROM users WHERE name LIKE ?) AND created_at BETWEEN ? AND ? AND text like ?', [user_id, startDate, endDate, text], function (err, result) {
                con.release();
                if (err) {
                    // throw err;
                    console.error(err);
                    res.status(400).send({
                        status: 1,
                        message: 'Failed to get messages!',
                        error: err
                    });
                }
                else {
                    res.send(result);
                }
            });
        });
    };
    //get count of messages, filtered by user_id, date range, and containing message text if specified.
    this.getCount = function (userName, startDate, endDate, queryText, userId, res) {
        queryText = queryText.replace(/\'/, "''"); //expand support for all mysql escape sequences needed
        console.log(queryText);
        db.acquire(function (err, con) {
            if (err)
                throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('CALL GetCounts(?,?,?,?,?)', [userName, startDate, endDate, queryText, userId], function (err, result) {
                con.release();
                if (err) {
                    // throw err;
                    console.error(err);
                    res.status(400).send({
                        status: 1,
                        message: 'Failed to get message counts!',
                        error: err
                    });
                }
                else {
                    res.send(result);
                }
            });
        });
    };
    //create new message with provided data.
    this.create = function (data, res) {
        db.acquire(function (err, con) {
            if (err)
                throw err; // You *MUST* handle err and not continue execution if
            // there is an error. this is a standard part of Node.js
            con.query('INSERT INTO messages (id, created_at, user_id, text) VALUES ? ON DUPLICATE KEY UPDATE id=id', [data], function (err, result) {
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
module.exports = new messages();
