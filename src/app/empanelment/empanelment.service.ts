import { EmpanelmentSubmitReqModel } from './../models/data-models';
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
}
