import { Component, OnInit } from '@angular/core';
import { VendorMasterDetailsModel, BusyDataModel } from '../../app/models/data-models'
import { HomeService } from '../home/home.service';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InvoiceSearchResultModel, InvoiceModel } from './../models/data-models';
import { InvoiceSearchService } from '../invoice-search/invoice-search.service';
export const MY_FORMATS = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'LL',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};
@Component({
    selector: 'app-invoice-rejected',
    templateUrl: './invoice-rejected.component.html',
    styleUrls: ['./invoice-rejected.component.scss']
})
export class InvoiceRejectedComponent implements OnInit {

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    _initDetails: InvoiceSearchResultModel = null;
    rejInvList: InvoiceModel[] = [];
    totalRejInvList: InvoiceModel[] = [];
    invoiceSearchForm: FormGroup;

    pageSize = 25;
    pageSizeOptions: number[] = [10, 25, 50, 100];

    headerArr: string[] = [];

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _invoiceSearchService: InvoiceSearchService) { }

    setPageSizeOptions(setPageSizeOptionsInput: string) {
        this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }

    onPageChanged(e) {
        let firstCut = e.pageIndex * e.pageSize;
        let secondCut = firstCut + e.pageSize;
        this.rejInvList = this.totalRejInvList.slice(firstCut, secondCut);
    }

    async loadInitData() {
        this.rejInvList = [];
        this.totalRejInvList = [];

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._initDetails = await this._invoiceSearchService.getRejectedInvoices();
        if (this._initDetails && this._initDetails.invoiceList && this._initDetails.invoiceList.length > 0) {
            this.rejInvList = this._initDetails.invoiceList.concat();
            this.totalRejInvList = this.rejInvList.concat();
            this.totalRejInvList = this.sortInvByDate(this.totalRejInvList);
            this.rejInvList = this.totalRejInvList.slice(0, this.pageSize);
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

    }
    sortInvByDate(totalRejInvList) {

        totalRejInvList = totalRejInvList.sort(function (a, b) {
            return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
        });

        return totalRejInvList;
    }
    onClearClick() {
        this.invoiceSearchForm.reset();
        this.rejInvList = this.totalRejInvList.concat();
    }

    onSearchChange() {
        let invoiceNumberVal = this.invoiceSearchForm.get("invoiceNumber").value;
        let lcInvoiceNumberVal = (invoiceNumberVal) ? invoiceNumberVal.toLowerCase() : "";

        let poNumberVal = this.invoiceSearchForm.get("poNumber").value;
        let lcPoNumberVal = (poNumberVal) ? poNumberVal.toLowerCase() : "";

        let vendorIdVal = this.invoiceSearchForm.get("vendorId").value;
        let lcVendorIdVal = (vendorIdVal) ? vendorIdVal.toLowerCase() : "";

        let entityNoVal = this.invoiceSearchForm.get("entityNo").value;
        let lcEntityNoVal = (entityNoVal) ? entityNoVal.toLowerCase() : "";

        let projectIdVal = this.invoiceSearchForm.get("projectId").value;
        let lcProjectIdVal = (projectIdVal) ? projectIdVal.toLowerCase() : "";

        let startDateVal = this.invoiceSearchForm.get("startDate").value;

        let endDateVal = this.invoiceSearchForm.get("endDate").value;

        this.rejInvList = this.totalRejInvList.filter(function (req) {

            let isPONumberValid: boolean = true;
            if (req.poNumber) {
                isPONumberValid = (req.poNumber && req.poNumber.toString().toLowerCase().indexOf(lcPoNumberVal) > -1);
            }

            if (isPONumberValid &&
                (req.invoiceNumber && req.invoiceNumber.toString().toLowerCase().indexOf(lcInvoiceNumberVal) > -1) &&
                ((req.vendorId && req.vendorId.toString().toLowerCase().indexOf(lcVendorIdVal) > -1) || (req.vendorName && req.vendorName.toString().toLowerCase().indexOf(lcVendorIdVal) > -1)) &&
                (req.companyCode && req.companyCode.toString().toLowerCase().indexOf(lcEntityNoVal) > -1) &&
                (req.projectId && req.projectId.toString().toLowerCase().indexOf(lcProjectIdVal) > -1) &&
                ((req.invoiceDate && startDateVal) ? new Date(req.invoiceDate) > startDateVal : true) &&
                ((req.invoiceDate && endDateVal) ? new Date(req.invoiceDate) < endDateVal : true)) {
                return true;
            }
        });
    }

    onInvoiceClick(inv: InvoiceModel) {
        this._appService.selectedInvoice = inv;
        this._appService.isInvoiceDetailsForPayments = false;
        this._router.navigate([this._appService.routingConstants.invoiceDetails]);
    }

    getFormattedDate(dtStr: string) {
        if (dtStr) {
            return this._appService.getFormattedDate(dtStr);
        }

        return "";
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

        this.invoiceSearchForm = this._formBuilder.group({
            invoiceNumber: null,
            poNumber: null,
            vendorId: null,
            entityNo: null,
            projectId: null,
            startDate: null,
            endDate: null
        });

        this.invoiceSearchForm.get("invoiceNumber").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.invoiceSearchForm.get("poNumber").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.invoiceSearchForm.get("vendorId").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.invoiceSearchForm.get("entityNo").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.invoiceSearchForm.get("projectId").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.invoiceSearchForm.get("startDate").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.invoiceSearchForm.get("endDate").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }

}