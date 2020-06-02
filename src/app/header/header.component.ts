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
        
    }
}
