import { LoginService } from './../login/login.service';
import { HomeService } from './../home/home.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CryptoService } from './../common/crypto.service';
import { AppService } from './../app.service';
import { MatDialog } from '@angular/material';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ForgotPasswordData } from '../models/data-models';

@Component({
    selector: 'app-vendor-login',
    templateUrl: './vendor-login.component.html',
    styleUrls: ['./vendor-login.component.scss']
})
export class VendorLoginComponent implements OnInit {

    loginForm: FormGroup;

    isFormSubmitted: boolean = false;
    errorMessage: string = "";
    loading: boolean = false;

    constructor(private _router: Router,
        private _formBuilder: FormBuilder,
        private _appService: AppService,
        private _homeService: HomeService,
        private _loginService: LoginService,
        private _cryptoService: CryptoService,
        public dialog: MatDialog
    ) {
    }

    get f() { return this.loginForm.controls; }

    checkVendorAuthentication(userId: string, password: string, loginType: string) {
        this._loginService.login(userId, password, loginType).subscribe(
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

        if (this.loginForm.valid) {
            let userId: string = this.loginForm.get("userId").value;
            let password: string = this.loginForm.get("password").value;
            let loginType: string = "vendor";

            this.checkVendorAuthentication(userId, password, loginType);
        }
    }

    ngOnInit() {
        this.isFormSubmitted = false;
        this.loading = false;
        this.loginForm = this._formBuilder.group({
            userId: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required, Validators.minLength(4)]]
        });
    }

}
