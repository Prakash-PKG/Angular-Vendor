import { InvoiceSearchResultModel, InvoiceSearchRequestModel, VoucherReqModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class InvoiceSearchService {

    constructor(private _appService: AppService,
        private _http: HttpClient) { }

    async getInvoiceList(req: InvoiceSearchRequestModel) {
        let url = this._appService.baseUrl + "invoices";
        try {
            let response = await this._http.post(url, req).toPromise();
            return this.prepareInvoiceList(response);
        } catch (error) {
            await console.log(error);
            return (new InvoiceSearchResultModel());
        }
    }
    async getRejectedInvoices() {
        let url = this._appService.baseUrl + "rejectedInvoices";
        try {
            let response = await this._http.get(url).toPromise();
            return this.prepareInvoiceList(response);
        } catch (error) {
            await console.log(error);
            return (new InvoiceSearchResultModel());
        }
    }
    prepareInvoiceList(data) {
        let initModel: InvoiceSearchResultModel = new InvoiceSearchResultModel();
        if (data) {
            initModel.invoiceList = data["invoiceList"];
            initModel.statusDetails = data["statusDetails"];
        }

        return initModel;
    }

    getFileData(req: InvoiceSearchRequestModel) {
        let url = this._appService.baseUrl + 'invoiceDump';
        return this._http.post(url, req, { responseType: 'arraybuffer', observe: 'response' });
    }

    getVoucherData(req: VoucherReqModel) {
        let url = this._appService.baseUrl + 'downloadInvVoucher';
        return this._http.post(url, req, { responseType: 'arraybuffer', observe: 'response' });
    }


}
