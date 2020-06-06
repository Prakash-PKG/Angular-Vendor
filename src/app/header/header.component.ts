import { globalConstant } from './../common/global-constant';
import { Component, OnInit } from '@angular/core';
import { HomeService } from './../home/home.service';
import { AppService } from './../app.service';
import { HeaderService } from './header.service';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    userName: string = "";
    userId: string = "";
    roleName: string = "";

    constructor(private _router: Router,
                private _appService: AppService,
                private _loginService: LoginService) {
    }

    onLogoutClick() {
        this._loginService.logout().subscribe(
            (response) => {
                localStorage.clear();
                this._router.navigate([this._appService.routingConstants.login]);
                
            },
            (error) => {
                console.log("logout Falied");
                console.log(error);
                localStorage.clear();
            }
        )
    }

    ngOnInit() {
        this.userName = globalConstant.userDetails.userName;
        this.userId = globalConstant.userDetails.userId;

        if(globalConstant.userDetails.userRoles && globalConstant.userDetails.userRoles.length > 0) {
            this.roleName = globalConstant.userDetails.userRoles[0].roleName;
        }
    }
}
