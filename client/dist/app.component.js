"use strict";
// client/app/app.component.ts
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
var data_service_1 = require("./data-service/data.service");
// import { NgModel } from '@angular/forms';
var AppComponent = (function () {
    function AppComponent(dataService) {
        this.dataService = dataService;
        this.sort = false;
        this.startDate = '20170804';
        this.endDate = new Date().toISOString();
        this.data1 = [
            ["ACCESSORY/STORAGE", "BUSINESS", "CIRCULATION", "CIRCULATE", "MEET", "OPERATE", "SERVE", "WASH", "WORK"],
            [0, 0, 0, 0, 0, 43, 0, 0, 0],
            [0, 0, 0, 0, 53, 0, 34, 9, 278],
            [0, 0, 0, 25, 0, 0, 0, 0, 0],
            [0, 0, 25, 0, 0, 0, 0, 0, 0],
            [0, 53, 0, 0, 0, 0, 0, 0, 0],
            [43, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 34, 0, 0, 0, 0, 0, 0, 0],
            [0, 9, 0, 0, 0, 0, 0, 0, 0],
            [0, 278, 0, 0, 0, 0, 0, 0, 0]
        ];
        this.data2 = [];
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.dataService.get(this.startDate, this.endDate).subscribe(
        /* happy path */ function (d) { return _this.data2 = d; }, 
        /* error path */ function (e) { return _this.errorMessage = e; }, 
        /* onCompleted */ function () { return _this.isLoading = false; });
    };
    AppComponent.prototype.Existing = function () {
        this.sort = !this.sort;
        console.log(this.sort);
    };
    AppComponent.prototype.updateLikeMatrix = function () {
        var _this = this;
        this.dataService.get(this.startDate, this.endDate).subscribe(
        /* happy path */ function (d) { return _this.data2 = d; }, 
        /* error path */ function (e) { return _this.errorMessage = e; }, 
        /* onCompleted */ function () { return _this.isLoading = false; });
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'app-root',
            templateUrl: './app/app.component.html',
            styleUrls: ['./app/app.component.css'],
            encapsulation: core_1.ViewEncapsulation.None
        }),
        __metadata("design:paramtypes", [data_service_1.DataService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
