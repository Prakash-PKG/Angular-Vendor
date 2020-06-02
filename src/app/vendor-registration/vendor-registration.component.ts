import { VendorRegistrationService } from './vendor-registration.service';
import { BusyDataModel, VendorRegistrationInitDataModel } from './../models/data-models';
import { HomeService } from './../home/home.service';
import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
    selector: 'app-vendor-registration',
    templateUrl: './vendor-registration.component.html',
    styleUrls: ['./vendor-registration.component.scss']
})
export class VendorRegistrationComponent implements OnInit {

    vendorRegistrationInitDataModel: VendorRegistrationInitDataModel = null;
    constructor(private _homeService: HomeService,
                private _appService: AppService,
                private _vendorRegistrationService: VendorRegistrationService) { }

    async loadInitData() {
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this.vendorRegistrationInitDataModel = await this._vendorRegistrationService.getVendorRegistrationInitData();
        this._appService.vendorRegistrationInitDetails = this.vendorRegistrationInitDataModel;
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
    }

    ngOnInit() {
        setTimeout(() => {
           this.loadInitData();
        }, 100);
    }

}
