import { HomeService } from './../home/home.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CryptoService } from './../common/crypto.service';
import { AppService } from './../app.service';
import { LoginService } from './login.service';
import { MatDialog } from '@angular/material';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ForgotPasswordData } from '../models/data-models';
import { MsAdalAngular6Service } from 'microsoft-adal-angular6';

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
    private _isSessionExpiredSubscription: any = null;
    isSessionExpireVisible: boolean = false;

    constructor(private _router: Router,
        private _formBuilder: FormBuilder,
        private _appService: AppService,
        private _homeService: HomeService,
        private _loginService: LoginService,
        private _cryptoService: CryptoService,
        public dialog: MatDialog,
        private _adalService: MsAdalAngular6Service
    ) {
    }

    get f() { return this.loginForm.controls; }

    checkLdapAuthentication(userId: string, password: string) {
        this._loginService.ldapLogin(userId, password).subscribe(
            (response) => {
                let _response: any = response;
                localStorage.setItem('token', JSON.parse(_response._body).access_token);
                this.checkServerAuthentication(userId, password);
            },
            (error) => {
                this.loading = false;
                this.errorMessage = "Invalid Employee Id / Password";
            }
        );
    }

    checkServerAuthentication(userId: string, password: string) {
        this._loginService.login(userId, password, "employee").subscribe(
            (response) => {
                this.loading = false;
                this._loginService.storeUserData(response);

                this._router.navigate([this._appService.routingConstants.posearch]);

                this._appService.startWatching();
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

    onForgotPasswordClick() {
        this.errorMessage = '';
        const dialogRef = this.dialog.open(ForgotPasswordComponent, {
            width: '400px',
            data: ForgotPasswordData
        });

    }

    OnLoginClick() {
        this.errorMessage = '';
        if (this._appService.isSSORequired) {
            return false;
        }
        else {
            this.isFormSubmitted = true;
            this.loading = true;
            if (this.loginForm.valid) {
                let userId: string = this.loginForm.get("userId").value;
                let password: string = this.loginForm.get("password").value;

                if (this._appService.isForProduction) {
                    this.checkLdapAuthentication(userId, password);
                }
                else {
                    this.checkServerAuthentication(userId, password);
                }
            }
        }
    }

    ngOnDestroy() {
        if (this._isSessionExpiredSubscription) {
            this._isSessionExpiredSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.isSessionExpireVisible = false;
        this._homeService.updateSessionExpireDetails(false);
        this.isFormSubmitted = false;
        this.loading = false;
        this.loginForm = this._formBuilder.group({
            userId: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required, Validators.minLength(4)]]
        });

        if (this._appService.isSSORequired) {
            if (!this._adalService.userInfo) {
                this._adalService.login();
            } else {
                let user_name = this._adalService.userInfo.userName;
                let user_passwd = "dghvcgd";
                this.checkServerAuthentication(user_name, user_passwd);
            }
        }

        this._isSessionExpiredSubscription = this._homeService.isSessionExpired.subscribe(data => {
            if (data) {
                this.isSessionExpireVisible = true;
            }
        });
    }
}
