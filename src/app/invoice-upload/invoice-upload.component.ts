import { globalConstant } from './../common/global-constant';
import { AppService } from './../app.service';
import { InvoiceUploadService } from './invoice-upload.service';
import { BusyDataModel, InvoiceUploadResultModel, InvoiceUploadReqModel, 
        PODetailsModel, POItemsRequestModel, POItemsResultModel, ItemModel,
        UpdateInvoiceRequestModel, UpdateInvoiceResultModel } from './../models/data-models';
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

    headerArr: string[] = ['Item No.', 'Item Desc', "HSN/SAC", 'Order Qty', 'Supplied Qty', 'Balance Qty', 'Invoive Qty', 'Rate', 'Amount'];

    _initDetails: InvoiceUploadResultModel = null;
    _poItemsResultDetails: POItemsResultModel = null;

    poList: PODetailsModel[] = [];

    invoiceUploadForm: FormGroup;

    msg: string = "";

    constructor(private _homeService: HomeService, 
                private _appService: AppService,
                private _formBuilder: FormBuilder,
                private _invoiceUploadService: InvoiceUploadService) { }

    get f() { return this.invoiceUploadForm.controls; }

    onInvoiceUnitsBlur(itemInd: number) {
        const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        let unitPriceVal = itemsFa.controls[itemInd].get("unitPrice").value;
        let invoiceUnits = itemsFa.controls[itemInd].get("invoiceUnits").value;

        let unitsAmt = (unitPriceVal && invoiceUnits) ? +unitPriceVal * +invoiceUnits : null;
        itemsFa.controls[itemInd].get("unitsAmt").setValue(unitsAmt);

        this.updateAmountDetails();
    }

    updateAmountDetails() {
        this.invoiceUploadForm.get("totalInvAmt").setValue("0");

        let totalItemsAmt = 0;
        const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        for(let i = 0; i < itemsFa.length; i++) {
            let unitsAmt = +itemsFa.controls[i].get("unitsAmt").value;
            totalItemsAmt = totalItemsAmt + unitsAmt;
        }
        this.invoiceUploadForm.get("totalItemsAmt").setValue(totalItemsAmt);

        this.updateInvoiceTotalAmt();
    }

    updateInvoiceTotalAmt() {
        let totalItemsAmtVal = this.invoiceUploadForm.get("totalItemsAmt").value;
        let totalItemsAmt = totalItemsAmtVal ? +totalItemsAmtVal : 0;

        let fregihtChargesVal = this.invoiceUploadForm.get("freightCharges").value;
        let fregihtCharges = fregihtChargesVal ? +fregihtChargesVal : 0;

        let totalTaxVal = this.invoiceUploadForm.get("totalTax").value;
        let totalTax = totalTaxVal ? +totalTaxVal : 0;

        let totalInvAmt: number = totalItemsAmt + fregihtCharges + totalTax;
        this.invoiceUploadForm.get("totalInvAmt").setValue(totalInvAmt);
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

        this.invoiceUploadForm.get("poList").valueChanges.subscribe(val => {
            if(val) {
                this.loadPOItems();
            }
        });
    }

    async loadPOItems() {
        this.removeItems();
        let req: POItemsRequestModel = {
            poNumber: this.invoiceUploadForm.get("poList").value
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._poItemsResultDetails = await this._invoiceUploadService.getPOItems(req);
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

        let itemsList: ItemModel[] = this._poItemsResultDetails.itemsList.concat();
        if(itemsList && itemsList.length > 0) {
            const formsList = <FormArray>this.invoiceUploadForm.controls['itemsList'];
            for(let i = 0; i < itemsList.length; i++) {
                formsList.insert(formsList.length, this.createItem(itemsList[i]));
            }
        }

        this.updateAmountDetails();
    }

    removeItems() {
        const controlsList: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        for(let i = 0; i < controlsList.length; i++) {
            controlsList.removeAt(0);
        }
    }

    createItem(item: ItemModel) {
        let unitsAmt = (item.unitPrice && item.invoiceUnits) ? +item.unitPrice * +item.invoiceUnits : null;
        let fg: FormGroup = this._formBuilder.group({
            itemId: item.itemId,
            itemNumber: item.itemNumber,
            itemDescription: item.itemDescription,
            orderedUnits: item.orderedUnits,
            suppliedUnits: item.suppliedUnits,
            consumedUnits: item.consumedUnits,
            invoiceUnits: [ item.invoiceUnits, Validators.required ],
            unitPrice: item.unitPrice,
            unitsAmt: unitsAmt,
            hsn: [ item.hsn, Validators.required ],
            createdBy: item.createdBy,
            createdDate: item.createdDate
        });

        return fg;
    }

    onSubmitClick() {

        let poNumber = this.invoiceUploadForm.get("poList").value;
        let selectedPOItem: PODetailsModel = this.poList.find( p => p.poNumber = poNumber);
        if(selectedPOItem) {
            let itemsList: ItemModel[] = [];
            const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
            for(let i = 0; i < itemsFa.length; i++) {
                let item: ItemModel = {
                    poNumber: poNumber,
                    itemNumber: itemsFa.controls[i].get("itemNumber").value,
                    itemId: itemsFa.controls[i].get("itemId").value,
                    itemDescription: itemsFa.controls[i].get("itemDescription").value,
                    orderedUnits: itemsFa.controls[i].get("orderedUnits").value,
                    suppliedUnits: itemsFa.controls[i].get("suppliedUnits").value,
                    consumedUnits: itemsFa.controls[i].get("consumedUnits").value,
                    invoiceUnits: itemsFa.controls[i].get("invoiceUnits").value,
                    unitPrice: itemsFa.controls[i].get("unitPrice").value,
                    hsn: itemsFa.controls[i].get("hsn").value,
                    createdBy: itemsFa.controls[i].get("createdBy").value,
                    createdDate: itemsFa.controls[i].get("createdDate").value
                };

                itemsList.push(item);
            }


            let req: UpdateInvoiceRequestModel = {
                action: this._appService.updateOperations.submit,
                vendorEmailId: globalConstant.userDetails.userEmail,
                poDetails: selectedPOItem,
                invoiceDetails: {
                    invoiceId: null,
                    purchaseOrderId: selectedPOItem.purchaseOrderId,
                    invoiceNumber: this.invoiceUploadForm.get("invoiceNumber").value,
                    invoiceDate: this._appService.getFormattedDateTime(this.invoiceUploadForm.get("invoiceDate").value),
                    remarks: this.invoiceUploadForm.get("remarks").value,
                    freightCharges: this.invoiceUploadForm.get("freightCharges").value,
                    totalAmt: this.invoiceUploadForm.get("totalInvAmt").value,
                    grnSesNumber: null,
                    statusCode: null,
                    totalTax: this.invoiceUploadForm.get("totalTax").value,
                    createdBy: null,
                    createdDate: null
                },
                itemsDetails: itemsList
            }

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
            this._invoiceUploadService.updateInvoiceDetails(req)
                .subscribe(response => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                    if (response.body) {
                        let result: UpdateInvoiceResultModel = response.body as UpdateInvoiceResultModel;
                        if (result.statusDetails.status == 200 && result.statusDetails.isSuccess) {
                            this.msg = result.statusDetails.message;
                        }
                        else {
                            this.msg = "failed";
                        }
                    }
                },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    console.log(error);
                });
        }
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
            invoiceNumber: [ null, Validators.required ],
            invoiceDate: [ null, Validators.required ],
            remarks: [ null, Validators.required ],
            freightCharges: [ null, Validators.required ],
            totalTax: [ null, Validators.required ],
            totalItemsAmt: [ null ],
            totalInvAmt: [ null, Validators.required ],
            createdBy: null,
            createdDate: null,
            itemsList: this._formBuilder.array([], Validators.required)
        });

        setTimeout(() => {
           this.loadInitData();
        }, 100);
    }

}
