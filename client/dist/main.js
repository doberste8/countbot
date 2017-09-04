"use strict";
// client/app/main.ts
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("./environment");
var platform_browser_dynamic_1 = require("@angular/platform-browser-dynamic");
var app_module_1 = require("./app.module");
var core_1 = require("@angular/core");
if (environment_1.environment.production)
    core_1.enableProdMode();
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_module_1.AppModule);
