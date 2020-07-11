import {
    VendorApprovalInitResultModel, VendorApprovalInitReqModel,
    VendorApprovalReqModel,
    VendorRegistrationDetailRequestModel,
    VendorMasterFilesModel,
    RemoveDocumentReqModel,
    FileDetailsModel,
    VendorDocumentReqModel
} from './../models/data-models';
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
            detailsModel.fileDetails = data["fileDetails"];
            detailsModel.vendorMasterDetails = data["vendorMasterDetails"];
            detailsModel.accGroupMasterList = data["accGroupMasterList"];
            detailsModel.companyCodeMasterList = data["companyCodeMasterList"];
            detailsModel.currencyMasterList = data["currencyMasterList"];
            detailsModel.vendorApprovalDetails = data["vendorApprovalDetail"];
            detailsModel.withholdTaxVOList = data["withholdTaxVOList"];
            detailsModel.withholdTypeVOList = data["withholdTypeVOList"];
            detailsModel.vendorMasterDocumentVOList = data["vendorMasterDocumentVOList"];
        }

        return detailsModel;
    }

    updateVendorApprovalDetails(updateReqModel: VendorApprovalReqModel) {
        let url = this._appService.baseUrl + "updateVendorApproval";
        return this._http.post(url, updateReqModel, { responseType: 'json', observe: 'response' });
    }
    
    sendBackForCorrection(sendVendCorrId: VendorRegistrationDetailRequestModel) {
        let url = this._appService.baseUrl + "fetchVendor";
        return this._http.post(url, sendVendCorrId, { responseType: 'json', observe: 'response' });
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
        let url = this._appService.baseUrl + 'downloadInvDoc/' + fileDetails.uniqueFileName;
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
}
