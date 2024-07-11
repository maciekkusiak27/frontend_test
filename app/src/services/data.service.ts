import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { DataJson } from '../data/data.interface';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private localStorageKey = 'myAppData';
  private resetDataSubject = new BehaviorSubject<boolean>(false);
  resetData$ = this.resetDataSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {}

  public setData(data: DataJson): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    }
  }

  public getData(): Observable<DataJson> {
    if (isPlatformBrowser(this.platformId)) {
      const storedData = localStorage.getItem(this.localStorageKey);
      if (storedData) {
        return of(JSON.parse(storedData));
      } else {
        return this.fetchInitialData().pipe(
          tap(data => {
            this.setData(data); 
          }),
          catchError(error => {
            console.error('Błąd pobierania danych z pliku JSON:', error);
            return of({ elements: [] }); 
          })
        );
      }
    }
    return of({ elements: [] });
  }

  private fetchInitialData(): Observable<DataJson> {
    const url = 'data.json';
    return this.http.get<DataJson>(url);
  }

  public clearData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.localStorageKey);
    }
  }

  public setResetData(value: boolean): void {
    this.resetDataSubject.next(value);
  }
}
