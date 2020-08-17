import { AppService } from './../app.service';
import { BusyDataModel, POSearchResultModel, PODetailsModel, POSearchReqModel } from './../models/data-models';
import { PoSearchService } from './po-search.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { HomeService } from '../home/home.service';
import { globalConstant } from './../common/global-constant';
import { Router } from '@angular/router';
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
    selector: 'app-po-search',
    templateUrl: './po-search.component.html',
    styleUrls: ['./po-search.component.scss'],
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

export class PoSearchComponent implements OnInit {

    headerArr: string[] = [];

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    _initDetails: POSearchResultModel = null;
    poList: PODetailsModel[] = [];
    totalPoList: PODetailsModel[] = [];

    poSearchForm: FormGroup;

    isVendor: boolean = false;

    constructor(private _homeService: HomeService,
                private _appService: AppService,
                private _router: Router,
                private _formBuilder: FormBuilder,
                private _datePipe: DatePipe,
                private _poSearchService: PoSearchService) { }

    onPODownloadClick() {
        let req: POSearchReqModel = this.getPOSearchRequestData();

        let displayStartDt: string = this._datePipe.transform(new Date(), this._appService.displayDtFormat);;
        let fileName: string = "po-dump-" + displayStartDt + ".xlsx";
        this.downloadPODump(req, fileName);
    }

    downloadPODump(req: POSearchReqModel, fileName: string) {
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._poSearchService.getFileData(req).subscribe(
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

    onPOClick(po: PODetailsModel) {
        this._appService.selectedPO = po;
        this._router.navigate([this._appService.routingConstants.poDetails]);
    }

    getPOSearchRequestData() {
        let req: POSearchReqModel = {
            vendorId: null,
            employeeId: null,
            approvalLevels: [],
            departments: [],
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
        this.poList = [];
        this.totalPoList = [];

        let req: POSearchReqModel = this.getPOSearchRequestData();

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._initDetails = await this._poSearchService.getPOList(req);
        if(this._initDetails && this._initDetails.poList && this._initDetails.poList.length > 0) {
            this.poList = this._initDetails.poList.concat();
            this.totalPoList = this.poList.concat();
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
    }

    getFormattedDate(dtStr: string) {
        if(dtStr) {
            return this._appService.getFormattedDate(dtStr);
        }
        
        return "";
    }

    onClearClick() {
        this.poSearchForm.reset();
        this.poList = this.totalPoList.concat();
    }

    onSearchChange() {

        let poNumberVal = this.poSearchForm.get("poNumber").value;
        let lcPoNumberVal = (poNumberVal) ? poNumberVal.toLowerCase() : "";

        let startDateVal = this.poSearchForm.get("startDate").value;

        let endDateVal = this.poSearchForm.get("endDate").value;

        this.poList = this.totalPoList.filter(function (req) {
                                if ((req.poNumber && req.poNumber.toString().toLowerCase().indexOf(lcPoNumberVal) > -1) &&
                                    ((req.poDate && startDateVal) ? new Date(req.poDate) > startDateVal : true) &&
                                    ((req.poDate && endDateVal) ? new Date(req.poDate) < endDateVal : true)) {
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
        this.isVendor = (globalConstant.userDetails.isVendor) ? true : false;

        this._appService.selectedPO = null;

        this.isDashboardCollapsed = true;

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        this.poSearchForm = this._formBuilder.group({
            poNumber: null,
            startDate: null,
            endDate: null
        });

        this.poSearchForm.get("poNumber").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.poSearchForm.get("startDate").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.poSearchForm.get("endDate").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        setTimeout(() => {
           this.loadInitData();
        }, 100);
    }
}
