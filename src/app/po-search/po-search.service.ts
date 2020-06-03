import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../app.service';

@Injectable({
  providedIn: 'root'
})
export class PoSearchService {

  constructor(private _appService: AppService,
    private _http: HttpClient) { }

  getPurchaseOrders() {
    let url = this._appService.baseUrl + "getPurchaseOrders/";
    return this._http.get(url, { responseType: 'json', observe: 'response' });
}
}
