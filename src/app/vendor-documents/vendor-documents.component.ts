import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AppService } from '../app.service';
import { VendorRegistrationService } from './../vendor-registration/vendor-registration.service';

import {
    BusyDataModel, VendorRegistrationRequestModel,
    VendorRegistrationResultModel, VendorDocumentReqModel,
    VendorMasterDocumentModel, FileDetailsModel, VendorDocumentResultModel, StatusModel
} from './../models/data-models';
import { DatePipe } from '@angular/common';
import { HomeService } from '../home/home.service';
import { globalConstant } from '../common/global-constant';
import { MatSnackBar } from '@angular/material';
import { Subscription, BehaviorSubject } from 'rxjs';
import { scan, takeWhile, takeLast } from 'rxjs/operators';

interface FileMap {
    [key: number]: {
        filesList: FileDetailsModel[],
        isMandatory: boolean,
        isAttached: boolean,
        isError: boolean
    }
}

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
    subscription: Subscription;
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

    constructor(private _appService: AppService,
        private _vendorRegistrationService: VendorRegistrationService,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _datePipe: DatePipe,
        private _snackBar: MatSnackBar) { }

    onFileChange(event: any, documentTypeId: number) {
        if (!documentTypeId) return;
        this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
        this.filesMap[documentTypeId] = { filesList: [], isMandatory: true, isAttached: false, isError: false };
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
                    this.filesMap[documentTypeId].filesList.push(fileDetails);

                    let reader = new FileReader();
                    reader.onload = this._handleFileReaderLoaded.bind(this, file.name, this.filesMap[documentTypeId].filesList, documentTypeId);
                    reader.readAsBinaryString(file);
                }
            }

        }
        else {
            this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: "Attaching..." });
        }
    }
    private _handleFileReaderLoaded(actualFileName, filesList: FileDetailsModel[], documentTypeId: number, readerEvt) {
        let binaryString = readerEvt.target.result;
        let base64textString = btoa(binaryString);

        for (let fileItem of filesList) {
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
            // userId: '106994',
            fileDetails: this.filesMap[documentTypeId].filesList,
            // vendorMasterId: 166
            userId: globalConstant.userDetails.isVendor ? globalConstant.userDetails.userEmail : globalConstant.userDetails.userId,
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
                        this.filesMap[documentTypeId].filesList = results.fileDetails.concat();
                        this.filesMap[documentTypeId].isAttached = true;
                    }

                }
            },
                (error) => {
                    this.filesMap[documentTypeId].isAttached = false;
                    this._vendorRegistrationService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    this._snackBar.open("Files Attachment Failed");
                    console.log(error);
                });
    }
    onPrevClick() {
        this._router.navigate([this._appService.routingConstants.vendorBankDetails]);
    }

    onSubmitClick() {
        this.failureMsg = "";
        console.log(this.vendorDocumentForm);
        this.isValid = true;
        for (let key in this.filesMap) {
            this.filesMap[key].isError = false;
            if (this.filesMap[key].isMandatory && !this.filesMap[key].isAttached) {
                this.isValid = false;
                this.filesMap[key].isError = true;
            }
        }
        if (!this.isValid) { return };

        if (this.vendorDocumentForm.valid) {
            // this._appService.vendorRegistrationDetails.isGSTReg = this.vendorDocumentForm.get("isGSTReg").value;
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
                            this._snackBar.open(this._appService.messages.vendorRegistrationSubmitSuccessMsg);
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
        this._appService.downloadInvoiceFile(fileDetails);
    }

    updateVendorDetails() {
        // this.vendorDocumentForm.get("isGSTReg").setValue(this._appService.vendorRegistrationDetails.isGSTReg);
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
        this.vendorDocumentForm.get("lutDate").setValue(new Date(this._appService.vendorRegistrationDetails.lutDate));
        this.vendorDocumentForm.get("otherDocDesc").setValue(this._appService.vendorRegistrationDetails.otherDocDesc);

    }
    initializeFilesList() {
        if (this._appService.vendorRegistrationInitDetails && this._appService.vendorRegistrationInitDetails.documentDetailsList &&
            this._appService.vendorRegistrationInitDetails.documentDetailsList.length > 0) {
            this._appService.vendorRegistrationInitDetails.documentDetailsList.forEach(item =>
                this.filesMap[item.vendorMasterDocumentsId] = { filesList: [], isMandatory: item.isMandatory, isAttached: false, isError: false });
        }
    }
    updateMandatory(selfId: string, documentTypeId: number) {
        if (!this.vendorDocumentForm.get(selfId).value) {
            this.vendorDocumentForm.get(selfId).setValidators([]);
            this.vendorDocumentForm.get(selfId).updateValueAndValidity();
            this.filesMap[documentTypeId] = { filesList: [], isMandatory: false, isAttached: false, isError: false }
            return;
        }
        this.vendorDocumentForm.get(selfId).enable();
        this.vendorDocumentForm.get(selfId).setValidators([Validators.required]);
        this.vendorDocumentForm.get(selfId).updateValueAndValidity();
        this.filesMap[documentTypeId].isMandatory = true;
        this.filesMap[documentTypeId].isError = true;
    }
    ngOnInit() {
        this.initializeFilesList();

        this.vendorDocumentForm = this._formBuilder.group({

            panNum: [null, [Validators.required]],
            gstNum: [null],
            // isGSTReg: [null, [Validators.required]],
            pfNum: [null],
            esiNum: [null],
            cinNum: [null],
            isSez: [null],
            isRcmApplicable: [null],
            isMsmedRegistered: [null],
            hasTdsLower: [null],
            lutNum: [null, [Validators.required]],
            lutDate: [null],
            otherDocDesc: [null]

        });
        this._vendorRegistrationService.updateCurrentPageDetails({ pageName: 'venDoc' });
        this.updateVendorDetails();
    }

}
