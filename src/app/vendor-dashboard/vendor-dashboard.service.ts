import { VendorMasterDetailsModel, VendorReportReqModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class VendorDashboardService {

    constructor(private _appService: AppService,
        private _http: HttpClient) { }

    getVendorList() {
        let url = this._appService.baseUrl + 'vendorDashBoard'
        return this._http.get(url, { responseType: 'json', observe: 'response' });
    }
    getFileData(req: VendorReportReqModel) {
        let url = this._appService.baseUrl + 'vendorDumpReport';
        return this._http.post(url, req, {responseType: 'arraybuffer', observe: 'response'});
    }
}
