import { VendorRegistrationInitDataModel, VendorRegistrationRequestModel, FileDetailsModel, RemoveDocumentReqModel, VendorDocumentReqModel, PageDetailsModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';
import { BusyDataModel } from './../models/data-models';
import { BehaviorSubject, Observable } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';

@Injectable({
    providedIn: 'root'
})
export class VendorRegistrationService {

    // Based on this, Busy icon will show
    private busy = new BehaviorSubject<BusyDataModel>(<BusyDataModel>{ isBusy: false, msg: null });
    isBusy = this.busy.asObservable();
    vendorUserId:string="";
    countyryName:string="";
    // Based on this, can identify current page
    private pgDetails = new BehaviorSubject<PageDetailsModel>(<PageDetailsModel>{ pageName: "" });
    currentPageDetails = this.pgDetails.asObservable();

    constructor(private _appService: AppService,
        private _http: HttpClient) { }

    // Updates Busy status
    updateBusy(obj: BusyDataModel) {
        this.busy.next(obj)
    }

    async getVendorRegistrationInitData(vendorUserId) {
        // let  UserId=localStorage.getItem("userId");
        // this.vendorUserId=UserId;
        console.log("vendor service   " + vendorUserId);
        
        let url = this._appService.baseUrl + "venRegInitData/"+vendorUserId;
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
        if (data) {
            initModel.countriesList = data["countryDataVOList"];
            initModel.documentDetailsList = data["vendorMasterDocumentVOList"];
            initModel.regionMasterVOList = data["regionMasterVOList"];
            initModel.bankAccountTypeList = data["bankAccountTypeVOList"];
            initModel.vendorCounty=data["vendorCounty"];
            this._appService.countyNm=initModel.vendorCounty;
            }

        return initModel;
    }

    updateVendorRegistrationDetails(updateReqModel: VendorRegistrationRequestModel) {
        let url = this._appService.baseUrl + "updateVendor";
        return this._http.post(url, updateReqModel, { responseType: 'json', observe: 'response' });
    }

    uploadVendorDocuments(filesReq: VendorDocumentReqModel) {
        let url = this._appService.baseUrl + "updateVenDoc";
        return this._http.post(url, filesReq, { responseType: 'json', observe: 'response' });
    }

    deleteVendorFile(fileDetails: FileDetailsModel) {
        let req: RemoveDocumentReqModel = {
            fileId: fileDetails.fileId
        };
        let url = this._appService.baseUrl + "removeVenDoc";
        return this._http.post(url, req, { responseType: 'json', observe: 'response' });
    }

    getFileData(fileDetails: FileDetailsModel) {
        let url = this._appService.baseUrl + 'downloadVenDoc/' + encodeURIComponent(fileDetails.uniqueFileName);
        return this._http.get(url, { responseType: 'arraybuffer', observe: 'response' });
    }

    downloadFile(fileDetails: FileDetailsModel) {
        this.getFileData(fileDetails).subscribe(
            (data) => {
                const blob = new Blob([data.body], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = fileDetails.actualFileName;
                document.body.appendChild(a);
                a.click();
            },
            error => {
                console.log(error);
            });
    }

    // Updates current page details
    updateCurrentPageDetails(obj: PageDetailsModel) {
        this.pgDetails.next(obj)
    }
}
