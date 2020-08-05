import { AppService } from './../app.service';
import { LoginService } from './../login/login.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { globalConstant } from '../common/global-constant';
import { HomeService } from '../home/home.service';



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

    // onGenerateOTPClick() {
    //     this.invalid = false;
    //     let generateOTPReq: ForgotPasswordData = {
    //         emailId: this.emailId,
    //         employeeId: null
    //     };
    //     this.isLoading = true;

    //     this._loginService.login(this.emailId, Math.random().toString(36).slice(-8), true).subscribe(
    //         (response) => {
    //             this.isLoading = false;
    //             this._appService.token = response.headers.get("x-auth-token");

    //             this.generateOTP = false;
    //             this.resetPassword = true;
    //             this.newPassword = null;
    //             this.confirmPassword = null;
    //             this.otp = null;
    //             //this.validateOTP = true;
    //             // this.isLoading = false;
    //             // let result = response.body as StatusModel;
    //             // if (result.isSuccess) {
    //             //   this.generateOTP = false;
    //             //   this.validateOTP = true;
    //             // }
    //             // else {
    //             //   this.invalid = true;
    //             //   this.errormsg = "Technical issue. Please check email Id and submit again to generate OTP";
    //             //   this.generateOTP = true;
    //             //   this.validateOTP = false;
    //             // }
    //         },
    //         (error) => {
    //             this.isLoading = false;
    //             this.invalid = true;
    //             this.generateOTP = true;
    //             //this.validateOTP = false;
    //             this.errormsg = error.json()['error-message'];
    //             console.log(error);
    //         });


    //     // this._forgotPasswordService.forgotPassword(generateOTPReq)
    //     //   .subscribe(response => {
    //     //     this.isLoading = false;
    //     //     let _response: any = response;
    //     //     localStorage.setItem('token', JSON.parse(_response._body).access_token);
    //     //     this.generateOTP = false;
    //     //     this.validateOTP = true;
    //     //     // this.isLoading = false;
    //     //     // let result = response.body as StatusModel;
    //     //     // if (result.isSuccess) {
    //     //     //   this.generateOTP = false;
    //     //     //   this.validateOTP = true;
    //     //     // }
    //     //     // else {
    //     //     //   this.invalid = true;
    //     //     //   this.errormsg = "Technical issue. Please check email Id and submit again to generate OTP";
    //     //     //   this.generateOTP = true;
    //     //     //   this.validateOTP = false;
    //     //     // }
    //     //   },
    //     //     (error) => {
    //     //       this.isLoading = false;
    //     //       this.invalid = true;
    //     //       this.generateOTP = true;
    //     //       this.validateOTP = false;
    //     //       this.errormsg = "Technical issue. Please check email Id and submit again to generate OTP";
    //     //       console.log(error);
    //     //     });
    // }

    // onValidateOTPClick() {
    //     this.invalid = false;
    //     let validateOTPReq: ValidateOTPData = {
    //         emailId: this.emailId,
    //         employeeId: null,
    //         oTP: this.otp
    //     };
    //     this.isLoading = true;
    //     this._loginService.validateOTP(validateOTPReq)
    //         .subscribe(response => {
    //             this.isLoading = false;
    //             let result = response["_body"] as StatusModel;
    //             if (result.isSuccess) {
    //                 this.invalid = false;
    //                 this.generateOTP = false;
    //                 // this.validateOTP = false;
    //                 this.resetPassword = true;
    //             }
    //             else {
    //                 this.invalid = true;
    //                 this.errormsg = "Invalid OTP"
    //                 this.generateOTP = true;
    //                 //this.validateOTP = false;
    //             }
    //         },
    //         (error) => {
    //             this.isLoading = false;
    //             this.invalid = true;
    //             this.errormsg = error.json()['error-message'];
    //             this.generateOTP = true;
    //             //this.validateOTP = false;
    //             console.log(error);
    //         });
    // }

    // onResetPasswordClick() {
    //     if (this.invalidPassword) {
    //         return;
    //     }
    //     this.invalid = false;
    //     let resetPasswordReq: ResetPasswordData = {
    //         emailId: this.emailId,
    //         employeeId: null,
    //         newPassword: this.newPassword,
    //         oTP: this.otp
    //     };
    //     this.isLoading = true;
    //     this._loginService.resetPassword(resetPasswordReq)
    //         .subscribe(response => {
    //             this.isLoading = false;
    //             let result = response["_body"] as StatusModel;
    //             if (result.isSuccess) {
    //                 this.invalid = false;
    //                 this.generateOTP = false;
    //                 this.resetPassword = false;
    //                 //this.validateOTP = false;
    //                 this.successfulReset = true;
    //             }
    //             else {
    //                 this.invalid = true;
    //                 this.errormsg = "Password reset failure"
    //                 this.generateOTP = true;
    //                 this.resetPassword = false;
    //                 //this.validateOTP = false;
    //             }

    //             this._loginService.logout(false).subscribe(
    //                 (response) => {
    //                     this._appService.token = '';
    //                 },
    //                 (error) => {
    //                     this._appService.token = '';
    //                 });
    //         },

    //         (error) => {
    //             this.isLoading = false;
    //             this.invalid = true;
    //             this.errormsg = error.json()['error-message'];
    //             this.generateOTP = true;
    //             this.resetPassword = false;
    //             // this.validateOTP = false;
    //             console.log(error);

    //             this._loginService.logout(false).subscribe(
    //                 (response) => {
    //                     this._appService.token = '';
    //                 },
    //                 (error) => {
    //                     this._appService.token = '';
    //                 });
    //         });
    // }

    // validateConfirmPassword() {
    //     if (this.newPassword == this.confirmPassword) {
    //         this.invalidPassword = false;
    //     }
    //     else {
    //         this.invalidPassword = true;
    //     }
    // }

    // onCloseClick() {
    //     this.dialogRef.close(true);
    // }

    ngOnInit() {
    }

}
