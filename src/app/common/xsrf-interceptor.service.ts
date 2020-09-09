
import {tap} from 'rxjs/operators';
import { NgModule, Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { Observable } from "rxjs";


import 'rxjs/Observable';

import {
    HttpRequest, HttpHandler, HttpEvent, HttpXsrfTokenExtractor, HttpInterceptor,
    HttpErrorResponse
} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class XsrfInterceptor implements HttpInterceptor {

    constructor(private _tokenExtractor: HttpXsrfTokenExtractor, private _routes: Router) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let authToken = localStorage.getItem("x-auth-token");
        let csrfToken = this._tokenExtractor.getToken() as string;

        console.log("csrf token: " + csrfToken);

        // let requestToForward = req.clone({
        //     headers: req.headers.set('Content-Type', 'application/json')
        //    // headers: req.headers.set('Content-Type', "multipart/form-data")
        // });

        let requestToForward = req.clone();

        if (csrfToken !== null) {
            requestToForward = requestToForward.clone({
                headers: requestToForward.headers.set('X-XSRF-TOKEN', csrfToken)
            });
        }

        if (authToken !== null) {
            requestToForward = requestToForward.clone({
                headers: requestToForward.headers.set('x-auth-token', authToken)
            });
        }

        return next.handle(requestToForward).pipe(tap((event: HttpEvent<any>) => {
            // optional task on success
            // console.log("---Interceptor Success------");
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                if (err.status === 401 || err.status === 403) { //|| err.status === 302 || err.status === 0
                    // redirect to the login route
                    // this.routes.navigate(['login']);
                }
            }
        }));

    }
}