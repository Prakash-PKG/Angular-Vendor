import { AppService } from './../app.service';
import { LoginService } from './../login/login.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { globalConstant } from '../common/global-constant';
import { HomeService } from '../home/home.service';
import { ForgotPasswordData, BusyDataModel, StatusModel, ResetPasswordData } from '../models/data-models';


@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

    emailId: string = '';
    employeeId: string = '';
    otp: string = '';
    newPassword: string = '';
    confirmPassword: string = '';

    generateOTP: boolean = true;
    //validateOTP: boolean = false;
    resetPassword: boolean = false;

    isLoading: boolean = false;
    invalidPassword: boolean = false;
    invalid: boolean = false;
    errormsg: string = '';
    successfulReset: boolean = false;

    constructor(public dialogRef: MatDialogRef<ForgotPasswordComponent>,
       // @Inject(MAT_DIALOG_DATA) public data: ForgotPasswordData,
        private _homeService: HomeService,
        private _loginService: LoginService,
        private _appService: AppService
        ) { }

    onGenerateOTPClick() {
        this.invalid = false;

        this.isLoading = true;

        this._loginService.login(this.emailId, Math.random().toString(36).slice(-8), "venndor-otp").subscribe(
            (response) => {
                this.isLoading = false;
                this._appService.token = response.headers.get("x-auth-token");

                this.generateOTP = false;
                this.resetPassword = true;
                this.newPassword = null;
                this.confirmPassword = null;
                this.otp = null;
            },
            (error) => {
                this.isLoading = false;
                this.invalid = true;
                this.generateOTP = true;
                this.errormsg = error.json()['error-message'];
                console.log(error);
            });
    }

    onResetPasswordClick() {
        if (this.invalidPassword) {
            return;
        }
        this.invalid = false;
        let resetPasswordReq: ResetPasswordData = {
            userName: this.emailId,
            password: this.newPassword,
            oTP: this.otp
        };
        this.isLoading = true;
        this._loginService.resetPassword(resetPasswordReq)
            .subscribe(response => {
                this.isLoading = false;
                let result = response["_body"] as StatusModel;
                if (result.isSuccess) {
                    this.invalid = false;
                    this.generateOTP = false;
                    this.resetPassword = false;
                    this.successfulReset = true;
                }
                else {
                    this.invalid = true;
                    this.errormsg = "Password reset failure"
                    this.generateOTP = true;
                    this.resetPassword = false;
                }

                this._loginService.logout(this._appService.token).subscribe(
                    (response) => {
                        this._appService.token = '';
                    },
                    (error) => {
                        this._appService.token = '';
                    });
            },

            (error) => {
                this.isLoading = false;
                this.invalid = true;
                this.errormsg = error.json()['error-message'];
                this.generateOTP = true;
                this.resetPassword = false;
                console.log(error);

                this._loginService.logout(this._appService.token).subscribe(
                    (response) => {
                        this._appService.token = '';
                    },
                    (error) => {
                        this._appService.token = '';
                    });
            });
    }

    validateConfirmPassword() {
        if (this.newPassword == this.confirmPassword) {
            this.invalidPassword = false;
        }
        else {
            this.invalidPassword = true;
        }
    }

    onCloseClick() {
        this.dialogRef.close(true);
    }

    ngOnInit() {
    }

}
