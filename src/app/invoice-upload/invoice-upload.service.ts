import { InvoiceUploadResultModel, InvoiceUploadReqModel, InvoiceDocumentReqModel, 
        POItemsRequestModel, POItemsResultModel, UpdateInvoiceRequestModel,
    FileDetailsModel, RemoveDocumentReqModel, VendorAutoCompleteModel, 
    ProjectAutoCompleteModel, InvoiceExistReqModel, StatusModel } from './../models/data-models';
import { Injectable } from '@angular/core';
import { AppService } from './../app.service';
import { HttpClient } from '@angular/common/http';
import { catchError, retry, tap, map, finalize } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

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
            initModel.invoiceFileTypes = data["invoiceFileTypes"];     
            initModel.currencyList =  data["currencyMasterList"];
            initModel.companiesList = data["companiesList"];
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
            initModel.notRejectedItemsList = data["notRejectedItemsList"];
            initModel.statusDetails = data["statusDetails"];        
        }

        return initModel;
    }

    async isInvoiceExist(req: InvoiceExistReqModel) {
        let url = this._appService.baseUrl + "isInvExist";
        try {
            let response = await this._http.post(url, req).toPromise();
            return this.prepareInvoiceExistResult(response);
        } catch (error) {
            await console.log(error);
            return (new StatusModel());
        }
    }

    prepareInvoiceExistResult(data) {
        return data as StatusModel;
    }

    updateInvoiceDetails(updateReqModel: UpdateInvoiceRequestModel) {
        let url = this._appService.baseUrl + "updateInvoice";
        return this._http.post(url, updateReqModel, {responseType: 'json', observe: 'response'});
    }


    uploadInvoiceDocuments(filesReq: InvoiceDocumentReqModel) {
        let url = this._appService.baseUrl + "updateInvDoc";
        return this._http.post(url, filesReq, { responseType: 'json', observe: 'response' });
    }

    deleteInvoiceFile(fileDetails: FileDetailsModel) {
        let req: RemoveDocumentReqModel = {
            fileId: fileDetails.fileId
        };
        let url = this._appService.baseUrl + "removeInvDoc/";
        return this._http.post(url, req, { responseType: 'json', observe: 'response' });
    }

    getVendorsData(filter: { searchText: any } = { searchText: '' }): Observable<VendorAutoCompleteModel[]>  {
        let url = this._appService.baseUrl + "vendorAutoSearch/" + filter.searchText;
        return this._http.get(url, { responseType: 'json'}).pipe(
                            tap((employeeList: any) => (employeeList as VendorAutoCompleteModel[]) ));
    }

    getProjectsData(filter: { searchText: any } = { searchText: '' }): Observable<ProjectAutoCompleteModel[]>  {
        let url = this._appService.baseUrl + "projectAutoSearch/" + filter.searchText;
        return this._http.get(url, { responseType: 'json'}).pipe(
                            tap((projectsList: any) => (projectsList as ProjectAutoCompleteModel[]) ));
    }

    getNonPOTemplateFileData() {
        let url = this._appService.baseUrl + 'downloadNonPOTemplate';
        return this._http.get(url, { responseType: 'arraybuffer', observe: 'response' });
    }
}
