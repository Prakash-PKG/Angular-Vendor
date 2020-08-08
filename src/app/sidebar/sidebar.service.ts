import { globalConstant } from './../common/global-constant';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';
import { MsAdalAngular6Service } from 'microsoft-adal-angular6';
import { AppService } from '../app.service';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {

    constructor(private _appService: AppService,
                private _router: Router,
                private _adalService: MsAdalAngular6Service,
                private _loginService: LoginService) { }

    logout() {
        this._loginService.logout(localStorage.getItem('x-auth-token')).subscribe(
            (response) => {
                this._appService.stopWatching();
                
                localStorage.clear();

                if(globalConstant.userDetails.isVendor || globalConstant.userDetails.isTempVendor) {
                    this._router.navigate([this._appService.routingConstants.loginVendor])
                }
                else {
                    if (this._appService.isSSORequired) {
                        this._adalService.logout();
                    }
                    else {
                        this._router.navigate([this._appService.routingConstants.login]);
                    }
                }
            },
            (error) => {
                this._appService.stopWatching();
                console.log("logout Falied");
                console.log(error);
                localStorage.clear();

                if (this._appService.isSSORequired) {
                    this._adalService.logout();
                }
                else {
                    this._router.navigate([this._appService.routingConstants.login]);
                }
            }
        )
    }
}
