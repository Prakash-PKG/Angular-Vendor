import { trigger } from '@angular/animations';
import { globalConstant } from './../common/global-constant';
import { VendorApprovalService } from './vendor-approval.service';
import { AppService } from './../app.service';
import {
    BusyDataModel, VendorApprovalInitResultModel, StatusModel,
    VendorApprovalInitReqModel, VendorMasterDetailsModel,
    VendorApprovalReqModel,
    AccGroupMasterList,
    CompanyCodeMasterList,
    currencyMasterList,
    WithholdTypeList,
    WithholdTaxList,
    VendorRegistrationDetailRequestModel, VendorDocumentResultModel, FileDetailsModel, 
    VendorMasterDocumentModel, VendorDocumentReqModel, CountryDataModel, regionMasterVOList
} from './../models/data-models';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { VendorRegistrationService } from '../vendor-registration/vendor-registration.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { MatSnackBar, MatDialog } from '@angular/material';
import { scan, takeWhile, takeLast } from 'rxjs/operators';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { MessageDialogModel } from '../models/popup-models';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

interface FileMap {
    [key: number]: {
        filesList?: FileDetailsModel[],
        toAttach?: FileDetailsModel[],
        isMandatory?: boolean,
        isAttached?: boolean,
        isError?: boolean
    }
}
@Component({
    selector: 'app-vendor-approval',
    templateUrl: './vendor-approval.component.html',
    styleUrls: ['./vendor-approval.component.scss']
})
export class VendorApprovalComponent implements OnInit {

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    vendorApprovalInitDetails: VendorApprovalInitResultModel = null;
    vendorDetails: VendorMasterDetailsModel = new VendorMasterDetailsModel();
    originalVendorDetails: VendorMasterDetailsModel = new VendorMasterDetailsModel();

    vendoraccGroupList: AccGroupMasterList[] = [];
    companyCodeList: CompanyCodeMasterList[] = [];
    currencyList: currencyMasterList[] = [];
    withholdTaxList: WithholdTaxList[] = [];
    withholdTypeList: WithholdTypeList[] = [];

    withholdTax: string = "";
    withholdType: string = "";
    remarks: string = "";
    selectedVendorGroup: string = null;
    selectedCompanyCode: string = null;
    selectedCurrency: string = null;

    isFinance: boolean = false;
    isProcurement: boolean = false;

    msg: string = "";

    isEditable = false;
    isValid = true;
    isServerError = false;
    disableSubmit: boolean = false;
    canApprove: boolean = false;

    documentsList: VendorMasterDocumentModel[] = [];
    vendorDocList: FileDetailsModel[] = [];
    filesMap: FileMap = {};
    private counterSubject: BehaviorSubject<number>;
    private counterSubscription: Subscription;

    vendorForm: FormGroup;
    isSubmitted: boolean = false;

    countriesList: CountryDataModel[] = [];
    regionMasterVOList: regionMasterVOList[] = [];

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
        otherCtrl: { documentTypeId: 13, browserId: 'otherFileCtrl', placeholder: 'Document Description' },
        msaCtrl: { documentTypeId: 12, browserId: 'msaFileCtrl', placeholder: 'Attach MSA' }
    }

    documentControlDetails = {
        2: { controlName: "gstNum", controlType: "text" },
        3: { controlName: "panNum", controlType: "text" },
        4: { controlName: "pfNum", controlType: "text" },
        5: { controlName: "esiNum", controlType: "text" },
        7: { controlName: "isMsmedRegistered", controlType: "radio" },
        8: { controlName: "hasTdsLower", controlType: "radio" },
        9: { controlName: "isSez", controlType: "radio" },
        10: { controlName: "lutNum", controlType: "text" },
        13: { controlName: "otherDocDesc", controlType: "text" },
    }

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _vendorApprovalService: VendorApprovalService,
        private _snackBar: MatSnackBar,
        private _dialog: MatDialog,
        private _datePipe: DatePipe,
        private _formBuilder: FormBuilder,
        private _router: Router) { }

    onEditClick() {
        this.isEditable = true;

        this.vendorForm.get("vendorName").enable();
        this.vendorForm.get("contactPerson").enable();
        this.vendorForm.get("mobileNum").enable();
        this.vendorForm.get("telephoneNum").enable();
        this.vendorForm.get("emailId").enable();

        this.vendorForm.get("address1").enable();
        this.vendorForm.get("address2").enable();
        this.vendorForm.get("city").enable();
        this.vendorForm.get("street").enable();
        this.vendorForm.get("pincode").enable();
        this.vendorForm.get("countryCode").enable();
        this.vendorForm.get("stateCode").enable();

        this.vendorForm.get("panNum").enable();
        this.vendorForm.get("gstNum").enable();
        this.vendorForm.get("pfNum").enable();
        this.vendorForm.get("esiNum").enable();
        this.vendorForm.get("cinNum").enable();

        this.vendorForm.get("lutNum").enable();
        let lutVal = this.vendorForm.get("lutNum").value;
        if(lutVal) {
            this.vendorForm.get("lutDate").enable();
        }
        else {
            this.vendorForm.get("lutDate").disable();
        }
        
        this.vendorForm.get("otherDocDesc").enable();
    }


    //for vendor bank detail correction ----- to be done in phase 2
    onSendForCorrClick() {
        let req: VendorRegistrationDetailRequestModel = {
            vendorMasterId: this.vendorApprovalInitDetails.vendorMasterDetails.vendorMasterId
        }
        this._vendorApprovalService.sendBackForCorrection(req)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                if (response.body) {
                    console.log(response.body);
                    let result: StatusModel = response.body as StatusModel;
                    if (result.status == 200 && result.isSuccess) {
                        this.msg = "Vendor sent back for correction successfully";
                    }
                    else {
                        this.msg = this._appService.messages.vendorSendBackFailure;
                    }
                }
            },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    this.msg = this._appService.messages.vendorSendBackFailure;
                    console.log(error);
                });
    }

    //for document attachments

    updateFileDetails() {
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.vendorMasterDocumentVOList &&
            this.vendorApprovalInitDetails.vendorMasterDocumentVOList.length > 0) {
            this.vendorApprovalInitDetails.vendorMasterDocumentVOList.forEach(item =>
                this.filesMap[item.vendorMasterDocumentsId] = { filesList: [], isMandatory: item.isMandatory, isAttached: false, isError: false });
        }

        this.updateAttachments();
        this.updateFilesValidity();
    }
    
    updateAttachments() {
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.fileDetails &&
            this.vendorApprovalInitDetails.fileDetails.length > 0) {
            this.vendorApprovalInitDetails.fileDetails.forEach(item => {
                this.filesMap[item.documentTypeId].filesList.push(item);
                this.filesMap[item.documentTypeId].isAttached = true;
            });
        }
    }

    updateFilesValidity() {
        for (let key in this.filesMap) {
            this.filesMap[key].isError = false;
            if (this.filesMap[key].isMandatory) {
                if(!this.filesMap[key].isAttached) {
                    this.filesMap[key].isError = true;
                }
            }
            else {
                if(this.documentControlDetails[key]) {
                    let controlVal = this.vendorForm.get(this.documentControlDetails[key].controlName).value;
                    if(controlVal && this.filesMap[key].filesList.length == 0) {
                        this.filesMap[key].isError = true;
                    }
                }
            }
        }
    }

    onFileChange(event: any, documentTypeId: number) {
        if (!documentTypeId) return;
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
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
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: "Attaching..." });
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
            userId: globalConstant.userDetails.isVendor ? globalConstant.userDetails.userEmail : globalConstant.userDetails.userId,
            vendorMasterId: this.vendorDetails.vendorMasterId
        }
        this._vendorApprovalService.uploadVendorDocuments(filesReq)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                if (response.body) {
                    let results: VendorDocumentResultModel = response.body as VendorDocumentResultModel;
                    if (results.status.status == 200 && results.status.isSuccess) {
                        this._snackBar.open("Files Attached Successfully");
                        results.fileDetails.forEach(f => this.filesMap[documentTypeId].filesList.push(f));
                        this.filesMap[documentTypeId].isAttached = true;
                        this.filesMap[documentTypeId].toAttach = [];
                    }

                }
            },
                (error) => {
                    this.filesMap[documentTypeId].isAttached = false;
                    this.filesMap[documentTypeId].toAttach = [];
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    this._snackBar.open("Files Attachment Failed");
                    console.log(error);
                });
    }

    onDeleteFileClick(fileDetails: FileDetailsModel, fileIndex: number, documentTypeId: number) {
        if (fileDetails && fileDetails.fileId) {
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Deleting..." });
            this._vendorApprovalService.deleteVendorFile(fileDetails)
                .subscribe(response => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    let result = response.body as StatusModel;
                    if (result.isSuccess) {
                        this.removefileFromList(fileIndex, documentTypeId);
                        this._snackBar.open("File deleted Successfully");
                    }
                },
                    (error) => {
                        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
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
            
            this.filesMap[documentTypeId].isError = false;
            if (this.filesMap[documentTypeId].isMandatory) {
                if(!this.filesMap[documentTypeId].isAttached) {
                    this.filesMap[documentTypeId].isError = true;
                }
            }
            else {
                if(this.documentControlDetails[documentTypeId]) {
                    let controlVal = this.vendorForm.get(this.documentControlDetails[documentTypeId].controlName).value;
                    if(controlVal && this.filesMap[documentTypeId].filesList.length == 0) {
                        this.filesMap[documentTypeId].isError = true;
                    }
                }
            }
        }
    }

    downloadFile(fileDetails: FileDetailsModel) {
        this._vendorApprovalService.downloadFile(fileDetails);
    }

    onApproveClick() {
        this.isSubmitted = true;
        this.updateVendorApprovals(this._appService.updateOperations.approve);
    }

    onRejectClick() {
        this.updateVendorApprovals(this._appService.updateOperations.reject);
    }

    onBackClick() {
        this.vendorDetails = this.originalVendorDetails;
        this._router.navigate([this._appService.routingConstants.vendorDashboard]);
    }

    updateMandatoryDocs(selfValue: any, documentTypeId: number) {
        if (selfValue) {
            this.filesMap[documentTypeId].isError = this.filesMap[documentTypeId].filesList.length > 0 ? false : true;
        }
        else {
            this.filesMap[documentTypeId].isAttached = this.filesMap[documentTypeId].filesList.length > 0 ? true : false;
            this.filesMap[documentTypeId].isError = false;
        }
    }

    onRadioBtnSelectionChange(evtData, documentTypeId) {
        this.updateMandatoryDocs(evtData.value, documentTypeId);
    }

    onTextFieldValueChange(cntrlName, documentTypeId) {
        this.updateMandatoryDocs(this.vendorForm.get(cntrlName).value, documentTypeId);
    }

    // functions for document attachment ends here
    isFilesValid() {
        this.isValid = true;
        for (let key in this.filesMap) {
            if(this.filesMap[key].isError) {
                this.isValid = false;
                break;
            }
        }
    }

    isMandatoryFieldsEmpty() {
        if(!this.vendorForm.valid) {
            this.msg = "Your form contains error.Please check.";
            this.isValid = false;
        }
    }

    updateVendorApprovals(action: string) {
        
        this.isFilesValid();
        if (!this.isValid) return;

        this.isMandatoryFieldsEmpty();
        if (!this.isValid) return;

        if (this.isFinance) {
            let withholdTaxVal = this.vendorForm.get("withholdTax").value;
            let withholdTypeVal = this.vendorForm.get("withholdType").value;
            if (!withholdTaxVal || !withholdTaxVal) {
                const dialogRef = this._dialog.open(ConfirmDialogComponent, {
                    disableClose: true,
                    panelClass: 'dialog-box',
                    width: '550px',
                    data: <MessageDialogModel>{
                        title: "Warning",
                        message: "You are trying to submit without with Hold Tax and Type. Do you wish to Continue?"
                    }
                });

                dialogRef.afterClosed().subscribe(result => {
                    if(result) {
                        this.updateVendorApprovalDetails(action);
                    }
                });
            }
            else {
                this.updateVendorApprovalDetails(action);
            }
        }
        else {
            this.updateVendorApprovalDetails(action);
        }
    }

    updateVendorApprovalDetails(action: string) {
        let req: VendorApprovalReqModel = {
            action: action,
            vendorApprovalID: this.vendorApprovalInitDetails.vendorApprovalDetails.vendorApprovalID,
            vendorMasterId: this.vendorApprovalInitDetails.vendorApprovalDetails.vendorMasterId,
            departmentCode: this.vendorApprovalInitDetails.vendorApprovalDetails.departmentCode ?
                this.vendorApprovalInitDetails.vendorApprovalDetails.departmentCode : globalConstant.userDetails.userRoles[0].roleCode,
            approverId: globalConstant.userDetails.userId,
            remarks: this.vendorForm.get("remarks").value ? this.vendorForm.get("remarks").value : null,
            groupCode: this.vendorForm.get("selectedVendorGroup").value ? this.vendorForm.get("selectedVendorGroup").value : null,
            companyCode: this.vendorForm.get("selectedCompanyCode").value ? this.vendorForm.get("selectedCompanyCode").value : null,
            currencyCode: this.vendorForm.get("selectedCurrency").value ? this.vendorForm.get("selectedCurrency").value : null,
            withholdTaxCode: this.vendorForm.get("withholdTax").value ? this.vendorForm.get("withholdTax").value : null,
            withholdTypeCode: this.vendorForm.get("withholdType").value ? this.vendorForm.get("withholdType").value : null,
            createdBy: this.vendorApprovalInitDetails.vendorApprovalDetails.createdBy ? this.vendorApprovalInitDetails.vendorApprovalDetails.createdBy : globalConstant.userId,
            createDate: this.vendorApprovalInitDetails.vendorApprovalDetails.createDate ? this.vendorApprovalInitDetails.vendorApprovalDetails.createDate : null,
            vendorMasterDetails: this.getUpdatedVendorDetails()
        };

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
        this._vendorApprovalService.updateVendorApprovalDetails(req)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                if (response.body) {
                    let result: StatusModel = response.body as StatusModel;
                    if (result.status == 200 && result.isSuccess) {
                        this.disableSubmit = true;
                        this.displayVendorApprovalStatus(result.message);
                    }
                    else {
                        this.isEditable = false;
                        this.isServerError = true;
                        this.disableSubmit = false;
                        this.msg = result.message;
                    }
                }
            },
                (error) => {
                    this.isEditable = false;
                    this.disableSubmit = false;
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    this.msg = this._appService.messages.vendorApprovalFailure;
                    console.log(error);
                });
    }

    displayVendorApprovalStatus(msg: string) {
        const dialogRef = this._dialog.open(MessageDialogComponent, {
            disableClose: true,
            panelClass: 'dialog-box',
            width: '550px',
            data: <MessageDialogModel>{
                title: "Vendor Approval Status",
                message: msg
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this._router.navigate([this._appService.routingConstants.pendingApprovals]);
        });
    }


    async loadInitData() {
        if (this._appService.selectedPendingApprovalRecord) {
            let req: VendorApprovalInitReqModel = {
                vendorMasterId: this._appService.selectedPendingApprovalRecord.vendorMasterId,
                departmentCode: this._appService.selectedPendingApprovalRecord.approvalLevel,
                approvalId: this._appService.selectedPendingApprovalRecord.approvalId
            };

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
            this.vendorApprovalInitDetails = await this._vendorApprovalService.getVendorApprovalInitData(req);
            this.vendorDetails = this.vendorApprovalInitDetails.vendorMasterDetails;
            // this.vendorDetails = this.originalVendorDetails;
            
            this.loadDropDown();
            this.updateVendorFields();
            this.updateFileDetails();
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
        }
    }

    updateStates() {
        this.vendorForm.get("stateCode").setValue(null);
        this.regionMasterVOList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.regionMasterVOList &&
            this.vendorApprovalInitDetails.regionMasterVOList.length > 0 && this.vendorApprovalInitDetails.vendorMasterDetails) {

            let cntryCode = this.vendorForm.get("countryCode").value ? this.vendorForm.get("countryCode").value : null;
            if(cntryCode) {
                this.regionMasterVOList = this.vendorApprovalInitDetails.regionMasterVOList.filter(r => r.countryCode == cntryCode);
            }
        }

        this.updatePincodeValidation();
    }

    updatePincodeValidation() {
        let countryCodeVal = this.vendorForm.get("countryCode").value;
        if(countryCodeVal == "US") {
            this.vendorForm.get("pincode").setValidators([Validators.required, Validators.minLength(5), Validators.maxLength(5)]);
        }
        else {
            this.vendorForm.get("pincode").setValidators([Validators.required, Validators.minLength(6),  Validators.maxLength(6)]);
        }

        this.vendorForm.get("pincode").updateValueAndValidity();
    }

    updateVendorFields() {
        this.vendorForm.get("vendorName").setValue(this.vendorDetails.vendorName);
        this.vendorForm.get("contactPerson").setValue(this.vendorDetails.contactPerson);
        this.vendorForm.get("mobileNum").setValue(this.vendorDetails.mobileNum);
        this.vendorForm.get("telephoneNum").setValue(this.vendorDetails.telephoneNum);
        this.vendorForm.get("emailId").setValue(this.vendorDetails.emailId);

        this.vendorForm.get("address1").setValue(this.vendorDetails.address1);
        this.vendorForm.get("address2").setValue(this.vendorDetails.address2);
        this.vendorForm.get("city").setValue(this.vendorDetails.city);
        this.vendorForm.get("street").setValue(this.vendorDetails.street);
        this.vendorForm.get("pincode").setValue(this.vendorDetails.pincode);
        this.vendorForm.get("countryCode").setValue(this.vendorDetails.countryCode);
        this.vendorForm.get("stateCode").setValue(this.vendorDetails.stateCode);

        this.vendorForm.get("panNum").setValue(this.vendorDetails.panNum);
        this.vendorForm.get("gstNum").setValue(this.vendorDetails.gstNum);
        this.vendorForm.get("pfNum").setValue(this.vendorDetails.pfNum);
        this.vendorForm.get("esiNum").setValue(this.vendorDetails.esiNum);
        this.vendorForm.get("cinNum").setValue(this.vendorDetails.cinNum);
        this.vendorForm.get("isSez").setValue(this.vendorDetails.isSez);
        this.vendorForm.get("isRcmApplicable").setValue(this.vendorDetails.isRcmApplicable);
        this.vendorForm.get("isMsmedRegistered").setValue(this.vendorDetails.isMsmedRegistered);
        this.vendorForm.get("hasTdsLower").setValue(this.vendorDetails.hasTdsLower);
        this.vendorForm.get("lutNum").setValue(this.vendorDetails.lutNum);
        this.vendorForm.get("lutDate").setValue(this.vendorDetails.lutDate ? new Date(this.vendorDetails.lutDate) : null);
        this.vendorForm.get("otherDocDesc").setValue(this.vendorDetails.otherDocDesc);

        this.vendorForm.get("selectedVendorGroup").setValue(this.vendorDetails.groupCode ? this.vendorDetails.groupCode : null);
        this.vendorForm.get("selectedCompanyCode").setValue(this.vendorDetails.companyCode ? this.vendorDetails.companyCode : null);
        this.vendorForm.get("selectedCurrency").setValue(this.vendorDetails.currencyCode ? this.vendorDetails.currencyCode : null);


        if (globalConstant.userDetails.isFinance) {
            this.vendorForm.get("selectedVendorGroup").setValidators([Validators.required]);
            this.vendorForm.get("selectedVendorGroup").updateValueAndValidity();

            this.vendorForm.get("selectedCompanyCode").setValidators([Validators.required]);
            this.vendorForm.get("selectedCompanyCode").updateValueAndValidity();

            this.vendorForm.get("selectedCurrency").setValidators([Validators.required]);
            this.vendorForm.get("selectedCurrency").updateValueAndValidity();

            this.vendorForm.get("remarks").setValidators([Validators.required]);
            this.vendorForm.get("remarks").updateValueAndValidity();
        } 

        this.updatePincodeValidation();

        this.updateLUTValidations(this.vendorForm.get("lutNum").value);

        this.vendorForm.get("lutNum").valueChanges.subscribe(val => {
            this.updateLUTValidations(val);
        });
    }

    updateLUTValidations(lutVal: string) {
        if(lutVal && lutVal.trim()) {
            this.vendorForm.get("lutDate").enable();
            this.vendorForm.get("lutDate").setValidators([Validators.required]);
        }
        else {
            this.vendorForm.get("lutDate").setValue(null);
            this.vendorForm.get("lutDate").disable();
            this.vendorForm.get("lutDate").setValidators([]);
        }

        this.vendorForm.get("lutDate").updateValueAndValidity();
    }

    loadDropDown() {
        this.vendoraccGroupList = [];

        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.accGroupMasterList &&
            this.vendorApprovalInitDetails.accGroupMasterList.length > 0) {
            this.vendoraccGroupList = this.vendorApprovalInitDetails.accGroupMasterList.concat();
        }
        this.companyCodeList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.companyCodeMasterList &&
            this.vendorApprovalInitDetails.companyCodeMasterList.length > 0) {
            this.companyCodeList = this.vendorApprovalInitDetails.companyCodeMasterList.concat();
        }
        this.currencyList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.currencyMasterList &&
            this.vendorApprovalInitDetails.currencyMasterList.length > 0) {
            this.currencyList = this.vendorApprovalInitDetails.currencyMasterList.concat();
        }

        this.withholdTypeList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.withholdTypeVOList &&
            this.vendorApprovalInitDetails.withholdTypeVOList.length > 0) {
            this.withholdTypeList = this.vendorApprovalInitDetails.withholdTypeVOList.concat();
        }

        this.countriesList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.countriesList &&
            this.vendorApprovalInitDetails.countriesList.length > 0) {
            this.countriesList = this.vendorApprovalInitDetails.countriesList.concat();
        }

        this.regionMasterVOList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.regionMasterVOList &&
            this.vendorApprovalInitDetails.regionMasterVOList.length > 0 && this.vendorApprovalInitDetails.vendorMasterDetails) {

            let cntryCode = this.vendorApprovalInitDetails.vendorMasterDetails.countryCode ? this.vendorApprovalInitDetails.vendorMasterDetails.countryCode : null;
            if(cntryCode) {
                this.regionMasterVOList = this.vendorApprovalInitDetails.regionMasterVOList.filter(r => r.countryCode == cntryCode);
            }
        }


        // this.selectedCompanyCode = this.vendorApprovalInitDetails.vendorMasterDetails &&
        //     this.vendorApprovalInitDetails.vendorMasterDetails.companyCode ?
        //     this.vendorApprovalInitDetails.vendorMasterDetails.companyCode : undefined;

        // this.selectedCurrency = this.vendorApprovalInitDetails.vendorMasterDetails &&
        //     this.vendorApprovalInitDetails.vendorMasterDetails.currencyCode ?
        //     this.vendorApprovalInitDetails.vendorMasterDetails.currencyCode : undefined;

        // this.selectedVendorGroup = this.vendorApprovalInitDetails.vendorMasterDetails &&
        //     this.vendorApprovalInitDetails.vendorMasterDetails.groupCode ?
        //     this.vendorApprovalInitDetails.vendorMasterDetails.groupCode : undefined;
    }

    onHoldTypeSelected(holdType) {
        this.withholdTaxList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.withholdTaxVOList &&
            this.vendorApprovalInitDetails.withholdTaxVOList.length > 0) {
            this.withholdTaxList = this.vendorApprovalInitDetails.withholdTaxVOList.filter(e => e.withholdTypeCode == holdType.value);
        }
        console.log(this.withholdTaxList);
    }

    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
    }

    get f() { return this.vendorForm.controls; }

    getUpdatedVendorDetails() {

        if(this.isEditable) {
            this.vendorDetails.vendorName = this.vendorForm.get("vendorName").value ? this.vendorForm.get("vendorName").value.trim() : null;
            this.vendorDetails.contactPerson = this.vendorForm.get("contactPerson").value ? this.vendorForm.get("contactPerson").value.trim() : null;
            this.vendorDetails.mobileNum = this.vendorForm.get("mobileNum").value;
            this.vendorDetails.telephoneNum = this.vendorForm.get("telephoneNum").value;
            this.vendorDetails.emailId = this.vendorForm.get("emailId").value;

            this.vendorDetails.address1 = this.vendorForm.get("address1").value ? this.vendorForm.get("address1").value.trim() : null;
            this.vendorDetails.address2 = this.vendorForm.get("address2").value ? this.vendorForm.get("address2").value.trim() : null;
            this.vendorDetails.city = this.vendorForm.get("city").value ? this.vendorForm.get("city").value.trim() : null;
            this.vendorDetails.street = this.vendorForm.get("street").value ? this.vendorForm.get("street").value.trim() : null;
            this.vendorDetails.pincode = this.vendorForm.get("pincode").value;
            this.vendorDetails.countryCode = this.vendorForm.get("countryCode").value;
            this.vendorDetails.stateCode = this.vendorForm.get("stateCode").value;

            this.vendorDetails.panNum = this.vendorForm.get("panNum").value;
            this.vendorDetails.gstNum = this.vendorForm.get("gstNum").value;
            this.vendorDetails.pfNum = this.vendorForm.get("pfNum").value;
            this.vendorDetails.esiNum = this.vendorForm.get("esiNum").value;
            this.vendorDetails.cinNum = this.vendorForm.get("cinNum").value;
            this.vendorDetails.lutNum = this.vendorForm.get("lutNum").value;
            this.vendorDetails.lutDate = this.vendorForm.get("lutDate").value ? this._datePipe.transform(this.vendorForm.get("lutDate").value, this._appService.dbDateFormat) : null;

            this.vendorDetails.otherDocDesc = this.vendorForm.get("otherDocDesc").value;
        }

        return this.vendorDetails;
    }

    ngOnInit() {

        this.isDashboardCollapsed = true;

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        if (globalConstant.userDetails.isFinance) {
            this.isFinance = true;
            this.canApprove = true;
        } 
        
        if (globalConstant.userDetails.isProcurement) {
            this.isProcurement = true;
            this.canApprove = true;
        }

        this.vendorForm = this._formBuilder.group({
            vendorName: [{value: null, disabled: true}, [Validators.required, Validators.nullValidator]],
            contactPerson: [{value: null, disabled: true}],
            mobileNum: [{value: null, disabled: true}, [Validators.required, Validators.minLength(10), Validators.nullValidator]],
            telephoneNum: {value: null, disabled: true},
            emailId: [{value: null, disabled: true}, [Validators.required, Validators.email, Validators.nullValidator]],
            
            address1: [{value: null, disabled: true}, [Validators.required]],
            address2: [{value: null, disabled: true}],
            city: [{value: null, disabled: true}, [Validators.required]],
            street: [{value: null, disabled: true}, [Validators.required]],
            pincode: [{value: null, disabled: true}, [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
            stateCode: [{value: null, disabled: true}, [Validators.required]],
            countryCode: [{value: null, disabled: true}, [Validators.required]],

            panNum: [{value: null, disabled: true}, [Validators.required, Validators.minLength(10)]],
            gstNum: [{value: null, disabled: true}],
            pfNum: [{value: null, disabled: true}],
            esiNum: [{value: null, disabled: true}],
            cinNum: [{value: null, disabled: true}],
            isSez: [false],
            isRcmApplicable: [false],
            isMsmedRegistered: [false],
            hasTdsLower: [false],
            lutNum: [{value: null, disabled: true}],
            lutDate: [{ value: null, disabled: true}],
            otherDocDesc: [{value: null, disabled: true}],

            selectedVendorGroup: null,
            selectedCompanyCode: null,
            selectedCurrency: null,
            withholdType: null,
            withholdTax: null,
            remarks: null
        });

        setTimeout(() => {  
            this.loadInitData();
        }, 100);
    }
}
