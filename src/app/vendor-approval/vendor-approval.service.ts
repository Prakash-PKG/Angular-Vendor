import { VendorApprovalInitResultModel, VendorApprovalInitReqModel,
        VendorApprovalReqModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class VendorApprovalService {

    constructor(private _appService: AppService,
                private _http: HttpClient) { }

    async getVendorApprovalInitData(req: VendorApprovalInitReqModel) {
        let url = this._appService.baseUrl + "venApprovalDetails";
        try {
            let response = await this._http.post(url, req).toPromise();
            return this.prepareVendorRegistrationInitData(response);
        } catch (error) {
            await console.log(error);
            return (new VendorApprovalInitResultModel());
        }
    }

    prepareVendorRegistrationInitData(data) {
        let detailsModel: VendorApprovalInitResultModel = new VendorApprovalInitResultModel();
        if (data) {
            detailsModel.statusDetails = data["status"];
            detailsModel.filesList = data["filesList"];
            detailsModel.vendorMasterDetails = data["vendorMasterDetails"];
            detailsModel.accGroupMasterList = data ["AccGroupMasterList"];
            detailsModel.companyCodeMasterList =data["companyCodeMasterList"];
            detailsModel.currencyMasterList = data["currencyMasterList"];
        }

        return detailsModel;
    }

    updateVendorApprovalDetails(updateReqModel: VendorApprovalReqModel) {
        let url = this._appService.baseUrl + "updateVendorApproval";
        return this._http.post(url, updateReqModel, {responseType: 'json', observe: 'response'});
    }
}
