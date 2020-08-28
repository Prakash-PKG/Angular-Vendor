import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { HomeService } from '../home/home.service';
import { CryptoService } from '../common/crypto.service';
import { MatDialog } from '@angular/material';
import { LoginVendorService } from './login-vendor.service';
import { EmpanelmentOtpReqModel, StatusModel } from '../models/data-models';

@Component({
    selector: 'app-login-vendor',
    templateUrl: './login-vendor.component.html',
    styleUrls: ['./login-vendor.component.scss']
})
export class LoginVendorComponent implements OnInit {
    loginForm: FormGroup;

    isFormSubmitted: boolean = false;
    errorMessage: string = "";
    otpMessage: string = "";
    isloading: boolean = false;
    isSignIn: boolean = false;
    haveOTP: boolean = false;
    validOTP: boolean = false;

    constructor(private _router: Router,
        private _formBuilder: FormBuilder,
        private _appService: AppService,
        private _loginVendorService: LoginVendorService,
        public dialog: MatDialog
    ) {
    }

    get f() { return this.loginForm.controls; }

    OnLoginClick() {
        this.errorMessage = "";
        this.isFormSubmitted = true;
        this.isSignIn = true;
        if (this.loginForm.valid) {
            let userId: string = this.loginForm.get("userId").value;
            let password: string = this.loginForm.get("password").value;
            this._loginVendorService.login(userId, password).subscribe(
                (response) => {
                    this.isSignIn = false;
                    this._loginVendorService.storeUserData(response);

                    this._router.navigate([this._appService.routingConstants.vendorDetails]);

                    this._appService.startWatching();
                },
                (error) => {
                    this.isSignIn = false;
                    if (error.status == 500) {
                        this.errorMessage = "Internal server error occurred. Please try again later."
                    } else {
                        this.errorMessage = error.json()['error-message'];
                    }
                }
            );
        }
    }
    async onGenerateOTPClick() {
        this.otpMessage = '';
        this.errorMessage = "";
        this.isloading = true;
        let userId = this.loginForm.get("userId").value;
        if (userId) {
            let req: EmpanelmentOtpReqModel = {
                userName: userId
            };
            let results = await this._loginVendorService.generateOTP(req);
            this.isloading = false;
            if (results) {
                if (results.isSuccess) {
                    this.haveOTP = true;
                    this.otpMessage = results.message
                }
                else {
                    this.otpMessage = results.message
                    this.haveOTP = false;
                }
            }
            else {
                this.otpMessage = results.message
                this.haveOTP = false;
            }
        }
    }
    ngOnInit() {
        this.isFormSubmitted = false;
        this.isloading = false;
        this.loginForm = this._formBuilder.group({
            userId: [null, [Validators.required, Validators.email]],
            password: [null, [Validators.required]]
        });
    }
}
