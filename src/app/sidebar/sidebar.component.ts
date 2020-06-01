import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { HomeService } from '../home/home.service';
import { transition, animate, state, style, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    animations: [
        trigger('collapseChanged', [
            state('true', style({
                width: '4em',
            })),
            state('false', style({
                width: '20%'
            })),
            transition('true <=> false', animate('0.5s ease-in-out'))
        ])
    ]
})
export class SidebarComponent implements OnInit {
    isSidebarCollapsed: boolean = false;
    isMenuTextVisible: boolean = true;

    constructor(private _appService: AppService,
        private _router: Router,
        private _loginService: LoginService,
        private _homeService: HomeService) { }

    onCollapseClick() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;

        if (this.isSidebarCollapsed == false) {
            setTimeout(() => {
                this.isMenuTextVisible = true;
            }, 500);
        }
        else {
            this.isMenuTextVisible = false;
        }

        this._homeService.updateSidebarDetails(this.isSidebarCollapsed);
    }

    onEmpanelmentClick() {
        this._router.navigate([this._appService.routingConstants.empanelment]);
    }

    onPendingApprovalClick() {
        this._router.navigate([this._appService.routingConstants.pendingApprovals]);
    }

    onPoSearchClick() {
        this._router.navigate([this._appService.routingConstants.posearch]);
    }

    onInvoiceSearchClick() {
        this._router.navigate([this._appService.routingConstants.invoiceSearch]);
    }

    onVendorRegistrationClickClick() {
        this._router.navigate([this._appService.routingConstants.vendorDetails]);
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
        this.isSidebarCollapsed = false;
        this._homeService.updateSidebarDetails(this.isSidebarCollapsed);
    }
}
