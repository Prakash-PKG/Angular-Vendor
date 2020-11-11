import { PendingApprovalResultModel, PendingApprovalRequestModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PendingApprovalsService {

  constructor(private _appService: AppService,
                private _http: HttpClient) { }


  async getPendingApprovals(req: PendingApprovalRequestModel) {
        let url = this._appService.baseUrl + "getPendingApprovals";
        try {
            let response = await this._http.post(url, req).toPromise();
            return this.preparePendingApprovals(response);
        } catch (error) {
            await console.log(error);
            return (new PendingApprovalResultModel());
        }
    }

    preparePendingApprovals(data) {
        let initModel: PendingApprovalResultModel = new PendingApprovalResultModel();
        if(data) {
            initModel.statusDetails = data["statusDetails"];
            initModel.pendingApprovals = data["pendingApprovals"];
        }

        return initModel;
    }
    async getRejectedInvoices(req: PendingApprovalRequestModel) {
        let url = this._appService.baseUrl + "rejectedInvoices";
        try {
            let response = await this._http.post(url, req).toPromise();
            return this.preparePendingApprovals(response);
        } catch (error) {
            await console.log(error);
            return (new PendingApprovalResultModel());
        }
    }
}
