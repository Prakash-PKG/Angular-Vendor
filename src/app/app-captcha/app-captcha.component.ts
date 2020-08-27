import { AppService } from './../app.service';

import { AppCaptchaService } from './app-captcha.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CaptchaComponent } from 'angular-captcha';
import { Observable } from 'rxjs/Rx';

@Component({
    selector: 'app-app-captcha',
    templateUrl: './app-captcha.component.html',
    styleUrls: ['./app-captcha.component.scss']
})
export class AppCaptchaComponent implements OnInit {

    @ViewChild(CaptchaComponent) captchaComponent: CaptchaComponent;

    constructor(private _appCaptchaService: AppCaptchaService,
        private _appService: AppService) { }

    // Process the form on submit event.
    validate(value, valid): void {

        // get the user-entered captcha code value to be validated at the backend side        
        let userEnteredCaptchaCode = this.captchaComponent.userEnteredCaptchaCode;

        // get the id of a captcha instance that the user tried to solve
        let captchaId = this.captchaComponent.captchaId;

        const postData = {
            userEnteredCaptchaCode: userEnteredCaptchaCode,
            captchaId: captchaId
        };

        // post the captcha data to the backend
        this._appCaptchaService.send(postData)
            .subscribe(
            response => {
                if (response.success == false) {
                    // captcha validation failed; reload image
                    this.captchaComponent.reloadImage();
                    // TODO: maybe display an error message, too
                } else {
                    // TODO: captcha validation succeeded; proceed with the workflow
                }
            });
    }

    ngOnInit() {
        // set the captchaEndpoint property to point to 
        // the captcha endpoint path on your app's backend
        this.captchaComponent.captchaEndpoint =
            this._appService.baseUrl + 'simple-captcha-endpoint';
    }

}
