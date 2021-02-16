import { InvoiceUploadService } from './../invoice-upload/invoice-upload.service';
import { InvoiceCommunicationDialogComponent } from './../invoice-communication-dialog/invoice-communication-dialog.component';
import { transition } from '@angular/animations';
import { ConfirmDialogComponent } from './../confirm-dialog/confirm-dialog.component';
import { GrnSesItemsComponent } from './../grn-ses-items/grn-ses-items.component';
import { MessageDialogModel } from './../models/popup-models';
import { MessageDialogComponent } from './../message-dialog/message-dialog.component';
import { globalConstant, countryCompanyCodes } from './../common/global-constant';
import { AppService } from './../app.service';
import {
    BusyDataModel, InvoiceApprovalInitResultModel, InvoiceApprovalInitReqModel,
    ItemModel, ItemDisplayModel, GrnSesModel, FileDetailsModel,
    StatusModel, UpdateInvoiceApprovalReqModel, GrnSesDisplayModel, GrnSesItemModel,
    GrnSesItemsDisplayModel, InvoiceApprovalModel, InvoiceCommunicationDisplayModel,
    UpdateInvoiceResultModel, InvoiceDocumentReqModel, InvoiceDocumentResultModel,
    InvoiceFileTypwModel
} from './../models/data-models';
import { InvoiceApprovalsService } from './invoice-approvals.service';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { Router } from '@angular/router';
import { MatSort, MatPaginator, MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import * as _ from 'underscore';

@Component({
    selector: 'app-invoice-approvals',
    templateUrl: './invoice-approvals.component.html',
    styleUrls: ['./invoice-approvals.component.scss']
})
export class InvoiceApprovalsComponent implements OnInit {
    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    headerArr: string[] = [];
    nonPOHeaderArr: string[] = ['Item No.', 'Item Desc', "HSN/SAC", 'Invoice Units', 'Rate', 'Amount', 'Remarks'];
    poHeaderArr: string[] = ['Item No.', 'Item Desc', "HSN/SAC", "From Date", "To Date", "Personnel Number", 'Order Units', "UOM",
        'Invoice Units', 'Rate', 'Amount', 'Remarks'];
    poHeaderArrWithoutDates: string[] = ['Item No.', 'Item Desc', "HSN/SAC", 'Order Units', "UOM", 'Invoice Units',
        'Rate', 'Amount', 'Remarks'];

    initDetails: InvoiceApprovalInitResultModel = null;
    itemsList: ItemDisplayModel[] = [];
    totalAmount: string = "0.000";

    isHSNVisible: boolean = false;
    isTCSAmtVisible: boolean = false;
    isRegionFieldsVisible: boolean = false;

    remarks: string = "";

    uploaderRemarks: string = "";
    isReceiver: boolean = false;
    uploaderRemarksErrMsg: string = "";

    isPOInvoice: boolean = false;

    isPOCompleted: boolean = false;
    isFunctionalHeadCompleted: boolean = false;
    //isFinanceCompleted: boolean = false;

    grnSesList: GrnSesModel[] = [];
    selectedGrnSesNumber: string = "";
    isGrnDdlVisible: boolean = true;

    invoiceFilesList: FileDetailsModel[] = [];
    supportFilesList: FileDetailsModel[] = [];

    rectifiedFilesList: FileDetailsModel[] = [];
    newRectifiedFilesList: FileDetailsModel[] = [];
    newRectifiedFilesErrMsg: string = "";
    private _tempNewRectifiedFilesList: FileDetailsModel[] = [];
    private _newRectifiedFileCnt: number = 0;
    newRectifiedFilesUpdateResults: UpdateInvoiceResultModel = null;

    invoiceFileTypeId: number = null;
    supportFileTypeId: number = null;
    rectifiedFileTypeId: number = null;

    grnSesAccountCategories: string[] = ["1", "3", "5", "2", "4"];
    isGrnSesRequired: boolean = false;

    remarksErrMsg: string = "";
    grnSesErrMsg: string = "";

    grnSesItemsDisplayList: GrnSesDisplayModel[] = [];

    selectedGrnSesModel: GrnSesDisplayModel = null;

    isGrnSesVisible: boolean = false;

    isFromToMandatory: boolean = false;

    approveBtnTxt: string = "Approve";
    //rejectedRemarks: string = "";
    isOnHold: boolean = false;
    isOnRectified: boolean = false;

    isRejectVisible: boolean = false;
    isHoldVisible: boolean = false;

    isChatBtnVisible: boolean = false;

    documentType: string = null;

    indiaWorkflow: boolean = false;
    usWorkflow: boolean = false;

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _router: Router,
        public _dialog: MatDialog,
        private _invoiceUploadService: InvoiceUploadService,
        private _invoiceApprovalsService: InvoiceApprovalsService) { }

    // onGrnSesSelectClick() {
    //     this.displayGrnSesItems();
    // }

    // displayGrnSesItems() {
    //     const dialogRef = this._dialog.open(GrnSesItemsComponent, {
    //         disableClose: true,
    //         panelClass: 'dialog-box',
    //         width: '550px',
    //         data: this.grnSesItemsDisplayList
    //     });

    //     dialogRef.afterClosed().subscribe(result => {
    //         if (result as GrnSesDisplayModel) {
    //             this.selectedGrnSesModel = result;
    //             this.selectedGrnSesNumber = this.selectedGrnSesModel.grnSesNumber;
    //             this.grnSesErrMsg = "";
    //         }
    //     });
    // }

    onRectifiedFileBrowseClick(event: any) {
        event.preventDefault();

        let element: HTMLElement = document.getElementById("rectifiedFileCtrl");
        element.click();
    }

    updateCountryFLow() {
        if (this.indiaWorkflow) {

            this.isHSNVisible = true;
            this.isTCSAmtVisible = true;
            this.isRegionFieldsVisible = false;

        }
        else if (this.usWorkflow) {

            this.isHSNVisible = false;
            this.isTCSAmtVisible = false;
            this.isRegionFieldsVisible = true;
            

            this.headerArr = this.headerArr.filter(x => x != "HSN/SAC");
        }
    }
    onRectifiedFileChange(event: any) {
        this._tempNewRectifiedFilesList = [];
        this._newRectifiedFileCnt = 0;
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
                            documentTypeId: this.rectifiedFileTypeId,
                            fileId: null,
                            createdDate: null,
                            createdBy: null
                        };
                        this._tempNewRectifiedFilesList.push(fileDetails);

                        let reader = new FileReader();
                        reader.onload = this._handleRectifiedFileReaderLoaded.bind(this, file.name);
                        reader.readAsBinaryString(file);
                    }
                }
            }
        }

        event.target.value = null;
    }

    private _handleRectifiedFileReaderLoaded(actualFileName, readerEvt) {
        let binaryString = readerEvt.target.result;
        let base64textString = btoa(binaryString);

        for (let fileItem of this._tempNewRectifiedFilesList) {
            if (fileItem.actualFileName == actualFileName) {
                fileItem.fileData = base64textString;
                this._newRectifiedFileCnt = this._newRectifiedFileCnt + 1;
                break;
            }
        }

        if (this._tempNewRectifiedFilesList.length > 0 && this._tempNewRectifiedFilesList.length == this._newRectifiedFileCnt) {
            this.onRectifiedFileAttachClick();
        }
    }

    onRectifiedFileAttachClick() {
        let invId = this._appService.selectedPendingApprovalRecord.invoiceId;
        let filesReq: InvoiceDocumentReqModel = {
            invoiceId: invId,
            userId: globalConstant.userDetails.userId,
            fileDetails: this._tempNewRectifiedFilesList
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Attaching..." });
        this._invoiceUploadService.uploadInvoiceDocuments(filesReq)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                if (response.body) {
                    let results: InvoiceDocumentResultModel = response.body as InvoiceDocumentResultModel;

                    if (results.status.status == 200 && results.status.isSuccess) {
                        this.newRectifiedFilesList = this.newRectifiedFilesList.concat(results.fileDetails);
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
                title: "Invoice Approval Action",
                message: msg
            }
        });

        dialogRef.afterClosed().subscribe(result => {

        });
    }

    displayMSMEData(msg: string) {
        const dialogRef = this._dialog.open(MessageDialogComponent, {
            disableClose: true,
            panelClass: 'dialog-box',
            width: '550px',
            data: <MessageDialogModel>{
                title: "Invoice Approval Action",
                message: msg
            }
        });

        dialogRef.afterClosed().subscribe(result => {

        });
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
        if (this.newRectifiedFilesList.length > 0) {
            this.newRectifiedFilesList.splice(fileIndex, 1);
        }
    }

    prepareInvoiceFileTypes() {
        this.invoiceFileTypeId = null;
        this.supportFileTypeId = null;
        if (this.initDetails && this.initDetails.invoiceFileTypes && this.initDetails.invoiceFileTypes.length > 0) {
            let invoiceFileTypeItem: InvoiceFileTypwModel = this.initDetails.invoiceFileTypes.find(ft => ft.fileType == "invoice");
            if (invoiceFileTypeItem) {
                this.invoiceFileTypeId = invoiceFileTypeItem.invoiceFileTypesId;
            }

            let supportFileTypeItem: InvoiceFileTypwModel = this.initDetails.invoiceFileTypes.find(ft => ft.fileType == "support");
            this.supportFileTypeId = supportFileTypeItem.invoiceFileTypesId;

            let rectifiedFileTypeItem: InvoiceFileTypwModel = this.initDetails.invoiceFileTypes.find(ft => ft.fileType == "rectified");
            this.rectifiedFileTypeId = rectifiedFileTypeItem.invoiceFileTypesId;
        }
    }

    onRemarksBlur() {
        if (this.remarks) {
            this.remarks = this.remarks.trim();
        }
    }

    onItemRemarksBlur(item: ItemDisplayModel) {
        if (item.remarks) {
            item.remarks = item.remarks.trim();
        }
    }

    onUploaderRemarksBlur() {
        if (this.uploaderRemarks) {
            this.uploaderRemarks = this.uploaderRemarks.trim();
        }
    }

    onBackBtnClick() {
        this._router.navigate([this._appService.routingConstants.pendingApprovals]);
    }

    getUnitsAmt(item: ItemDisplayModel) {
        let unitsAmt = (item.unitPrice && item.invoiceUnits) ? +item.unitPrice * +item.invoiceUnits : null;
        return unitsAmt;
    }

    getCurrencyType() {
        return this.initDetails.poDetails.currencyType;
    }

    getFormattedDate(dtStr: string) {
        if (dtStr) {
            return this._appService.getFormattedDate(dtStr);
        }

        return "";
    }

    getPlant() {
        if (this.initDetails && this.initDetails.invoiceDetails) {
            return this.initDetails.invoiceDetails.plantDescription + " ( " + this.initDetails.invoiceDetails.plantCode + " )";
        }

        return "";
    }

    async loadInitData() {
        this.isRejectVisible = false;
        this.isHoldVisible = false;
        this.indiaWorkflow = false;
        this.usWorkflow = false;
        if (this._appService.selectedPendingApprovalRecord) {

            if (this._appService.selectedPendingApprovalRecord.departmentId) {
                if (this._appService.selectedPendingApprovalRecord.departmentId.indexOf("-" + globalConstant.usCountryCode) > 0) {
                    this.usWorkflow = true
                }
                else {
                    this.indiaWorkflow = true;
                }
                
            }

            if (globalConstant.userDetails.isPurchaseOwner) {
                this.isReceiver = true;
            }

            this.isPOInvoice = false;
            if (this._appService.selectedPendingApprovalRecord.purchaseOrderId && this._appService.selectedPendingApprovalRecord.poNumber) {
                this.isPOInvoice = true;
            }

            this.documentType = this._appService.selectedPendingApprovalRecord.documentType;

            if (!this.isPOInvoice || globalConstant.userDetails.isPurchaseOwner || globalConstant.userDetails.isSubContractReceiver) {
                this.isRejectVisible = true;
            }

            if (this.isPOInvoice && (globalConstant.userDetails.isFunctionalHead || globalConstant.userDetails.isFinance)) {
                this.isHoldVisible = true;
            }

            this.totalAmount = "0.000";

            this.isGrnSesRequired = false;
            if (this.grnSesAccountCategories.indexOf(this._appService.selectedPendingApprovalRecord.accountAssignmenCategory) > -1) {
                this.isGrnSesRequired = true;
            }

            let req: InvoiceApprovalInitReqModel = {
                approvalId: this._appService.selectedPendingApprovalRecord.approvalId,
                purchaseOrderId: this._appService.selectedPendingApprovalRecord.purchaseOrderId,
                invoiceId: this._appService.selectedPendingApprovalRecord.invoiceId,
                poNumber: this._appService.selectedPendingApprovalRecord.poNumber,
                poDeptId: this._appService.selectedPendingApprovalRecord.departmentId,
                approvalLevel: this._appService.selectedPendingApprovalRecord.approvalLevel
            };
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
            this.initDetails = await this._invoiceApprovalsService.getInvoiceApprovalInitData(req);

            if (this.initDetails) {
                this.uploaderRemarks = (this.initDetails.invoiceDetails) ? this.initDetails.invoiceDetails.remarks : "";

                this.prepareInvoiceFileTypes();

                this.itemsList = this.initDetails.itemsList.concat();
                let totalAmt: number = 0;
                for (let i = 0; i < this.itemsList.length; i++) {
                    //this.itemsList[i].unitsTotalAmount = (this.itemsList[i].unitPrice && this.itemsList[i].invoiceUnits) ? +this.itemsList[i].unitPrice * +this.itemsList[i].invoiceUnits : null;
                    this.itemsList[i].unitsTotalAmount = (this.itemsList[i].totalAmt) ? +this.itemsList[i].totalAmt : null;
                    if (this.itemsList[i].unitsTotalAmount && this.itemsList[i].unitsTotalAmount > 0) {
                        totalAmt = totalAmt + this.itemsList[i].unitsTotalAmount;
                    }
                }
                this.totalAmount = totalAmt.toFixed(3);

                this.grnSesList = this.initDetails.grnSesList;

                // if(this.grnSesList && this.grnSesList.length > 0) {
                //     this.selectedGrnSesNumber = this.grnSesList[0].grnSesNumber;
                // }

                if (this.initDetails.invoiceDetails) {
                    this.selectedGrnSesNumber = this.initDetails.invoiceDetails.grnSesNumber;
                }

                this.isGrnSesVisible = false;
                if (globalConstant.userDetails.isFunctionalHead || globalConstant.userDetails.isFinance) {
                    if (this._appService.selectedPendingApprovalRecord.documentType == 'ZHR') {
                        if (globalConstant.userDetails.isFinance) {
                            this.isGrnSesVisible = true;
                        }
                    }
                    else {
                        this.isGrnSesVisible = true;
                    }
                }

                this.updateStatusFlow();
            
                this.invoiceFilesList = this.initDetails.invoiceFilesList;
                this.supportFilesList = this.initDetails.supportFilesList;
                this.rectifiedFilesList = this.initDetails.rectifiedFilesList;

                this.updateGrnSesItemsDisplayData();
            }

            if (this.isPOInvoice) {
                if (this.initDetails.poDetails.accountAssignmenCategory == '4' &&
                    (this.initDetails.poDetails.documentType == 'ZFO' || this.initDetails.poDetails.documentType == 'ZHR')) {

                    this.isFromToMandatory = true;
                    this.headerArr = this.poHeaderArr.concat();
                }
                else {
                    this.isFromToMandatory = false;
                    this.headerArr = this.poHeaderArrWithoutDates.concat();
                }
            }
            else {
                this.headerArr = this.nonPOHeaderArr.concat();
            }

            this.isOnHold = false;
            this.isOnRectified = false;
            if (this.initDetails.approvalsList && this.initDetails.approvalsList.length > 0) {
                if (globalConstant.userDetails.isSubContractReceiver ||
                    (globalConstant.userDetails.isPurchaseOwner && this.initDetails.approvalsList && this.initDetails.approvalsList.length > 0)) {
                    let onHoldRecs: InvoiceApprovalModel[] = this.initDetails.approvalsList.filter(rec => rec.statusCode == this._appService.updateOperations.onhold);
                    if (onHoldRecs && onHoldRecs.length > 0) {
                        //this.rejectedRemarks =  onHoldRecs[0].remarks;
                        this.isOnHold = true;
                    }
                }

                let onRectifiedRecs: InvoiceApprovalModel[] = this.initDetails.approvalsList.filter(rec => rec.statusCode == this._appService.updateOperations.rectified);
                if (onRectifiedRecs && onRectifiedRecs.length > 0) {
                    this.isOnRectified = true;
                }
            }
            this.updateCountryFLow();

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

            this.isChatBtnVisible = false;
            if (this.initDetails.communicationMsgsList && this.initDetails.communicationMsgsList.length > 0) {
                this.isChatBtnVisible = true;
                this.onCommunicationClick();
            }

            if (this.initDetails.msme == "Yes") {
                this.displayMSMEData("Vendor is MSME registered");
            }
        }
    }

    updateGrnSesItemsDisplayData() {
        this.grnSesItemsDisplayList = [];
        if (this.initDetails.grnSesItemsList && this.initDetails.grnSesItemsList.length > 0) {

            let grnSesList = _.pluck(this.initDetails.grnSesItemsList, 'grnSesNumber');
            let uniqGrnSesList = _.uniq(grnSesList);
            //for(let gs in uniqGrnSesList) {
            for (let i = 0; i < uniqGrnSesList.length; i++) {
                let sslGrsSesItems: GrnSesItemModel[] = this.initDetails.grnSesItemsList.filter(x => x.grnSesNumber == uniqGrnSesList[i]);
                let gsDisplayModel: GrnSesDisplayModel = {
                    grnSesNumber: uniqGrnSesList[i],
                    itemsList: sslGrsSesItems
                };
                this.grnSesItemsDisplayList.push(gsDisplayModel);
            }
        }
    }

    updateStatusFlow() {
        this.isPOCompleted = false;
        this.isFunctionalHeadCompleted = false;
        this.isGrnDdlVisible = true;
        if (this.initDetails.approvalDetails) {
            if (this.initDetails.approvalDetails.approvalLevel == this._appService.approvalLevels.functionalHead) {
                this.isPOCompleted = true;
                this.isGrnDdlVisible = false;
            }
            else if (this.initDetails.approvalDetails.approvalLevel == this._appService.approvalLevels.finance) {
                this.isPOCompleted = true;
                this.isFunctionalHeadCompleted = true;
                this.isGrnDdlVisible = false;
            }
        }
    }

    onHoldClick() {
        this.updateInvoiceApprovals(this._appService.updateOperations.onhold, "Are you sure you want to Send back?");
    }

    onRectifyClick() {
        this.updateInvoiceApprovals(this._appService.updateOperations.rectified, "");
    }

    onApproveClick() {
        this.updateInvoiceApprovals(this._appService.updateOperations.approve, "");
    }

    onRejectClick() {
        this.updateInvoiceApprovals(this._appService.updateOperations.reject, "Are you sure you want to Reject?");
    }

    onCommunicationClick() {
        const dialogRef = this._dialog.open(InvoiceCommunicationDialogComponent, {
            disableClose: true,
            panelClass: 'dialog-box',
            width: '400px',
            height: '300px',
            position: {
                top: '100px',
                right: '20px'
            },
            data: <InvoiceCommunicationDisplayModel>{
                purchaseOrderId: this._appService.selectedPendingApprovalRecord.purchaseOrderId,
                invoiceId: this._appService.selectedPendingApprovalRecord.invoiceId,
                msgsList: this.initDetails.communicationMsgsList
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {

            }
        });
    }

    updateInvoiceApprovals(action: string, msg: string) {
        this.remarksErrMsg = "";
        this.grnSesErrMsg = "";
        this.uploaderRemarksErrMsg = "";
        let isRemarksValid: boolean = true;
        let isUploaderRemarksValid: boolean = true;

        if (!this.remarks || this.remarks.trim().length == 0) {
            this.remarksErrMsg = "Please provide Remarks";
            isRemarksValid = false;
        }

        if (!this.uploaderRemarks || this.uploaderRemarks.trim().length == 0) {
            this.uploaderRemarksErrMsg = "Please provide Remarks";
            isUploaderRemarksValid = false;
        }

        // let approveSuccessMsg: string = (action == this._appService.updateOperations.approve) ? "Approved." : "Rejected.";
        // let approveFailureMsg: string = (action == this._appService.updateOperations.approve) ? "Approval is failed." : "Reject is failed.";
        // if(globalConstant.userDetails.isPurchaseOwner) {
        //     approveSuccessMsg = (action == this._appService.updateOperations.approve) ? "Recieved." : "Rejected.";
        //     approveFailureMsg = (action == this._appService.updateOperations.approve) ? "Receiving is failed." : "Reject is failed.";
        // }
        // else {
        //     if(globalConstant.userDetails.isFunctionalHead && this._appService.selectedPendingApprovalRecord.documentType == 'ZHR') {
        //         approveSuccessMsg = (action == this._appService.updateOperations.approve) ? "Recieved." : "Rejected.";
        //         approveFailureMsg = (action == this._appService.updateOperations.approve) ? "Receiving is failed." : "Reject is failed.";
        //     }
        // }

        let isGrnSesValid: boolean = true;
        if (this.isGrnSesRequired && action == this._appService.updateOperations.approve && (globalConstant.userDetails.isFunctionalHead || globalConstant.userDetails.isFinance)) {

            if (this._appService.selectedPendingApprovalRecord.documentType == 'ZHR') {
                if (globalConstant.userDetails.isFinance) {
                    if (!this.selectedGrnSesNumber) {
                        isGrnSesValid = false;
                        this.grnSesErrMsg = "GRN/SES No. is not available.";
                    }
                }
            }
            else {
                if (!this.selectedGrnSesNumber) {
                    isGrnSesValid = false;
                    this.grnSesErrMsg = "GRN/SES No. is not available.";
                }
            }
        }

        // if(action == this._appService.updateOperations.approve && this.isGrnSesRequired && this.isGrnDdlVisible) {
        //     if(!this.selectedGrnSesNumber) {
        //         this.grnSesErrMsg = "Please select GRN/SES No.";
        //         isGrnSesValid = false;
        //     }
        //     else {
        //         if(this.selectedGrnSesModel && this.selectedGrnSesModel.itemsList) {
        //             if(this.selectedGrnSesModel.itemsList.length == this.itemsList.length) {
        //                 for(let i = 0; i < this.selectedGrnSesModel.itemsList.length; i++) {
        //                     let selActualItem: GrnSesItemsDisplayModel = this.selectedGrnSesModel.itemsList[i];
        //                     let existItem = this.itemsList.find(si => si.itemNumber == selActualItem.itemNo && si.invoiceUnits == selActualItem.grnSesUnits);
        //                     if(!existItem) {
        //                         this.grnSesErrMsg = "Items are not matched.";
        //                         isGrnSesValid = false;
        //                         break;
        //                     }
        //                 }
        //             }
        //             else {
        //                 this.grnSesErrMsg = "Items are not matched.";
        //                 isGrnSesValid = false;
        //             }
        //         }
        //     }
        // }



        if (isRemarksValid && isGrnSesValid && isUploaderRemarksValid) {
            if (action == this._appService.updateOperations.reject || action == this._appService.updateOperations.onhold) {
                const dialogRef = this._dialog.open(ConfirmDialogComponent, {
                    disableClose: true,
                    panelClass: 'dialog-box',
                    width: '550px',
                    data: <MessageDialogModel>{
                        title: "Invoice Action",
                        message: msg
                    }
                });

                dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                        this.updateInvoiceApprovalDetails(action);
                    }
                });
            }
            else {
                this.updateInvoiceApprovalDetails(action);
            }
        }
    }

    updateInvoiceApprovalDetails(action: string) {
        let apprLevel: string = this.initDetails.approvalDetails.approvalLevel;
        if (this.isOnHold) {
            if (globalConstant.userDetails.isSubContractReceiver) {
                apprLevel = this._appService.approvalLevels.subContractReceiver;
            }
            else {
                apprLevel = this._appService.approvalLevels.po;
            }
        }

        let req: UpdateInvoiceApprovalReqModel = {
            action: action,
            isOnHold: this.isOnHold,
            departmentHeadId: globalConstant.userDetails.departmentHead,
            grnSesNumber: (this.selectedGrnSesNumber) ? this.selectedGrnSesNumber : null,
            approvalDetails: {
                invoiceApprovalId: this.initDetails.approvalDetails.invoiceApprovalId,
                purchaseOrderId: this.initDetails.approvalDetails.purchaseOrderId,
                invoiceId: this.initDetails.approvalDetails.invoiceId,
                departmentId: this.initDetails.approvalDetails.departmentId,
                projectId: this.initDetails.approvalDetails.projectId,
                statusCode: null,
                approverId: globalConstant.userDetails.userId,
                approvalLevel: apprLevel,
                remarks: this.remarks,
                uploaderRemarks: this.uploaderRemarks,
                approvedDate: this.initDetails.approvalDetails.approvedDate ? this.initDetails.approvalDetails.approvedDate : null,
                onholdDate: this.initDetails.approvalDetails.onholdDate ? this.initDetails.approvalDetails.onholdDate : null,
                rectifiedDate: this.initDetails.approvalDetails.rectifiedDate ? this.initDetails.approvalDetails.rectifiedDate : null,
                createdBy: this.initDetails.approvalDetails.createdBy,
                createdDate: this.initDetails.approvalDetails.createdDate,
                updatedBy: null,
                updatedDate: null,
                approverName: globalConstant.userDetails.userName,
                invoiceUploadedBy: null
            },
            itemsList: this.itemsList
        };

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
        this._invoiceApprovalsService.updateInvoiceApprovalDetails(req)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                if (response.body) {
                    let result: StatusModel = response.body as StatusModel;
                    if (result.status == 200 && result.isSuccess) {
                        //this.msg = "Invoice approval is success";
                        this.displayInvoiceApprovalStatus(result.message, true);
                    }
                    else {
                        //this.msg = this._appService.messages.vendorApprovalFailure;
                        this.displayInvoiceApprovalStatus(result.message, false);
                    }
                }
            },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    //this.msg = this._appService.messages.vendorApprovalFailure;
                    this.displayInvoiceApprovalStatus("Failed", false);
                    console.log(error);
                });
    }

    displayInvoiceApprovalStatus(msg: string, status: boolean) {
        const dialogRef = this._dialog.open(MessageDialogComponent, {
            disableClose: true,
            panelClass: 'dialog-box',
            width: '550px',
            data: <MessageDialogModel>{
                title: "Invoice Approval Action",
                message: msg
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && status) {
                this._router.navigate([this._appService.routingConstants.invoiceSearch]);
            }
        });
    }

    downloadFile(fileDetails: FileDetailsModel) {
        this._appService.downloadInvoiceFile(fileDetails);
    }

    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.isDashboardCollapsed = true;

        if (globalConstant.userDetails.isPurchaseOwner) {
            this.approveBtnTxt = "Recieved";
        }
        else {
            this.approveBtnTxt = "Approve";
        }

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        setTimeout(() => {
            this.loadInitData();
        }, 100);

    }
}
