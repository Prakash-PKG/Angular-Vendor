import { EmpanelmentSubmitReqModel, EmpanelmentInitDataModel, CountryDataModel } from './../models/data-models';
import { AppService } from './../app.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmpanelmentService {

  constructor(private _appService: AppService,
    private _http: HttpClient) { }


  submitEmpanelmentReq(filesReq: EmpanelmentSubmitReqModel) {
    let url = this._appService.baseUrl + "submitEmpanelment";
    return this._http.post(url, filesReq, { responseType: 'json', observe: 'response' });
  }


  async getCountryList() {
    let url = this._appService.baseUrl + "getVendorCounty";
    try {
      let response = await this._http.get(url).toPromise();
      return this.prepareCountryList(response);
    } catch (error) {
      await console.log(error);
      return ([]);
    }
  }

  prepareCountryList(response: any) {
     let list: CountryDataModel[] = [];
    if (response && response.countryDataVOList.length > 0) {
      list = response.countryDataVOList.concat();
    }
    return list;
  }
}
