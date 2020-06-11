import { globalConstant } from './../common/global-constant';
import { AppService } from './../app.service';
import { InvoiceUploadService } from './invoice-upload.service';
import { BusyDataModel, InvoiceUploadResultModel, InvoiceUploadReqModel, InvoiceDocumentReqModel, currencyMasterList, 
        PODetailsModel, POItemsRequestModel, POItemsResultModel, ItemModel, FileDetailsModel, InvoiceFileTypwModel, 
        UpdateInvoiceRequestModel, UpdateInvoiceResultModel, InvoiceDocumentResultModel, StatusModel } from './../models/data-models';
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

    headerArr: string[] = [];
    nonPOHeaderArr: string [] = ['Item No.', 'Item Desc', "HSN/SAC", 'Invoive Qty', 'Rate', 'Amount'];
    poHeaderArr: string[] = ['Item No.', 'Item Desc', "HSN/SAC", 'Order Qty', 'Supplied Qty', 'Balance Qty', 
                            'Invoive Qty', 'Currency', 'Rate', 'Amount'];

    _initDetails: InvoiceUploadResultModel = null;
    _poItemsResultDetails: POItemsResultModel = null;

    poList: PODetailsModel[] = [];

    invoiceUploadForm: FormGroup;

    msg: string = "";

    invoiceFilesList: FileDetailsModel[] = [];
    supportingFilesList: FileDetailsModel[] = [];

    invoiceUpdateResults: UpdateInvoiceResultModel = null;

    selectedInvoiceType: string = "po";

    selectedPOItem: PODetailsModel = null;

    currency: string = "";

    invoiceFileTypeId: number = null;
    supportFileTypeId: number = null;

    currencyList: currencyMasterList[] = [];

    isSelectedInvoiceTypeVisible: boolean = true;

    constructor(private _homeService: HomeService, 
                private _appService: AppService,
                private _formBuilder: FormBuilder,
                private _invoiceUploadService: InvoiceUploadService) { }

    get f() { return this.invoiceUploadForm.controls; }

    onInvoiceTypeChange(evtData) {
        this.resetAllFields();
        
        if(evtData.value == "po") {
            this.headerArr = this.poHeaderArr.concat();
        }
        else {
            this.headerArr = this.nonPOHeaderArr.concat();
        }
    }

    resetAllFields() {
        this.invoiceUploadForm.reset();
        this.removeItems();
        this.currency = "";
        this.selectedPOItem = null;
    }

    onNewClick() {
        const formsList = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        formsList.insert(formsList.length, this.createNonPOItem());
    }

    createNonPOItem() {
        let fg: FormGroup = this._formBuilder.group({
            itemId: null,
            itemNumber: null,
            itemDescription: null,
            orderedUnits: null,
            suppliedUnits: null,
            consumedUnits: null,
            invoiceUnits: null,
            unitPrice: null,
            unitsAmt: null,
            hsn: null,
            createdBy: null,
            createdDate: null
        });

        return fg;
    }

    onInvoiceBrowseClick(event: any) {
        event.preventDefault();

        let element: HTMLElement = document.getElementById("invoiceFileCtrl");
        element.click();
    }

    onInvoiceFileChange(event: any) {
        this.invoiceFilesList = [];
        if (event.target.files && event.target.files.length > 0) {
            for (let f = 0; f < event.target.files.length; f++) {
                let file = event.target.files[f];
                if (file) {
                    let fileDetails: FileDetailsModel = {
                        actualFileName: file.name,
                        uniqueFileName: null,
                        fileData: null,
                        documentTypeId: this.invoiceFileTypeId,
                        fileId: null,
                        createdDate: null,
                        createdBy: null
                    };
                    this.invoiceFilesList.push(fileDetails);

                    let reader = new FileReader();
                    reader.onload = this._handleInvoiceFileReaderLoaded.bind(this, file.name);
                    reader.readAsBinaryString(file);
                }
            }
        }
    }

    private _handleInvoiceFileReaderLoaded(actualFileName, readerEvt) {
        let binaryString = readerEvt.target.result;
        let base64textString = btoa(binaryString);

        for (let fileItem of this.invoiceFilesList) {
            if (fileItem.actualFileName == actualFileName) {
                fileItem.fileData = base64textString;
                break;
            }
        }
    }

    onInvoiceAttachFileClick() {
        let invId = (this.invoiceUpdateResults && this.invoiceUpdateResults.invoiceDetails && this.invoiceUpdateResults.invoiceDetails.invoiceId) ?
        this.invoiceUpdateResults.invoiceDetails.invoiceId : null;
        let filesReq: InvoiceDocumentReqModel = {
            invoiceId: invId,
            userId: globalConstant.userDetails.isVendor ? globalConstant.userDetails.userEmail : globalConstant.userDetails.userId,
            fileDetails: this.invoiceFilesList
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
        this._invoiceUploadService.uploadInvoiceDocuments(filesReq)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                if (response.body) {
                    let results: InvoiceDocumentResultModel = response.body as InvoiceDocumentResultModel;

                    if (results.status.status == 200 && results.status.isSuccess) {
                        this.invoiceFilesList = [];
                        this.invoiceFilesList = results.fileDetails.concat();
                    }
                }
            },
            (error) => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                console.log(error);
            });
    }

    onSupportingBrowseClick(event: any) {
        event.preventDefault();

        let element: HTMLElement = document.getElementById("supportingFileCtrl");
        element.click();
    }

    private _handleSuportingReaderLoaded(actualFileName, readerEvt) {
        let binaryString = readerEvt.target.result;
        let base64textString = btoa(binaryString);

        for (let fileItem of this.supportingFilesList) {
            if (fileItem.actualFileName == actualFileName) {
                fileItem.fileData = base64textString;
                break;
            }
        }
    }

    onSupportingFileChange(event: any) {
        this.supportingFilesList = [];
        if (event.target.files && event.target.files.length > 0) {
            for (let f = 0; f < event.target.files.length; f++) {
                let file = event.target.files[f];
                if (file) {
                    let fileDetails: FileDetailsModel = {
                        actualFileName: file.name,
                        uniqueFileName: null,
                        fileData: null,
                        documentTypeId: this.supportFileTypeId,
                        fileId: null,
                        createdDate: null,
                        createdBy: null
                    };
                    this.supportingFilesList.push(fileDetails);

                    let reader = new FileReader();
                    reader.onload = this._handleSuportingReaderLoaded.bind(this, file.name);
                    reader.readAsBinaryString(file);
                }
            }
        }
    }

    onSupportingAttachFileClick() {
        let invId = (this.invoiceUpdateResults && this.invoiceUpdateResults.invoiceDetails && this.invoiceUpdateResults.invoiceDetails.invoiceId) ?
        this.invoiceUpdateResults.invoiceDetails.invoiceId : null;
        let filesReq: InvoiceDocumentReqModel = {
            userId: globalConstant.userDetails.isVendor ? globalConstant.userDetails.userEmail : globalConstant.userDetails.userId,
            invoiceId: invId,
            fileDetails: this.supportingFilesList
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
        this._invoiceUploadService.uploadInvoiceDocuments(filesReq)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                
                if (response.body) {
                    let results: InvoiceDocumentResultModel = response.body as InvoiceDocumentResultModel;

                    if (results.status.status == 200 && results.status.isSuccess) {
                        this.supportingFilesList = [];
                        this.supportingFilesList = results.fileDetails.concat();
                    }
                    // else {
                    //     this.msg = "failed";
                    // }
                }
            },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    console.log(error);
                });
    }

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

    prepareInvoiceFileTypes() {
        this.invoiceFileTypeId = null;
        this.supportFileTypeId = null;
        if(this._initDetails && this._initDetails.invoiceFileTypes && this._initDetails.invoiceFileTypes.length > 0) {
            let invoiceFileTypeItem: InvoiceFileTypwModel = this._initDetails.invoiceFileTypes.find(ft => ft.fileType == "invoice");
            if(invoiceFileTypeItem) {
                this.invoiceFileTypeId = invoiceFileTypeItem.invoiceFileTypesId;
            }

            let supportFileTypeItem: InvoiceFileTypwModel = this._initDetails.invoiceFileTypes.find(ft => ft.fileType == "support");
            this.supportFileTypeId = supportFileTypeItem.invoiceFileTypesId;
        }
    }

    async loadInitData() {

        let req: InvoiceUploadReqModel = {
            vendorId: (globalConstant.userDetails.isVendor) ? globalConstant.userDetails.userId : null,
            approvalLevels: [],
            departments: []
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._initDetails = await this._invoiceUploadService.getInvoiceUploadInitData(req);
        if(this._initDetails) {
            this.prepareInvoiceFileTypes();
            this.poList = this._initDetails.poList.concat();
            this.currencyList = this._initDetails.currencyList.concat();
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

        this.invoiceUploadForm.get("poList").valueChanges.subscribe(val => {
            this.selectedPOItem = null;
            if(val) {
                this.selectedPOItem = this.poList.find( p => p.poNumber == val);
                this.currency = this.selectedPOItem.currencyType;
                this.loadPOItems();
            }
        });

        this.invoiceUploadForm.get("currency").valueChanges.subscribe(val => {
            if(val) {
                this.currency = val;
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

    onDeleteFileClick(fileDetails: FileDetailsModel, fileIndex: number, fileType: string) {
        if(fileDetails.fileId) {
            this._homeService.updateBusy(<BusyDataModel>{isBusy: true, msg: "Deleting..."});
            this._invoiceUploadService.deleteInvoiceFile(fileDetails)
                .subscribe(response => {
                    this._homeService.updateBusy(<BusyDataModel>{isBusy: false, msg: null});
                    let result = response.body as StatusModel;
                    if(result.isSuccess) {
                        this.removefileFromList(fileIndex, fileType);
                    }
                },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{isBusy: false, msg: null});
                    console.log(error);
                });
        }
        else {
            this.removefileFromList(fileIndex, fileType);
        }
    }

    removefileFromList(fileIndex: number, fileType: string) {
        if(fileType == 'invoice') {
            if(this.invoiceFilesList.length > 0) {
                this.invoiceFilesList.splice(fileIndex, 1);
            }
        } else {
            if(this.supportingFilesList.length > 0) {
                this.supportingFilesList.splice(fileIndex, 1);
            }
        }
    }

    downloadFile(fileDetails: FileDetailsModel) {
        this._appService.downloadInvoiceFile(fileDetails);
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

    onSaveClick() {
        this.updateInvoiceDetails(this._appService.updateOperations.save);
    }

    onSubmitClick() {
        this.updateInvoiceDetails(this._appService.updateOperations.submit);
    }

    updateInvoiceDetails(action: string) {
        let poNumber = null;
        if(this.selectedInvoiceType == 'po') {
            if(!this.selectedPOItem) {
                return false;
            }

            poNumber = this.selectedPOItem.poNumber;
        }
        else {
            this.selectedPOItem = new PODetailsModel();
            this.selectedPOItem.departmentId = globalConstant.userDetails.poDepts[0];
        }

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

        let filesList: FileDetailsModel[] = [];
        for(let invCnt = 0; invCnt < this.invoiceFilesList.length; invCnt++) {
            if(this.invoiceFilesList[invCnt] && this.invoiceFilesList[invCnt].fileId) {
                filesList.push(this.invoiceFilesList[invCnt]);
            }
        }

        for(let sCnt = 0; sCnt < this.supportingFilesList.length; sCnt++) {
            if(this.supportingFilesList[sCnt] && this.supportingFilesList[sCnt].fileId) {
                filesList.push(this.supportingFilesList[sCnt]);
            }
        }

        let req: UpdateInvoiceRequestModel = {
            action: action,
            userId: (this.selectedInvoiceType == 'po' && globalConstant.userDetails.isVendor) ? globalConstant.userDetails.userEmail : globalConstant.userDetails.userId,
            poDetails: this.selectedPOItem,
            invoiceDetails: {
                invoiceId: null,
                purchaseOrderId: (this.selectedPOItem) ? this.selectedPOItem.purchaseOrderId : null,
                invoiceNumber: this.invoiceUploadForm.get("invoiceNumber").value,
                invoiceDate: this._appService.getFormattedDateTime(this.invoiceUploadForm.get("invoiceDate").value),
                remarks: this.invoiceUploadForm.get("remarks").value,
                freightCharges: this.invoiceUploadForm.get("freightCharges").value,
                totalAmt: this.invoiceUploadForm.get("totalInvAmt").value,
                grnSesNumber: null,
                statusCode: null,
                totalTax: this.invoiceUploadForm.get("totalTax").value,
                currencyType: this.currency,
                createdBy: null,
                createdDate: null
            },
            itemsDetails: itemsList,
            filesList: filesList
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
        this._invoiceUploadService.updateInvoiceDetails(req)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                if (response.body) {
                    this.invoiceUpdateResults = response.body as UpdateInvoiceResultModel;
                    if (this.invoiceUpdateResults.statusDetails.status == 200 && this.invoiceUpdateResults.statusDetails.isSuccess) {
                        this.msg = this.invoiceUpdateResults.statusDetails.message;
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

    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.isSelectedInvoiceTypeVisible = (globalConstant.userDetails.isVendor) ? false : true;

        this.isDashboardCollapsed = true;

        this.headerArr = this.poHeaderArr.concat();

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
            totalItemsAmt: [ "" ],
            totalInvAmt: [ "", Validators.required ],
            currency: null,
            createdBy: null,
            createdDate: null,
            itemsList: this._formBuilder.array([], Validators.required)
        });

        setTimeout(() => {
           this.loadInitData();
        }, 100);
    }

}
