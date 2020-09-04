import { Component, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { VendorMasterDetailsModel, BusyDataModel } from '../../app/models/data-models'
import { HomeService } from '../home/home.service';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { VendorDashboardService } from './vendor-dashboard.service';
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
    selector: 'app-vendor-dashboard',
    templateUrl: './vendor-dashboard.component.html',
    styleUrls: ['./vendor-dashboard.component.scss']
})
export class VendorDashboardComponent implements OnInit {


    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    // _initDetails: VendorMasterDetailsModel = null;

    vendorList: VendorMasterDetailsModel[] = [];
    totalVendorList: VendorMasterDetailsModel[] = [];
    vendorSearchForm: FormGroup;

    
    pageSize = 25;
    pageSizeOptions: number[] = [10, 25, 50, 100];

    headerArr: string[] = [];

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _vendorDashService: VendorDashboardService) { }

        setPageSizeOptions(setPageSizeOptionsInput: string) {
            this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
        }
    
        onPageChanged(e) {
            let firstCut = e.pageIndex * e.pageSize;
            let secondCut = firstCut + e.pageSize;
            this.vendorList = this.totalVendorList.slice(firstCut, secondCut);
        }

    loadInitData() {
        this.vendorList = [];
        this.totalVendorList = [];

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._vendorDashService.getVendorList().subscribe(response => {

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
            if (response.body) {
                let results: VendorMasterDetailsModel[] = response.body as VendorMasterDetailsModel[];
                this.vendorList = results;
                console.log(results.length);
                console.log(this.vendorList.length);
                this.vendorList = [].concat.apply([], results);
                console.log(this.vendorList);
                this.totalVendorList = this.vendorList.concat();
                this.vendorList = this.totalVendorList.slice(0, this.pageSize);
 
            }
        });
        (error) => {
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
            console.log(error);
        };
    }

    onClearClick() {
        this.vendorSearchForm.reset();
        this.vendorList = this.totalVendorList.concat();
    }

    onSearchChange() {
        
        this.vendorList = this.totalVendorList;

        let vendorIdVal = this.vendorSearchForm.get("vendorId").value;
        let lcvendorIdVal = (vendorIdVal) ? vendorIdVal.toLowerCase() : "";

        let vendorNameVal = this.vendorSearchForm.get("vendorName").value;
        let lcvendorNameVal = (vendorNameVal) ? vendorNameVal.toLowerCase() : "";

        let mobileNumVal = this.vendorSearchForm.get("mobileNum").value;
        let lcmobileNumVal = (mobileNumVal) ? mobileNumVal.toLowerCase() : "";

        let coCodeVal = this.vendorSearchForm.get("coCode").value;
        let lcCoCodeVal = (coCodeVal) ? coCodeVal.toLowerCase() : "";

        this.vendorList = this.totalVendorList.filter(function (req) {
            if ((req.vendorId && req.vendorId.toString().toLowerCase().indexOf(lcvendorIdVal) > -1) &&
                (req.vendorName && req.vendorName.toString().toLowerCase().indexOf(lcvendorNameVal) > -1) &&
                (req.mobileNum && req.mobileNum.toString().toLowerCase().indexOf(lcmobileNumVal) > -1) &&
                (req.companyCode && req.companyCode.toString().toLowerCase().indexOf(lcCoCodeVal) > -1)) {
                return true;
            }
        });

    }
    onVendorClick(vendor: VendorMasterDetailsModel) {
        this._appService.selectedVendor = vendor;
        this._appService.isExistingVendor = true;
        this._router.navigate([this._appService.routingConstants.vendorApproval]);
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


        this.vendorSearchForm = this._formBuilder.group({
            vendorId: null,
            vendorName: null,
            mobileNum: null,
            coCode: null
        });

        this.vendorSearchForm.get("vendorId").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.vendorSearchForm.get("coCode").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.vendorSearchForm.get("vendorName").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.vendorSearchForm.get("mobileNum").valueChanges.subscribe(val => {
            this.onSearchChange();
        });
        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }

}