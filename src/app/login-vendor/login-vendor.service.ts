import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppService } from '../app.service';
import { CryptoService } from '../common/crypto.service';
import { EmpanelmentOtpReqModel, StatusModel } from '../models/data-models';

@Injectable({
  providedIn: 'root'
})
export class LoginVendorService {

  constructor(
    private _http: Http,
    private _appService: AppService,
    private _cryptoService: CryptoService) { };

  login(userId: string, password: string) {
    let body = new FormData();
    body.append('username', userId);
    body.append('password', password);
    body.append('usertype', "new_vendor");
    return this._http.post(this._appService.baseUrl + 'login', body);
  };

  async generateOTP(req: EmpanelmentOtpReqModel) {
    let url = this._appService.baseUrl + "generateEmpanelmentOtp";
    try {
      let response = await this._http.post(url, req).toPromise();   
      return response.json() as StatusModel;
    } catch (error) {
      if(error instanceof Response){
        let status = new StatusModel();
        status.isSuccess = false;
        status.exceptionMsg = error.json()["error-message"];
        return status;
      }else{
        let status = new StatusModel();
        status.isSuccess = false;
        status.exceptionMsg = 'Something went wrong';
        return status;
      }
    }
  }

  storeUserData(response) {
    localStorage.setItem('x-auth-token', response.headers.get("x-auth-token"));
    localStorage.setItem('user', this._cryptoService.encrypt(response._body));
  }

}
