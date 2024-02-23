import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponseService {

  private response = new BehaviorSubject<any>({});
  sendResponse = this.response.asObservable();

  setResponse(res: any) {
    this.response.next(res);
  }
}
