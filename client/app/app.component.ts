// client/app/app.component.ts

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataService } from './data-service/data.service';
// import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app/app.component.html',
  styleUrls: [ './app/app.component.css' ],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit {
  data1: Array<any>;
  data2: Array<any>;
  sort: boolean = false;
  startDate: string = '20170804';
  endDate: string = new Date().toISOString();

  constructor( private dataService: DataService) {

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
  
  ngOnInit() {
    this.dataService.get(this.startDate, this.endDate).subscribe(
        /* happy path */ d => this.data2 = d,
        /* error path */ e => this.errorMessage = e,
        /* onCompleted */ () => this.isLoading = false);
  }
  
  Existing(){
    this.sort = !this.sort;
    console.log(this.sort);
  }
  
  updateLikeMatrix() {
        this.dataService.get(this.startDate, this.endDate).subscribe(
        /* happy path */ d => this.data2 = d,
        /* error path */ e => this.errorMessage = e,
        /* onCompleted */ () => this.isLoading = false);
  }

}