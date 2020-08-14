import { InvoiceSearchService } from './invoice-search.service';
import {
    InvoiceSearchRequestModel, BusyDataModel,
    InvoiceSearchResultModel, InvoiceModel
} from './../models/data-models';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { HomeService } from '../home/home.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { globalConstant } from './../common/global-constant';
import { Router } from '@angular/router';
import { AppService } from './../app.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import * as _ from 'underscore';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
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
    selector: 'app-invoice-search',
    templateUrl: './invoice-search.component.html',
    styleUrls: ['./invoice-search.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        },

        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ]
})
export class InvoiceSearchComponent implements OnInit {

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    _initDetails: InvoiceSearchResultModel = null;

    invoiceList: InvoiceModel[] = [];
    totalInvoiceList: InvoiceModel[] = [];

    invoiceSearchForm: FormGroup;

    isForPayments: boolean = false;

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _datePipe: DatePipe,
        private _invoiceSearchService: InvoiceSearchService) { }

    onUpdatePaymentStatusClick(inv: InvoiceModel) {
        this._appService.selectedInvoice = inv;
        this._appService.isInvoiceDetailsForPayments = this.isForPayments;
        this._router.navigate([this._appService.routingConstants.invoiceDetails]);
    }

    onInvoiceDownloadClick() {
        let req: InvoiceSearchRequestModel = this.getPOSearchRequestData();

        let displayStartDt: string = this._datePipe.transform(new Date(), this._appService.displayDtFormat);;
        let fileName: string = "invoice-dump-" + displayStartDt + ".xlsx";
        this.downloadInvoiceDump(req, fileName);
    }

    downloadInvoiceDump(req: InvoiceSearchRequestModel, fileName: string) {
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._invoiceSearchService.getFileData(req).subscribe(
            (data) => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                const blob = new Blob([data.body], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
            },
            error => {
                console.log(error);
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
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

    getPOSearchRequestData() {
        // let req: InvoiceSearchRequestModel = {
        //     vendorId: null,
        //     employeeId: null,
        //     approvalLevels: [],
        //     departments: [],
        //     isForPayments: this.isForPayments
        // };

        // if (globalConstant.userDetails.isVendor) {
        //     req.vendorId = globalConstant.userDetails.userId;
        // }
        // else {
        //     req.employeeId = globalConstant.userDetails.isFunctionalHead ? globalConstant.userDetails.userId : null;

        //     if (globalConstant.userDetails.isPurchaseOwner || globalConstant.userDetails.isInvoiceUploader) {
        //         req.departments = req.departments.concat(globalConstant.userDetails.poDepts);
        //     }

        //     if (globalConstant.userDetails.isFinance) {
        //         req.approvalLevels.push(this._appService.approvalLevels.finance);
        //     }
        // }

        // return req;
        
        let req: InvoiceSearchRequestModel = {
            vendorId: null,
            employeeId: null,
            approvalLevels: [],
            departments: [],
            isForPayments: this.isForPayments,
            projectIds: []
        };

        if(globalConstant.userDetails.isVendor) {
            req.vendorId = globalConstant.userDetails.userId;
        }
        else {
            //req.employeeId = globalConstant.userDetails.isFunctionalHead ? globalConstant.userDetails.userId : null;

            // if(globalConstant.userDetails.isPurchaseOwner || globalConstant.userDetails.isInvoiceUploader) {
            //     req.departments = req.departments.concat(globalConstant.userDetails.poDepts);
            // }

            // if(globalConstant.userDetails.isFinance) {
            //     req.approvalLevels.push(this._appService.approvalLevels.finance);
            // }

            if(globalConstant.userDetails.isPurchaseOwner || globalConstant.userDetails.isInvoiceUploader) {
                req.approvalLevels.push(this._appService.approvalLevels.po);
                req.departments = req.departments.concat(globalConstant.userDetails.poDepts);
            }

            if(globalConstant.userDetails.isFunctionalHead) {
                req.approvalLevels.push(this._appService.approvalLevels.functionalHead);
                req.departments = req.departments.concat(globalConstant.userDetails.functionalHeadDepts);
                req.projectIds = req.projectIds.concat(globalConstant.userDetails.functionalHeadProjects);
            }

            if(globalConstant.userDetails.isFinance) {
                req.approvalLevels.push(this._appService.approvalLevels.finance);
            }

            if(req.departments && req.departments.length > 0) {
                req.departments = _.uniq(req.departments);
            }
        }

        return req;
    }

    async loadInitData() {
        this.invoiceList = [];
        this.totalInvoiceList = [];

        let req: InvoiceSearchRequestModel = this.getPOSearchRequestData();

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._initDetails = await this._invoiceSearchService.getInvoiceList(req);
        if (this._initDetails && this._initDetails.invoiceList && this._initDetails.invoiceList.length > 0) {
            this.invoiceList = this._initDetails.invoiceList.concat();
            this.totalInvoiceList = this.invoiceList.concat();
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
    }

    onClearClick() {
        this.invoiceSearchForm.reset();
        this.invoiceList = this.totalInvoiceList.concat();
    }

    onSearchChange() {
        let invoiceNumberVal = this.invoiceSearchForm.get("invoiceNumber").value;
        let lcInvoiceNumberVal = (invoiceNumberVal) ? invoiceNumberVal.toLowerCase() : "";

        let poNumberVal = this.invoiceSearchForm.get("poNumber").value;
        let lcPoNumberVal = (poNumberVal) ? poNumberVal.toLowerCase() : "";

        let entityNoVal = this.invoiceSearchForm.get("entityNo").value;
        let lcEntityNoVal = (entityNoVal) ? entityNoVal.toLowerCase() : "";

        let projectIdVal = this.invoiceSearchForm.get("projectId").value;
        let lcProjectIdVal = (projectIdVal) ? projectIdVal.toLowerCase() : "";

        let startDateVal = this.invoiceSearchForm.get("startDate").value;

        let endDateVal = this.invoiceSearchForm.get("endDate").value;

        this.invoiceList = this.totalInvoiceList.filter(function (req) {
            if ((req.poNumber && req.poNumber.toString().toLowerCase().indexOf(lcPoNumberVal) > -1) &&
                (req.invoiceNumber && req.invoiceNumber.toString().toLowerCase().indexOf(lcInvoiceNumberVal) > -1) &&
                (req.companyCode && req.companyCode.toString().toLowerCase().indexOf(lcEntityNoVal) > -1) &&
                (req.projectId && req.projectId.toString().toLowerCase().indexOf(lcProjectIdVal) > -1) &&
                ((req.invoiceDate && startDateVal) ? new Date(req.invoiceDate) > startDateVal : true) &&
                ((req.invoiceDate && endDateVal) ? new Date(req.invoiceDate) < endDateVal : true)) {
                return true;
            }
        });

    }

    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.isForPayments = this._appService.isInvoiceSearchForPayments;

        this._appService.isInvoiceSearchForPayments = false;

        this.isDashboardCollapsed = true;

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        this.invoiceSearchForm = this._formBuilder.group({
            invoiceNumber: null,
            poNumber: null,
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
