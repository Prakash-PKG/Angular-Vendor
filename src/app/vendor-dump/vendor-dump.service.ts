import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../app.service';
import { VendorDumpReqModel, VendorDumpInitResultModel } from '../models/data-models';

@Injectable({
  providedIn: 'root'
})
export class VendorDumpService {

  constructor(private _http: HttpClient, private _appService: AppService) { }

  getFileData(req: VendorDumpReqModel) {
    let url = this._appService.baseUrl + 'vendorFinanceDump';
    return this._http.post(url, req, { responseType: 'arraybuffer', observe: 'response' });
  }

  async getVendorDumpInitDetails() {
    let url = this._appService.baseUrl + "vendorFinanceDumpInit";
    try {
      let response = await this._http.get(url).toPromise();
      return this.prepareVendorDumpInitDetails(response);
    } catch (error) {
      await console.log(error);
      return (new VendorDumpInitResultModel());
    }
  }

  prepareVendorDumpInitDetails(data) {
    let initModel: VendorDumpInitResultModel = new VendorDumpInitResultModel();
    if (data) {
      initModel.lastDumpDt = data["lastDumpDt"];
    }

    return initModel;
  }
}