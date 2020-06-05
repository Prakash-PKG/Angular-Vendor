import { InvoiceUploadService } from './invoice-upload.service';
import { BusyDataModel, InvoiceUploadResultModel, InvoiceUploadReqModel, 
        PODetailsModel, POItemsRequestModel, POItemsResultModel } from './../models/data-models';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';

@Component({
    selector: 'app-invoice-upload',
    templateUrl: './invoice-upload.component.html',
    styleUrls: ['./invoice-upload.component.scss']
})
export class InvoiceUploadComponent implements OnInit {

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    headerArr: string[] = ['Item No.', 'Item Desc', 'Order Qty', 'Supplied Qty', 'Balance Qty', 'Invoive Qty', 'Rate', 'Amount'];

    _initDetails: InvoiceUploadResultModel = null;
    _poItemsResultDetails: POItemsResultModel = null;

    poList: PODetailsModel[] = [];

    invoiceUploadForm: FormGroup;

    constructor(private _homeService: HomeService, 
                private _formBuilder: FormBuilder,
                private _invoiceUploadService: InvoiceUploadService) { }

    onPoNumberChange() {
        this.loadPOItems();
    }

    async loadInitData() {

        let req: InvoiceUploadReqModel = {
            vendorId: '7100000002',
            approvalLevels: [],
            departments: []
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._initDetails = await this._invoiceUploadService.getInvoiceUploadInitData(req);
        this.poList = this._initDetails.poList.concat();
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
    }

    async loadPOItems() {
        let req: POItemsRequestModel = {
            poNumber: this.invoiceUploadForm.get("poList").value
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._poItemsResultDetails = await this._invoiceUploadService.getPOItems(req);
        this.poList = this._initDetails.poList.concat();
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
    }

    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.isDashboardCollapsed = true;

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        this.invoiceUploadForm = this._formBuilder.group({
            poList: [ { value: null } ],
            invoiceNumber: [ { value: null } ],
            invoiceDate: [ { value: null } ],
            remarks: [ { value: null } ],
            itemsList: this._formBuilder.array([], Validators.required)
        });

        this.invoiceUploadForm.get("poList").valueChanges.subscribe(val => {
            if(val) {
                console.log(val);
                this.loadPOItems();
            }
           
        });

        setTimeout(() => {
           this.loadInitData();
        }, 100);
    }

}
