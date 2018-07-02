// server/app/routes/api.ts

const api = require('express').Router();
import * as likes from '../models/likes';
import * as bot from '../models/bot';
import * as messages from '../models/messages';
import * as users from '../models/users';

// middleware for all api requests
api.use(function(req, res, next) {
    // console.log('API');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

api.route('/')

    .post(function(req, res) {
        bot.updateDB(req.body, res);
    });
    
api.route('/messages')

    .get(function(req, res) {
        let id = '%';
        let text = '%';
        if (req.query.id) id = req.query.id;
        if (req.query.text) text = req.query.text;
        messages.get(id, text, res);
    })
  
    .post(function(req, res) {
        messages.create(req.body, res);
    });

api.route('/messages/count')

    .get(function(req, res) {
        let userName = '%';
        let startDate = '00000000';
        let endDate = new Date().toISOString();
        let queryText = '%';
        let userId = '%';
        if (req.query.user_name) userName = req.query.user_name;
        if (req.query.start_date) startDate = req.query.start_date;
        if (req.query.end_date) endDate = req.query.end_date;
        if (req.query.query_text) queryText = req.query.query_text;
        if (req.query.user_id) userId = req.query.user_id;
        // console.log('Server-side: ', userName, startDate, endDate, queryText, userId);
        messages.getCount(userName, startDate, endDate, queryText, userId, res);
    });

api.route('/users')

    .get(function(req, res) {
        let id = '%';
        let name = '%';
        if (req.query.id) id = req.query.id;
        if (req.query.name) name = req.query.name;
        users.get(id, name, res);
    })
    
    .post(function(req, res) {
        users.create(req.body, res);
    })
    
    .put(function(req, res) {
        users.update(req.body, res);
    });
    
api.route('/likes')

    .get(function(req, res) {
        let message_id = '%';
        let user_id = '%';
        if (req.query.message_id) message_id = req.query.message_id;
        if (req.query.user_id) user_id = req.query.user_id;
        likes.get(message_id, user_id, res);
    })
  
    .post(function(req, res) {
        likes.create(req.body, res);
    });

api.route('/likes/matrix')

    .get(function(req, res) {
        let startDate = '00000000';
        let endDate = new Date().toISOString();
        if (req.query.startDate) startDate = req.query.startDate;
        if (req.query.endDate) endDate = req.query.endDate;
        likes.getMatrix(startDate, endDate, res);
    });

module.exports = api;