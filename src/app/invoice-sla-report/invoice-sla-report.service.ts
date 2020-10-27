import { HttpClient } from '@angular/common/http';
import { AppService } from './../app.service';
import { InvoiceSLAReportDetailsModel, InvoiceSLAReportReqModel } from './../models/data-models';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class InvoiceSlaReportService {

    constructor(private _appService: AppService,
        private _http: HttpClient) { }

    async getInvoiceSLAList() {
        let url = this._appService.baseUrl + "invoiceSLAReportDashBoard";
        try {
            let response = await this._http.get(url).toPromise();
            return this.prepareInvoiceList(response);
        } catch (error) {
            await console.log(error);
            return ([]);
        }
    }

    prepareInvoiceList(response: any) {
        let list: InvoiceSLAReportDetailsModel[] = [];
        if (response && response.length > 0) {
            list = response.concat();
        }

        return list;
    }

    getFileData(req: InvoiceSLAReportReqModel) {
        let url = this._appService.baseUrl + 'invoiceSLAReport';
        return this._http.post(url, req, { responseType: 'arraybuffer', observe: 'response' });
    }

}
