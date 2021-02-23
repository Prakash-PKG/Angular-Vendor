import { SidebarService } from './sidebar.service';
import { globalConstant } from './../common/global-constant';
import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { HomeService } from '../home/home.service';
import { transition, animate, state, style, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { LoginService } from '../login/login.service';
import { MsAdalAngular6Service } from 'microsoft-adal-angular6';

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
    isVendorDashboardVisible: boolean = false;
    isVendorRegistrationVisible: boolean = false;
    isVendorReportViewer: boolean = false;
    isInvoiceReportViewer: boolean = false;
    isVendorDumpVisible: boolean = false;

    _sidebarExpansionSubscription: any = null;

    constructor(private _appService: AppService,
        private _router: Router,
        private _adalService: MsAdalAngular6Service,
        private _loginService: LoginService,
        private _sidebarService: SidebarService,
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
    onRejectedInvoiceClick(){
        
        this._router.navigate([this._appService.routingConstants.invoiceRejected]);
    }

    onPoSearchClick() {
        this._router.navigate([this._appService.routingConstants.posearch]);
    }

    onInvoiceSearchClick() {
        this._appService.isInvoiceSearchForPayments = false;
        this._router.navigate([this._appService.routingConstants.invoiceSearch]);
    }

    onPaymentsInvoiceSearchClick() {
        this._appService.isInvoiceSearchForPayments = true;
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
    onVenReportClick() {
        this._router.navigate([this._appService.routingConstants.vendorReport]);
    }
    onInvPostReportClick() {

        this._router.navigate([this._appService.routingConstants.invoicePostReport]);
    }
    onInvReportClick() {

        this._router.navigate([this._appService.routingConstants.invoiceReport]);
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

    onContactMeClick() {
        this._router.navigate([this._appService.routingConstants.contact]);
    }


    onLogoutClick() {
        // this._loginService.logout().subscribe(
        //     (response) => {
        //         localStorage.clear();
        //         if(this._appService.isSSORequired) {
        //             this._adalService.logout();
        //         }
        //         else {
        //             this._router.navigate([this._appService.routingConstants.login]);
        //         }
        //     },
        //     (error) => {
        //         console.log("logout Falied");
        //         console.log(error);
        //         localStorage.clear();

        //         if(this._appService.isSSORequired) {
        //             this._adalService.logout();
        //         }
        //         else {
        //             this._router.navigate([this._appService.routingConstants.login]);
        //         }
        //     }
        // )

        this._sidebarService.logout();
    }

    ngOnInit() {
        this.isSidebarCollapsed = true;
        this._homeService.updateSidebarDetails(this.isSidebarCollapsed);

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isSidebarCollapsed = data;
        });

        this.isInvoiceCreateVisible = false;
        if (globalConstant.userDetails.isVendor || globalConstant.userDetails.isInvoiceUploader) {
            this.isInvoiceCreateVisible = true;
        }

        // this.isApprovalsVisible = true;
        // if (globalConstant.userDetails.isVendor || globalConstant.userDetails.isEmpanelment || globalConstant.userDetails.isInvoiceUploader) {
        //     this.isApprovalsVisible = false;
        // }


        this.isApprovalsVisible = false;
        if (globalConstant.userDetails.isSubContractReceiver || globalConstant.userDetails.isPurchaseOwner
            || globalConstant.userDetails.isFunctionalHead || globalConstant.userDetails.isProcurement
            || globalConstant.userDetails.isFinance) {
            this.isApprovalsVisible = true;
        }

        this.isPOInvoiceDumpVisible = false;
        if (globalConstant.userDetails.isInvoiceDumpVisible) {
            this.isPOInvoiceDumpVisible = true;
        }

        this.isVendorDumpVisible = false;
        if (globalConstant.userDetails.isFinance) {
            this.isVendorDumpVisible = true;
        }

        this.isEmpanelmentVisible = false;
        if (globalConstant.userDetails.isEmpanelment) {
            this.isEmpanelmentVisible = true;
        }

        this.isVendorDashboardVisible = false;
        if (globalConstant.userDetails.isFinance || globalConstant.userDetails.isProcurement || globalConstant.userDetails.isEmpanelment) {
            this.isVendorDashboardVisible = true;
        }

        this.isVendorRegistrationVisible = false;
        if (globalConstant.userDetails.isEmpanelment) {
            this.isVendorRegistrationVisible = true;
        }

        this.isVendorReportViewer = globalConstant.userDetails.isVendorReportViewer;
        this.isInvoiceReportViewer = globalConstant.userDetails.isInvoiceReportViewer;
    }
}
