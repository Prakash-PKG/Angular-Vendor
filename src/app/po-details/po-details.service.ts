import { PODetailsRequestModel, PODetailsResultsModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PoDetailsService {

    constructor(private _appService: AppService,
                private _http: HttpClient) { }

    async getPODetails(req: PODetailsRequestModel) {
        let url = this._appService.baseUrl + "poDetails";
        try {
            let response = await this._http.post(url, req).toPromise();
            return this.preparePODetails(response);
        } catch (error) {
            await console.log(error);
            return (new PODetailsResultsModel());
        }
    }

    preparePODetails(data) {
        let initModel: PODetailsResultsModel = new PODetailsResultsModel();
        if (data) {
            initModel.itemsList = data["itemsList"];
            initModel.statusDetails = data["statusDetails"];
        }

        return initModel;
    }
}
