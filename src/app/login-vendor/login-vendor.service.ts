import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Http, RequestOptions } from '@angular/http';
import { AppService } from '../app.service';
import { CryptoService } from '../common/crypto.service';

@Injectable({
  providedIn: 'root'
})
export class LoginVendorService {
  options;
  isValidUser: boolean = false;
  res: Observable<Response>;
  dat: string;
  userRole: string;
  public header = new Headers();
  userName: string;
  userEmail: string;
  userId: string;

  constructor(private _httpClient: HttpClient,
    private _http: Http,
    private _appService: AppService,
    private _cryptoService: CryptoService) { };

  login(userId: string, password: string) {
    let body = new FormData();
    body.append('username', userId);
    body.append('password', password);
    body.append('usertype', "NEW_VENDOR");
    return this._http.post(this._appService.baseUrl + 'login', body);
  };

  storeUserData(response) {
    localStorage.setItem('x-auth-token', response.headers.get("x-auth-token"));
    localStorage.setItem('user', this._cryptoService.encrypt(response._body));
  }

}
