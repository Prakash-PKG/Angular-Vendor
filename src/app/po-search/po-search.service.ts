import { POSearchReqModel, POSearchResultModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PoSearchService {

    constructor(private _appService: AppService,
                private _http: HttpClient) { }

    async getPOList(req: POSearchReqModel) {
        let url = this._appService.baseUrl + "posearch";
        try {
            let response = await this._http.post(url, req).toPromise();
            return this.preparePOList(response);
        } catch (error) {
            await console.log(error);
            return (new POSearchResultModel());
        }
    }

    preparePOList(data) {
        let initModel: POSearchResultModel = new POSearchResultModel();
        if (data) {
            initModel.poList = data["pODetailsVO"];
            initModel.statusDetails = data["statusVO"];
        }

        return initModel;
    }
}
