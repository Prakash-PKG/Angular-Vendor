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
    VendorMasterDocumentModel, VendorDocumentReqModel, CountryDataModel, regionMasterVOList, organizationTypeMasterVO, organizationCategoryMasterVO, VendorOrgTypesModel, vendorOrgCategoryModel
} from './../models/data-models';
import { Component, OnInit, HostListener } from '@angular/core';
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
        isError?: boolean,
        isAttachWithoutValue?: boolean
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
    // vendorOrgCategory: vendorOrgCategoryModel = new vendorOrgCategoryModel();
    vendorOrgTypesList: VendorOrgTypesModel[] = [];
    originalVendorDetails: VendorMasterDetailsModel = new VendorMasterDetailsModel();

    orgTypeOthersData: string = '';
    otherOrgTypeSel: boolean = false;

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
    isExistingVendor: boolean = false;
    canEdit: boolean = false;

    msg: string = "";
    usFieldErrMsg: string = '';

    isEditable = false;
    isValid = true;
    isServerError = false;
    disableSubmit: boolean = false;
    canApprove: boolean = false;
    canReject: boolean = false;

    documentsList: VendorMasterDocumentModel[] = [];
    vendorDocList: FileDetailsModel[] = [];
    filesMap: FileMap = {};
    private counterSubject: BehaviorSubject<number>;
    private counterSubscription: Subscription;

    vendorForm: FormGroup;
    isSubmitted: boolean = false;

    countriesList: CountryDataModel[] = [];
    regionMasterVOList: regionMasterVOList[] = [];

    usPayeeIdentificatn: string = '';
    organizationTypeMasterVO: organizationTypeMasterVO[] = [];
    organizationCategoryMasterVO: organizationCategoryMasterVO[] = [];

    maxLutDate = new Date();

    approveBtnTxt: string = "Approve";
    isRejectVisible: boolean = false;

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
        msaCtrl: { documentTypeId: 12, browserId: 'msaFileCtrl', placeholder: 'Attach MSA' },

        // us fields
        taxIdNoCtrl: { documentTypeId: 14, browserId: 'taxIdNoFileCtrl', placeholder: 'Tax ID No.', controlName: 'usTaxId' },
        socialSecNoCtrl: { documentTypeId: 15, browserId: 'socialSecoFileCtrl', placeholder: 'Social Security No.', controlName: 'usSocialSecurity' },
        einCtrl: { documentTypeId: 16, browserId: 'einFileCtrl', placeholder: 'EIN', controlName: 'usEinNumber' },
        w8Ctrl: { documentTypeId: 17, browserId: 'w8FileCtrl', placeholder: 'W8 - BENE / W8 BEN', controlName: 'usW8Bene' },
        w9Ctrl: { documentTypeId: 18, browserId: 'w9FileCtrl', placeholder: 'W9', controlName: 'usW9' },
        minorityCertCtrl: { documentTypeId: 19, browserId: 'minorityCertFileCtrl', placeholder: 'Minority Certificate', controlName: 'usMinorityCertificate' },
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

        // us fields
        14: { controlName: "usTaxId", controlType: "text" },
        15: { controlName: "usSocialSecurity", controlType: "text" },
        16: { controlName: "usEinNumber", controlType: "text" },
        17: { controlName: "usW8Bene", controlType: "radio" },
        18: { controlName: "usW9", controlType: "radio" },
        19: { controlName: "usMinorityCertificate", controlType: "radio" },
    }

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _vendorApprovalService: VendorApprovalService,
        private _snackBar: MatSnackBar,
        private _dialog: MatDialog,
        private _datePipe: DatePipe,
        private _formBuilder: FormBuilder,
        private _router: Router) { }


    omit_special_char(event) {
        var k;
        k = event.charCode;
        return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
    }

    toUppercase(control: string) {
        let ControlVal = this.vendorForm.get(control).value;

        if (ControlVal) {
            this.vendorForm.get(control).setValue(ControlVal.toUpperCase());
        }
    }

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
        this.vendorForm.get("isMsmedRegistered").enable();
        this.vendorForm.get("hasTdsLower").enable();
        this.vendorForm.get("isSez").enable();
        this.vendorForm.get("isRcmApplicable").enable();
        this.vendorForm.get("esiNum").enable();
        this.vendorForm.get("cinNum").enable();

        this.vendorForm.get("lutNum").enable();
        let lutVal = this.vendorForm.get("lutNum").value;
        if (lutVal) {
            this.vendorForm.get("lutDate").enable();
        }
        else {
            this.vendorForm.get("lutDate").disable();
        }

        this.vendorForm.get("otherDocDesc").enable();

        //us Fields

        this.vendorForm.get("usVendorBusiness").enable();
        this.vendorForm.get("vendorOrgCatogery").enable();
        this.vendorForm.get("vendorOrgSubCategory").enable();
        this.vendorForm.get("vendorOrgTypes").enable();
        this.vendorForm.get("usTaxId").enable();
        this.vendorForm.get("usSocialSecurity").enable();
        this.vendorForm.get("usEinNumber").enable();
        this.vendorForm.get("usW8Bene").enable();
        this.vendorForm.get("usW9").enable();
        this.vendorForm.get("usMinorityCertificate").enable();
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
                this.filesMap[item.vendorMasterDocumentsId] = { filesList: [], isMandatory: item.isMandatory, isAttached: false, isError: false, isAttachWithoutValue: false });
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
                if (!this.filesMap[key].isAttached) {
                    this.filesMap[key].isError = true;
                }
            }
            else {
                if (this.documentControlDetails[key]) {
                    let controlVal = this.vendorForm.get(this.documentControlDetails[key].controlName).value
                    this.filesMap[key].isError = (controlVal && this.filesMap[key].filesList.length == 0) ? true : false;
                    this.filesMap[key].isAttachWithoutValue = (!controlVal && this.filesMap[key].filesList.length) ? true : false;
                }
            }
        }
    }

    onFileChange(event: any, documentTypeId: number) {
        if (!documentTypeId) return;
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
        if (!this.filesMap[documentTypeId]) {
            this.filesMap[documentTypeId] = { filesList: [], toAttach: [], isMandatory: true, isAttached: false, isError: false, isAttachWithoutValue: false };
        }
        else {
            this.filesMap[documentTypeId].toAttach = [];
            this.filesMap[documentTypeId].isMandatory = true;
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

                        if (this.documentControlDetails[documentTypeId]) {
                            let controlVal = this.vendorForm.get(this.documentControlDetails[documentTypeId].controlName).value;
                            this.filesMap[documentTypeId].isAttachWithoutValue = controlVal ? false : true;

                        }
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

            this.filesMap[documentTypeId].isAttached = (this.filesMap[documentTypeId].filesList.length === 0) ? false : true;

            this.filesMap[documentTypeId].isError = false;
            if (this.filesMap[documentTypeId].isMandatory && !this.filesMap[documentTypeId].isAttached) {
                this.filesMap[documentTypeId].isError = true;
            }
            else {
                if (this.documentControlDetails[documentTypeId] && this.documentControlDetails[documentTypeId].controlName) {
                    let controlVal = this.vendorForm.get(this.documentControlDetails[documentTypeId].controlName).value;
                    this.filesMap[documentTypeId].isError = (controlVal && this.filesMap[documentTypeId].filesList.length == 0) ? true : false;
                    this.filesMap[documentTypeId].isAttachWithoutValue = (!controlVal && this.filesMap[documentTypeId].filesList.length > 0) ? true : false;
                }
            }

        }
    }

    downloadFile(fileDetails: FileDetailsModel) {
        this._vendorApprovalService.downloadFile(fileDetails);
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

    onApproveClick() {
        this.isSubmitted = true;
        this.msg = '';
        if (globalConstant.userDetails.userRoles.find(r => r.roleCode == "reviewer")) {
            this.updateVendorApprovals(this._appService.updateOperations.review);
        } else {
            this.updateVendorApprovals(this._appService.updateOperations.approve);
        }
    }
    // onSaveClick() {
    //     this.isSubmitted = true;
    //     this.msg = '';
    //     this.updateVendorApprovals(this._appService.updateOperations.proSave);
    // }

    onRejectClick() {
        this.updateVendorApprovals(this._appService.updateOperations.reject);
    }

    onBackClick() {
        this.vendorDetails = this.originalVendorDetails;
        this._router.navigate([this._appService.routingConstants.vendorDashboard]);
    }

    updateMandatoryDocs(selfValue: any, documentTypeId: number) {
        if (selfValue) {
            this.filesMap[documentTypeId].isMandatory = true;
            this.filesMap[documentTypeId].isError = this.filesMap[documentTypeId].filesList.length > 0 ? false : true;
            this.filesMap[documentTypeId].isAttachWithoutValue = false;
        }
        else {
            this.filesMap[documentTypeId].isMandatory = false;
            this.filesMap[documentTypeId].isAttached = this.filesMap[documentTypeId].filesList.length > 0 ? true : false;
            this.filesMap[documentTypeId].isError = false;
            this.filesMap[documentTypeId].isAttachWithoutValue = this.filesMap[documentTypeId].filesList.length ? true : false;
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
            if (this.filesMap[key].isError || this.filesMap[key].isAttachWithoutValue) {
                this.msg = "Form contains error.Please check.";
                this.isValid = false;
                break;
            }
        }
    }

    isMandatoryFieldsEmpty() {
        if (!this.vendorForm.valid) {
            this.msg = "Form contains error.Please check.";
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

            if (withholdTypeVal) {
                this.vendorForm.get("withholdTax").setValidators([Validators.required]);
                this.vendorForm.get("withholdTax").updateValueAndValidity();

            }
            else {
                this.vendorForm.get("withholdTax").setValidators([]);
                this.vendorForm.get("withholdTax").updateValueAndValidity();
            }

            this.isMandatoryFieldsEmpty();
            if (!this.isValid) return;

            if (!withholdTypeVal && !withholdTaxVal) {
                const dialogRef = this._dialog.open(ConfirmDialogComponent, {
                    disableClose: true,
                    panelClass: 'dialog-box',
                    width: '550px',
                    data: <MessageDialogModel>{
                        title: "Warning",
                        message: "You are trying to submit without with Hold Tax or/and Type. Do you wish to Continue?"
                    }
                });

                dialogRef.afterClosed().subscribe(result => {
                    if (result) {
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
            vendorMasterDetails: this.getUpdatedVendorDetails(),

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

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });

        if (this._appService.isExistingVendor) {
            this.vendorDetails = this._appService.selectedVendor;
            this.canApprove = false;
            this.isEditable = false;
            this.canEdit = false;

        }
        else if (this._appService.selectedPendingApprovalRecord) {
            let req: VendorApprovalInitReqModel = {
                vendorMasterId: this._appService.selectedPendingApprovalRecord.vendorMasterId,
                departmentCode: this._appService.selectedPendingApprovalRecord.approvalLevel,
                approvalId: this._appService.selectedPendingApprovalRecord.approvalId
            };
            this.vendorApprovalInitDetails = await this._vendorApprovalService.getVendorApprovalInitData(req);
            this.vendorDetails = this.vendorApprovalInitDetails.vendorMasterDetails;
            this.usPayeeIdentificatn = this.vendorDetails.usSocialSecurity ? 'socialSec' : (this.vendorDetails.usEinNumber ? 'ein' : 'taxId')
        }
        this.loadDropDown();
        this.updateVendorFields();
        this.updateFileDetails();
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
        // this.vendorOrgTypesList = this.vendorDetails.vendorOrgTypesVO;
        // if (this.vendorOrgTypesList) {
        //     this.vendorOrgTypesList.forEach(selectedOrgType => {
        //         this.organizationTypeMasterVO.some((masterOrgType) => {
        //             if(masterOrgType.orgType === selectedOrgType.orgType){
        //                 return masterOrgType.isChecked = true;
        //             }else{
        //                 return masterOrgType.isChecked
        //             }

        //         })
        //     });
        //     console.log(this.organizationTypeMasterVO);
        // }

    }

    updateStates() {
        this.vendorForm.get("stateCode").setValue(null);
        this.regionMasterVOList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.regionMasterVOList &&
            this.vendorApprovalInitDetails.regionMasterVOList.length > 0 && this.vendorApprovalInitDetails.vendorMasterDetails) {

            let cntryCode = this.vendorForm.get("countryCode").value ? this.vendorForm.get("countryCode").value : null;
            if (cntryCode) {
                this.regionMasterVOList = this.vendorApprovalInitDetails.regionMasterVOList.filter(r => r.countryCode == cntryCode);
            }
        }
        // this.updatePincodeValidation();
    }

    // ----------------------------------------region based pincode checking----------------do not remove------------------
    // updatePincodeValidation() {
    //     if (this._vendorApprovalService.vendorUS) {
    //         this.vendorForm.get("pincode").setValidators([Validators.required, Validators.pattern("^[0-9]{5}(?:-[0-9]{4})?$"), Validators.minLength(5), Validators.maxLength(10)]);
    //     }
    //     else {
    //         this.vendorForm.get("pincode").setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
    //     }
    //     this.vendorForm.get("pincode").updateValueAndValidity();
    // }

    updateVendorFields() {
        if (this.vendorDetails) {
            this.vendorForm.get("vendorName").setValue(this.vendorDetails.vendorName);
            this.vendorForm.get("contactPerson").setValue(this.vendorDetails.contactPerson);
            this.vendorForm.get("mobileNum").setValue(this.vendorDetails.mobileNum);
            this.vendorForm.get("telephoneNum").setValue(this.vendorDetails.telephoneNum);
            this.vendorForm.get("emailId").setValue(this.vendorDetails.emailId);
            this.vendorForm.get('usVendorBusiness').setValue(this.vendorDetails.usVendorBusiness);

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
            //us fields
            this.vendorForm.get("usTaxId").setValue(this.vendorDetails.usTaxId);
            this.vendorForm.get("usSocialSecurity").setValue(this.vendorDetails.usSocialSecurity);
            this.vendorForm.get("usEinNumber").setValue(this.vendorDetails.usEinNumber);
            this.vendorForm.get("usW8Bene").setValue(this.vendorDetails.usW8Bene);
            this.vendorForm.get("usW9").setValue(this.vendorDetails.usW9);
            this.vendorForm.get("usMinorityCertificate").setValue(this.vendorDetails.usMinorityCertificate);

            this.vendorForm.get("vendorOrgCatogery").setValue(this.vendorDetails.vendorOrgCatogeryVO ? this.vendorDetails.vendorOrgCatogeryVO.catogery : null);
            this.vendorForm.get("vendorOrgSubCategory").setValue(this.vendorDetails.vendorOrgCatogeryVO ? this.vendorDetails.vendorOrgCatogeryVO.subCatogery : null);

            this.vendorForm.get("selectedVendorGroup").setValue(this.vendorDetails.groupCode ? this.vendorDetails.groupCode : null);
            this.vendorForm.get("selectedCompanyCode").setValue(this.vendorDetails.companyCode ? this.vendorDetails.companyCode : null);
            this.vendorForm.get("selectedCurrency").setValue(this.vendorDetails.currencyCode ? this.vendorDetails.currencyCode : null);
            this.vendorOrgTypesList = this.vendorDetails.vendorOrgTypesVO;
        }

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

        // this.updatePincodeValidation();

        this.updateLUTValidations(this.vendorForm.get("lutNum").value);

        this.vendorForm.get("lutNum").valueChanges.subscribe(val => {
            this.updateLUTValidations(val);
        });
        this.vendorOrgTypesList = this.vendorDetails.vendorOrgTypesVO;
        this.updateUSFieldsValidation();
    }

    updateLUTValidations(lutVal: string) {

        if (lutVal && lutVal.trim()) {
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
            if (cntryCode) {
                this.regionMasterVOList = this.vendorApprovalInitDetails.regionMasterVOList.filter(r => r.countryCode == cntryCode);
            }
        }
        this.organizationTypeMasterVO = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.organizationTypeMasterVO &&
            this.vendorApprovalInitDetails.organizationTypeMasterVO.length > 0) {
            this.organizationTypeMasterVO = this.vendorApprovalInitDetails.organizationTypeMasterVO.concat();
        }

        this.organizationCategoryMasterVO = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.organizationCategoryMasterVO &&
            this.vendorApprovalInitDetails.organizationCategoryMasterVO.length > 0) {
            this.organizationCategoryMasterVO = this.vendorApprovalInitDetails.organizationCategoryMasterVO.concat();
        }

    }

    onHoldTypeSelected(holdType) {
        this.withholdTaxList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.withholdTaxVOList &&
            this.vendorApprovalInitDetails.withholdTaxVOList.length > 0) {
            this.withholdTaxList = this.vendorApprovalInitDetails.withholdTaxVOList.filter(e => e.withholdTypeCode == holdType.value);
        }

    }

    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
        this._appService.isExistingVendor = false;
        this._appService.selectedVendor = null;
    }

    get f() { return this.vendorForm.controls; }

    getUpdatedVendorDetails() {

        if (this.isEditable) {
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

            this.vendorDetails.isMsmedRegistered = this.vendorForm.get("isMsmedRegistered").value;
            this.vendorDetails.hasTdsLower = this.vendorForm.get("hasTdsLower").value;
            this.vendorDetails.isSez = this.vendorForm.get("isSez").value;
            this.vendorDetails.isRcmApplicable = this.vendorForm.get("isRcmApplicable").value;

            this.vendorDetails.cinNum = this.vendorForm.get("cinNum").value;
            this.vendorDetails.lutNum = this.vendorForm.get("lutNum").value;
            this.vendorDetails.lutDate = this.vendorForm.get("lutDate").value ? this._datePipe.transform(this.vendorForm.get("lutDate").value, this._appService.dbDateFormat) : null;

            this.vendorDetails.otherDocDesc = this.vendorForm.get("otherDocDesc").value;

            // US Fields
            this.vendorDetails.usVendorBusiness = this.vendorForm.get("usVendorBusiness").value;
            this.vendorDetails.usTaxId = this.vendorForm.get("usTaxId").value;
            this.vendorDetails.usSocialSecurity = this.vendorForm.get("usSocialSecurity").value;
            this.vendorDetails.usEinNumber = this.vendorForm.get("usEinNumber").value;
            this.vendorDetails.usW8Bene = this.vendorForm.get("usW8Bene").value;
            this.vendorDetails.usW9 = this.vendorForm.get("usW9").value;
            this.vendorDetails.usMinorityCertificate = this.vendorForm.get("usMinorityCertificate").value;

        }

        return this.vendorDetails;
    }

    showUSField() {
        return this._vendorApprovalService.vendorUS;
    }

    onOrgCatChange() {
        this.vendorDetails.vendorOrgCatogeryVO = null;
        this.vendorForm.get('vendorOrgSubCategory').setValue(null);
        let selectedOrgCat = this.vendorForm.get('vendorOrgCatogery').value
        let i = this.organizationCategoryMasterVO.findIndex(orgCat => orgCat.catogery == selectedOrgCat);
        if (this.organizationCategoryMasterVO[i].subCatogeries.length > 1) {
            this.vendorForm.get('vendorOrgSubCategory').setValidators([Validators.required]);
            this.vendorForm.get('vendorOrgSubCategory').updateValueAndValidity;
        }
        else {
            this.vendorForm.get('vendorOrgSubCategory').setValidators([]);
            this.vendorForm.get('vendorOrgSubCategory').updateValueAndValidity;
            this.prepareOrgCat();
        }
    }
    prepareOrgCat() {
        let obj: vendorOrgCategoryModel = {
            vendorMasterId: this.vendorApprovalInitDetails.vendorMasterDetails.vendorMasterId,
            catogery: this.vendorForm.get('vendorOrgCatogery').value,
            subCatogery: this.vendorForm.get('vendorOrgSubCategory').value
        }
        this.vendorDetails.vendorOrgCatogeryVO = obj;
    }

    setOrgType(selectedOrgType) {
        this.vendorOrgTypesList = this.vendorDetails.vendorOrgTypesVO;
        if (this.vendorOrgTypesList) {
            // let i = this.vendorOrgTypesList.findIndex((org) => org.orgType == 'Others');
            // if (i > -1) {
            //     this.vendorForm.get("orgTypeOthersData").setValue(this.vendorOrgTypesList[i].orgTypesOthersData);
            //     this.orgTypeOthersData = this.vendorOrgTypesList[i].orgTypesOthersData;
            // }
            return this.vendorOrgTypesList.some(orgType => orgType.orgType == selectedOrgType);
        }
        else return false;
    }

    prepareOthersData() {
        this.orgTypeOthersData = this.otherOrgTypeSel ? this.vendorForm.get("orgTypeOthersData").value : null
        let i = this.vendorOrgTypesList.findIndex((org) => org.orgType == 'Others');
        this.vendorOrgTypesList[i].orgTypesOthersData = this.orgTypeOthersData
    }

    prepareOrgTypeList(event, orgType, index) {
        this.vendorOrgTypesList = this.vendorOrgTypesList || [];
        let vendorOrgTypeId: number = null;
        if (this.vendorDetails && this.vendorDetails.vendorOrgTypesVO && this.vendorDetails.vendorOrgTypesVO[index]) {
            vendorOrgTypeId = this.vendorDetails.vendorOrgTypesVO[index].vendorOrgTypeId ? this.vendorDetails.vendorOrgTypesVO[index].vendorOrgTypeId : null
        }
        this.orgTypeOthersData = (orgType == 'Others') ? this.vendorForm.get("orgTypeOthersData").value : null;
        let obj: VendorOrgTypesModel = {
            vendorMasterId: this.vendorDetails.vendorMasterId,
            orgType: orgType,
            vendorOrgTypeId: vendorOrgTypeId,
            orgTypesOthersData: this.orgTypeOthersData

        }
        if (event) {
            this.vendorOrgTypesList.push(obj);
            if (orgType == 'Others') {
                this.otherOrgTypeSel = true;
                this.vendorForm.get("orgTypeOthersData").setValidators([Validators.required]);
                this.vendorForm.get("orgTypeOthersData").updateValueAndValidity();
            }
        }
        else {
            let i = this.vendorOrgTypesList.findIndex((org) => org.orgType == orgType);
            this.vendorOrgTypesList.splice(i, 1);
            if (orgType == 'Others') {
                this.otherOrgTypeSel = true;
                this.vendorForm.get("orgTypeOthersData").setValidators([]);
                this.vendorForm.get("orgTypeOthersData").updateValueAndValidity();
            }
        }
        this.vendorDetails.vendorOrgTypesVO = this.vendorOrgTypesList;
    }

    updateUSFieldsValidation() {
        if (this._vendorApprovalService.vendorUS) {
            this.vendorForm.get('usVendorBusiness').setValidators([Validators.required]);
            this.vendorForm.get('vendorOrgCatogery').setValidators([Validators.required]);
            this.vendorForm.get('vendorOrgSubCategory').setValidators([Validators.required]);

            this.vendorForm.get('usVendorBusiness').updateValueAndValidity;
            this.vendorForm.get('vendorOrgCatogery').updateValueAndValidity;
            this.vendorForm.get('vendorOrgSubCategory').updateValueAndValidity;

            this.vendorForm.get('panNum').setValidators([]);
            this.vendorForm.get('panNum').updateValueAndValidity;

            this.vendorForm.get("pincode").setValidators([Validators.required, Validators.pattern("^[0-9]{5}(?:-[0-9]{4})?$"), Validators.minLength(5), Validators.maxLength(10)]);
            this.vendorForm.get('pincode').updateValueAndValidity;

            let otherOrg = this.vendorOrgTypesList ? this.vendorOrgTypesList.find((org) => org.orgType == 'Others') : null;
            this.otherOrgTypeSel = otherOrg ? true : false;
            this.orgTypeOthersData = otherOrg ? otherOrg.orgTypesOthersData : null;
            this.vendorForm.get("orgTypeOthersData").setValue(this.orgTypeOthersData);
            if (this.otherOrgTypeSel) {
                this.vendorForm.get('orgTypeOthersData').setValidators([Validators.required]);
                this.vendorForm.get('orgTypeOthersData').updateValueAndValidity;
            }
        }
        else {
            this.vendorForm.get('usVendorBusiness').setValidators([]);
            this.vendorForm.get('vendorOrgCatogery').setValidators([]);
            this.vendorForm.get('vendorOrgSubCategory').setValidators([]);

            this.vendorForm.get('usVendorBusiness').updateValueAndValidity;
            this.vendorForm.get('vendorOrgCatogery').updateValueAndValidity;
            this.vendorForm.get('vendorOrgSubCategory').updateValueAndValidity;

            this.vendorForm.get('panNum').setValidators([Validators.required]);
            this.vendorForm.get('panNum').updateValueAndValidity;

            this.vendorForm.get("pincode").setValidators([Validators.required, Validators.minLength(6), Validators.pattern("^[0-9]*$"), Validators.maxLength(6)]);
            this.vendorForm.get('pincode').updateValueAndValidity;

        }

    }
    isOthersSel() {
        if (this.vendorOrgTypesList.find((org) => org.orgType == 'Others')) return true;
        else return false;
    }
    upatePayeeIdentificationFiles(documentTypeId) {
        this.filesMap[documentTypeId].filesList.forEach((file, fInd) => {
            this.onDeleteFileClick(file, fInd, documentTypeId);
        });
        this.filesMap[documentTypeId].isMandatory = false;
        this.filesMap[documentTypeId].isAttached = false;
    }

    updatePayeeIdentificatn() {
        this.usFieldErrMsg = '';
        if (this.usPayeeIdentificatn == 'taxId') {

            this.vendorForm.get("usTaxId").setValidators([Validators.required]);
            this.vendorForm.get("usTaxId").updateValueAndValidity();
            this.filesMap[this.vendorDocCtrl.taxIdNoCtrl.documentTypeId].isMandatory = true;

            this.vendorForm.get("usW8Bene").setValue(true);
            this.updateMandatoryDocs(true, this.vendorDocCtrl.w8Ctrl.documentTypeId);

            this.vendorForm.get("usEinNumber").setValue(null);
            this.upatePayeeIdentificationFiles(this.vendorDocCtrl.einCtrl.documentTypeId);


            this.vendorForm.get("usW9").setValue(false);
            this.upatePayeeIdentificationFiles(this.vendorDocCtrl.w9Ctrl.documentTypeId);
            this.updateMandatoryDocs(false, this.vendorDocCtrl.w9Ctrl.documentTypeId);

            this.vendorForm.get("usSocialSecurity").setValue(null);
            this.upatePayeeIdentificationFiles(this.vendorDocCtrl.socialSecNoCtrl.documentTypeId);


            this.vendorForm.get("usSocialSecurity").setValidators([]);
            this.vendorForm.get("usSocialSecurity").updateValueAndValidity();

            this.vendorForm.get("usEinNumber").setValidators([]);
            this.vendorForm.get("usEinNumber").updateValueAndValidity();

            if (this.filesMap[this.vendorDocCtrl.socialSecNoCtrl.documentTypeId].filesList.length) {
                this.usFieldErrMsg = 'Remove document from Social security if Social security is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.einCtrl.documentTypeId].filesList.length) {
                this.usFieldErrMsg = 'Remove document from EIN if EIN is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.w9Ctrl.documentTypeId].filesList.length) {
                this.usFieldErrMsg = 'Remove document from w9 if EIN / SSN is not selected as payee identification proof'
            }
        }
        else if (this.usPayeeIdentificatn == 'socialSec') {


            this.vendorForm.get("usSocialSecurity").setValidators([Validators.required]);
            this.vendorForm.get("usSocialSecurity").updateValueAndValidity();
            this.filesMap[this.vendorDocCtrl.socialSecNoCtrl.documentTypeId].isMandatory = true;


            this.vendorForm.get("usTaxId").setValue(null);
            this.upatePayeeIdentificationFiles(this.vendorDocCtrl.taxIdNoCtrl.documentTypeId);
            this.vendorForm.get("usTaxId").setValidators([]);
            this.vendorForm.get("usTaxId").updateValueAndValidity();

            this.vendorForm.get("usW8Bene").setValue(false);
            this.upatePayeeIdentificationFiles(this.vendorDocCtrl.w8Ctrl.documentTypeId);
            this.updateMandatoryDocs(false, this.vendorDocCtrl.w8Ctrl.documentTypeId);


            this.vendorForm.get("usEinNumber").setValue(null);
            this.upatePayeeIdentificationFiles(this.vendorDocCtrl.einCtrl.documentTypeId);
            this.vendorForm.get("usEinNumber").setValidators([]);
            this.vendorForm.get("usEinNumber").updateValueAndValidity();

            this.vendorForm.get("usW9").setValue(true);
            // this.upatePayeeIdentificationFiles(this.vendorDocCtrl.w9Ctrl.documentTypeId);
            this.updateMandatoryDocs(true, this.vendorDocCtrl.w9Ctrl.documentTypeId);


            if (this.filesMap[this.vendorDocCtrl.taxIdNoCtrl.documentTypeId].filesList.length) {
                this.usFieldErrMsg = 'Remove document from Tax ID if Tax ID is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.w8Ctrl.documentTypeId].filesList.length) {
                this.usFieldErrMsg = 'Remove document from w8 if Tax ID is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.einCtrl.documentTypeId].filesList.length) {
                this.usFieldErrMsg = 'Remove document from EIN if EIN is not selected as payee identification proof'
            }
            // if (this.filesMap[this.vendorDocCtrl.w9Ctrl.documentTypeId].filesList.length) {
            //     this.usFieldErrMsg = 'Remove document from w9 if EIN is not selected as payee identification proof'
            // }
        }
        else if (this.usPayeeIdentificatn == 'ein') {

            this.vendorForm.get("usEinNumber").setValidators([Validators.required]);
            this.vendorForm.get("usEinNumber").updateValueAndValidity();
            this.filesMap[this.vendorDocCtrl.einCtrl.documentTypeId].isMandatory = true;

            this.vendorForm.get("usW9").setValue(true);
            this.updateMandatoryDocs(true, this.vendorDocCtrl.w9Ctrl.documentTypeId);

            this.vendorForm.get("usTaxId").setValue(null);
            this.upatePayeeIdentificationFiles(this.vendorDocCtrl.taxIdNoCtrl.documentTypeId);
            this.vendorForm.get("usTaxId").setValidators([]);
            this.vendorForm.get("usTaxId").updateValueAndValidity();

            this.vendorForm.get("usW8Bene").setValue(false);
            this.upatePayeeIdentificationFiles(this.vendorDocCtrl.w8Ctrl.documentTypeId);
            this.updateMandatoryDocs(false, this.vendorDocCtrl.w8Ctrl.documentTypeId);

            this.vendorForm.get("usSocialSecurity").setValue(null);
            this.upatePayeeIdentificationFiles(this.vendorDocCtrl.socialSecNoCtrl.documentTypeId);
            this.vendorForm.get("usSocialSecurity").setValidators([]);
            this.vendorForm.get("usSocialSecurity").updateValueAndValidity();


            if (this.filesMap[this.vendorDocCtrl.taxIdNoCtrl.documentTypeId].filesList.length) {
                this.usFieldErrMsg = 'Remove document from Tax ID if Tax ID is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.w8Ctrl.documentTypeId].filesList.length) {
                this.usFieldErrMsg = 'Remove document from w8 if Tax ID is not selected as payee identification proof'
            }
            if (this.filesMap[this.vendorDocCtrl.socialSecNoCtrl.documentTypeId].filesList.length) {
                this.usFieldErrMsg = 'Remove document from social security if social security is not selected as payee identification proof'
            }
        }
    }
    ngOnInit() {

        this.isDashboardCollapsed = true;
        this.maxLutDate.setDate(this.maxLutDate.getDate() + 1);

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        this.isExistingVendor = this._appService.isExistingVendor;

        if (globalConstant.userDetails.isFinance) {
            this.isFinance = true;
            this.canApprove = true;
            this.canReject = true;
            this.canEdit = false;

        }

        if (globalConstant.userDetails.isProcurement) {
            this.isProcurement = true;
            this.canApprove = true;
            this.canReject = true;
            this.canEdit = true;
        }

        if (globalConstant.userDetails.userRoles.find(r => r.roleCode == "reviewer")) {
            this.approveBtnTxt = "Review";
            this.isRejectVisible = false;
            this.canReject = false;
        }
        else {
            this.approveBtnTxt = "Approve";
            this.isRejectVisible = true;
            this.canReject = true;
        }

        this.vendorForm = this._formBuilder.group({
            vendorName: [{ value: null, disabled: true }, [Validators.required]],
            contactPerson: [{ value: null, disabled: true }],
            mobileNum: [{ value: null, disabled: true }, [Validators.required, Validators.minLength(10), Validators.pattern("^[0-9]*$")]],
            telephoneNum: [{ value: null, disabled: true }, [Validators.minLength(11), Validators.pattern("^[0-9]*$")]],
            emailId: [{ value: null, disabled: true }, [Validators.required, Validators.email]],

            //For US in vendor details
            usVendorBusiness: [{ value: null, disabled: true }],

            address1: [{ value: null, disabled: true }, [Validators.required]],
            address2: [{ value: null, disabled: true }],
            city: [{ value: null, disabled: true }, [Validators.required]],
            street: [{ value: null, disabled: true }, [Validators.required]],
            pincode: [{ value: null, disabled: true }, [Validators.required,]],
            stateCode: [{ value: null, disabled: true }, [Validators.required]],
            countryCode: [{ value: null, disabled: true }, [Validators.required]],

            //For India in vendor documents
            panNum: [{ value: null, disabled: true }, [Validators.required, Validators.minLength(10)]],
            gstNum: [{ value: null, disabled: true }, [Validators.minLength(15)]],
            pfNum: [{ value: null, disabled: true }],
            esiNum: [{ value: null, disabled: true }],
            cinNum: [{ value: null, disabled: true }],
            isSez: [false],
            isRcmApplicable: [false],
            isMsmedRegistered: [false],
            hasTdsLower: [false],
            lutNum: [{ value: null, disabled: true }],
            lutDate: [{ value: null, disabled: true }],
            otherDocDesc: [{ value: null, disabled: true }],

            //For US in vendor documents
            vendorOrgCatogery: [{ value: null, disabled: true }, [Validators.required]],
            vendorOrgSubCategory: [{ value: null, disabled: true }],
            vendorOrgTypes: [{ value: null, disabled: true }],
            usTaxId: [{ value: null, disabled: true }, [Validators.minLength(9), Validators.maxLength(11)]],
            usSocialSecurity: [{ value: null, disabled: true }, [Validators.minLength(9), Validators.maxLength(11)]],
            usEinNumber: [{ value: null, disabled: true }, [Validators.minLength(9), Validators.maxLength(11)]],
            usW8Bene: [false],
            usW9: [false],
            usMinorityCertificate: [false],
            orgTypeOthersData: [null],

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
