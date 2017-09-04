"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var Observable_1 = require("rxjs/Observable");
var environment_1 = require("../environment");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
var DataService = (function () {
    function DataService(http) {
        this.http = http;
        this.apiUrl = environment_1.environment.apiUrl;
    }
    DataService.prototype.get = function (startDate, endDate) {
        if (!startDate)
            startDate = '00000000';
        if (!endDate)
            endDate = new Date().toISOString();
        var result = this.http
            .get(this.apiUrl + "/likes/matrix?startDate=" + startDate + "&endDate=" + endDate, { headers: this.getHeaders() })
            .map(this.mapMatrix)
            .catch(this.handleError);
        return result;
    };
    DataService.prototype.getHeaders = function () {
        // I included these headers because otherwise FireFox
        // will request text/html instead of application/json
        var headers = new http_1.Headers();
        headers.append('Accept', 'application/json');
        return headers;
    };
    DataService.prototype.mapMatrix = function (response) {
        // If request fails, throw an Error that will be caught
        if (response.status < 200 || response.status >= 300) {
            throw new Error('This request has failed ' + response.status);
        }
        else {
            // console.log(response.json());
            var names = response.json()[0];
            var matrix = response.json()[1];
            var newObject_1 = [];
            var newRow_1 = [];
            names.forEach(function (i) { newRow_1.push(i['name']); });
            newObject_1.push(newRow_1);
            var keys_1 = Object.keys(matrix[0]);
            keys_1 = keys_1.map(function (k) { return parseInt(k); });
            keys_1.sort();
            // console.log(keys);
            matrix.forEach(function (i) {
                var newRow = [];
                keys_1.forEach(function (key) { newRow.push(i[key]); });
                newObject_1.push(newRow);
            });
            // console.log(newObject);
            return newObject_1;
        }
    };
    // this could also be a private method of the component class
    DataService.prototype.handleError = function (error) {
        // log error
        // could be something more sofisticated
        var errorMsg = error.message || 'Error retrieving data!';
        console.error(errorMsg);
        // throw an application level error
        return Observable_1.Observable.throw(errorMsg);
    };
    DataService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http])
    ], DataService);
    return DataService;
}());
exports.DataService = DataService;
