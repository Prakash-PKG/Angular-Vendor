import { AppService } from './../app.service';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';

@Injectable({
    providedIn: 'root'
})
export class AppCaptchaService {

    constructor(private http: HttpClient, private _appService: AppService) { }

    send(data: Object): Observable<any> {
        const options = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
        };

        return this.http.post(
            this._appService.baseUrl + 'your-app-backend-path',
            data, options);
    }
}
