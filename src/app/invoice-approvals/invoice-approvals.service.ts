import { InvoiceApprovalInitReqModel, InvoiceApprovalInitResultModel, 
    UpdateInvoiceApprovalReqModel, GrnSesModel } from './../models/data-models';
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
        if(data) {
            initModel.invoiceDetails = data["invoiceDetails"];
            initModel.itemsList = data["itemsList"]; 
            initModel.approvalDetails = data["approvalDetails"];  
            initModel.poDetails = data["poDetails"];    
            initModel.grnSesList = data["grnSesList"]; 
        }

        for(let i = 0; i < 2; i++) {
            let gsModel: GrnSesModel = {
                grnSesNumber: "GRN00" + (i + 1)
            }

            initModel.grnSesList.push(gsModel);
        }

        return initModel;
    }

    updateInvoiceApprovalDetails(updateReqModel: UpdateInvoiceApprovalReqModel) {
        let url = this._appService.baseUrl + "updateInvAppr";
        return this._http.post(url, updateReqModel, {responseType: 'json', observe: 'response'});
    }
}
