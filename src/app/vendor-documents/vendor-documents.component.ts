import { SidebarService } from './../sidebar/sidebar.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AppService } from '../app.service';
import { VendorRegistrationService } from './../vendor-registration/vendor-registration.service';

import {
    BusyDataModel, VendorRegistrationRequestModel,
    VendorRegistrationResultModel, VendorDocumentReqModel,
    VendorMasterDocumentModel, FileDetailsModel, VendorDocumentResultModel, StatusModel, FileMap
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
    attachWithoutValue: boolean = false;
    private counterSubject: BehaviorSubject<number>;
    private counterSubscription: Subscription;


    vendorDocCtrl = {
        incCerCtrl: { documentTypeId: 1, browserId: 'incCerFileCtrl', placeholder: 'Incorporation Certificate' },
        gstCtrl: { documentTypeId: 2, browserId: 'gstFileCtrl', placeholder: 'GST No.' },
        panCtrl: { documentTypeId: 3, browserId: 'panFileCtrl', placeholder: 'PAN No.' },
        pfCtrl: { documentTypeId: 4, browserId: 'pfFileCtrl', placeholder: 'PF No.' },
        esiCtrl: { documentTypeId: 5, browserId: 'esiFileCtrl', placeholder: 'ESI No.' },
        canChqCtrl: { documentTypeId: 6, browserId: 'canChqFileCtrl', placeholder: 'Cancelled Cheque' },
        msmeCtrl: { documentTypeId: 7, browserId: 'msmeFileCtrl', placeholder: 'Is MSME Certificate applicable?' },
        tdsCtrl: { documentTypeId: 8, browserId: 'tdsFileCtrl', placeholder: 'Has TDS lower deduction certificate?' },
        sezCtrl: { documentTypeId: 9, browserId: 'sezFileCtrl', placeholder: 'SEZ / Non-SEZ' },
        lutNoCtrl: { documentTypeId: 10, browserId: 'lutNoFileCtrl', placeholder: 'LUT No.' },
        msmeSelfCtrl: { documentTypeId: 11, browserId: 'msmeSelfFileCtrl', placeholder: 'MSME Self Attested Certificate?' },
        otherCtrl: { documentTypeId: 13, browserId: 'otherFileCtrl', placeholder: 'Document Description' }
    }

    isSubmitted: boolean = false;

    constructor(private _appService: AppService,
        private _vendorRegistrationService: VendorRegistrationService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _datePipe: DatePipe,
        private _snackBar: MatSnackBar,
        private _sidebarService: SidebarService,
        private _dialog: MatDialog) { }

    onFileChange(event: any, documentTypeId: number) {
        if (!documentTypeId) return;
        this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
        if (!this.filesMap[documentTypeId]) {
            this.filesMap[documentTypeId] = { filesList: [], toAttach: [], isMandatory: true, isAttached: false, isError: false };
        }
        else {
            this.filesMap[documentTypeId].toAttach = [];
            this.filesMap[documentTypeId].isMandatory = true;
            this.filesMap[documentTypeId].isAttached = false;
            this.filesMap[documentTypeId].isError = false;
        }
        if (event.target.files && event.target.files.length > 0) {
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

    omit_special_char(event) {
        var k;
        k = event.charCode;
        return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
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
                        this.attachWithoutValue = false;
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
            this.filesMap[key].isError = false;
            if (this.filesMap[key].isMandatory && !this.filesMap[key].isAttached) {
                this.isValid = false;
                this.filesMap[key].isError = true;
            }
        }
        if (!this.isValid) { return };

        if (this.attachWithoutValue) { return };

        if (this.vendorDocumentForm.valid) {

            this.updateDataForBackup();

            let req: VendorRegistrationRequestModel = {
                action: this._appService.updateOperations.submit,
                vendorMasterDetails: this._appService.vendorRegistrationDetails
            }

            // console.log(req);

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
        }

    }

    downloadFile(fileDetails: FileDetailsModel) {
        this._vendorRegistrationService.downloadFile(fileDetails);
    }

    updateVendorDetails() {
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

        this.filesMap = this._appService.selectedFileMap;

        this.updateLUTValidations(this.vendorDocumentForm.get("lutNum").value);

        this.vendorDocumentForm.get("lutNum").valueChanges.subscribe(val => {
            this.updateLUTValidations(val);
        });
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
                    this.filesMap[item.vendorMasterDocumentsId] = { filesList: [], isMandatory: item.isMandatory, isAttached: false, isError: false, toAttach: [] });
            }

            this._appService.selectedFileMap = this.filesMap;

            for (let key in this.filesMap) {
                if (this.filesMap[key].filesList.length) {
                    this.filesMap[key].isAttached = true;
                }
            }
        }
    }

    updateMandatory(selfId: string, documentTypeId: number) {
        if (!this.vendorDocumentForm.get(selfId).value) {
            if (this.filesMap[documentTypeId].filesList.length < 0) {
                this.vendorDocumentForm.get(selfId).setValidators([]);
                this.vendorDocumentForm.get(selfId).updateValueAndValidity();
                this.filesMap[documentTypeId] = { filesList: [], isMandatory: false, isAttached: false, isError: false, toAttach: [] }
                this.attachWithoutValue = false;
                return;
            }
            else {
                this.filesMap[documentTypeId].isError = true;
                this.attachWithoutValue = true;
            }
        }
        this.vendorDocumentForm.get(selfId).enable();
        this.vendorDocumentForm.get(selfId).setValidators([Validators.required]);
        if (selfId == 'gstNum') {
            this.vendorDocumentForm.get(selfId).setValidators([Validators.minLength(15)]);
        }
        this.vendorDocumentForm.get(selfId).updateValueAndValidity();
        this.filesMap[documentTypeId].isMandatory = true;
        this.filesMap[documentTypeId].isError = true;
    }

    get vdf() { return this.vendorDocumentForm.controls; }

    ngOnInit() {
        this.isSubmitted = false;

        this.initializeFilesList();

        this.vendorDocumentForm = this._formBuilder.group({

            panNum: [null, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
            gstNum: [null, [Validators.minLength(15), Validators.maxLength(15)]],
            pfNum: [null],
            esiNum: [null],
            cinNum: [null],
            isSez: [false],
            isRcmApplicable: [false],
            isMsmedRegistered: [false],
            hasTdsLower: [false],
            lutNum: [null],
            lutDate: [{ value: null, disabled: true }],
            otherDocDesc: [null]

        });
        this._vendorRegistrationService.updateCurrentPageDetails({ pageName: 'venDoc' });
        this.updateVendorDetails();
    }

}
