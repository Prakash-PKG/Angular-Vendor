import { LoginVendorComponent } from './../login-vendor/login-vendor.component';
import { MessageDialogModel } from './../models/popup-models';
import { MessageDialogComponent } from './../message-dialog/message-dialog.component';
import { globalConstant, countryCompanyCodes } from './../common/global-constant';
import { AppService } from './../app.service';
import { InvoiceUploadService } from './invoice-upload.service';
import {
    BusyDataModel, InvoiceUploadResultModel, InvoiceUploadReqModel, InvoiceDocumentReqModel, currencyMasterList,
    PODetailsModel, POItemsRequestModel, POItemsResultModel, ItemModel, FileDetailsModel, InvoiceFileTypwModel,
    UpdateInvoiceRequestModel, UpdateInvoiceResultModel, InvoiceDocumentResultModel, StatusModel,
    VendorAutoCompleteModel, ProjectAutoCompleteModel, CompanyCodeMasterList, InvoiceExistReqModel,
    NotRejectedItemsModel, PlantModel, regionMasterVOList
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

    totalHeaders: string[] = [];
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

    plantsList: PlantModel[] = [];

    isInvoiceValid: boolean = false;

    invoiceNumberErrMsg: string = "";

    minInvoiceDate: Date = null;
    maxInvoiceDate: Date = new Date();

    isFromToMandatory: boolean = false;

    isHSNVisible: boolean = false;
    isTCSAmtVisible: boolean = false;
    isRegionFieldsVisible: boolean = false;

    isIndiaWorkflow: boolean = false;
    isUSWorkFlow: boolean = false;

    regionsList: regionMasterVOList[] = [];

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

    // fires on Download template click
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

    // gets project name
    getPOProjectName() {
        let projectName: string = "";
        if (this.selectedPOItem && this.selectedPOItem.projectName && this.selectedPOItem.projectId) {
            projectName = this.selectedPOItem.projectName + "( " + this.selectedPOItem.projectId + " )";
        }

        return projectName;
    }

    // gets plant details
    getPlant() {
        let plant: string = "";
        if (this.selectedPOItem && this.selectedPOItem.plantCode && this.selectedPOItem.plantDescription) {
            plant = this.selectedPOItem.plantDescription + " ( " + this.selectedPOItem.plantCode + " )";
        }

        return plant;
    }

    // fires on cancel click
    onCancelClick() {
        this._router.navigate([this._appService.routingConstants.invoiceSearch]);
    }

    // fires on invoice number change
    onInvoiceBlur() {
        this.validateInvoiceNumber();
    }

    // validates invoice number
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

    // displays vendor name
    displayVendor(v: VendorAutoCompleteModel) {
        if (v) { return v.vendorName + " ( " + v.vendorId + " )"; }
    }

    // fires on vendor option selected
    onVendorOptionSelected(evt: VendorAutoCompleteModel) {
        this.filteredVendors = [];
        this.validateInvoiceNumber();
    }

    // gets vendor name
    getDisplayVendorName(v: VendorAutoCompleteModel) {
        if (v) {
            return "<b>" + v.vendorName + "</b> (" + v.vendorId + ")";
        }

        return "";
    }

    // fires vendor panel closed
    onVendorPanelClosed() {
        this.filteredVendors = [];
    }

    // fires on vendor value change
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

    // diplays project details
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

    // on project panel closed
    onProjectPanelClosed() {
        this.filteredProjects = [];
    }

    // on project value change 
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

    // fires on invoice type change
    onInvoiceTypeChange(evtData) {
        this.resetAllFields();

        if (evtData.value == "po") {
            this.headerArr = this.poHeaderArr.concat();
            this.totalHeaders = this.headerArr.concat();
            this.invoiceUploadForm.get("poList").setValidators([Validators.required]);

            this.invoiceUploadForm.get("currency").setValidators([]);
            this.invoiceUploadForm.get("vendorId").setValidators([]);
            this.invoiceUploadForm.get("projectId").setValidators([]);
            this.invoiceUploadForm.get("companyCode").setValidators([]);
            this.invoiceUploadForm.get("plantCode").setValidators([]);
        }
        else {
            this.headerArr = this.nonPOHeaderArr.concat();
            this.totalHeaders = this.headerArr.concat();
            this.invoiceUploadForm.get("currency").setValidators([Validators.required]);
            this.invoiceUploadForm.get("vendorId").setValidators([Validators.required]);
            this.invoiceUploadForm.get("projectId").setValidators([Validators.required]);
            this.invoiceUploadForm.get("companyCode").setValidators([Validators.required]);
            this.invoiceUploadForm.get("plantCode").setValidators([Validators.required]);

            this.invoiceUploadForm.get("poList").setValidators([]);
        }

        this.invoiceUploadForm.get("poList").updateValueAndValidity();
        this.invoiceUploadForm.get("currency").updateValueAndValidity();
        this.invoiceUploadForm.get("vendorId").updateValueAndValidity();
        this.invoiceUploadForm.get("projectId").updateValueAndValidity();
        this.invoiceUploadForm.get("companyCode").updateValueAndValidity();
        this.invoiceUploadForm.get("plantCode").updateValueAndValidity();
    }

    // resets all fields
    resetAllFields() {
        this.invoiceUploadForm.reset();
        this.removeItems();
        this.currency = "";
        this.selectedPOItem = null;

        this.invoiceUploadForm.get("poList").setValidators([]);
        this.invoiceUploadForm.get("currency").setValidators([]);

        
        this.invoiceUploadForm.get("freightCharges").setValue("");
        this.invoiceUploadForm.get("totalItemsAmt").setValue("");
        this.invoiceUploadForm.get("totalInvAmt").setValue("");
    }

    // updates non po item numbers
    updateNonPOItemNumbers() {
        const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        let itemNoVal: number = 0;
        for (let i = 0; i < itemsFa.length; i++) {
            itemNoVal = itemNoVal + 10;
            itemsFa.controls[i].get("itemNumber").setValue(itemNoVal);
        }
    }

    // fires on new click
    onNewClick() {
        const formsList = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        formsList.insert(formsList.length, this.createNonPOItem());

        this.updateNonPOItemNumbers();
    }

    // creates non po item
    createNonPOItem() {
        let hsnValidators: any = [];

        let selCompany: string = this.invoiceUploadForm.get("companyCode").value;
        if(countryCompanyCodes.indiaCompanyCodes.indexOf(selCompany) > -1) {
            hsnValidators = [Validators.required, Validators.maxLength(8), Validators.pattern("^[0-9]*$")];
        }

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
            hsn: [null, hsnValidators],
            createdBy: null,
            createdDate: null
        });

        return fg;
    }

    // file upload functionality starts here
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

                let isExeFileExist: boolean = false;
                for (let i = 0; i < event.target.files.length; i++) {
                    let file = event.target.files[i];
                    let ext = file.name.split('.').pop().toLowerCase();
                    if (ext == 'exe') {
                        isExeFileExist = true;
                        break;
                    }
                }

                if (isExeFileExist) {
                    this.displayFileUploadStatus("Can't attach exe file.");
                }
                else {
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
            //this.getInvoiceFileData(readerEvt.target.result, actualFileName);
        }
    }

    getInvoiceFileData(fileData, actualFileName) {
        let fileReq = null;
        let fd = new FormData();
        const blob = new Blob([fileData], { type: 'application/pdf' });
        fd.append('file', blob, actualFileName);

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
        this._invoiceUploadService.getInvoiceFileData(fd)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                if (response) {

                }
            },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    console.log(error);
                    //this.displayFileUploadStatus("Files upload failed.");
                });
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

            let isExeFileExist: boolean = false;
            for (let i = 0; i < event.target.files.length; i++) {
                let file = event.target.files[i];
                let ext = file.name.split('.').pop().toLowerCase();
                if (ext == 'exe') {
                    isExeFileExist = true;
                    break;
                }
            }

            if (isExeFileExist) {
                this.displayFileUploadStatus("Can't attach exe file.");
            }
            else {
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
    // file upload functionality ends here

    // fires on invoice units change
    onInvoiceUnitsBlur(itemInd: number) {
        const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        let invoiceUnitsVal = itemsFa.controls[itemInd].get("invoiceUnits").value;
        if (invoiceUnitsVal && !isNaN(invoiceUnitsVal) && Number(invoiceUnitsVal) > 0) {
            let invoiceUnits = Number(invoiceUnitsVal).toFixed(6);
            itemsFa.controls[itemInd].get("invoiceUnits").setValue(invoiceUnits);
        }
        else {
            itemsFa.controls[itemInd].get("invoiceUnits").setValue(null);
        }

        this.updateItemTotalAmount(itemInd);
    }

    // on units price change
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

    // updates item total amount
    updateItemTotalAmount(itemInd: number) {
        const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        let unitPriceVal = itemsFa.controls[itemInd].get("unitPrice").value;
        let invoiceUnits = itemsFa.controls[itemInd].get("invoiceUnits").value;

        let unitsAmt: number = (unitPriceVal && invoiceUnits) ? +unitPriceVal * +invoiceUnits : 0;
        itemsFa.controls[itemInd].get("unitsAmt").setValue(unitsAmt.toFixed(3));

        this.updateAmountDetails();
    }

    // updates amount details
    updateAmountDetails() {
        this.invoiceUploadForm.get("totalInvAmt").setValue("0");
                this.invoiceUploadForm.get("freightCharges").setValue("0");

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

    // on freight charge change event fires
    onFreightChargesBlur() {
        let freightChargesVal = this.invoiceUploadForm.get("freightCharges").value;
        if (freightChargesVal && !isNaN(freightChargesVal)) {
            let freightCharges = Number(freightChargesVal).toFixed(3);
            this.invoiceUploadForm.get("freightCharges").setValue(freightCharges);
        }
        else {
            this.invoiceUploadForm.get("freightCharges").setValue(0);
        }

        this.updateInvoiceTotalAmt();
    }
    
    // fires on tcs amount change
    ontcsAmountBlur() {
        let tcsAmountVal = this.invoiceUploadForm.get("tcsAmount").value;
        if (tcsAmountVal && !isNaN(tcsAmountVal)) {
            let tcsAmount = Number(tcsAmountVal).toFixed(3);
            this.invoiceUploadForm.get("tcsAmount").setValue(tcsAmount);
        }
        else {
            this.invoiceUploadForm.get("tcsAmount").setValue(null);
        }

        this.updateInvoiceTotalAmt();
    }

    // on rate change
    onRateBlur() {
        let rateVal = this.invoiceUploadForm.get("rate").value;
        if (rateVal && !isNaN(rateVal)) {
            let rateAmt = Number(rateVal).toFixed(3);
            this.invoiceUploadForm.get("rate").setValue(rateAmt);
        }
        else {
            this.invoiceUploadForm.get("rate").setValue(null);
        }

        let updatedRate: number = this.invoiceUploadForm.get("rate").value ? +this.invoiceUploadForm.get("rate").value : 0;
        if(updatedRate == 0) {
            this.invoiceUploadForm.get("taxableAmt").setValue(null);
            this.invoiceUploadForm.get("taxableAmt").disable();
            this.invoiceUploadForm.get("taxableAmt").setValidators([]);
        }
        else {
            this.invoiceUploadForm.get("taxableAmt").enable();
            this.invoiceUploadForm.get("taxableAmt").setValidators([Validators.required]);
        }

        this.invoiceUploadForm.get("taxableAmt").updateValueAndValidity();

        this.updateTotalTaxAmt();
    }

    // on non taxable amoutn change
    onNonTaxableAmtBlur() {
        let amtVal = this.invoiceUploadForm.get("nonTaxableAmt").value;
        if (amtVal && !isNaN(amtVal)) {
            let amt = Number(amtVal).toFixed(3);
            this.invoiceUploadForm.get("nonTaxableAmt").setValue(amt);
        }
        else {
            this.invoiceUploadForm.get("nonTaxableAmt").setValue(null);
        }

        this.invoiceUploadForm.get("totalItemsAmt").updateValueAndValidity();
    }

    // fires on taxable amount change
    onTaxableAmtBlur() {
        let amtVal = this.invoiceUploadForm.get("taxableAmt").value;
        if (amtVal && !isNaN(amtVal)) {
            let amt = Number(amtVal).toFixed(3);
            this.invoiceUploadForm.get("taxableAmt").setValue(amt);
        }
        else {
            this.invoiceUploadForm.get("taxableAmt").setValue(null);
        }

        this.invoiceUploadForm.get("totalItemsAmt").updateValueAndValidity();

        this.updateTotalTaxAmt();
    }

    // updates total tax amount
    updateTotalTaxAmt() {
        let rateVal = this.invoiceUploadForm.get("rate").value ? +this.invoiceUploadForm.get("rate").value : 0;
        let taxableAmt = this.invoiceUploadForm.get("taxableAmt").value ? +this.invoiceUploadForm.get("taxableAmt").value : 0;
        
        let totalTaxAmt: string = ((rateVal * taxableAmt)/100).toFixed(3);
        this.invoiceUploadForm.get("totalTax").setValue(totalTaxAmt);

        this.updateInvoiceTotalAmt();
    }

    // fires on total tax amount change
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

    // updates invoice total amount
    updateInvoiceTotalAmt() {
        let totalItemsAmtVal = this.invoiceUploadForm.get("totalItemsAmt").value;
        let totalItemsAmt = totalItemsAmtVal ? +totalItemsAmtVal : 0;

        let fregihtChargesVal = this.invoiceUploadForm.get("freightCharges").value;
        let fregihtCharges = fregihtChargesVal ? +fregihtChargesVal : 0;

        let tcsAmount = 0;
        if(this.isIndiaWorkflow) {
            let tcsAmountVal = this.invoiceUploadForm.get("tcsAmount").value;
            tcsAmount = tcsAmountVal ? +tcsAmountVal : 0;
        }

        let totalTaxVal = this.invoiceUploadForm.get("totalTax").value;
        let totalTax = totalTaxVal ? +totalTaxVal : 0;

        let totalInvAmt: number = totalItemsAmt + fregihtCharges + totalTax + tcsAmount;
        this.invoiceUploadForm.get("totalInvAmt").setValue(totalInvAmt.toFixed(3));
    }

    // prepares invoice file type
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

    // loads init data
    async loadInitData() {
        this.companiesList = [];

        this.invoiceNumberErrMsg = "";
        this.headerArr = this.poHeaderArrWithoutDates.concat();
        this.totalHeaders = this.headerArr.concat();

        let wfCountryCodes: string[] = this._appService.getAllCountryCodesByDept(globalConstant.userDetails.poDepts);

        let req: InvoiceUploadReqModel = {
            vendorId: (globalConstant.userDetails.isVendor) ? globalConstant.userDetails.userId : null,
            approvalLevels: [],
            departments: (globalConstant.userDetails.isInvoiceUploader) ? this._appService.getUpdatedUniqueDepartments(globalConstant.userDetails.poDepts) : [],
            companyCodes: (globalConstant.userDetails.isInvoiceUploader) ? this._appService.getCompanyCodesByDept(globalConstant.userDetails.poDepts) : [],
            countryCodes: (globalConstant.userDetails.isInvoiceUploader) ? this._appService.getCountryCodesByDept(globalConstant.userDetails.poDepts) : []
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._initDetails = await this._invoiceUploadService.getInvoiceUploadInitData(req);
        if (this._initDetails) {
            this.prepareInvoiceFileTypes();
            this.poList = (this._initDetails.poList && this._initDetails.poList.length > 0) ? this._initDetails.poList.concat() : [];
            this.currencyList = (this._initDetails.currencyList && this._initDetails.currencyList.length > 0) ? this._initDetails.currencyList.concat() : [];
            
            for(let i = 0; i < wfCountryCodes.length; i++) {
                let selCompanies: CompanyCodeMasterList[] = this._initDetails.companiesList.filter(c => c.countryCode == wfCountryCodes[i]);
                if(selCompanies && selCompanies.length > 0) {
                    this.companiesList = this.companiesList.concat(selCompanies);
                }
            }
            
            //this.companiesList = (this._initDetails.companiesList && this._initDetails.companiesList.length > 0) ? this._initDetails.companiesList.concat() : [];
            this.plantsList = (this._initDetails.plantsList && this._initDetails.plantsList.length > 0) ? this._initDetails.plantsList.concat() : [];
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
                    this.invoiceUploadForm.get("isDatesMandatory").setValue(true);
                    this.headerArr = this.poHeaderArr.concat();
                }
                else {
                    this.headerArr = this.poHeaderArrWithoutDates.concat();
                }
                this.totalHeaders = this.headerArr.concat();

                this.loadPOItems();
            }

            this.validateInvoiceNumber();
        });

        this.invoiceUploadForm.get("companyCode").valueChanges.subscribe(val => {
            if (val) {
               this.onCompanyCodeChange(val);
            }
        }); 

        this.invoiceUploadForm.get("currency").valueChanges.subscribe(val => {
            if (val) {
                this.currency = val;
            }
        }); 

        this.invoiceUploadForm.get("isDatesMandatory").valueChanges.subscribe(val => {
            const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
            if(val) {
                for (let i = 0; i < itemsFa.length; i++) {
                    itemsFa.controls[i].get("fromDate").setValidators([Validators.required]);
                    itemsFa.controls[i].get("toDate").setValidators([Validators.required]);
                    itemsFa.controls[i].get("fromDate").updateValueAndValidity();
                    itemsFa.controls[i].get("toDate").updateValueAndValidity();
                }
            }
            else {
                for (let i = 0; i < itemsFa.length; i++) {
                    itemsFa.controls[i].get("fromDate").setValidators([]);
                    itemsFa.controls[i].get("toDate").setValidators([]);
                    itemsFa.controls[i].get("fromDate").updateValueAndValidity();
                    itemsFa.controls[i].get("toDate").updateValueAndValidity();
                }
            }
        });

        this.registerVendorAutoComplete();
        this.registerProjectAutoComplete();
    }

    // fires on company code change
    onCompanyCodeChange(companyCode: string) {
        this.invoiceUploadForm.get("region").setValue(null);
        this.invoiceUploadForm.get("rate").setValue(null);
        this.invoiceUploadForm.get("nonTaxableAmt").setValue(null);
        this.invoiceUploadForm.get("taxableAmt").setValue(null);

        const itemsFa: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        for (let i = 0; i < itemsFa.length; i++) {
            itemsFa.controls[i].get("hsn").setValue(null);
        }

        this.isIndiaWorkflow = false;
        this.isUSWorkFlow = false;

        this.isHSNVisible = false;
        this.isTCSAmtVisible = false;
        this.isRegionFieldsVisible = false;
        if(countryCompanyCodes.indiaCompanyCodes.indexOf(companyCode) > -1) {
            this.isIndiaWorkflow = true;

            this.isHSNVisible = true;
            this.isTCSAmtVisible = true;
            this.isRegionFieldsVisible = false;

            this.headerArr = this.totalHeaders.concat();

            this.invoiceUploadForm.get("region").setValidators([]);
            this.invoiceUploadForm.get("rate").setValidators([]);
            this.invoiceUploadForm.get("nonTaxableAmt").setValidators([]);
            this.invoiceUploadForm.get("taxableAmt").setValidators([]);
            this.invoiceUploadForm.get("totalTax").enable();

            for (let i = 0; i < itemsFa.length; i++) {
                itemsFa.controls[i].get("hsn").setValidators([Validators.required, Validators.maxLength(8), Validators.pattern("^[0-9]*$")]);
                itemsFa.controls[i].get("hsn").updateValueAndValidity();
            }
        }
        else if(countryCompanyCodes.usCompanyCodes.indexOf(companyCode) > -1) {
            this.isUSWorkFlow = true;

            this.isHSNVisible = false;
            this.isTCSAmtVisible = false;
            this.isRegionFieldsVisible = true;

            this.headerArr = this.totalHeaders.filter(x => x != "HSN/SAC");

            this.regionsList = this._initDetails.regionsList.filter(x => x.countryCode == "US");

            this.invoiceUploadForm.get("region").setValidators([Validators.required]);
            this.invoiceUploadForm.get("rate").setValidators([Validators.required]);
            this.invoiceUploadForm.get("nonTaxableAmt").setValidators([Validators.required]);
            this.invoiceUploadForm.get("taxableAmt").setValidators([Validators.required]);
            this.invoiceUploadForm.get("totalTax").disable();

            for (let i = 0; i < itemsFa.length; i++) {
                itemsFa.controls[i].get("hsn").setValidators([]);
                itemsFa.controls[i].get("hsn").updateValueAndValidity();
            }
        }

        this.invoiceUploadForm.get("region").updateValueAndValidity();
        this.invoiceUploadForm.get("rate").updateValueAndValidity();
        this.invoiceUploadForm.get("nonTaxableAmt").updateValueAndValidity();
        this.invoiceUploadForm.get("taxableAmt").updateValueAndValidity();

        itemsFa.updateValueAndValidity();
    }

    // fires on remarks change
    onRemarksBlur() {
        let val: string = this.invoiceUploadForm.get("remarks").value;
        if (val) {
            this.invoiceUploadForm.get("remarks").setValue(val.trim());
        }
    }

    // loads po items
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

        this.onCompanyCodeChange(this.selectedPOItem.companyCode);

        this.updateAmountDetails();
    }

    // on delete file click
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

    // fires on remove file click
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

    // fires on download file click
    downloadFile(fileDetails: FileDetailsModel) {
        this._appService.downloadInvoiceFile(fileDetails);
    }

    // fires on remove item click
    removeItems() {
        const controlsList: FormArray = <FormArray>this.invoiceUploadForm.controls['itemsList'];
        let cnt = 0;
        while (cnt < controlsList.length) {
            controlsList.removeAt(0);
        }
    }

    // creates new item
    createItem(item: ItemModel) {
        let unitsAmt = (item.unitPrice && item.invoiceUnits) ? +item.unitPrice * +item.invoiceUnits : null;
        let orderedUnits: number = (item.orderedUnits) ? +item.orderedUnits : 0.000;
        let suppliedUnits: number = (item.suppliedUnits) ? +item.suppliedUnits : 0.000;
        let submittedUnits: number = (item.submittedUnits) ? +item.submittedUnits : 0.000;
        let balanceUnits: number = orderedUnits - suppliedUnits - submittedUnits;

        let isDatesMandatoryVal: boolean =  this.invoiceUploadForm.get("isDatesMandatory").value;
        let validatorRequiredArr = (this.isFromToMandatory && isDatesMandatoryVal) ? [Validators.required] : [];

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

    // validates invoice total amount
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

    // fires on save click
    onSaveClick() {
        this.updateInvoiceDetails(this._appService.updateOperations.save);
    }

    // fires on submit click
    onSubmitClick() {
        this.updateInvoiceDetails(this._appService.updateOperations.submit);
    }

    // checks whether form is valid or not
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

    // updates invoice details
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
        let plantCode: string = null;
        let plantDescription: string = null;
        if (this.selectedInvoiceType == 'po') {
            venId = this.selectedPOItem.vendorId;
            venName = this.selectedPOItem.vendorName;
            companyCode = this.selectedPOItem.companyCode;
            companyName = this.selectedPOItem.companyName;
            plantCode = this.selectedPOItem.plantCode;
            plantDescription = this.selectedPOItem.plantDescription;
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

            let selPlantCode = this.invoiceUploadForm.get("plantCode").value;
            let selPlantCodeObj: PlantModel = this.plantsList.find(c => c.plantCode == selPlantCode);
            if (selCompanyCodeObj) {
                plantCode = selPlantCodeObj.plantCode;
                plantDescription = selPlantCodeObj.plantDescription;
            }
        }

        let selRegionCode: string = this.invoiceUploadForm.get("region").value;
        let selRegionDesc: string = null;
        if(selRegionCode) {
            let selRegionObj: regionMasterVOList = this._initDetails.regionsList.find(r => r.regionCode == selRegionCode);
            selRegionDesc = selRegionObj.regionDesc;
        }

        let updatePOItem: PODetailsModel = JSON.parse(JSON.stringify(this.selectedPOItem));
        if(this.selectedInvoiceType == 'po' && this.isUSWorkFlow){
            updatePOItem.departmentId = this.selectedPOItem.departmentId + "-" + globalConstant.usCountryCode;
        }

        let req: UpdateInvoiceRequestModel = {
            action: action,
            userId: (this.selectedInvoiceType == 'po' && globalConstant.userDetails.isVendor) ? globalConstant.userDetails.userEmail : globalConstant.userDetails.userId,
            poDetails: updatePOItem,
            invoiceDetails: {
                invoiceId: null,
                purchaseOrderId: (updatePOItem) ? updatePOItem.purchaseOrderId : null,
                vendorId: venId,
                vendorName: venName,
                invoiceNumber: this.invoiceUploadForm.get("invoiceNumber").value,
                invoiceDate: this._appService.getFormattedDateTime(this.invoiceUploadForm.get("invoiceDate").value),
                remarks: this.invoiceUploadForm.get("remarks").value,
                freightCharges: this.invoiceUploadForm.get("freightCharges").value ? this.invoiceUploadForm.get("freightCharges").value : 0,
                totalAmt: this.invoiceUploadForm.get("totalInvAmt").value,
                grnSesNumber: null,
                statusCode: null,
                regionCode: this.invoiceUploadForm.get("region").value ? this.invoiceUploadForm.get("region").value : null,
                regionDescription: selRegionDesc,
                rate: this.invoiceUploadForm.get("rate").value ? this.invoiceUploadForm.get("rate").value : null,
                nonTaxableAmt: this.invoiceUploadForm.get("nonTaxableAmt").value ? this.invoiceUploadForm.get("nonTaxableAmt").value : null,
                taxableAmt: this.invoiceUploadForm.get("taxableAmt").value ? this.invoiceUploadForm.get("taxableAmt").value : null,
                totalTax: this.invoiceUploadForm.get("totalTax").value,
                currencyType: this.currency,
                projectId: projId,
                projectName: projName,
                companyCode: companyCode,
                companyName: companyName,
                plantCode: plantCode,
                plantDescription: plantDescription,
                createdBy: null,
                createdDate: null,
                tcsAmount: this.invoiceUploadForm.get("tcsAmount").value ? this.invoiceUploadForm.get("tcsAmount").value : null
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

    // validates amount
    totalItemsAmtValidator(control: AbstractControl) {
        if (this.invoiceUploadForm) {
            let totalItemsAmtVal = this.invoiceUploadForm.get("totalItemsAmt").value;
            if (totalItemsAmtVal && (Number(totalItemsAmtVal) > 0)) {
                if(this.isUSWorkFlow) {
                    let totalItemsAmt: number = Number(totalItemsAmtVal);
                    let nonTaxableAmt: number = this.invoiceUploadForm.get("nonTaxableAmt").value ? +this.invoiceUploadForm.get("nonTaxableAmt").value : 0;
                    let taxableAmt: number = this.invoiceUploadForm.get("taxableAmt").value ? +this.invoiceUploadForm.get("taxableAmt").value : 0;

                    let totalAmt: number = nonTaxableAmt + taxableAmt;
                    let totalAmtNumber: number =  Number(totalAmt.toFixed(3));

                    if(totalItemsAmtVal != totalAmtNumber) {
                        return {
                            totalItemsAmtErr: "Invoice Net Amount should be sum of Taxable amount and non taxable amount"
                        }
                    }
                }
                
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

    // fires on page destory event
    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
    }

    // fires on page load event
    ngOnInit() {
        this.isSelectedInvoiceTypeVisible = (globalConstant.userDetails.isVendor) ? false : true;

        this.isDashboardCollapsed = true;

        this.headerArr = this.poHeaderArr.concat();
        this.totalHeaders = this.headerArr.concat();

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        this.invoiceUploadForm = this._formBuilder.group({
            poList: [null, Validators.required],
            invoiceNumber: [null, Validators.required],
            invoiceDate: [null, Validators.required],
            remarks: [null, Validators.required],
            isDatesMandatory: false,
            freightCharges: '',
            region: null,
            rate: null,
            nonTaxableAmt: null,
            taxableAmt: null,
            totalTax: [null, Validators.required],
            totalItemsAmt: ["", [this.totalItemsAmtValidator.bind(this)]],
            totalInvAmt: [""],
            currency: null,
            vendorId: null,
            projectId: null,
            companyCode: null,
            plantCode: null,
            createdBy: null,
            createdDate: null,
            tcsAmount: null,
            itemsList: this._formBuilder.array([], Validators.required)
        });

        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }

}
