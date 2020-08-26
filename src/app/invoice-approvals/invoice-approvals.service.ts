import {
    InvoiceApprovalInitReqModel, InvoiceApprovalInitResultModel, FileDetailsModel,
    UpdateInvoiceApprovalReqModel, GrnSesModel
} from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class InvoiceApprovalsService {

    constructor(private _appService: AppService,
        private _http: HttpClient) { }

    async getInvoiceApprovalInitData(req: InvoiceApprovalInitReqModel) {
        let url = this._appService.baseUrl + "invApprDetails";
        try {
            let response = await this._http.post(url, req).toPromise();
            return this.prepareInvoiceApprovalInitData(response);
        } catch (error) {
            await console.log(error);
            return (new InvoiceApprovalInitResultModel());
        }
    }

    prepareInvoiceApprovalInitData(data) {
        let initModel: InvoiceApprovalInitResultModel = new InvoiceApprovalInitResultModel();
        let filesList: FileDetailsModel[] = [];
        if (data) {
            initModel.invoiceDetails = data["invoiceDetails"];
            initModel.itemsList = data["itemsList"];
            initModel.approvalDetails = data["approvalDetails"];
            initModel.poDetails = data["poDetails"];
            initModel.grnSesList = data["grnSesList"];
            initModel.grnSesItemsList = data["grnSesItemsList"];
            initModel.approvalsList = data["approvalsList"];
            initModel.communicationMsgsList = data["communicationMsgsList"];
            initModel.invoiceFileTypes = data["invoiceFileTypes"];  
            initModel.invoiceFilesList = [];
            initModel.supportFilesList = [];

            filesList = data["fileDetails"];
        }

        if(filesList && filesList.length > 0) {
            let invFiles: FileDetailsModel[] = filesList.filter(f => f.documentTypeId == 1);
            if(invFiles && invFiles.length > 0) {
                initModel.invoiceFilesList = invFiles.concat();
            }
            
            let supportFiles: FileDetailsModel[] = filesList.filter(f => f.documentTypeId == 2);
            if(supportFiles && supportFiles.length > 0) {
                initModel.supportFilesList = supportFiles.concat();
            }
        }

        // let invoiceFile: FileDetailsModel = {
        //     actualFileName: "invoicefile1.docx",
        //     uniqueFileName: "uniq_invoicefile1.docx",
        //     fileData: null,
        //     documentTypeId: 1,
        //     fileId: 10,
        //     createdDate: null,
        //     createdBy: null
        // }

        // initModel.invoiceFilesList.push(invoiceFile);

        // let supportFile: FileDetailsModel = {
        //     actualFileName: "invoicefile1.docx",
        //     uniqueFileName: "uniq_invoicefile1.docx",
        //     fileData: null,
        //     documentTypeId: 1,
        //     fileId: 10,
        //     createdDate: null,
        //     createdBy: null
        // }

        // initModel.supportFilesList.push(supportFile);

        return initModel;
    }

    updateInvoiceApprovalDetails(updateReqModel: UpdateInvoiceApprovalReqModel) {
        let url = this._appService.baseUrl + "updateInvAppr";
        return this._http.post(url, updateReqModel, { responseType: 'json', observe: 'response' });
    }
}
