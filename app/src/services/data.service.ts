import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataJson } from '../data/data.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _dataUrl = 'data.json';
  private resetDataSubject = new BehaviorSubject<boolean>(false);
  resetData$ = this.resetDataSubject.asObservable();


  constructor(private _http: HttpClient) {
  } 

  public setResetData(value: boolean) {
    this.resetDataSubject.next(value);
  }

  public getData(): Observable<DataJson> {
    return this._http.get<DataJson>(this._dataUrl);
  }

}
