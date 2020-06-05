import { InvoiceUploadResultModel, InvoiceUploadReqModel, 
        POItemsRequestModel, POItemsResultModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class InvoiceUploadService {

    constructor(private _appService: AppService,
                private _http: HttpClient) { }

    async getInvoiceUploadInitData(req: InvoiceUploadReqModel) {
        let url = this._appService.baseUrl + "invUploadInitData";
        try {
            let response = await this._http.post(url, req).toPromise();
            return this.prepareInvoiceUploadInitData(response);
        } catch (error) {
            await console.log(error);
            return (new InvoiceUploadResultModel());
        }
    }

    prepareInvoiceUploadInitData(data) {
        let initModel: InvoiceUploadResultModel = new InvoiceUploadResultModel();
        if(data) {
            initModel.poList = data["pODetailsVO"];
            initModel.statusDetails = data["statusVO"];        
        }

        return initModel;
    }

    async getPOItems(req: POItemsRequestModel) {
        let url = this._appService.baseUrl + "poItems";
        try {
            let response = await this._http.post(url, req).toPromise();
            return this.prepareItemsList(response);
        } catch (error) {
            await console.log(error);
            return (new POItemsResultModel());
        }
    }

    prepareItemsList(data) {
        let initModel: POItemsResultModel = new POItemsResultModel();
        if(data) {
            initModel.itemsList = data["pOItemsList"];
            initModel.statusDetails = data["statusDetails"];        
        }

        return initModel;
    }
}
