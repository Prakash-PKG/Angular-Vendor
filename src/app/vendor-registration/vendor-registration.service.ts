import { VendorRegistrationInitDataModel, VendorRegistrationRequestModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';
import { BusyDataModel } from './../models/data-models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class VendorRegistrationService {

    // Based on this, Busy icon will show
    private busy = new BehaviorSubject<BusyDataModel>(<BusyDataModel>{isBusy: false, msg: null});
    isBusy = this.busy.asObservable();

    constructor(private _appService: AppService,
                private _http: HttpClient) { }

    // Updates Busy status
    updateBusy(obj: BusyDataModel) {
        this.busy.next(obj)
    }

    async getVendorRegistrationInitData() {
        let url = this._appService.baseUrl + "venRegInitData";
        try {
            let response = await this._http.get(url).toPromise();
            return this.prepareVendorRegistrationInitData(response);
        } catch (error) {
            await console.log(error);
            return (new VendorRegistrationInitDataModel());
        }
    }

    prepareVendorRegistrationInitData(data) {
        let initModel: VendorRegistrationInitDataModel = new VendorRegistrationInitDataModel();
        if(data) {
            initModel.countriesList = data["countryDataVOList"];
            initModel.documentDetailsList = data["vendorMasterDocumentVOList"];        
            initModel.regionMasterVOList = data ["regionMasterVOList"];
        }

        return initModel;
    }

    updateVendorRegistrationDetails(updateReqModel: VendorRegistrationRequestModel) {
        let url = this._appService.baseUrl + "updateVendor";
        return this._http.post(url, updateReqModel, {responseType: 'json', observe: 'response'});
    }
}
