import { InvoiceFinanceDumpReqModel, InvoiceDumpInitResultModel } from './../models/data-models';
import { HttpClient } from '@angular/common/http';
import { AppService } from './../app.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PoInvoiceDumpService {

    constructor(private _http: HttpClient, private _appService: AppService) { }

    getFileData(req: InvoiceFinanceDumpReqModel) {
        let url = this._appService.baseUrl + 'invFinanceDump';
        return this._http.post(url, req, {responseType: 'arraybuffer', observe: 'response'});
    }

    async getPOInvoiceDumpInitDetails(countryCode: string) {
        let url = this._appService.baseUrl + "poInvDumpInit";
        try {
            let response = await this._http.post(url, { 'countryCode' : countryCode}).toPromise();
            return this.preparePOInvoiceDumpInitDetails(response);
        } catch (error) {
            await console.log(error);
            return (new InvoiceDumpInitResultModel());
        }
    }

    preparePOInvoiceDumpInitDetails(data) {
        let initModel: InvoiceDumpInitResultModel = new InvoiceDumpInitResultModel();
        if (data) {
            initModel.lastDumpDt = data["lastDumpDt"];
        }

        return initModel;
    }
}
