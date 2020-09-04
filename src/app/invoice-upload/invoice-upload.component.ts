import { MessageDialogModel } from './../models/popup-models';
import { MessageDialogComponent } from './../message-dialog/message-dialog.component';
import { globalConstant } from './../common/global-constant';
import { AppService } from './../app.service';
import { InvoiceUploadService } from './invoice-upload.service';
import {
    BusyDataModel, InvoiceUploadResultModel, InvoiceUploadReqModel, InvoiceDocumentReqModel, currencyMasterList,
    PODetailsModel, POItemsRequestModel, POItemsResultModel, ItemModel, FileDetailsModel, InvoiceFileTypwModel,
    UpdateInvoiceRequestModel, UpdateInvoiceResultModel, InvoiceDocumentResultModel, StatusModel,
    VendorAutoCompleteModel, ProjectAutoCompleteModel, CompanyCodeMasterList, InvoiceExistReqModel,
    NotRejectedItemsModel
} from './../models/data-models';
import { Component, OnInit, HostListener } from '@angular/core';
import { HomeService } from '../home/home.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSort, MatPaginator, MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
    parse: {
        dateInput: 'LL',
    },
    display: {
        dateInput: 'DD MMM YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-invoice-upload',
    templateUrl: './invoice-upload.component.html',
    styleUrls: ['./invoice-upload.component.scss'],
    providers: [
        // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
        // application's root module. We provide it at the component level here, due to limitations of
        // our example generation script.
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        },

        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ]
})
export class InvoiceUploadComponent implements OnInit {

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    headerArr: string[] = [];
    nonPOHeaderArr: string[] = ['Item No.', 'Item Desc', "HSN/SAC", 'Invoice Units', 'Rate', 'Amount'];
    poHeaderArr: string[] = ['Item No.', 'Item Desc', "HSN/SAC", "From Date", "To Date", "Personnel Number", 'Order Units', 'Balance Units', "UOM",
        'Invoice Units', 'Currency', 'Rate', 'Amount'];
    poHeaderArrWithoutDates: string[] = ['Item No.', 'Item Desc', "HSN/SAC", 'Order Units', 'Balance Units', "UOM",
        'Invoice Units', 'Currency', 'Rate', 'Amount'];

    _initDetails: InvoiceUploadResultModel = null;
    _poItemsResultDetails: POItemsResultModel = null;

    poList: PODetailsModel[] = [];

    invoiceUploadForm: FormGroup;

    //msg: string = "";

    invoiceFilesList: FileDetailsModel[] = [];
    private _tempInvoiceFilesList: FileDetailsModel[] = [];
    private _invoicefileCnt: number = 0;

    supportingFilesList: FileDetailsModel[] = [];
    private _tempSupportingFilesList: FileDetailsModel[] = [];
    private _supportingfileCnt: number = 0;

    invoiceUpdateResults: UpdateInvoiceResultModel = null;

    selectedInvoiceType: string = "po";

    selectedPOItem: PODetailsModel = null;

    currency: string = "";

    invoiceFileTypeId: number = null;
    supportFileTypeId: number = null;

    currencyList: currencyMasterList[] = [];

    isSelectedInvoiceTypeVisible: boolean = true;

    isSubmitted: boolean = false;

    invoiceFilesErrMsg: string = "";
    supportFilesErrMsg: string = "";

    filteredVendors: VendorAutoCompleteModel[] = [];
    isLoading: boolean = false;

    filteredProjects: ProjectAutoCompleteModel[] = [];

    companiesList: CompanyCodeMasterList[] = [];

    isInvoiceValid: boolean = false;

    invoiceNumberErrMsg: string = "";

    minInvoiceDate: Date = null;
    maxInvoiceDate: Date = new Date();

    isFromToMandatory: boolean = false;

    //totalItemsAmtValid: boolean = false;

    @HostListener('document:keydown.enter', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
        event.preventDefault();
        this.onSubmitClick();
    }

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        public _dialog: MatDialog,
        private _http: HttpClient,
        private _invoiceUploadService: InvoiceUploadService) { }

    onDownloadTemplateClick() {
        this._invoiceUploadService.getNonPOTemplateFileData().subscribe(
            (data) => {
                const blob = new Blob([data.body], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = "NonPOInvoiceUploadTemplate.csv";
                document.body.appendChild(a);
                a.click();
            },
            error => {
                console.log(error);
            });
    }

    get f() { return this.invoiceUploadForm.controls; }

    get fa() { return <FormArray>this.invoiceUploadForm.controls['itemsList']; }

    getPOProjectName() {
        let projectName: string = "";
        if (this.selectedPOItem && this.selectedPOItem.projectName && this.selectedPOItem.projectId) {
            projectName = this.selectedPOItem.projectName + "( " + this.selectedPOItem.projectId + " )";
        }

        return projectName;
    }

    onCancelClick() {
        this._router.navigate([this._appService.routingConstants.invoiceSearch]);
    }

    onInvoiceBlur() {
        this.validateInvoiceNumber();
    }

    async validateInvoiceNumber() {
        this.invoiceNumberErrMsg = "";

        this.isInvoiceValid = false;

        let venId: string = null;
        if (this.selectedInvoiceType == 'po') {
            venId = (this.selectedPOItem && this.selectedPOItem.vendorId) ? this.selectedPOItem.vendorId : "";
        }
        else {
            let selVendor = this.invoiceUploadForm.get("vendorId").value;
            if (selVendor && typeof (selVendor) == "object") {
                venId = (selVendor as VendorAutoCompleteModel).vendorId;
            }
        }

        let innvoiceNumber = this.invoiceUploadForm.get("invoiceNumber").value;
        if (innvoiceNumber && venId) {
            let req: InvoiceExistReqModel = {
                vendorId: venId,
                innvoiceNumber: innvoiceNumber
            };
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
            let results = await this._invoiceUploadService.isInvoiceExist(req);
            if (results) {
                if (results.isSuccess) {
                    this.isInvoiceValid = true;
                }
                else {
                    this.invoiceNumberErrMsg = results.message;
                }
            }
            else {
                this.invoiceNumberErrMsg = "Invoice number is not valid."
            }

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
        }
    }

    // vendor auto complete start
    registerVendorAutoComplete() {
        this.invoiceUploadForm.get("vendorId").valueChanges
            .pipe(debounceTime(300),
            tap(() => { this.isLoading = true; }),
            switchMap(term => {
                if (term && typeof term === 'string') {
                    let sText: string = term as string;

                    if (sText && sText.length > 1) {
                        return this._invoiceUploadService.getVendorsData({ searchText: term });
                    }
                }

                this.isLoading = false;
                this.filteredVendors = [];
                return [];

            }),
            tap(() => { this.isLoading = false; })
            )
            .subscribe(results => {
                this.filteredVendors = results as VendorAutoCompleteModel[];
            });
    }

    displayVendor(v: VendorAutoCompleteModel) {
        if (v) { return v.vendorName + " ( " + v.vendorId + " )"; }
    }

    onVendorOptionSelected(evt: VendorAutoCompleteModel) {
        this.filteredVendors = [];
        this.validateInvoiceNumber();
    }

    getDisplayVendorName(v: VendorAutoCompleteModel) {
        if (v) {
            return "<b>" + v.vendorName + "</b> (" + v.vendorId + ")";
        }

        return "";
    }

    onVendorPanelClosed() {
        this.filteredVendors = [];
    }

    onVendorBlur() {
        setTimeout(() => {
            let val = this.invoiceUploadForm.get("vendorId").value;
            if (!val || typeof val == "string") {
                this.invoiceUploadForm.get("vendorId").setValue(null);
            }
        }, 500);
    }


    // vendor auto complete end

    // projects auto complete start
    registerProjectAutoComplete() {
        this.invoiceUploadForm.get("projectId").valueChanges
            .pipe(debounceTime(300),
            tap(() => { this.isLoading = true; }),
            switchMap(term => {
                if (term && typeof term === 'string') {
                    let sText: string = term as string;

                    if (sText && sText.length > 1) {
                        return this._invoiceUploadService.getProjectsData({ searchText: term });
                    }
                }

                this.isLoading = false;
                this.filteredProjects = [];
                return [];

            }),
            tap(() => { this.isLoading = false; })
            )
            .subscribe(results => {
                this.filteredProjects = results as ProjectAutoCompleteModel[];
            });
    }

    displayProject(p: ProjectAutoCompleteModel) {
        if (p) { return p.projectId + " ( " + p.projectName + " )"; }
    }

    onProjectOptionSelected(evt: ProjectAutoCompleteModel) {
        this.filteredProjects = [];
    }

    getDisplayProjectName(p: ProjectAutoCompleteModel) {
        if (p) {
            return "<b>" + p.projectId + "</b> (" + p.projectName + ")";
        }

        return "";
    }

    onProjectPanelClosed() {
        this.filteredProjects = [];
    }

    onProjectBlur() {
        setTimeout(() => {
            let val = this.invoiceUploadForm.get("projectId").value;
            if (!val || typeof val == "string") {
                this.invoiceUploadForm.get("projectId").setValue(null);
            }
        }, 500);
    }

    //projects auto complete end

    onDeleteItemClick(rowInd: number) {
        const formsList = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        formsList.removeAt(rowInd);
        this.updateAmountDetails();

        if (this.selectedInvoiceType == "non-po") {
            this.updateNonPOItemNumbers();
        }
    }

    onInvoiceTypeChange(evtData) {
        this.resetAllFields();

        if (evtData.value == "po") {
            this.headerArr = this.poHeaderArr.concat();
            this.invoiceUploadForm.get("poList").setValidators([Validators.required]);

            this.invoiceUploadForm.get("currency").setValidators([]);
            this.invoiceUploadForm.get("vendorId").setValidators([]);
            this.invoiceUploadForm.get("projectId").setValidators([]);
            this.invoiceUploadForm.get("companyCode").setValidators([]);
        }
        else {
            this.headerArr = this.nonPOHeaderArr.concat();
            this.invoiceUploadForm.get("currency").setValidators([Validators.required]);
            this.invoiceUploadForm.get("vendorId").setValidators([Validators.required]);
            this.invoiceUploadForm.get("projectId").setValidators([Validators.required]);
            this.invoiceUploadForm.get("companyCode").setValidators([Validators.required]);

            this.invoiceUploadForm.get("poList").setValidators([]);
        }

        this.invoiceUploadForm.get("poList").updateValueAndValidity();
        this.invoiceUploadForm.get("currency").updateValueAndValidity();
        this.invoiceUploadForm.get("vendorId").updateValueAndValidity();
        this.invoiceUploadForm.get("projectId").updateValueAndValidity();
        this.invoiceUploadForm.get("companyCode").updateValueAndValidity();
    }

    resetAllFields() {
        this.invoiceUploadForm.reset();
        this.removeItems();
        this.currency = "";
        this.selectedPOItem = null;

        this.invoiceUploadForm.get("poList").setValidators([]);
        this.invoiceUploadForm.get("currency").setValidators([]);

        this.invoiceUploadForm.get("totalItemsAmt").setValue("");
        this.invoiceUploadForm.get("totalInvAmt").setValue("");
    }

    updateNonPOItemNumbers() {
        const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        let itemNoVal: number = 0;
        for (let i = 0; i < itemsFa.length; i++) {
            itemNoVal = itemNoVal + 10;
            itemsFa.controls[i].get("itemNumber").setValue(itemNoVal);
        }
    }

    onNewClick() {
        const formsList = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        formsList.insert(formsList.length, this.createNonPOItem());

        this.updateNonPOItemNumbers();
    }

    createNonPOItem() {
        let fg: FormGroup = this._formBuilder.group({
            itemId: null,
            itemNumber: [{ value: null, disabled: true }, [Validators.required, Validators.pattern("^[0-9]*$")]],
            itemDescription: [null, Validators.required],
            uom: null,
            orderedUnits: null,
            suppliedUnits: null,
            consumedUnits: null,
            balanceUnits: null,
            invoiceUnits: [null, Validators.required],
            unitPrice: [null, Validators.required],
            unitsAmt: null,
            hsn: [null, [Validators.required, Validators.maxLength(8), Validators.pattern("^[0-9]*$")]],
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
        this.invoiceFilesErrMsg = "";

        if (this.invoiceFilesList.length > 0) {
            this.invoiceFilesErrMsg = "More than one Invoice files can't be attached.";
        }
        else {
            this._tempInvoiceFilesList = [];
            this._invoicefileCnt = 0;
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
                        this._tempInvoiceFilesList.push(fileDetails);

                        let reader = new FileReader();
                        reader.onload = this._handleInvoiceFileReaderLoaded.bind(this, file.name);
                        reader.readAsBinaryString(file);
                    }
                }
            }
        }

        event.target.value = null;
    }

    private _handleInvoiceFileReaderLoaded(actualFileName, readerEvt) {
        let binaryString = readerEvt.target.result;
        let base64textString = btoa(binaryString);

        for (let fileItem of this._tempInvoiceFilesList) {
            if (fileItem.actualFileName == actualFileName) {
                fileItem.fileData = base64textString;
                this._invoicefileCnt = this._invoicefileCnt + 1;
                break;
            }
        }

        if (this._tempInvoiceFilesList.length > 0 && this._tempInvoiceFilesList.length == this._invoicefileCnt) {
            this.onInvoiceAttachFileClick();
        }
    }

    onInvoiceAttachFileClick() {
        let invId = (this.invoiceUpdateResults && this.invoiceUpdateResults.invoiceDetails && this.invoiceUpdateResults.invoiceDetails.invoiceId) ?
            this.invoiceUpdateResults.invoiceDetails.invoiceId : null;
        let filesReq: InvoiceDocumentReqModel = {
            invoiceId: invId,
            userId: globalConstant.userDetails.isVendor ? globalConstant.userDetails.userEmail : globalConstant.userDetails.userId,
            fileDetails: this._tempInvoiceFilesList
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
        this._invoiceUploadService.uploadInvoiceDocuments(filesReq)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                if (response.body) {
                    let results: InvoiceDocumentResultModel = response.body as InvoiceDocumentResultModel;

                    if (results.status.status == 200 && results.status.isSuccess) {
                        this.invoiceFilesList = this.invoiceFilesList.concat(results.fileDetails);
                    }
                    else {
                        this.displayFileUploadStatus(results.status.message);
                    }
                }
            },
            (error) => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                console.log(error);
                this.displayFileUploadStatus("Files upload failed.");
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

        for (let fileItem of this._tempSupportingFilesList) {
            if (fileItem.actualFileName == actualFileName) {
                fileItem.fileData = base64textString;
                this._supportingfileCnt = this._supportingfileCnt + 1;
                break;
            }
        }

        if (this._tempSupportingFilesList.length > 0 && this._tempSupportingFilesList.length == this._supportingfileCnt) {
            this.onSupportingAttachFileClick();
        }
    }

    onSupportingFileChange(event: any) {
        this._tempSupportingFilesList = [];
        this._supportingfileCnt = 0;
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
                    this._tempSupportingFilesList.push(fileDetails);

                    let reader = new FileReader();
                    reader.onload = this._handleSuportingReaderLoaded.bind(this, file.name);
                    reader.readAsBinaryString(file);
                }
            }
        }

        event.target.value = null;
    }

    onSupportingAttachFileClick() {
        let invId = (this.invoiceUpdateResults && this.invoiceUpdateResults.invoiceDetails && this.invoiceUpdateResults.invoiceDetails.invoiceId) ?
            this.invoiceUpdateResults.invoiceDetails.invoiceId : null;
        let filesReq: InvoiceDocumentReqModel = {
            userId: globalConstant.userDetails.isVendor ? globalConstant.userDetails.userEmail : globalConstant.userDetails.userId,
            invoiceId: invId,
            fileDetails: this._tempSupportingFilesList
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
        this._invoiceUploadService.uploadInvoiceDocuments(filesReq)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                if (response.body) {
                    let results: InvoiceDocumentResultModel = response.body as InvoiceDocumentResultModel;

                    if (results.status.status == 200 && results.status.isSuccess) {
                        this.supportingFilesList = this.supportingFilesList.concat(results.fileDetails);
                    }
                    else {
                        this.displayFileUploadStatus(results.status.message);
                    }
                }
            },
            (error) => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                console.log(error);
                this.displayFileUploadStatus("Files upload failed.");
            });
    }

    displayFileUploadStatus(msg: string) {
        const dialogRef = this._dialog.open(MessageDialogComponent, {
            disableClose: true,
            panelClass: 'dialog-box',
            width: '550px',
            data: <MessageDialogModel>{
                title: "Invoice Upload Action",
                message: msg
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            
        });
    }

    onInvoiceUnitsBlur(itemInd: number) {
        const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        let invoiceUnitsVal = itemsFa.controls[itemInd].get("invoiceUnits").value;
        if (invoiceUnitsVal && !isNaN(invoiceUnitsVal) && Number(invoiceUnitsVal) > 0) {
            let invoiceUnits = Number(invoiceUnitsVal).toFixed(3);
            itemsFa.controls[itemInd].get("invoiceUnits").setValue(invoiceUnits);
        }
        else {
            itemsFa.controls[itemInd].get("invoiceUnits").setValue(null);
        }

        this.updateItemTotalAmount(itemInd);
    }

    onUnitPriceBlur(itemInd: number) {
        const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        let UnitPriceVal = itemsFa.controls[itemInd].get("unitPrice").value;
        if (UnitPriceVal && !isNaN(UnitPriceVal)) {
            let unitPrice = Number(UnitPriceVal).toFixed(3);
            itemsFa.controls[itemInd].get("unitPrice").setValue(unitPrice);
        }
        else {
            itemsFa.controls[itemInd].get("unitPrice").setValue(null);
        }

        this.updateItemTotalAmount(itemInd);
    }

    updateItemTotalAmount(itemInd: number) {
        const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        let unitPriceVal = itemsFa.controls[itemInd].get("unitPrice").value;
        let invoiceUnits = itemsFa.controls[itemInd].get("invoiceUnits").value;

        let unitsAmt: number = (unitPriceVal && invoiceUnits) ? +unitPriceVal * +invoiceUnits : 0;
        itemsFa.controls[itemInd].get("unitsAmt").setValue(unitsAmt.toFixed(3));

        this.updateAmountDetails();
    }

    updateAmountDetails() {
        this.invoiceUploadForm.get("totalInvAmt").setValue("0");

        let totalItemsAmt = 0;
        const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        for (let i = 0; i < itemsFa.length; i++) {
            let unitsAmtVal = itemsFa.controls[i].get("unitsAmt").value;
            let unitsAmt = (unitsAmtVal) ? +unitsAmtVal : 0;
            totalItemsAmt = totalItemsAmt + unitsAmt;
        }
        this.invoiceUploadForm.get("totalItemsAmt").setValue(totalItemsAmt.toFixed(3));

        this.updateInvoiceTotalAmt();
    }

    onFreightChargesBlur() {
        let freightChargesVal = this.invoiceUploadForm.get("freightCharges").value;
        if (freightChargesVal && !isNaN(freightChargesVal)) {
            let freightCharges = Number(freightChargesVal).toFixed(3);
            this.invoiceUploadForm.get("freightCharges").setValue(freightCharges);
        }
        else {
            this.invoiceUploadForm.get("freightCharges").setValue(null);
        }

        this.updateInvoiceTotalAmt();
    }

    onTotalTaxBlur() {
        let totalTaxVal = this.invoiceUploadForm.get("totalTax").value;
        if (totalTaxVal && !isNaN(totalTaxVal)) {
            let totalTax = Number(totalTaxVal).toFixed(3);
            this.invoiceUploadForm.get("totalTax").setValue(totalTax);
        }
        else {
            this.invoiceUploadForm.get("totalTax").setValue(null);
        }

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
        this.invoiceUploadForm.get("totalInvAmt").setValue(totalInvAmt.toFixed(3));
    }

    prepareInvoiceFileTypes() {
        this.invoiceFileTypeId = null;
        this.supportFileTypeId = null;
        if (this._initDetails && this._initDetails.invoiceFileTypes && this._initDetails.invoiceFileTypes.length > 0) {
            let invoiceFileTypeItem: InvoiceFileTypwModel = this._initDetails.invoiceFileTypes.find(ft => ft.fileType == "invoice");
            if (invoiceFileTypeItem) {
                this.invoiceFileTypeId = invoiceFileTypeItem.invoiceFileTypesId;
            }

            let supportFileTypeItem: InvoiceFileTypwModel = this._initDetails.invoiceFileTypes.find(ft => ft.fileType == "support");
            this.supportFileTypeId = supportFileTypeItem.invoiceFileTypesId;
        }
    }

    async loadInitData() {
        this.invoiceNumberErrMsg = "";
        this.headerArr = this.poHeaderArrWithoutDates.concat();

        let req: InvoiceUploadReqModel = {
            vendorId: (globalConstant.userDetails.isVendor) ? globalConstant.userDetails.userId : null,
            approvalLevels: [],
            departments: (globalConstant.userDetails.isInvoiceUploader) ? globalConstant.userDetails.poDepts : []
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._initDetails = await this._invoiceUploadService.getInvoiceUploadInitData(req);
        if (this._initDetails) {
            this.prepareInvoiceFileTypes();
            this.poList = (this._initDetails.poList && this._initDetails.poList.length > 0) ? this._initDetails.poList.concat() : [];
            this.currencyList = (this._initDetails.currencyList && this._initDetails.currencyList.length > 0) ? this._initDetails.currencyList.concat() : [];
            this.companiesList = (this._initDetails.companiesList && this._initDetails.companiesList.length > 0) ? this._initDetails.companiesList.concat() : [];
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

        this.invoiceUploadForm.get("poList").valueChanges.subscribe(val => {
            this.isFromToMandatory = false;
            this.selectedPOItem = null;
            if (val) {
                this.selectedPOItem = this.poList.find(p => p.poNumber == val);
                if (this.selectedPOItem.poDate) {
                    this.minInvoiceDate = new Date(this.selectedPOItem.poDate);
                }
                else {
                    this.minInvoiceDate = null;
                }
                this.currency = this.selectedPOItem.currencyType;

                if (this.selectedPOItem.accountAssignmenCategory == '4' &&
                    (this.selectedPOItem.documentType == 'ZFO' || this.selectedPOItem.documentType == 'ZHR')) {

                    this.isFromToMandatory = true;
                    this.headerArr = this.poHeaderArr.concat();
                }

                this.loadPOItems();
            }

            this.validateInvoiceNumber();
        });

        this.invoiceUploadForm.get("currency").valueChanges.subscribe(val => {
            if (val) {
                this.currency = val;
            }
        });

        this.registerVendorAutoComplete();
        this.registerProjectAutoComplete();
    }

    onRemarksBlur() {
        let val: string = this.invoiceUploadForm.get("remarks").value;
        if (val) {
            this.invoiceUploadForm.get("remarks").setValue(val.trim());
        }
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
        if (itemsList && itemsList.length > 0) {
            const formsList = <FormArray>this.invoiceUploadForm.controls['itemsList'];
            for (let i = 0; i < itemsList.length; i++) {
                formsList.insert(formsList.length, this.createItem(itemsList[i]));
            }
        }

        this.updateAmountDetails();
    }

    onDeleteFileClick(fileDetails: FileDetailsModel, fileIndex: number, fileType: string) {
        if (fileDetails.fileId) {
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Deleting..." });
            this._invoiceUploadService.deleteInvoiceFile(fileDetails)
                .subscribe(response => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    let result = response.body as StatusModel;
                    if (result.isSuccess) {
                        this.removefileFromList(fileIndex, fileType);
                    }
                },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    console.log(error);
                });
        }
        else {
            this.removefileFromList(fileIndex, fileType);
        }
    }

    removefileFromList(fileIndex: number, fileType: string) {
        if (fileType == 'invoice') {
            if (this.invoiceFilesList.length > 0) {
                this.invoiceFilesList.splice(fileIndex, 1);
            }
        } else {
            if (this.supportingFilesList.length > 0) {
                this.supportingFilesList.splice(fileIndex, 1);
            }
        }
    }

    downloadFile(fileDetails: FileDetailsModel) {
        this._appService.downloadInvoiceFile(fileDetails);
    }

    removeItems() {
        const controlsList: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        let cnt = 0;
        while (cnt < controlsList.length) {
            controlsList.removeAt(0);
        }
    }

    createItem(item: ItemModel) {
        let unitsAmt = (item.unitPrice && item.invoiceUnits) ? +item.unitPrice * +item.invoiceUnits : null;
        let orderedUnits: number = (item.orderedUnits) ? +item.orderedUnits : 0.000;
        let suppliedUnits: number = (item.suppliedUnits) ? +item.suppliedUnits : 0.000;
        let submittedUnits: number = (item.submittedUnits) ? +item.submittedUnits : 0.000;
        let balanceUnits: number = orderedUnits - suppliedUnits - submittedUnits;

        let validatorRequiredArr = (this.isFromToMandatory) ? [Validators.required] : [];

        let fg: FormGroup = this._formBuilder.group({
            itemId: item.itemId,
            itemNumber: [item.itemNumber, [Validators.pattern("^[0-9]*$")]],
            itemDescription: item.itemDescription,
            uom: item.uom,
            orderedUnits: item.orderedUnits,
            suppliedUnits: item.suppliedUnits,
            consumedUnits: item.consumedUnits,
            balanceUnits: balanceUnits.toFixed(3),
            invoiceUnits: [item.invoiceUnits, Validators.required],
            unitPrice: item.unitPrice,
            unitsAmt: unitsAmt,
            hsn: [item.hsn, [Validators.required, Validators.maxLength(8), Validators.pattern("^[0-9]*$")]],
            fromDate: [null, validatorRequiredArr],
            toDate: [null, validatorRequiredArr],
            personnelNumber: item.personnelNumber ? item.personnelNumber : "",
            createdBy: item.createdBy,
            createdDate: item.createdDate
        },
            { validator: [this.invoiceGreaterThanBalance('invoiceUnits', 'balanceUnits', "itemNumber", "orderedUnits", "Invoice units shouldn't greater than Balance units.")] });

        return fg;
    }

    invoiceGreaterThanBalance(invoiceUnits: string, balanceUnits: string, itemNumber: string, orderedUnits: string, errorMsg: string) {
        return (group: FormGroup): { [key: string]: any } => {
            let invCtrl = group.controls[invoiceUnits];
            let balCtrl = group.controls[balanceUnits];

            if (this.selectedInvoiceType == 'po') {
                if (invCtrl.value && balCtrl.value) {
                    let invUnits: number = +invCtrl.value;
                    let balUnits: number = +balCtrl.value;
                    if (invUnits > balUnits) {
                        return {
                            invErrMsg: "Invoice units shouldn't greater than Balance units."
                        };
                    }
                }
                // let existingItem: NotRejectedItemsModel = null;
                // if(this._poItemsResultDetails && this._poItemsResultDetails.notRejectedItemsList && this._poItemsResultDetails.notRejectedItemsList.length > 0) {
                //     let itemNumberCtrl = group.controls[itemNumber];
                //     existingItem = this._poItemsResultDetails.notRejectedItemsList.find(x => x.itemNumber == itemNumberCtrl.value);
                // }

                // if(existingItem) {
                //     if (invCtrl.value && balCtrl.value) {
                //         let invUnits: number = +invCtrl.value;
                //         let balUnits: number = +balCtrl.value;
                //         if (invUnits > balUnits) {
                //             return {
                //                 invErrMsg: "Invoice units shouldn't greater than Balance units."
                //             };
                //         }
                //     }
                // }
                // else {
                //     let orderedUnitsCtrl = group.controls[orderedUnits];

                //     if (invCtrl.value && orderedUnitsCtrl.value) {
                //         let invUnits: number = +invCtrl.value;
                //         let orderedUnits: number = +orderedUnitsCtrl.value;
                //         if (invUnits > orderedUnits) {
                //             return {
                //                 invErrMsg: "Invoice units shouldn't greater than Order units."
                //             };
                //         }
                //     }
                // }
            }
            else {
                if (invCtrl.value && balCtrl.value) {
                    let invUnits: number = +invCtrl.value;
                    let balUnits: number = +balCtrl.value;
                    if (invUnits > balUnits) {
                        return {
                            invErrMsg: "Invoice units shouldn't greater than Balance units."
                        };
                    }
                }
            }

            return {};
        }
    }

    onSaveClick() {
        this.updateInvoiceDetails(this._appService.updateOperations.save);
    }

    onSubmitClick() {
        this.updateInvoiceDetails(this._appService.updateOperations.submit);
    }

    isUploadFormValid() {
        this.invoiceFilesErrMsg = "";
        this.supportFilesErrMsg = "";

        let isInvFilesValid: boolean = true;
        if (this.invoiceFilesList && this.invoiceFilesList.length == 0) {
            this.invoiceFilesErrMsg = "Please select invoice file.";
            isInvFilesValid = false;
        }
        else {
            let nonAttachInvFiles: FileDetailsModel[] = this.invoiceFilesList.filter(f => f.fileId == null);
            if (nonAttachInvFiles && nonAttachInvFiles.length > 0) {
                this.invoiceFilesErrMsg = "Please attach invoice file.";
                isInvFilesValid = false;
            }
        }

        let isSupportingFilesValid: boolean = true;
        if (this.supportingFilesList && this.supportingFilesList.length > 0) {
            let nonAttachSupportFiles: FileDetailsModel[] = this.supportingFilesList.filter(f => f.fileId == null);
            if (nonAttachSupportFiles && nonAttachSupportFiles.length > 0) {
                this.supportFilesErrMsg = "Please attach or remove selected support files.";
                isSupportingFilesValid = false;
            }
        }

        let isCntrlsValid: boolean = false;
        if ((this.invoiceUploadForm.controls['itemsList'] as FormArray).length > 0 && this.invoiceUploadForm.valid) {
            isCntrlsValid = true;
        }

        // this.totalItemsAmtValid = false;
        // let totalItemsAmtVal = this.invoiceUploadForm.get("totalItemsAmt").value;
        // if(totalItemsAmtVal && !isNaN(totalItemsAmtVal) && Number(totalItemsAmtVal) > 0) {
        //     this.totalItemsAmtValid = true;
        // }

        if (isInvFilesValid && isSupportingFilesValid && isCntrlsValid && this.isInvoiceValid) {
            return true;
        }

        return false;
    }

    updateInvoiceDetails(action: string) {
        this.isSubmitted = true;

        if (!this.isUploadFormValid()) {
            return false;
        }


        let poNumber = null;
        if (this.selectedInvoiceType == 'po') {
            if (!this.selectedPOItem) {
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
        for (let i = 0; i < itemsFa.length; i++) {
            let item: ItemModel = {
                poNumber: poNumber,
                itemNumber: itemsFa.controls[i].get("itemNumber").value,
                itemId: itemsFa.controls[i].get("itemId").value,
                itemDescription: itemsFa.controls[i].get("itemDescription").value,
                uom: itemsFa.controls[i].get("uom").value,
                orderedUnits: itemsFa.controls[i].get("orderedUnits").value,
                suppliedUnits: itemsFa.controls[i].get("suppliedUnits").value,
                consumedUnits: itemsFa.controls[i].get("consumedUnits").value,
                submittedUnits: null,
                invoiceUnits: itemsFa.controls[i].get("invoiceUnits").value,
                unitPrice: itemsFa.controls[i].get("unitPrice").value,
                totalAmt: itemsFa.controls[i].get("unitsAmt").value,
                hsn: itemsFa.controls[i].get("hsn").value,
                fromDate: (this.selectedInvoiceType == 'po' && itemsFa.controls[i].get("fromDate").value) ? this._appService.getDBFormattedDate(itemsFa.controls[i].get("fromDate").value) : null,
                toDate: (this.selectedInvoiceType == 'po' && itemsFa.controls[i].get("toDate").value) ? this._appService.getDBFormattedDate(itemsFa.controls[i].get("toDate").value) : null,
                personnelNumber: (this.selectedInvoiceType == 'po') ? itemsFa.controls[i].get("personnelNumber").value : null,
                remarks: null,
                createdBy: itemsFa.controls[i].get("createdBy").value,
                createdDate: itemsFa.controls[i].get("createdDate").value
            };

            itemsList.push(item);
        }

        let filesList: FileDetailsModel[] = [];
        for (let invCnt = 0; invCnt < this.invoiceFilesList.length; invCnt++) {
            if (this.invoiceFilesList[invCnt] && this.invoiceFilesList[invCnt].fileId) {
                filesList.push(this.invoiceFilesList[invCnt]);
            }
        }

        for (let sCnt = 0; sCnt < this.supportingFilesList.length; sCnt++) {
            if (this.supportingFilesList[sCnt] && this.supportingFilesList[sCnt].fileId) {
                filesList.push(this.supportingFilesList[sCnt]);
            }
        }

        let venId: string = null;
        let venName: string = null;
        let projId: string = null;
        let projName: string = null;
        let companyCode: string = null;
        let companyName: string = null;
        if (this.selectedInvoiceType == 'po') {
            venId = this.selectedPOItem.vendorId;
            venName = this.selectedPOItem.vendorName;
            companyCode = this.selectedPOItem.companyCode;
            companyName = this.selectedPOItem.companyName;
        }
        else {
            let selVendor = this.invoiceUploadForm.get("vendorId").value;
            if (typeof (selVendor) == "object") {
                venId = (selVendor as VendorAutoCompleteModel).vendorId;
                venName = (selVendor as VendorAutoCompleteModel).vendorName;
            }

            let selProject = this.invoiceUploadForm.get("projectId").value;
            if (typeof (selProject) == "object") {
                projId = (selProject as ProjectAutoCompleteModel).projectId;
                projName = (selProject as ProjectAutoCompleteModel).projectName;
            }

            let selCompanyCode = this.invoiceUploadForm.get("companyCode").value;
            let selCompanyCodeObj: CompanyCodeMasterList = this.companiesList.find(c => c.companyCode == selCompanyCode);
            if (selCompanyCodeObj) {
                companyCode = selCompanyCodeObj.companyCode;
                companyName = selCompanyCodeObj.companyDesc;
            }
        }

        let req: UpdateInvoiceRequestModel = {
            action: action,
            userId: (this.selectedInvoiceType == 'po' && globalConstant.userDetails.isVendor) ? globalConstant.userDetails.userEmail : globalConstant.userDetails.userId,
            poDetails: this.selectedPOItem,
            invoiceDetails: {
                invoiceId: null,
                purchaseOrderId: (this.selectedPOItem) ? this.selectedPOItem.purchaseOrderId : null,
                vendorId: venId,
                vendorName: venName,
                invoiceNumber: this.invoiceUploadForm.get("invoiceNumber").value,
                invoiceDate: this._appService.getFormattedDateTime(this.invoiceUploadForm.get("invoiceDate").value),
                remarks: this.invoiceUploadForm.get("remarks").value,
                freightCharges: this.invoiceUploadForm.get("freightCharges").value ? this.invoiceUploadForm.get("freightCharges").value : null,
                totalAmt: this.invoiceUploadForm.get("totalInvAmt").value,
                grnSesNumber: null,
                statusCode: null,
                totalTax: this.invoiceUploadForm.get("totalTax").value,
                currencyType: this.currency,
                projectId: projId,
                projectName: projName,
                companyCode: companyCode,
                companyName: companyName,
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
                        this.displayInvoiceUploadStatus(this.invoiceUpdateResults.statusDetails.message, true);
                    }
                    else {
                        this.displayInvoiceUploadStatus(this.invoiceUpdateResults.statusDetails.message, false);
                    }
                }
            },
            (error) => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                console.log(error);
                this.displayInvoiceUploadStatus("Invoice upload failed.", false);
            });
    }

    displayInvoiceUploadStatus(msg: string, status: boolean) {
        const dialogRef = this._dialog.open(MessageDialogComponent, {
            disableClose: true,
            panelClass: 'dialog-box',
            width: '550px',
            data: <MessageDialogModel>{
                title: "Invoice Upload Action",
                message: msg
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && status) {
                this._router.navigate([this._appService.routingConstants.invoiceSearch]);
            }
        });
    }

    totalItemsAmtValidator(control: AbstractControl) {
        if (this.invoiceUploadForm) {
            let totalItemsAmtVal = this.invoiceUploadForm.get("totalItemsAmt").value;
            if (totalItemsAmtVal && (Number(totalItemsAmtVal) > 0)) {
                return {};
            }
            else {
                return {
                    totalItemsAmtErr: "Invoice Net Amount should be greater than zero"
                }
            }
        }

        return {};
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
            poList: [null, Validators.required],
            invoiceNumber: [null, Validators.required],
            invoiceDate: [null, Validators.required],
            remarks: [null, Validators.required],
            freightCharges: null,
            totalTax: [null, Validators.required],
            totalItemsAmt: ["", [this.totalItemsAmtValidator.bind(this)]],
            totalInvAmt: [""],
            currency: null,
            vendorId: null,
            projectId: null,
            companyCode: null,
            createdBy: null,
            createdDate: null,
            itemsList: this._formBuilder.array([], Validators.required)
        });

        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }

}
