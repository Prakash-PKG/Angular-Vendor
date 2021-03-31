import { SidebarService } from './../sidebar/sidebar.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AppService } from '../app.service';
import { VendorRegistrationService } from './../vendor-registration/vendor-registration.service';

import {
    BusyDataModel, VendorRegistrationRequestModel,
    VendorRegistrationResultModel, VendorDocumentReqModel, vendorOrgCategoryModel,
    VendorMasterDocumentModel, FileDetailsModel, VendorDocumentResultModel, StatusModel, FileMap, organizationCategoryMasterVO, organizationTypeMasterVO, VendorOrgTypesModel
} from './../models/data-models';
import { DatePipe } from '@angular/common';
import { HomeService } from '../home/home.service';
import { globalConstant } from '../common/global-constant';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Subscription, BehaviorSubject } from 'rxjs';
import { scan, takeWhile, takeLast } from 'rxjs/operators';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { MessageDialogModel } from '../models/popup-models';



@Component({
    selector: 'app-vendor-documents',
    templateUrl: './vendor-documents.component.html',
    styleUrls: ['./vendor-documents.component.scss']
})
export class VendorDocumentsComponent implements OnInit {
    isValid = true;
    isServerError = false;

    vendorDocumentForm: FormGroup;
    failureMsg: string = "";
    documentsList: VendorMasterDocumentModel[] = [];
    filesMap: FileMap = {};
    disableSubmit: boolean = false;
    private counterSubject: BehaviorSubject<number>;
    private counterSubscription: Subscription;

    maxLutDate = new Date();
    usPayeeIdentificatn: string = "";

    organizationTypeMasterVO: organizationTypeMasterVO[] = [];
    organizationCategoryMasterVO: organizationCategoryMasterVO[] = [];

    vendorOrgTypesList: VendorOrgTypesModel[] = [];

    vendorDocCtrl = {
        incCerCtrl: { documentTypeId: 1, browserId: 'incCerFileCtrl', placeholder: 'Incorporation Certificate', controlName: '' },
        gstCtrl: { documentTypeId: 2, browserId: 'gstFileCtrl', placeholder: 'GST No.', controlName: 'gstNum' },
        panCtrl: { documentTypeId: 3, browserId: 'panFileCtrl', placeholder: 'PAN No.', controlName: 'panNum' },
        pfCtrl: { documentTypeId: 4, browserId: 'pfFileCtrl', placeholder: 'PF No.', controlName: 'pfNum' },
        esiCtrl: { documentTypeId: 5, browserId: 'esiFileCtrl', placeholder: 'ESI No.', controlName: 'esiNum' },
        canChqCtrl: { documentTypeId: 6, browserId: 'canChqFileCtrl', placeholder: 'Cancelled Cheque', controlName: '' },
        msmeCtrl: { documentTypeId: 7, browserId: 'msmeFileCtrl', placeholder: 'Is MSME Certificate applicable?', controlName: 'isMsmedRegistered' },
        tdsCtrl: { documentTypeId: 8, browserId: 'tdsFileCtrl', placeholder: 'Has TDS lower deduction certificate?', controlName: 'hasTdsLower' },
        sezCtrl: { documentTypeId: 9, browserId: 'sezFileCtrl', placeholder: 'SEZ / Non-SEZ', controlName: 'isSez' },
        lutNoCtrl: { documentTypeId: 10, browserId: 'lutNoFileCtrl', placeholder: 'LUT No.', controlName: 'lutNum' },
        msmeSelfCtrl: { documentTypeId: 11, browserId: 'msmeSelfFileCtrl', placeholder: 'MSME Self Attested Certificate?', controlName: '' },
        otherCtrl: { documentTypeId: 13, browserId: 'otherFileCtrl', placeholder: 'Document Description', controlName: 'otherDocDesc' },

        // us fields
        taxIdNoCtrl: { documentTypeId: 14, browserId: 'taxIdNoFileCtrl', placeholder: 'Tax ID No.', controlName: 'usTaxId' },
        socialSecNoCtrl: { documentTypeId: 15, browserId: 'socialSecoFileCtrl', placeholder: 'Social Security No.', controlName: 'usSocialSecurity' },
        einCtrl: { documentTypeId: 16, browserId: 'einFileCtrl', placeholder: 'EIN', controlName: 'usEinNumber' },
        w8Ctrl: { documentTypeId: 17, browserId: 'w8FileCtrl', placeholder: 'W8 - BENE / W8 BEN', controlName: 'usW8Bene' },
        w9Ctrl: { documentTypeId: 18, browserId: 'w9FileCtrl', placeholder: 'W9', controlName: 'usW9' },
        minorityCertCtrl: { documentTypeId: 19, browserId: 'minorityCertFileCtrl', placeholder: 'Minority Certificate', controlName: 'usMinorityCertificate' },
    }

    isSubmitted: boolean = false;

    // _isDirty: boolean = false;

    constructor(private _appService: AppService,
        private _vendorRegistrationService: VendorRegistrationService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _datePipe: DatePipe,
        private _snackBar: MatSnackBar,
        private _sidebarService: SidebarService,
        private _dialog: MatDialog) { }

    get vdf() { return this.vendorDocumentForm.controls; }


    onFileChange(event: any, documentTypeId: number) {
        if (!documentTypeId) return;
        this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
        if (!this.filesMap[documentTypeId]) {
            this.filesMap[documentTypeId] = { filesList: [], toAttach: [], isMandatory: true, isAttached: false, isError: false, isAttachWithoutValue: false };
        }
        else {
            this.filesMap[documentTypeId].toAttach = [];
            // this.filesMap[documentTypeId].isMandatory = true;
            this.filesMap[documentTypeId].isAttached = false;
            this.filesMap[documentTypeId].isError = false;
            this.filesMap[documentTypeId].isAttachWithoutValue = false;
        }
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

                this.counterSubject = new BehaviorSubject(0);
                this.counterSubscription = this.counterSubject
                    .pipe(
                        scan((sum, curr) => sum + curr, 0),
                        takeWhile(val => val < event.target.files.length),
                        takeLast(1)
                    )
                    .subscribe((val: number) => {
                        this.onAttachFileClick(documentTypeId);
                        this.counterSubscription.unsubscribe();
                    });
                for (let f = 0; f < event.target.files.length; f++) {
                    let file = event.target.files[f];
                    if (file) {
                        let fileDetails: FileDetailsModel = {
                            actualFileName: file.name,
                            uniqueFileName: null,
                            fileData: null,
                            documentTypeId: documentTypeId,
                            fileId: null,
                            createdDate: null,
                            createdBy: null
                        };
                        this.filesMap[documentTypeId].toAttach.push(fileDetails);

                        let reader = new FileReader();
                        reader.onload = this._handleFileReaderLoaded.bind(this, file.name, this.filesMap[documentTypeId].toAttach, documentTypeId);
                        reader.readAsBinaryString(file);
                    }
                }
            }
        }
        else {
            this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: "Attaching..." });
        }
    }
    private _handleFileReaderLoaded(actualFileName, toAttach: FileDetailsModel[], documentTypeId: number, readerEvt) {
        let binaryString = readerEvt.target.result;
        let base64textString = btoa(binaryString);

        for (let fileItem of toAttach) {
            if (fileItem.actualFileName == actualFileName) {
                fileItem.fileData = base64textString;
                break;
            }
        }
        this.counterSubject.next(1);
    }

    onBrowseFileClick(event: any, controlName: string) {
        event.preventDefault();
        let element: HTMLElement = document.getElementById(controlName);
        element.click();

    }

    onAttachFileClick(documentTypeId: number) {
        let filesReq: VendorDocumentReqModel = {
            fileDetails: this.filesMap[documentTypeId].toAttach,
            userId: globalConstant.userDetails.isTempVendor ? globalConstant.userDetails.userEmail : globalConstant.userDetails.userId,
            vendorMasterId: this._appService.vendorRegistrationDetails.vendorMasterId
        }

        this._vendorRegistrationService.uploadVendorDocuments(filesReq)
            .subscribe(response => {
                this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                if (response.body) {
                    let results: VendorDocumentResultModel = response.body as VendorDocumentResultModel;
                    if (results.status.status == 200 && results.status.isSuccess) {
                        // this.filesMap[documentTypeId].filesList = [];
                        this._snackBar.open("Files Attached Successfully");
                        results.fileDetails.forEach(f => this.filesMap[documentTypeId].filesList.push(f));
                        this.filesMap[documentTypeId].isAttached = true;
                        this.filesMap[documentTypeId].toAttach = [];
                        this.updateFileWithoutValue(documentTypeId);
                    }

                }
            },
                (error) => {
                    this.filesMap[documentTypeId].isAttached = false;
                    this.filesMap[documentTypeId].toAttach = [];
                    this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    this._snackBar.open("Files Attachment Failed");
                    console.log(error);
                });
    }

    onDeleteFileClick(fileDetails: FileDetailsModel, fileIndex: number, documentTypeId: number) {
        if (fileDetails && fileDetails.fileId) {
            this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Deleting..." });
            this._vendorRegistrationService.deleteVendorFile(fileDetails)
                .subscribe(response => {
                    this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    let result = response.body as StatusModel;
                    if (result.isSuccess) {
                        this.removefileFromList(fileIndex, documentTypeId);
                        this._snackBar.open("File deleted Successfully");
                    }
                },
                    (error) => {
                        this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                        console.log(error);
                    });
        }
        else {
            this.removefileFromList(fileIndex, documentTypeId);
        }
    }

    removefileFromList(fileIndex: number, documentTypeId: number) {
        if (this.filesMap[documentTypeId]
            && this.filesMap[documentTypeId].filesList
            && this.filesMap[documentTypeId].filesList.length > 0) {
            this.filesMap[documentTypeId].filesList.splice(fileIndex, 1);
            this.filesMap[documentTypeId].isAttached =
                (this.filesMap[documentTypeId].filesList.length === 0) ? false : true;
            this.updateFileWithoutValue(documentTypeId);
        }

    }

    downloadFile(fileDetails: FileDetailsModel) {
        this._vendorRegistrationService.downloadFile(fileDetails);
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

    updateDataForBackup() {
        this._appService.vendorRegistrationDetails.panNum = this.vendorDocumentForm.get("panNum").value;
        this._appService.vendorRegistrationDetails.gstNum = this.vendorDocumentForm.get("gstNum").value;
        this._appService.vendorRegistrationDetails.pfNum = this.vendorDocumentForm.get("pfNum").value;
        this._appService.vendorRegistrationDetails.esiNum = this.vendorDocumentForm.get("esiNum").value;
        this._appService.vendorRegistrationDetails.cinNum = this.vendorDocumentForm.get("cinNum").value;
        this._appService.vendorRegistrationDetails.isSez = this.vendorDocumentForm.get("isSez").value;
        this._appService.vendorRegistrationDetails.isRcmApplicable = this.vendorDocumentForm.get("isRcmApplicable").value;
        this._appService.vendorRegistrationDetails.isMsmedRegistered = this.vendorDocumentForm.get("isMsmedRegistered").value;
        this._appService.vendorRegistrationDetails.hasTdsLower = this.vendorDocumentForm.get("hasTdsLower").value;
        this._appService.vendorRegistrationDetails.lutNum = this.vendorDocumentForm.get("lutNum").value;
        this._appService.vendorRegistrationDetails.lutDate = this._datePipe.transform(this.vendorDocumentForm.get("lutDate").value, this._appService.dbDateFormat);
        this._appService.vendorRegistrationDetails.otherDocDesc = this.vendorDocumentForm.get("otherDocDesc").value;
        // US fields
        if (this._appService.vendorRegistrationDetails.vendorOrgCatogeryVO) {
            this._appService.vendorRegistrationDetails.vendorOrgCatogeryVO.catogery = this.vendorDocumentForm.get("vendorOrgCatogery").value;
            this._appService.vendorRegistrationDetails.vendorOrgCatogeryVO.subCatogery = this.vendorDocumentForm.get("vendorOrgSubCategory").value;
        }
        this._appService.vendorRegistrationDetails.usTaxId = this.vendorDocumentForm.get("usTaxId").value;
        this._appService.vendorRegistrationDetails.usSocialSecurity = this.vendorDocumentForm.get("usSocialSecurity").value;
        this._appService.vendorRegistrationDetails.usEinNumber = this.vendorDocumentForm.get("usEinNumber").value;
        this._appService.vendorRegistrationDetails.usW8Bene = this.vendorDocumentForm.get("usW8Bene").value;
        this._appService.vendorRegistrationDetails.usW9 = this.vendorDocumentForm.get("usW9").value;
        this._appService.vendorRegistrationDetails.usMinorityCertificate = this.vendorDocumentForm.get("usMinorityCertificate").value;

        this._appService.usPayeeIdentificatn = this.usPayeeIdentificatn;
        // this._appService.vendorRegistrationDetails.vendorOrgTypesVO = this.vendorOrgTypesList;
    }

    onPrevClick() {
        this.updateDataForBackup();
        this._appService.selectedFileMap = this.filesMap;
        this._router.navigate([this._appService.routingConstants.vendorBankDetails]);
    }

    onSubmitClick() {
        this.failureMsg = "";

        this.isSubmitted = true;

        this.isValid = true;

        for (let key in this.filesMap) {
            if ((this.filesMap[key].isMandatory && !this.filesMap[key].isAttached) || this.filesMap[key].isAttachWithoutValue == true) {
                this.isValid = false;
            }
            if (this.filesMap[key].isMandatory && !this.filesMap[key].isAttached) { this.filesMap[key].isError = true; }
        }

        if (!this.isValid) { this.failureMsg = this._appService.messages.vendorRegistrationFormInvalid; return; };

        if (this.vendorDocumentForm.valid) {

            this.updateDataForBackup();

            let req: VendorRegistrationRequestModel = {
                action: this._appService.updateOperations.submit,
                vendorMasterDetails: this._appService.vendorRegistrationDetails
            }

            this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
            this._vendorRegistrationService.updateVendorRegistrationDetails(req)
                .subscribe(response => {
                    this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    if (response.body) {
                        let result: VendorRegistrationResultModel = response.body as VendorRegistrationResultModel;
                        if (result.status.status == 200 && result.status.isSuccess) {
                            this._appService.vendorRegistrationDetails = result.vendorMasterDetails;
                            this.disableSubmit = true;
                            this.displayRegistrationStatus(this._appService.messages.vendorRegistrationSubmitSuccessMsg);

                        }
                        else {
                            this.disableSubmit = false;
                            this.isServerError = true;
                            this.failureMsg = this._appService.messages.vendorRegistrationSaveFailure;
                        }
                    }
                },
                    (error) => {
                        this.disableSubmit = false;
                        this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                        this.failureMsg = this._appService.messages.vendorRegistrationSaveFailure;
                        console.log(error);
                    });
        }
        else {
            this.failureMsg = this._appService.messages.vendorRegistrationFormInvalid;
        }
    }

    displayRegistrationStatus(msg: string) {
        const dialogRef = this._dialog.open(MessageDialogComponent, {
            disableClose: true,
            panelClass: 'dialog-box',
            width: '550px',
            data: <MessageDialogModel>{
                title: "Vendor Registration Status",
                message: msg
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (globalConstant.userDetails.isEmpanelment) {
                this._router.navigate([this._appService.routingConstants.posearch]);
            }
            else {
                this._sidebarService.logout();
            }
        });
    }

    omit_special_char(event) {
        var k;
        k = event.charCode;
        return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
    }

    toUppercase(control: string) {
        let ControlVal = this.vendorDocumentForm.get(control).value;

        if (ControlVal) {
            this.vendorDocumentForm.get(control).setValue(ControlVal.toUpperCase());
        }
    }

    updateVendorDetails() {
        if (this._appService.vendorRegistrationDetails) {
            this.vendorDocumentForm.get("panNum").setValue(this._appService.vendorRegistrationDetails.panNum);
            this.vendorDocumentForm.get("gstNum").setValue(this._appService.vendorRegistrationDetails.gstNum);
            this.vendorDocumentForm.get("pfNum").setValue(this._appService.vendorRegistrationDetails.pfNum);
            this.vendorDocumentForm.get("esiNum").setValue(this._appService.vendorRegistrationDetails.esiNum);
            this.vendorDocumentForm.get("cinNum").setValue(this._appService.vendorRegistrationDetails.cinNum);
            this.vendorDocumentForm.get("isSez").setValue(this._appService.vendorRegistrationDetails.isSez);
            this.vendorDocumentForm.get("isRcmApplicable").setValue(this._appService.vendorRegistrationDetails.isRcmApplicable);
            this.vendorDocumentForm.get("isMsmedRegistered").setValue(this._appService.vendorRegistrationDetails.isMsmedRegistered);
            this.vendorDocumentForm.get("hasTdsLower").setValue(this._appService.vendorRegistrationDetails.hasTdsLower);
            this.vendorDocumentForm.get("lutNum").setValue(this._appService.vendorRegistrationDetails.lutNum);
            this.vendorDocumentForm.get("lutDate").setValue(this._appService.vendorRegistrationDetails.lutDate ? new Date(this._appService.vendorRegistrationDetails.lutDate) : null);
            this.vendorDocumentForm.get("otherDocDesc").setValue(this._appService.vendorRegistrationDetails.otherDocDesc);
            // US fields

            this.vendorDocumentForm.get("vendorOrgCatogery").setValue(this._appService.vendorRegistrationDetails.vendorOrgCatogeryVO ? this._appService.vendorRegistrationDetails.vendorOrgCatogeryVO.catogery : null);
            this.vendorDocumentForm.get("vendorOrgSubCategory").setValue(this._appService.vendorRegistrationDetails.vendorOrgCatogeryVO ? this._appService.vendorRegistrationDetails.vendorOrgCatogeryVO.subCatogery : null);
            this.vendorDocumentForm.get("usTaxId").setValue(this._appService.vendorRegistrationDetails.usTaxId);
            this.vendorDocumentForm.get("usSocialSecurity").setValue(this._appService.vendorRegistrationDetails.usSocialSecurity);
            this.vendorDocumentForm.get("usEinNumber").setValue(this._appService.vendorRegistrationDetails.usEinNumber);
            this.vendorDocumentForm.get("usW8Bene").setValue(this._appService.vendorRegistrationDetails.usW8Bene);
            this.vendorDocumentForm.get("usW9").setValue(this._appService.vendorRegistrationDetails.usW9);
            this.vendorDocumentForm.get("usMinorityCertificate").setValue(this._appService.vendorRegistrationDetails.usMinorityCertificate);

            this.usPayeeIdentificatn = this._appService.usPayeeIdentificatn;

            this.vendorOrgTypesList = this._appService.vendorRegistrationDetails.vendorOrgTypesVO;

            this.filesMap = this._appService.selectedFileMap;

            this.updateLUTValidations(this.vendorDocumentForm.get("lutNum").value);

            this.vendorDocumentForm.get("lutNum").valueChanges.subscribe(val => {
                this.updateLUTValidations(val);
            });
        }
    }

    updateLUTValidations(lutVal: string) {
        if (lutVal && lutVal.trim()) {
            this.vendorDocumentForm.get("lutDate").enable();
            this.vendorDocumentForm.get("lutDate").setValidators([Validators.required]);
        }
        else {
            this.vendorDocumentForm.get("lutDate").setValue(null);
            this.vendorDocumentForm.get("lutDate").disable();
            this.vendorDocumentForm.get("lutDate").setValidators([]);
        }

        this.vendorDocumentForm.get("lutDate").updateValueAndValidity();
    }

    initializeFilesList() {
        if (this._appService.isEmpty(this._appService.selectedFileMap)) {
            if (this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.documentDetailsList &&
                this._appService.vendorRegistrationInitDetails.documentDetailsList.length > 0) {
                this._appService.vendorRegistrationInitDetails.documentDetailsList.forEach(item =>
                    this.filesMap[item.vendorMasterDocumentsId] = { filesList: [], isMandatory: item.isMandatory, isAttached: false, isError: false, toAttach: [], isAttachWithoutValue: false });
            }

            this._appService.selectedFileMap = this.filesMap;

            for (let key in this.filesMap) {
                if (this.filesMap[key].filesList.length) {
                    this.filesMap[key].isAttached = true;
                }

                if (this.vendorDocCtrl[key]) {
                    if (this.vendorDocCtrl[key].controlName != '') {
                        let controlVal = this.vendorDocumentForm.get(this.vendorDocCtrl[key].controlName).value;
                        if (controlVal) {
                            this.filesMap[key].isError = this.filesMap[key].filesList.length ? false : true;
                            this.filesMap[key].isAttachWithoutValue = false;
                        }
                        else {
                            this.filesMap[key].isError = false;
                            this.filesMap[key].isAttachWithoutValue = this.filesMap[key].filesList.length ? true : false;
                        }

                    }
                }
            }

        }
    }

    updateMandatory(selfId: string, documentTypeId: number) {

        if (this.vendorDocumentForm.get(selfId).value) {
            this.filesMap[documentTypeId].isMandatory = true;
            this.filesMap[documentTypeId].isError = this.filesMap[documentTypeId].filesList.length ? false : true;
            this.filesMap[documentTypeId].isAttachWithoutValue = false;
        }

        else {
            this.filesMap[documentTypeId].isMandatory = false;
            this.filesMap[documentTypeId].isAttachWithoutValue = this.filesMap[documentTypeId].filesList.length ? true : false;
            this.filesMap[documentTypeId].isAttached = this.filesMap[documentTypeId].filesList.length > 0 ? true : false;
            this.filesMap[documentTypeId].isError = false;
        }

        // this.updateFileWithoutValue(documentTypeId);
    }


    updateFileWithoutValue(documentTypeId: number) {

        let ctrl = Object.keys(this.vendorDocCtrl).find((k) => {
            return this.vendorDocCtrl[k].documentTypeId === documentTypeId;
        });

        let ctrlName = this.vendorDocCtrl[ctrl].controlName;
        if (ctrlName != '') {
            let controlVal = this.vendorDocumentForm.get(ctrlName).value;
            this.filesMap[documentTypeId].isAttachWithoutValue = (!controlVal && this.filesMap[documentTypeId].filesList.length) ? true : false;
            this.filesMap[documentTypeId].isError = (controlVal && !this.filesMap[documentTypeId].filesList.length) ? true : false;
        }

    }

    showUSField() {
        return this._vendorRegistrationService.vendorUS;
        // return true;
    }
    updatePayeeIdentificatn() {
        if (this.usPayeeIdentificatn == 'taxId') {

            this.vendorDocumentForm.get("usSocialSecurity").setValue(null);
            this.vendorDocumentForm.get("usEinNumber").setValue(null);
            this.vendorDocumentForm.get("usW9").setValue(false);
            this.vendorDocumentForm.get("usW8Bene").setValue(true);

            this.vendorDocumentForm.get("usSocialSecurity").setValidators([]);
            this.vendorDocumentForm.get("usSocialSecurity").updateValueAndValidity();

            this.vendorDocumentForm.get("usEinNumber").setValidators([]);
            this.vendorDocumentForm.get("usEinNumber").updateValueAndValidity();

            this.vendorDocumentForm.get("usW9").setValidators([]);
            this.vendorDocumentForm.get("usW9").updateValueAndValidity();

            this.vendorDocumentForm.get("usTaxId").setValidators([Validators.required]);
            this.vendorDocumentForm.get("usTaxId").updateValueAndValidity();

            // this.vendorDocumentForm.get("usW8Bene").setValidators([Validators.required]);
            // this.vendorDocumentForm.get("usW8Bene").updateValueAndValidity();
            if (this.filesMap[this.vendorDocCtrl.socialSecNoCtrl.documentTypeId].filesList.length) {
                this.failureMsg = 'Remove document from Social security if Social security is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.einCtrl.documentTypeId].filesList.length) {
                this.failureMsg = 'Remove document from EIN if EIN is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.w9Ctrl.documentTypeId].filesList.length) {
                this.failureMsg = 'Remove document from w9 if EIN is not selected as payee identification proof'
            }
        }
        else if (this.usPayeeIdentificatn == 'socialSec') {

            this.vendorDocumentForm.get("usTaxId").setValue(null);
            this.vendorDocumentForm.get("usW8Bene").setValue(false);
            this.vendorDocumentForm.get("usEinNumber").setValue(null);
            this.vendorDocumentForm.get("usW9").setValue(false);

            this.vendorDocumentForm.get("usTaxId").setValidators([]);
            this.vendorDocumentForm.get("usTaxId").updateValueAndValidity();

            this.vendorDocumentForm.get("usW8Bene").setValidators([]);
            this.vendorDocumentForm.get("usW8Bene").updateValueAndValidity();

            this.vendorDocumentForm.get("usEinNumber").setValidators([]);
            this.vendorDocumentForm.get("usEinNumber").updateValueAndValidity();

            this.vendorDocumentForm.get("usW9").setValidators([]);
            this.vendorDocumentForm.get("usW9").updateValueAndValidity();

            this.vendorDocumentForm.get("usSocialSecurity").setValidators([Validators.required]);
            this.vendorDocumentForm.get("usSocialSecurity").updateValueAndValidity();

            if (this.filesMap[this.vendorDocCtrl.taxIdNoCtrl.documentTypeId].filesList.length) {
                this.failureMsg = 'Remove document from Tax ID if Tax ID is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.w8Ctrl.documentTypeId].filesList.length) {
                this.failureMsg = 'Remove document from w8 if Tax ID is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.einCtrl.documentTypeId].filesList.length) {
                this.failureMsg = 'Remove document from EIN if EIN is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.socialSecNoCtrl.documentTypeId].filesList.length) {
                this.failureMsg = 'Remove document from social security if social security is not selected as payee identification proof'
            }
        }
        else if (this.usPayeeIdentificatn == 'ein') {

            this.vendorDocumentForm.get("usTaxId").setValue(null);
            this.vendorDocumentForm.get("usW8Bene").setValue(false);
            this.vendorDocumentForm.get("usSocialSecurity").setValue(null);
            this.vendorDocumentForm.get("usW9").setValue(true);

            this.vendorDocumentForm.get("usTaxId").setValidators([]);
            this.vendorDocumentForm.get("usTaxId").updateValueAndValidity();

            this.vendorDocumentForm.get("usW8Bene").setValidators([]);
            this.vendorDocumentForm.get("usW8Bene").updateValueAndValidity();

            this.vendorDocumentForm.get("usSocialSecurity").setValidators([]);
            this.vendorDocumentForm.get("usSocialSecurity").updateValueAndValidity();

            this.vendorDocumentForm.get("usEinNumber").setValidators([Validators.required]);
            this.vendorDocumentForm.get("usEinNumber").updateValueAndValidity();

            // this.vendorDocumentForm.get("usW9").setValidators([Validators.required]);
            // this.vendorDocumentForm.get("usW9").updateValueAndValidity();

            if (this.filesMap[this.vendorDocCtrl.taxIdNoCtrl.documentTypeId].filesList.length) {
                this.failureMsg = 'Remove document from Tax ID if Tax ID is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.w8Ctrl.documentTypeId].filesList.length) {
                this.failureMsg = 'Remove document from w8 if Tax ID is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.einCtrl.documentTypeId].filesList.length) {
                this.failureMsg = 'Remove document from EIN if EIN is not selected as payee identification proof'
            }
        }
    }
    setOrgType(orgType) {

        this.vendorOrgTypesList = this._appService.vendorRegistrationDetails.vendorOrgTypesVO;
        if (this.vendorOrgTypesList) {
            return this.vendorOrgTypesList.some(selectedOrgType => selectedOrgType.orgType == orgType);
        }
        else return false;
    }

    prepareOrgTypeList(event, orgType, index) {
        this.vendorOrgTypesList = this.vendorOrgTypesList ? this.vendorOrgTypesList : [];
        let vendorOrgTypeId: number = null;
        if (this._appService.vendorRegistrationDetails && this._appService.vendorRegistrationDetails.vendorOrgTypesVO && this._appService.vendorRegistrationDetails.vendorOrgTypesVO[index]) {
            vendorOrgTypeId = this._appService.vendorRegistrationDetails.vendorOrgTypesVO[index].vendorOrgTypeId ? this._appService.vendorRegistrationDetails.vendorOrgTypesVO[index].vendorOrgTypeId : null
        }
        let obj: VendorOrgTypesModel = {
            vendorMasterId: this._appService.vendorRegistrationDetails.vendorMasterId,
            orgType: orgType,
            vendorOrgTypeId: vendorOrgTypeId
        }
        if (event) {
            this.vendorOrgTypesList.push(obj);
        }
        else {
            this.vendorOrgTypesList.splice(index, 1);
        }
        this._appService.vendorRegistrationDetails.vendorOrgTypesVO = this.vendorOrgTypesList;
    }

    onOrgCatChange() {
        this._appService.vendorRegistrationDetails.vendorOrgCatogeryVO = null;
        this.vendorDocumentForm.get('vendorOrgSubCategory').setValue(null);
        let selectedOrgCat = this.vendorDocumentForm.get('vendorOrgCatogery').value
        let i = this.organizationCategoryMasterVO.findIndex(orgCat => orgCat.catogery == selectedOrgCat);
        if (this.organizationCategoryMasterVO[i].subCatogeries.length > 1) {
            this.vendorDocumentForm.get('vendorOrgSubCategory').setValidators([Validators.required]);
            this.vendorDocumentForm.get('vendorOrgSubCategory').updateValueAndValidity;
        }
        else {
            this.vendorDocumentForm.get('vendorOrgSubCategory').setValidators([]);
            this.vendorDocumentForm.get('vendorOrgSubCategory').updateValueAndValidity;
            this.prepareOrgCat();
        }
    }
    prepareOrgCat() {
        let obj: vendorOrgCategoryModel = {
            vendorMasterId: this._appService.vendorRegistrationDetails.vendorMasterId,
            catogery: this.vendorDocumentForm.get('vendorOrgCatogery').value,
            subCatogery: this.vendorDocumentForm.get('vendorOrgSubCategory').value
        }
        this._appService.vendorRegistrationDetails.vendorOrgCatogeryVO = obj;
    }

    ngOnInit() {
        this.isSubmitted = false;

        if (this._appService.vendorRegistrationDetails && this._appService.vendorRegistrationDetails.vendorMasterId == null) {
            this._router.navigate([this._appService.routingConstants.vendorDetails]);
        }

        else {
            this.maxLutDate.setDate(this.maxLutDate.getDate() + 1);

            this.organizationTypeMasterVO = [];
            if (this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.organizationTypeMasterVO &&
                this._appService.vendorRegistrationInitDetails.organizationTypeMasterVO.length > 0) {
                this.organizationTypeMasterVO = this._appService.vendorRegistrationInitDetails.organizationTypeMasterVO;
            }

            this.organizationCategoryMasterVO = [];
            if (this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.organizationCategoryMasterVO &&
                this._appService.vendorRegistrationInitDetails.organizationCategoryMasterVO.length > 0) {
                this.organizationCategoryMasterVO = this._appService.vendorRegistrationInitDetails.organizationCategoryMasterVO;
            }

            // this.organizationTypeMasterVO = [{ orgType: "Service" },
            // { orgType: "R&D Firm" },
            // { orgType: "University" },
            // { orgType: "United States Government Agency" },
            // { orgType: "Consulting" },
            // { orgType: "Utility" },
            // { orgType: "Foreign Gov't Agency" },
            // { orgType: "Manufacturing" },
            // { orgType: "Retailer" },
            // { orgType: "Staffing/Temp Agency" },
            // { orgType: "Construction" },
            // { orgType: "Others" }]

            this.initializeFilesList();

            this.vendorDocumentForm = this._formBuilder.group({

                panNum: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern(/^[a-zA-Z0-9]*([a-zA-Z]+[0-9]+|[0-9]+[a-zA-Z]+)[a-zA-Z0-9]*$/)]],
                gstNum: [null, [Validators.minLength(15), Validators.maxLength(15), Validators.pattern(/^[a-zA-Z0-9]*([a-zA-Z]+[0-9]+|[0-9]+[a-zA-Z]+)[a-zA-Z0-9]*$/)]],
                pfNum: [null],
                esiNum: [null],
                cinNum: [null],
                isSez: [false],
                isRcmApplicable: [false],
                isMsmedRegistered: [false],
                hasTdsLower: [false],
                lutNum: [null],
                lutDate: [{ value: null, disabled: true }],
                otherDocDesc: [null],
                vendorOrgCatogery: [null, [Validators.required]],
                vendorOrgSubCategory: [null],
                vendorOrgTypes: [null],
                usTaxId: [null, [Validators.minLength(9), Validators.maxLength(11)]],
                usSocialSecurity: [null, [Validators.minLength(9), Validators.maxLength(11)]],
                usEinNumber: [null, [Validators.minLength(9), Validators.maxLength(11)]],
                usW8Bene: [false],
                usW9: [false],
                usMinorityCertificate: [null]

            });

            this.updateVendorDetails();

            this.updatePayeeIdentificatn();

            if (this._vendorRegistrationService.vendorUS) {
                this.vendorDocumentForm.get('panNum').setValidators([]);
                this.vendorDocumentForm.get('panNum').updateValueAndValidity;
            }
            else {
                this.vendorDocumentForm.get('vendorOrgCatogery').setValidators([]);
                this.vendorDocumentForm.get('vendorOrgCatogery').updateValueAndValidity;
            }
            this._vendorRegistrationService.updateCurrentPageDetails({ pageName: 'venDoc' });
        }
    }
}
