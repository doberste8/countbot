// server/server.js

"use strict";

//modules =====================================================================
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const path = require('path');

// config =====================================================================
require('dotenv').config({path:'./.env'});
const db = require("./dist/config/db");

//set port
const port = process.env.PORT || 8080;

// create mysql database connection pool
db.init();

// get all data of the body (POST) parameters
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("X-HTTP-Method-Override"));
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));
app.use(express.static(path.join(__dirname, '../client')));

// routes =====================================================================
const router = require(path.join(__dirname, './dist/app/routes'));
app.use('/', router);

// start app ==================================================================
app.listen(port);
console.log("App listening on port " + port + " in " + process.env.NODE_ENV + " mode...");

// expose app
exports = module.exports = app;