import { CryptoService } from './../common/crypto.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions, Http } from '@angular/http';
import { HttpClient, HttpResponse, HttpParams, HttpHeaders } from "@angular/common/http";

import { AppService } from './../app.service';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
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

    encodePassword(password) {
        let regex;

        if (password.includes('%')) {
            regex = /%/gi;
            password = password.replace(regex, '%25');
        }

        if (password.includes('&')) {
            regex = /&/gi;
            password = password.replace(regex, '%26');
        }

        if (password.includes('+')) {
            regex = /\+/gi;
            password = password.replace(regex, '%2b');
        }
        return password;
    }

    ldapLogin(userId: string, password: string) {
        let _btoa = btoa('clientapp' + ':' + '123456'); // used to set btoa in header
        let options = new RequestOptions({
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + _btoa,
            })
        });

        let data = "username=" + userId + "&password=" + this.encodePassword(password) + "&grant_type=password&scope=read%20write&" + "client_secret=123456&client_id=clientapp";

        return this._http.post(this._appService.customerAuthUrl, data, options);
    };

    login(userId: string, password: string, loginType: string) {
        let body = new FormData();
        body.append('username', userId);
        body.append('password', password);
        body.append('usertype', loginType);

        return this._http.post(this._appService.baseUrl + 'login', body);
    };

    storeUserData(response) {
        localStorage.setItem('x-auth-token', response.headers.get("x-auth-token"));
        localStorage.setItem('user', this._cryptoService.encrypt(response._body));
    }


    logout() {
        let accessToken = localStorage.getItem('x-auth-token');
        let options = new RequestOptions({
            headers: new Headers({
                'Accept': 'application/json',
                // 'Access-Control-Allow-Origin': '*',
                'x-auth-token': accessToken
            }),
            withCredentials: true
        });

        var body = new FormData();
        body.append('session', accessToken);

        return this._httpClient.post(this._appService.baseUrl + 'logout', body, this.options);
    }


    getData() {
        return this.userRole;
    }

    getUsername() {
        return this.userName;
    }

    getUserEmail() {
        return this.userEmail;
    }

    getUserId() {
        return this.userId;
    }

}