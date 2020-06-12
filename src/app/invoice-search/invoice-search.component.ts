import { InvoiceSearchService } from './invoice-search.service';
import { InvoiceSearchRequestModel, BusyDataModel, 
        InvoiceSearchResultModel, InvoiceModel } from './../models/data-models';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { HomeService } from '../home/home.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { globalConstant } from './../common/global-constant';
import { Router } from '@angular/router';
import { AppService } from './../app.service';

@Component({
    selector: 'app-invoice-search',
    templateUrl: './invoice-search.component.html',
    styleUrls: ['./invoice-search.component.scss'],
})
export class InvoiceSearchComponent implements OnInit {

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    _initDetails: InvoiceSearchResultModel = null;

    invoiceList: InvoiceModel[] = [];

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _router: Router,
        private _invoiceSearchService: InvoiceSearchService) { }

    onInvoiceClick(inv: InvoiceModel) {
        this._appService.selectedInvoice = inv;
        this._router.navigate([this._appService.routingConstants.invoiceDetails]);
    }

    getFormattedDate(dtStr: string) {
        if(dtStr) {
            return this._appService.getFormattedDate(dtStr);
        }
        
        return "";
    }

    async loadInitData() {

        let req: InvoiceSearchRequestModel = {
            vendorId: null,
            employeeId: null,
            approvalLevels: [],
            departments: []
        };

        if (globalConstant.userDetails.isVendor) {
            req.vendorId = globalConstant.userDetails.userId;
        }
        else {
            req.employeeId = globalConstant.userDetails.isFunctionalHead ? globalConstant.userDetails.userId : null;

            if (globalConstant.userDetails.isPurchaseOwner) {
                req.departments = req.departments.concat(globalConstant.userDetails.poDepts);
            }

            if (globalConstant.userDetails.isFinance) {
                req.approvalLevels.push(this._appService.approvalLevels.finance);
            }
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._initDetails = await this._invoiceSearchService.getInvoiceList(req);
        if (this._initDetails) {
            this.invoiceList = this._initDetails.invoiceList.concat();
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
    }

    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.isDashboardCollapsed = true;

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }

}
