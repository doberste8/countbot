"use strict";
// app/models/bot.ts
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPS = require("https");
const HTTP = require("http");
const ontime = require("ontime");
const botID = process.env.BOT_ID;
const countessBotId = process.env.COUNTESS_BOT_ID;
const groupID = process.env.GROUP_ID;
const token = process.env.TOKEN;
console.log("Updating member count database...");
populateCounts([], [], 0);
ontime({
    cycle: '00:00:00'
}, function (ot) {
    console.log("Updating member count database...");
    populateCounts([], [], 0);
    ot.done();
    return;
});
function bot() {
    this.updateDB = function (body, res) {
        const regEx = /(added (.*) to the group\.$|changed name to (.*)$)/;
        if (body.user_id === 'system' && regEx.test(body.text)) {
            const params = regEx.exec(body.text);
            const userName = params[1];
            getUserId(userName, insertDB);
        }
        insertMessage(body, res, celebrate);
    };
}
function insertMessage(body, res, callback) {
    let d = new Date(body.created_at * 1000);
    d = new Date((body.created_at - (d.getTimezoneOffset() * 60)) * 1000);
    body.created_at = d.toISOString().slice(0, -1);
    const msg = pluck(body, ["id", "created_at", "user_id", "text"]);
    const user = pluck(body, ["user_id", "name"]);
    // console.log(msg);
    // console.log(user);
    insertDB('users', [user]);
    insertDB("messages", [msg]);
    callback(body, res, respond);
}
function celebrate(body, res, callback) {
    let options1, Req1, options2, Req2;
    const groupGifs = JSON.parse(require('fs').readFileSync(__dirname + '/group_gifs.json', 'utf8'));
    const indGifs = JSON.parse(require('fs').readFileSync(__dirname + '/ind_gifs.json', 'utf8'));
    options1 = {
        hostname: 'api.groupme.com',
        path: '/v3/groups/' + groupID + '/messages?token=' + token + '&limit=100',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    Req1 = HTTPS.request(options1, function (res) {
        let output = '';
        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            let obj = JSON.parse(output);
            let msgCount = obj.response.count;
            if ((msgCount + 1) % 10000 === 0 || /^(?=\d{4,})(\d)\1*$/.test(msgCount + 1)) {
                postMessageCountess(groupGifs[Math.floor(Math.random() * groupGifs.length)]);
                postMessageCountess("Message " + (msgCount + 1) + "! Party Time!!!!");
            }
        });
    });
    /*Req.on('error', function(err) {
        res.send('error: ' + err.message);
    });*/
    Req1.end();
    options2 = {
        hostname: process.env.HOST_NAME,
        port: process.env.PORT,
        path: '/api/messages/count' + '?user_id=' + body.user_id,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    Req2 = HTTP.request(options2, function (res) {
        let output = '';
        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            let obj = JSON.parse(output);
            // console.log(obj);
            if (obj[1]) {
                if (obj[1][0].count % 1000 === 0 || /^(?=\d{4,})(\d)\1*$/.test(obj[1][0].count)) {
                    postMessageCountess(indGifs[Math.floor(Math.random() * indGifs.length)]);
                    postMessageCountess("It's time to Celebrate! " + body.name + " has reached " + obj[1][0].count + " messages!!!!");
                }
            }
        });
    });
    /*Req2.on('error', function(err) {
        res.send('error: ' + err.message);
    });*/
    Req2.end();
    callback(body, res);
}
function respond(body, res) {
    //console.log(body.text);
    //console.log(body.sender_id);
    var messageRegex = [/^#(?:\.([^.\n]*))?(?:\.([^.\n]*))?(?:\.([^.\n]*))?(?:\.([^\n]*))?/, /^Refresh_DB$/];
    let userName, startDate, queryText, endDate;
    if (body.text && messageRegex[0].test(body.text)) {
        res.writeHead(200);
        const params = messageRegex[0].exec(body.text);
        // console.log(params);
        let endDateQ = params[3] === undefined ? 0 : params[3] === '' ? 0 : 1;
        userName = params[1] === undefined ? "%" : params[1] === '' ? "%" : params[1];
        startDate = params[2] === undefined ? "00000000" : params[2] === '' ? "00000000" : params[2];
        queryText = params[4] === undefined ? "%" : params[4] === '' ? "%" : params[4];
        endDate = params[3] === undefined ? new Date().toISOString() : params[3] === '' ? new Date().toISOString() : params[3];
        console.log(userName, startDate, endDate, queryText);
        getCount(userName, startDate, endDate, queryText, endDateQ, postMessage);
        res.end();
    }
    else if (body.text && messageRegex[1].test(body.text)) {
        res.writeHead(200);
        console.log("Updating member count database...");
        postMessage("Updating database counts...");
        populateCounts([], [], 0);
        res.end();
    }
    else {
        // console.log("don't care");
        res.writeHead(200);
        res.end();
    }
}
function postMessage(botResponse) {
    let options, body, botReq;
    options = {
        hostname: 'api.groupme.com',
        path: '/v3/bots/post',
        method: 'POST'
    };
    body = {
        "bot_id": botID,
        "text": botResponse
    };
    console.log('sending ' + botResponse + ' to ' + botID);
    botReq = HTTPS.request(options, function (res) {
        if (res.statusCode == 202) {
            //neat
        }
        else {
            console.log(res);
            console.log('rejecting bad status code ' + res.statusCode);
        }
    });
    botReq.on('error', function (err) {
        console.log('error posting message ' + JSON.stringify(err));
    });
    botReq.on('timeout', function (err) {
        console.log('timeout posting message ' + JSON.stringify(err));
    });
    botReq.end(JSON.stringify(body));
}
function postMessageCountess(botResponse) {
    let options, body, botReq;
    options = {
        hostname: 'api.groupme.com',
        path: '/v3/bots/post',
        method: 'POST'
    };
    body = {
        "bot_id": countessBotId,
        "text": botResponse
    };
    console.log('sending ' + botResponse + ' to ' + botID);
    botReq = HTTPS.request(options, function (res) {
        if (res.statusCode == 202) {
            //neat
        }
        else {
            console.log(res);
            console.log('rejecting bad status code ' + res.statusCode);
        }
    });
    botReq.on('error', function (err) {
        console.log('error posting message ' + JSON.stringify(err));
    });
    botReq.on('timeout', function (err) {
        console.log('timeout posting message ' + JSON.stringify(err));
    });
    botReq.end(JSON.stringify(body));
}
function getCount(userName, startDate, endDate, queryText, endDateQ, postMessage) {
    var options, Req;
    options = {
        hostname: process.env.HOST_NAME,
        port: process.env.PORT,
        path: '/api/messages/count' + '?user_name=' + encodeURIComponent(userName) + '&start_date=' + encodeURIComponent(startDate) + '&end_date=' + encodeURIComponent(endDate) + '&query_text=' + encodeURIComponent(queryText),
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    Req = HTTP.request(options, function (res) {
        var output = '';
        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            var obj = JSON.parse(output);
            // console.log(obj);
            if (obj[0].length === 0) {
                postMessage("User \"" + userName + "\" not found.");
            }
            else {
                const len = obj[1].length;
                if (len === 0)
                    postMessage("Count Bot counts 0 messages matching those criteria.");
                for (let i = 0; i < len; i++) {
                    setTimeout(() => {
                        postMessage((obj[1][i].name ? obj[1][i].name + " has posted " : (userName != "%" ? userName + " has posted " : "")) + obj[1][i].count + " messages" + (queryText != '%' ? " containing \"" + queryText + "\"" : "") + (startDate != "00000000" && endDateQ ? " between " + startDate + " and " + endDate + "." : (startDate != "00000000" ? " since " + startDate + "." : (endDateQ ? " before " + endDate + "." : "."))));
                    }, i * 500);
                }
            }
        });
    });
    /*Req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });*/
    Req.end();
}
function getUserId(userName, callback) {
    var options, Req, userId;
    options = {
        hostname: 'api.groupme.com',
        path: '/v3/groups/' + groupID + '?token=' + token,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    Req = HTTPS.request(options, function (res) {
        var output = '';
        //console.log('statusCode:', res.statusCode);
        //console.log('headers:', res.headers);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            var obj = JSON.parse(output);
            var members = obj.response.members;
            for (var i = 0; i < members.length; i++) {
                if (userName == members[i].nickname) {
                    userId = members[i].user_id;
                    // console.log("User ID: " + userId);
                }
            }
            callback('users', [[userId, userName]]);
        });
    });
    /*Req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });*/
    Req.end();
}
function populateCounts(memberList, likes, last_id) {
    var options, Req;
    var pathAdd = "";
    if (last_id)
        pathAdd = "&before_id=" + last_id;
    options = {
        hostname: 'api.groupme.com',
        path: '/v3/groups/' + groupID + '/messages?token=' + token + '&limit=100' + pathAdd,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    Req = HTTPS.request(options, function (res) {
        var output = '';
        if (res.statusCode == 304) {
            //insert likes into database here
            const len = likes.length;
            for (let i = 0; i < len / 100; i++) {
                setTimeout(() => {
                    // console.log(i);
                    insertDB("likes", likes.slice(i * 100, i * 100 + 100));
                    if (i + 1 >= len / 100) {
                        console.log("Database updated.");
                        postMessage("Database counts updated.");
                    }
                }, i * 500);
            }
            Req.end();
            return;
        }
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            var obj = JSON.parse(output);
            //if (obj.response.messages.length > 0) {
            var msgs = obj.response.messages;
            var msgsLength = msgs.length;
            if (msgsLength > 0) {
                for (var i = 0; i < msgsLength; i++) {
                    if (msgs[i].user_id === "system" || msgs[i].name === "GroupMe Calendar") {
                        msgs[i].user_id = 1;
                        msgs[i].name = "GroupMe";
                    }
                    // msgs[i].id = parseInt(msgs[i].id, 10);
                    // msgs[i].user_id = parseInt(msgs[i].user_id, 10);
                    let index = memberList.findIndex(item => item[0] === msgs[i].user_id);
                    if (index === -1) {
                        const user = pluck(msgs[i], ['user_id', 'name']);
                        insertDB("users", [user]);
                        memberList.push(user);
                        index = memberList.length - 1;
                    }
                    if (i + 1 === msgsLength) {
                        let msgsMapped = msgs.map(item => {
                            let d = new Date(item.created_at * 1000);
                            d = new Date((item.created_at - (d.getTimezoneOffset() * 60)) * 1000);
                            item.created_at = d.toISOString().slice(0, -1);
                            return item;
                        }).map(item => pluck(item, ["id", "created_at", "user_id", "text"]));
                        // console.log(msgsMapped);
                        insertDB("messages", msgsMapped);
                    }
                }
                msgs.forEach(item => {
                    item.favorited_by.forEach(innerItem => {
                        likes.push([item.id, innerItem]);
                    });
                });
                last_id = msgs[msgsLength - 1].id;
                populateCounts(memberList, likes, last_id);
            }
            else {
                //insert likes into database here
                const len = likes.length;
                for (let i = 0; i < len / 100; i++) {
                    setTimeout(() => {
                        // console.log(i);
                        insertDB("likes", likes.slice(i * 100, i * 100 + 100));
                        if (i + 1 >= len / 100) {
                            console.log("Database updated.");
                            postMessage("Database counts updated.");
                        }
                    }, i * 500);
                }
                Req.end();
                return;
            }
        });
    });
    /*Req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });*/
    Req.end();
}
function pluck(sourceObject, keys) {
    var newObject = [];
    keys.forEach(key => { newObject.push(sourceObject[key]); });
    return newObject;
}
function getStartOfWeek() {
    var date = new Date();
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    date = new Date(date.getTime() - date.getDay() * 24 * 3600 * 1000);
    var dateUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, date.getTimezoneOffset());
    return (dateUTC);
}
function ObjToArray(obj) {
    var arr = obj instanceof Array;
    return (arr ? obj : Object.keys(obj)).map(function (i) {
        var val = arr ? i : obj[i];
        if (typeof val === 'object')
            return ObjToArray(val);
        else
            return val;
    });
}
function insertDB(table, data) {
    var options, Req;
    options = {
        hostname: process.env.HOST_NAME,
        port: process.env.PORT,
        path: '/api/' + table,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    Req = HTTP.request(options, function (res) {
        if (res.statusCode == 202 || 200) {
            //neat
            // console.log("Messages inserted successfully.");
        }
        else {
            console.log('rejecting bad status code ' + res.statusCode);
        }
    });
    Req.on('error', function (err) {
        console.log('error posting message ' + JSON.stringify(err));
    });
    Req.on('timeout', function (err) {
        console.log('timeout posting message ' + JSON.stringify(err));
    });
    Req.end(JSON.stringify(data));
}
module.exports = new bot();
