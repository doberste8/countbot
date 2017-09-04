// client/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ChordComponent } from './chord-diagram/chord-diagram.component';
import { DataService } from './data-service/data.service';

@NgModule({
  imports: [
             BrowserModule,
             HttpModule,
             FormsModule
           ],
  declarations: [
                  AppComponent,
                  ChordComponent
                ],
  providers: [DataService],
  bootstrap: [ AppComponent ]
})

export class AppModule {}