/** Angular Imports */
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';

/** rxjs Imports */
import {Observable} from 'rxjs';

/**
 * Home Service
 */
@Injectable({
  providedIn: 'root'
})
export class EntryService {


  constructor(private http: HttpClient) {
  }

  createJournalEntry(JournalEntry: any): Observable<any> {
    const objectObservable = this.http.post("/m", JournalEntry);
    console.log(objectObservable);
    return objectObservable;
  }

}
