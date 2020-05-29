import { HomeService } from './../home/home.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CryptoService } from './../common/crypto.service';

import { AppService } from './../app.service';
import { LoginService } from './login.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;

    isFormSubmitted: boolean = false;
    errorMessage: string = "";
    loading: boolean = false;

    constructor(private _router: Router,
            private _formBuilder: FormBuilder,
            private _appService: AppService,
            private _homeService: HomeService,
            private _loginService: LoginService,
            private _cryptoService: CryptoService
        ) {
    }

    get f() { return this.loginForm.controls; }

    checkLdapAuthentication(userId: string, password: string) {
        this._loginService.ldapLogin(userId, password).subscribe(
            (response) => {
                let _response: any = response;
                localStorage.setItem('token', JSON.parse(_response._body).access_token);
                this.checkTravelAuthentication(userId, password);
            },
            (error) => {
                this.loading = false;
                this.errorMessage = "Invalid Employee Id / Password";
            }
        );
    }

    checkTravelAuthentication(userId: string, password: string) {
        this._loginService.login(userId, password).subscribe(
            (response) => {
                this.loading = false;
                this._loginService.storeUserData(response);

                this._router.navigate([this._appService.routingConstants.posearch]);
            },
            (error) => {
                this.loading = false;
                if (error.status == 500) {
                    this.errorMessage = "Internal server error occurred. Please try again later."
                } else {
                    this.errorMessage = error.json()['error-message'];
                }

            }
        );
    }

    OnLoginClick() {
        // this._router.navigate([this._appService.routingConstants.posearch]);
        // return false;

        this.isFormSubmitted = true;
        this.loading = true;
        if (this.loginForm.valid) {
            let userId: string = this.loginForm.get("userId").value;
            let password: string = this.loginForm.get("password").value;

            if (this._appService.isForProduction) {
                this.checkLdapAuthentication(userId, password);
            }
            else {
                this.checkTravelAuthentication(userId, password);
            }
        }
    }

    ngOnInit() {
        this.isFormSubmitted = false;
        this.loading = false;
        this.loginForm = this._formBuilder.group({
            userId: [null, [Validators.required]],
            password: [null, [Validators.required, Validators.minLength(4)]]
        });
    }
}
