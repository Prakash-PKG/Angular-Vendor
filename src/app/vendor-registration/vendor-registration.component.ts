import { VendorRegistrationService } from './vendor-registration.service';
import { BusyDataModel, VendorRegistrationInitDataModel } from './../models/data-models';
import { HomeService } from './../home/home.service';
import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { flatMap } from 'rxjs/operators';
import { Route } from '@angular/compiler/src/core';

@Component({
    selector: 'app-vendor-registration',
    templateUrl: './vendor-registration.component.html',
    styleUrls: ['./vendor-registration.component.scss']
})
export class VendorRegistrationComponent implements OnInit {

    private _busySubscription: any = null;

    spinnerCls: string = "";
    busyMsg: string = "Please wait...";
    currentUrl:string="";
    venDetails:string="/vendor/vendetails";
    venAdd:string="/vendor/venaddr";
    venBank:string="/vendor/venbank";
    venDoc:string="/vendor/vendocs";

    vendorRegistrationInitDataModel: VendorRegistrationInitDataModel = null;
    constructor(private _appService: AppService,
                private _spinner: NgxSpinnerService,
                private _vendorRegistrationService: VendorRegistrationService,
                private route: Router) { }

    async loadInitData() {
        this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this.vendorRegistrationInitDataModel = await this._vendorRegistrationService.getVendorRegistrationInitData();
        this._appService.vendorRegistrationInitDetails = this.vendorRegistrationInitDataModel;
        this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
    }

    ngOnDestroy() {
        if (this._busySubscription) {
            this._busySubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.currentUrl=this.route.routerState.snapshot.url;
        let spin = this._spinner;
        this._busySubscription = this._vendorRegistrationService.isBusy.subscribe(data => {
            if(data && data.isBusy == true) {
                spin.show();
                this.spinnerCls = "overlay";
                //this.busyMsg = (data.msg) ? data.msg : "Please wait...";
                this.busyMsg = "Please wait...";
            }
            else {
                spin.hide();
                this.spinnerCls = "";
            }
        });

        setTimeout(() => {
           this.loadInitData();
        }, 100);

    }

}
