// client/app/main.ts

import { environment } from './environment';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { enableProdMode } from '@angular/core';

if (environment.production) enableProdMode();

platformBrowserDynamic().bootstrapModule(AppModule);