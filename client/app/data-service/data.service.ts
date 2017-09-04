import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../environment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()

export class DataService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: Http) {}

  get(startDate, endDate): Observable < Array < any >> {
    if (!startDate) startDate='00000000';
    if (!endDate) endDate=new Date().toISOString();
    let result = this.http
      .get(`${this.apiUrl}/likes/matrix?startDate=${startDate}&endDate=${endDate}`, { headers: this.getHeaders() })
      .map(this.mapMatrix)
      .catch(this.handleError);
    return result;
  }

  private getHeaders() {
    // I included these headers because otherwise FireFox
    // will request text/html instead of application/json
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    return headers;
  }

  private mapMatrix(response: Response): Array<any> {
    // If request fails, throw an Error that will be caught
    if(response.status < 200 || response.status >= 300) {
      throw new Error('This request has failed ' + response.status);
      
    } 
    // If everything went fine, return the response
    else {
    // console.log(response.json());
    const names = response.json()[0];
    const matrix = response.json()[1];
    let newObject = [];
    let newRow = [];
    names.forEach(i => {newRow.push(i['name']);});
    newObject.push(newRow);
    
    let keys = Object.keys(matrix[0]);
    keys = keys.map(k => { return parseInt(k);});
    keys.sort();
    // console.log(keys);
    matrix.forEach(i => {
      let newRow = [];
      keys.forEach(key => {newRow.push(i[key]); });
      newObject.push(newRow);
    });
    // console.log(newObject);
    return newObject;
    }
  }

  // this could also be a private method of the component class
  private handleError(error: any) {
    // log error
    // could be something more sofisticated
    let errorMsg = error.message || 'Error retrieving data!';
    console.error(errorMsg);

    // throw an application level error
    return Observable.throw(errorMsg);
  }
}