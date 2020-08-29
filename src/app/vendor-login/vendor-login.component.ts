import { LoginService } from './../login/login.service';
import { HomeService } from './../home/home.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CryptoService } from './../common/crypto.service';
import { AppService } from './../app.service';
import { MatDialog } from '@angular/material';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ForgotPasswordData } from '../models/data-models';
import { CaptchaComponent, CaptchaService } from 'angular-captcha';

import {
    HttpRequest, HttpHandler, HttpEvent, HttpXsrfTokenExtractor, HttpInterceptor,
    HttpErrorResponse
} from "@angular/common/http";



@Component({
    selector: 'app-vendor-login',
    templateUrl: './vendor-login.component.html',
    styleUrls: ['./vendor-login.component.scss']
})

export class VendorLoginComponent implements OnInit {

    @ViewChild(CaptchaComponent) captchaComponent: CaptchaComponent;

    @ViewChild(CaptchaService) captchaService: CaptchaService;


    loginForm: FormGroup;

    isFormSubmitted: boolean = false;
    errorMessage: string = "";
    loading: boolean = false;
    private _isSessionExpiredSubscription: any = null;
    isSessionExpireVisible: boolean = false;

    capchaVal: string = "";

    constructor(private _router: Router,
        private _formBuilder: FormBuilder,
        private _appService: AppService,
        private _homeService: HomeService,
        private _loginService: LoginService,
        private _cryptoService: CryptoService,
        public dialog: MatDialog,
        private _tokenExtractor: HttpXsrfTokenExtractor
    ) {
    }

    get f() { return this.loginForm.controls; }

    checkVendorAuthentication(userId: string, password: string, loginType: string) {
        this._loginService.login(userId, password, loginType).subscribe(
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
        this.isFormSubmitted = true;
        this.loading = true;
        this.errorMessage = '';

        if (this.loginForm.valid && this.captchaComponent.userEnteredCaptchaCode) {

            // get the user-entered captcha code value to be validated at the backend side        
            let userEnteredCaptchaCode = this.captchaComponent.userEnteredCaptchaCode;

            // get the id of a captcha instance that the user tried to solve
            let captchaId = this.captchaComponent.captchaId;

            const postData = {
                userEnteredCaptchaCode: userEnteredCaptchaCode,
                captchaId: captchaId
            };

            // post the captcha data to the backend
            this._loginService.validateCapcha(postData)
                .subscribe(
                response => {
                    this.loading = false;
                    if (response.success == false) {
                        this.capchaVal = "";

                        // captcha validation failed; reload image
                        this.captchaComponent.reloadImage();
                        // TODO: maybe display an error message, too
                    } else {
                        this.loading = true;

                        let userId: string = this.loginForm.get("userId").value;
                        let password: string = this.loginForm.get("password").value;
                        let loginType: string = "vendor";

                        this.checkVendorAuthentication(userId, password, loginType);
                    }
                },
                (error) => {
                    this.loading = false;
                });
        }
    }

    isFormValid() {
        if (this.loginForm.get("userId").invalid || this.loginForm.get("password").invalid || this.loading || !this.captchaComponent.userEnteredCaptchaCode) {
            return true;
        }

        return false;
    }

    ngOnDestroy() {
        if (this._isSessionExpiredSubscription) {
            this._isSessionExpiredSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        // let csrfToken = this._tokenExtractor.getToken() as string;
        // if(csrfToken) {
        //     this.captchaComponent.captchaEndpoint =
        //     this._appService.baseUrl + 'simple-captcha-endpoint?_csrf=' + csrfToken;
        // }
        // else {
        //     this.captchaComponent.captchaEndpoint =
        //     this._appService.baseUrl + 'simple-captcha-endpoint';
        // }

        this.captchaComponent.captchaEndpoint =
            this._appService.baseUrl + 'simple-captcha-endpoint';

        this.isSessionExpireVisible = false;

        this.isFormSubmitted = false;
        this.loading = false;
        this.loginForm = this._formBuilder.group({
            userId: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required, Validators.minLength(4)]]
        });

        this._isSessionExpiredSubscription = this._homeService.isSessionExpired.subscribe(data => {
            if (data) {
                this.isSessionExpireVisible = true;
            }
        });
    }

}
