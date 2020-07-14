import { InvoiceDetailsRequestModel, InvoiceDetailsResultModel, 
        FileDetailsModel, paymentStatusModel, PaymentReqModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class InvoiceDetailsService {

    constructor(private _appService: AppService,
                private _http: HttpClient) { }

    async getInvoiceDetails(req: InvoiceDetailsRequestModel) {
        let url = this._appService.baseUrl + "invDetails";
        try {
            let response = await this._http.post(url, req).toPromise();
            return this.preparePODetails(response);
        } catch (error) {
            await console.log(error);
            return (new InvoiceDetailsResultModel());
        }
    }

    preparePODetails(data) {
        let initModel: InvoiceDetailsResultModel = new InvoiceDetailsResultModel();
        let filesList: FileDetailsModel[] = [];
        let paymentStatusList: paymentStatusModel[] = [{ paymentStatusId: -1, statusCode: "", statusDesc: "Please select status"}];
        if (data) {
            initModel.itemsList = data["itemsList"];
            initModel.statusDetails = data["statusDetails"];
            initModel.approvalsList = data["approvalsList"];
            initModel.paymentStatusDetails = data["paymentStatusDetails"];
            initModel.paymentDetails = data["paymentDetails"];
            initModel.invoiceFilesList = [];
            initModel.supportFilesList = [];

            filesList = data["filesList"];

            if((data["paymentStatusList"] && data["paymentStatusList"].length > 0) ) {
                paymentStatusList =  paymentStatusList.concat(data["paymentStatusList"]);
            }
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

        initModel.paymentStatusList = paymentStatusList.concat();

        return initModel;
    }

    updatePaymentStatusDetails(req: PaymentReqModel) {
        let url = this._appService.baseUrl + "updatePayment";
        return this._http.post(url, req, { responseType: 'json', observe: 'response' });
    }
}
