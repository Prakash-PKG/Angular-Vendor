import { InvoiceFinanceDumpReqModel, InvoiceDumpInitResultModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from './../app.service';

@Injectable({
    providedIn: 'root'
})
export class NonPoInvoiceDumpService {

    constructor(private _http: HttpClient, private _appService: AppService) { }

    getFileData(req: InvoiceFinanceDumpReqModel) {
        let url = this._appService.baseUrl + 'nonpoInvFinanceDump';
        return this._http.post(url, req, { responseType: 'arraybuffer', observe: 'response' });
    }

    async getNonPOInvoiceDumpInitDetails() {
        let url = this._appService.baseUrl + "nonpoInvDumpInit";
        try {
            let response = await this._http.get(url).toPromise();
            return this.prepareNonPOInvoiceDumpInitDetails(response);
        } catch (error) {
            await console.log(error);
            return (new InvoiceDumpInitResultModel());
        }
    }

    prepareNonPOInvoiceDumpInitDetails(data) {
        let initModel: InvoiceDumpInitResultModel = new InvoiceDumpInitResultModel();
        if (data) {
            initModel.lastDumpDt = data["lastDumpDt"];
        }

        return initModel;
    }
}
