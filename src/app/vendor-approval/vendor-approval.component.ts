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
    VendorRegistrationDetailRequestModel, VendorDocumentResultModel, FileDetailsModel, VendorMasterDocumentModel, VendorDocumentReqModel
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

    isEditable = true;
    isValid = true;
    isServerError = false;
    disableSubmit: boolean = false;
    canApprove: boolean = false;

    documentsList: VendorMasterDocumentModel[] = [];
    vendorDocList: FileDetailsModel[] = [];
    filesMap: FileMap = {};
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
        otherCtrl: { documentTypeId: 13, browserId: 'otherFileCtrl', placeholder: 'Document Description' },
        msaCtrl: { documentTypeId: 12, browserId: 'msaFileCtrl', placeholder: 'Attach MSA' }
    }

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _vendorApprovalService: VendorApprovalService,
        private _snackBar: MatSnackBar,
        private _dialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _router: Router) { }

    onEditClick() {
        this.isEditable = false;
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

    initializeFilesList() {
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.vendorMasterDocumentVOList &&
            this.vendorApprovalInitDetails.vendorMasterDocumentVOList.length > 0) {
            this.vendorApprovalInitDetails.vendorMasterDocumentVOList.forEach(item =>
                this.filesMap[item.vendorMasterDocumentsId] = { filesList: [], isMandatory: item.isMandatory, isAttached: false, isError: false });
        }
    }
    getAttachments() {
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.fileDetails &&
            this.vendorApprovalInitDetails.fileDetails.length > 0) {
            this.vendorApprovalInitDetails.fileDetails.forEach(item => {
                this.filesMap[item.documentTypeId].filesList.push(item);
                this.filesMap[item.documentTypeId].isAttached = true;
            });
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
        }

    }

    downloadFile(fileDetails: FileDetailsModel) {
        this._vendorApprovalService.downloadFile(fileDetails);
    }

    onApproveClick() {
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
        if (!selfValue) {
            this.filesMap[documentTypeId].isAttached = false;
            this.filesMap[documentTypeId].isError = false;
            this.filesMap[documentTypeId].isMandatory = false;
            console.log(this.filesMap);
            return;
        }
        this.filesMap[documentTypeId].isMandatory = true;
        this.filesMap[documentTypeId].isError = true;
        console.log(this.filesMap);
    }
    // functions for document attachment ends here

    isFilesValid() {
        this.isValid = true;
        for (let key in this.filesMap) {
            this.filesMap[key].isError = false;
            if (this.filesMap[key].isMandatory && !this.filesMap[key].isAttached) {
                this.isValid = false;
                this.filesMap[key].isError = true;
                return;
            }
        }
    }
    async isFormValid() {
        if (this.isFinance) {

            if (!this.selectedVendorGroup || !this.selectedCompanyCode || !this.selectedCurrency) {
                this.msg = "Your form contains error.Please check.";
                return this.isValid = false;
            }
            if (!this.withholdTax || !this.withholdType || !this.remarks) {
                const dialogRef = this._dialog.open(ConfirmDialogComponent, {
                    disableClose: true,
                    panelClass: 'dialog-box',
                    width: '550px',
                    data: <MessageDialogModel>{
                        title: "Warning",
                        message: "You are trying to submit without with Hold Tax and Type. Do you wish to Continue?"
                    }
                });
                return await dialogRef.afterClosed().toPromise();
            }
        }
        else {
            return true;
        }
    }
    isMandatoryFieldsEmpty() {
        if (this.isProcurement) {
            if (!this.vendorDetails.vendorName || !this.vendorDetails.mobileNum || !this.vendorDetails.emailId || !this.vendorDetails.address1 || !this.vendorDetails.street || !this.vendorDetails.city || !this.vendorDetails.pincode || !this.vendorDetails.stateName || !this.vendorDetails.countryName || !this.vendorDetails.panNum) {
                this.msg = "Your form contains error.Please check.";
                this.isValid = false;
            }
        }
    }

    async updateVendorApprovals(action: string) {
        this.isFilesValid();
        if (!this.isValid) return;

        this.isMandatoryFieldsEmpty();
        if (!this.isValid) return;

        this.isValid = await this.isFormValid();
        if (!this.isValid) { return };



        let req: VendorApprovalReqModel = {
            action: action,
            vendorApprovalID: this.vendorApprovalInitDetails.vendorApprovalDetails.vendorApprovalID,
            vendorMasterId: this.vendorApprovalInitDetails.vendorApprovalDetails.vendorMasterId,
            departmentCode: this.vendorApprovalInitDetails.vendorApprovalDetails.departmentCode ?
                this.vendorApprovalInitDetails.vendorApprovalDetails.departmentCode : globalConstant.userDetails.userRoles[0].roleCode,
            approverId: globalConstant.userDetails.userId,
            remarks: this.remarks,
            groupCode: this.selectedVendorGroup,
            companyCode: this.selectedCompanyCode,
            currencyCode: this.selectedCurrency,
            withholdTaxCode: this.withholdTax,
            withholdTypeCode: this.withholdType,
            createdBy: this.vendorApprovalInitDetails.vendorApprovalDetails.createdBy ? this.vendorApprovalInitDetails.vendorApprovalDetails.createdBy : globalConstant.userId,
            createDate: this.vendorApprovalInitDetails.vendorApprovalDetails.createDate ? this.vendorApprovalInitDetails.vendorApprovalDetails.createDate : null,
            vendorMasterDetails: this.vendorDetails
        }

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
                        this.isEditable = true;
                        this.isServerError = true;
                        this.disableSubmit = false;
                        this.msg = result.message;
                    }
                }
            },
                (error) => {
                    this.isEditable = true;
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
            this.originalVendorDetails = this.vendorApprovalInitDetails.vendorMasterDetails;
            this.vendorDetails = this.originalVendorDetails;
            this.initializeFilesList();
            this.loadDropDown();
            this.getAttachments();
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
        }
    }

    loadDropDown() {
        this.vendoraccGroupList = [];

        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.accGroupMasterList &&
            this.vendorApprovalInitDetails.accGroupMasterList.length > 0) {
            this.vendoraccGroupList = this.vendorApprovalInitDetails.accGroupMasterList;
        }
        this.companyCodeList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.companyCodeMasterList &&
            this.vendorApprovalInitDetails.companyCodeMasterList.length > 0) {
            this.companyCodeList = this.vendorApprovalInitDetails.companyCodeMasterList;
        }
        this.currencyList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.currencyMasterList &&
            this.vendorApprovalInitDetails.currencyMasterList.length > 0) {
            this.currencyList = this.vendorApprovalInitDetails.currencyMasterList;
        }

        this.withholdTypeList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.withholdTypeVOList &&
            this.vendorApprovalInitDetails.withholdTypeVOList.length > 0) {
            this.withholdTypeList = this.vendorApprovalInitDetails.withholdTypeVOList;
        }

        this.selectedCompanyCode = this.vendorApprovalInitDetails.vendorMasterDetails &&
            this.vendorApprovalInitDetails.vendorMasterDetails.companyCode ?
            this.vendorApprovalInitDetails.vendorMasterDetails.companyCode : undefined;

        this.selectedCurrency = this.vendorApprovalInitDetails.vendorMasterDetails &&
            this.vendorApprovalInitDetails.vendorMasterDetails.currencyCode ?
            this.vendorApprovalInitDetails.vendorMasterDetails.currencyCode : undefined;

        this.selectedVendorGroup = this.vendorApprovalInitDetails.vendorMasterDetails &&
            this.vendorApprovalInitDetails.vendorMasterDetails.groupCode ?
            this.vendorApprovalInitDetails.vendorMasterDetails.groupCode : undefined;
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

    ngOnInit() {

        this.isDashboardCollapsed = true;

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });
        if (globalConstant.userDetails.userRoles[0].roleCode == 'finance') {
            this.isFinance = true;
            this.canApprove = true;

        } else if (globalConstant.userDetails.userRoles[0].roleCode == 'procurement') {
            this.isProcurement = true;
            this.canApprove = true;
        }

        // this.vendorForm = this._formBuilder.group({
        //     // bankAddress: [null, [Validators.required]],
        //     accountNum: [null, [Validators.required]],
        //     accountType: [null, [Validators.required]],
        //     accountName: [null, [Validators.required]],
        //     ifscCode: [null, [Validators.required]],
        //     bankName: [null, [Validators.required]],
        //     bankBranch: [null, [Validators.required]],
        //     bankCity: [null, [Validators.required]],
        //     bankRegion: [null, [Validators.required]],
        //     bankCountry: [null, [Validators.required]],
        //     swiftIbanCode: [null],
        //     routingBank: [null],
        //     swiftInterm: [null],
        // });

        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }
}
