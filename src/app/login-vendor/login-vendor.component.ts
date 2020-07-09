import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { HomeService } from '../home/home.service';
import { CryptoService } from '../common/crypto.service';
import { MatDialog } from '@angular/material';
import { LoginVendorService } from './login-vendor.service';

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
  haveOTP: boolean = false;
  validOTP: boolean = false;

  constructor(private _router: Router,
    private _formBuilder: FormBuilder,
    private _appService: AppService,
    private _homeService: HomeService,
    private _loginVendorService: LoginVendorService,
    private _cryptoService: CryptoService,
    public dialog: MatDialog
  ) {
  }

  get f() { return this.loginForm.controls; }

  OnLoginClick() {
    this.isFormSubmitted = true;
    this.isloading = true;
    if (this.loginForm.valid) {
      let userId: string = this.loginForm.get("userId").value;
      let password: string = this.loginForm.get("password").value;
      this._loginVendorService.login(userId, password).subscribe(
        (response) => {
          this.isloading = false;
          this._loginVendorService.storeUserData(response);
  
          this._router.navigate([this._appService.routingConstants.vendorDetails]);
        },
        (error) => {
          this.isloading = false;
          if (error.status == 500) {
            this.errorMessage = "Internal server error occurred. Please try again later."
          } else {
            this.errorMessage = error.json()['error-message'];
          }
  
        }
      );
  
    }
  }
  onGenerateOTPClick() {
    this.isloading = true;
    this.haveOTP = true;
    this.otpMessage = "OTP is sent on your registered Email ID"
  }
  ngOnInit() {
    this.isFormSubmitted = false;
    this.isloading = false;
    this.loginForm = this._formBuilder.group({
      userId: [null, [Validators.required,Validators.email]],
      password: [null, [Validators.required]]
    });
  }
}
