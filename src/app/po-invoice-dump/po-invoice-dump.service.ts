import { POInvoiceFinanceDumpReqModel, POInvoiceDumpInitResultModel } from './../models/data-models';
import { HttpClient } from '@angular/common/http';
import { AppService } from './../app.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PoInvoiceDumpService {

    constructor(private _http: HttpClient, private _appService: AppService) { }

    getFileData(req: POInvoiceFinanceDumpReqModel) {
        let url = this._appService.baseUrl + 'invFinanceDump';
        return this._http.post(url, req, {responseType: 'arraybuffer', observe: 'response'});
    }

    async getPOInvoiceDumpInitDetails() {
        let url = this._appService.baseUrl + "poInvDumpInit";
        try {
            let response = await this._http.get(url).toPromise();
            return this.preparePOInvoiceDumpInitDetails(response);
        } catch (error) {
            await console.log(error);
            return (new POInvoiceDumpInitResultModel());
        }
    }

    preparePOInvoiceDumpInitDetails(data) {
        let initModel: POInvoiceDumpInitResultModel = new POInvoiceDumpInitResultModel();
        if (data) {
            initModel.lastDumpDt = data["lastDumpDt"];
        }

        return initModel;
    }
}
