import { globalConstant } from './../common/global-constant';
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

    isInvoiceCreateVisible: boolean = false;
    isApprovalsVisible: boolean = true;
    isPOInvoiceDumpVisible: boolean = false;
    isEmpanelmentVisible: boolean = false;

    constructor(private _appService: AppService,
        private _router: Router,
        private _loginService: LoginService,
        private _homeService: HomeService) { }

    onCollapseClick() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
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
    onVenDashClick() {
        this._router.navigate([this._appService.routingConstants.vendorDashboard]);
    }
    onVenApp1Click() {
        this._router.navigate([this._appService.routingConstants.vendorApproval]);
    }

    onVenApp2Click() {
        this._router.navigate([this._appService.routingConstants.vendorApproval]);
    }

    onInvoiceUploadClick() {
        this._router.navigate([this._appService.routingConstants.invoiceUpload]);
    }

    onVendorRegistrationClickClick() {
        this._router.navigate([this._appService.routingConstants.vendorDetails]);
    }

    onPOInvoiceDumpClick() {
        this._router.navigate([this._appService.routingConstants.poInvoiceDump]);
    }

    onNonPOInvoiceDumpClick() {
        this._router.navigate([this._appService.routingConstants.nonpoInvoiceDump]);
    }

    onVendorDumpClick() {
        this._router.navigate([this._appService.routingConstants.vendorDump]);
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

        this.isInvoiceCreateVisible = false;
        if (globalConstant.userDetails.isVendor || globalConstant.userDetails.isInvoiceUploader) {
            this.isInvoiceCreateVisible = true;
        }

        this.isApprovalsVisible = true;
        if (globalConstant.userDetails.isVendor || globalConstant.userDetails.isEmpanelment || globalConstant.userDetails.isInvoiceUploader) {
            this.isApprovalsVisible = false;
        }

        this.isPOInvoiceDumpVisible = false;
        if (globalConstant.userDetails.isFinance) {
            this.isPOInvoiceDumpVisible = true;
        }

        this.isEmpanelmentVisible = false;
        if (globalConstant.userDetails.isEmpanelment) {
            this.isEmpanelmentVisible = true;
        }
    }
}
