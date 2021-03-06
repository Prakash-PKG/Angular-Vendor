import { InvoiceSearchService } from './../invoice-search/invoice-search.service';
import { MessageDialogModel } from './../models/popup-models';
import { MessageDialogComponent } from './../message-dialog/message-dialog.component';
import { globalConstant, countryCompanyCodes } from './../common/global-constant';
import {
    InvoiceModel, BusyDataModel, InvoiceDetailsRequestModel, InvoiceDetailsResultModel,
    ItemDisplayModel, FileDetailsModel, InvoiceApprovalModel, ApprovalLevelsModel, paymentStatusModel,
    PaymentStatusDetailsModel, PaymentReqModel, StatusModel, PaymentDetailsModel, VoucherReqModel,
    EmployeeDetailsModel
} from './../models/data-models';
import { AppService } from './../app.service';
import { InvoiceDetailsService } from './invoice-details.service';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { Router } from '@angular/router';
import { MatSort, MatPaginator, MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

@Component({
    selector: 'app-invoice-details',
    templateUrl: './invoice-details.component.html',
    styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailsComponent implements OnInit {
    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    statusHeaderArr: string[] = ['Stages', 'Status', 'Action By', 'Action Date', 'Remarks'];
    headerArr: string[] = [];

    poInvHeaderArr: string[] = ['Item No.', 'Item Desc', "HSN/SAC", "From Date", "To Date", "Personnel Number", 'Order Units', "UOM", 'Inv Units', 'Curr', 'Rate', 'Amount'];

    poInvHeaderArrWithoutDates: string[] = ['Item No.', 'Item Desc', "HSN/SAC", 'Order Units', "UOM", 'Inv Units', 'Curr', 'Rate', 'Amount'];

    nonPoInvHeaderArr: string[] = ['Item No.', 'Item Desc', "HSN/SAC", 'Inv Units', 'Curr', 'Rate', 'Amount'];

    invoiceDetails: InvoiceModel = null;
    currency: string = "";

    _initDetails: InvoiceDetailsResultModel = null;
    itemsList: ItemDisplayModel[] = [];
    totalAmount: string = "0.000";

    invoiceFilesList: FileDetailsModel[] = [];
    supportFilesList: FileDetailsModel[] = [];
    rectifiedFilesList: FileDetailsModel[] = [];

    approvalLevelList: ApprovalLevelsModel[] = [];

    uploadLevel: ApprovalLevelsModel = null;
    poLevel: ApprovalLevelsModel = null;
    fhLevel: ApprovalLevelsModel = null;
    financeLevel: ApprovalLevelsModel = null;

    invoicePaymentStatusDetails: PaymentStatusDetailsModel = null;
    invoicePaymentDetails: PaymentDetailsModel = null;

    isPOBasedInvoice: boolean = true;

    isForPayments: boolean = false;

    remarks: string = "";
    selectedPaymentStatus: string = "";
    paymentStatusList: paymentStatusModel[] = [];

    amountPaid: string = "";

    amountPaidErrMsg: string = "";
    paymentStatusErrMsg: string = "";
    remarksErrMsg: string = "";

    remarksList: string[] = [];

    isFromToMandatory: boolean = false;

    isSesSubContractPO: boolean = false;

    isPrintVoucherVisible: boolean = false;

    indiaWorkflow: boolean = false;
    usWorkflow: boolean = false;

    isHSNVisible: boolean = false;
    isTCSAmtVisible: boolean = false;
    isRegionFieldsVisible: boolean = false;

    constructor(private _homeService: HomeService,
        private _router: Router,
        public _dialog: MatDialog,
        private _invoiceDetailsService: InvoiceDetailsService,
        private _invoiceSearchService: InvoiceSearchService,
        private _appService: AppService) { }

    // updates country flow details
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

    // fires on print voucher click
    onPrintVoucherClick() {
        let req: VoucherReqModel = {
            invoiceId: this.invoiceDetails.invoiceId
        };

        let fileName: string = this.invoiceDetails.invoiceNumber + ".pdf";
        this.downloadVoucher(req, fileName);
    }

    // downloads voucher
    downloadVoucher(req: VoucherReqModel, fileName: string) {
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._invoiceSearchService.getVoucherData(req).subscribe(
            (data) => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                const blob = new Blob([data.body], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);

                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = url;
                document.body.appendChild(iframe);
                iframe.contentWindow.print();
            },
            error => {
                console.log(error);
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
            });
    }

    // get project name
    getPOProjectName() {
        let projectName: string = "";
        if (this.invoiceDetails && this.invoiceDetails.projectName && this.invoiceDetails.projectId) {
            projectName = this.invoiceDetails.projectName + "( " + this.invoiceDetails.projectId + " )";
        }

        return projectName;
    }

    // on amount field value change 
    onAmountPaidBlur() {
        this.amountPaidErrMsg = "";
        let amountPaidVal: any = this.amountPaid;
        if (amountPaidVal && !isNaN(amountPaidVal)) {
            let amtPaid = Number(amountPaidVal).toFixed(3);
            this.amountPaid = amtPaid;
        }
        else {
            this.amountPaid = null;
        }
    }

    onPaymentStatusChange() {
        this.paymentStatusErrMsg = "";
    }

    // checks payment details valid or not
    isPaymentDetailsValid() {
        let isValid: boolean = true;

        this.amountPaidErrMsg = "";
        this.paymentStatusErrMsg = "";
        this.remarksErrMsg = "";

        if (!this.amountPaid) {
            this.amountPaidErrMsg = "Amount Paid is required.";
        }

        if (!this.selectedPaymentStatus) {
            this.paymentStatusErrMsg = "Payment Status is required.";
        }

        if (!this.remarks) {
            this.remarksErrMsg = "Remarks is required.";
        }

        if (!this.amountPaid || !this.selectedPaymentStatus || !this.remarks) {
            isValid = false;
        }

        if (isValid && this.selectedPaymentStatus == "paid") {
            if (+this.invoiceDetails.totalAmt != +this.amountPaid) {
                isValid = false;
                this.amountPaidErrMsg = "If Payment status is Paid, Payment Initiated(Incl Tax) must equal to Invoice Total Amount(Incl Tax).";
            }
        }

        return isValid;
    }

    // on update payment status click
    onUpdatePaymentStatusClick() {
        if (this.invoiceDetails && this.isPaymentDetailsValid()) {
            let req: PaymentReqModel = {
                paymentDetailsId: (this._initDetails.paymentDetails && this._initDetails.paymentDetails.paymentDetailsId) ? this._initDetails.paymentDetails.paymentDetailsId : null,
                purchaseOrderId: this.invoiceDetails.purchaseOrderId,
                invoiceId: this.invoiceDetails.invoiceId,
                poNumber: this.invoiceDetails.poNumber,
                invoiceNumber: this.invoiceDetails.invoiceNumber,
                amountPaid: this.amountPaid,
                remarks: this.remarks,
                statusCode: this.selectedPaymentStatus,
                statusDesc: null,
                createdBy: (this._initDetails.paymentDetails && this._initDetails.paymentDetails.createdBy) ? this._initDetails.paymentDetails.createdBy : null,
                createdDate: (this._initDetails.paymentDetails && this._initDetails.paymentDetails.createdDate) ? this._initDetails.paymentDetails.createdDate : null,
                updatedBy: globalConstant.userDetails.userId,
                updatedDate: null
            };

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
            this._invoiceDetailsService.updatePaymentStatusDetails(req)
                .subscribe(response => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                    if (response.body) {
                        let result: StatusModel = response.body as StatusModel;
                        if (result.status == 200 && result.isSuccess) {
                            this.displayPaymentUpdateStatus(result.message, true);
                        }
                        else {
                            this.displayPaymentUpdateStatus(result.message, false);
                        }
                    }
                },
                    (error) => {
                        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                        this.displayPaymentUpdateStatus(this._appService.messages.paymentStatusUpdateFailureMsg, false);
                        console.log(error);
                    });
        }
    }

    displayPaymentUpdateStatus(msg: string, status: boolean) {
        const dialogRef = this._dialog.open(MessageDialogComponent, {
            disableClose: true,
            panelClass: 'dialog-box',
            width: '550px',
            data: <MessageDialogModel>{
                title: "Payment Status Update Action",
                message: msg
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && status) {
                this._appService.isInvoiceSearchForPayments = true;
                this._router.navigate([this._appService.routingConstants.invoiceSearch]);
            }
        });
    }

    // on remarks field value change
    onRemarksBlur() {
        this.remarksErrMsg = "";
        if (this.remarks) {
            this.remarks = this.remarks.trim();
        }
    }

    // fires back button is triggerred
    onBackBtnClick() {
        this._appService.isInvoiceSearchForPayments = this.isForPayments;
        this._router.navigate([this._appService.routingConstants.invoiceSearch]);
    }

    // gets payment status details
    getPaymentStatusDetails() {
        if (this.invoicePaymentStatusDetails && this.invoicePaymentStatusDetails.status && this.invoicePaymentStatusDetails.paymentDate) {
            return this.invoicePaymentStatusDetails.status + " on " + this._appService.getFormattedDate(this.invoicePaymentStatusDetails.paymentDate);
        }

        return "";
    }

    // gets tcs amount
    getTDSAmount() {
        if (this.invoicePaymentStatusDetails && this.invoicePaymentStatusDetails.tdsAmt) {
            return this.invoicePaymentStatusDetails.tdsAmt + " " + this.currency;
        }

        return "";
    }

    // gets paid amount
    getPaidAmount() {
        if (this.invoicePaymentStatusDetails && this.invoicePaymentStatusDetails.invoiceAmountPaid) {
            return this.invoicePaymentStatusDetails.invoiceAmountPaid + " " + this.currency;
        }

        return "";
    }

    // gets paid date
    getPaidDate() {
        if (this.invoicePaymentStatusDetails && this.invoicePaymentStatusDetails.paymentDate) {
            return this._appService.getFormattedDate(this.invoicePaymentStatusDetails.paymentDate);
        }

        return "";
    }

    // gets remarks
    getRemarks() {
        if (this.invoicePaymentStatusDetails && this.invoicePaymentStatusDetails.remarks) {
            return this.invoicePaymentStatusDetails.remarks;
        }

        return "";
    }

    // updates remarks list
    updateRemarksList() {
        this.remarksList = [];
        if (this.invoicePaymentStatusDetails && this.invoicePaymentStatusDetails.remarks) {
            this.remarksList = this.invoicePaymentStatusDetails.remarks.split(",");
        }
    }

    // gets paid status
    getPaidStatus() {
        if (this.invoicePaymentStatusDetails && this.invoicePaymentStatusDetails.status) {
            return this.invoicePaymentStatusDetails.status;
        }

        return "";
    }

    // gets status
    getStatusDetails(level: ApprovalLevelsModel) {
        if (level && (level.status == this._appService.statusNames.approved || level.status == this._appService.statusNames.received || level.status == this._appService.statusNames.rejected)) {
            return level.status + " on " + level.date;
        }

        return "";
    }

    // gets plant details
    getPlant() {
        if (this.invoiceDetails) {
            return this.invoiceDetails.plantDescription + " ( " + this.invoiceDetails.plantCode + " )";
        }

        return "";
    }

    // on downloadd file click
    downloadFile(fileDetails: FileDetailsModel) {
        this._appService.downloadInvoiceFile(fileDetails);
    }

    // gets formatted date
    getFormattedDate(dtStr: string) {
        if (dtStr) {
            return this._appService.getFormattedDate(dtStr);
        }

        return "";
    }

    // gets delivery manager name
    getDeliveryManagerName(delMgrDetails: EmployeeDetailsModel) {
        if (delMgrDetails) {
            return delMgrDetails.firstName + " " + ((delMgrDetails.middleName) ? delMgrDetails.middleName + " " : "") + delMgrDetails.lastName + " (" + delMgrDetails.status + ")";
        }

        return "";
    }

    // loads initial data
    async loadInitData() {
        this.paymentStatusList = [];

        this.isPOBasedInvoice = true;
        this.headerArr = [];
        this.totalAmount = "0.000";

        this.uploadLevel = null;
        this.poLevel = null;
        this.fhLevel = null;
        this.financeLevel = null;

        this.isPrintVoucherVisible = false;

        this.indiaWorkflow = false;
        this.usWorkflow = false;

        if (this.invoiceDetails && this.invoiceDetails.invoiceId) {

            if (this.invoiceDetails.statusCode == 'approved-finance' && globalConstant.userDetails.isFinance) {
                this.isPrintVoucherVisible = true;
            }

            this.isSesSubContractPO = this.invoiceDetails.documentType == 'ZHR' ? true : false;

            this.currency = this.invoiceDetails.currencyType;

            if (!this.invoiceDetails.purchaseOrderId) {
                this.isPOBasedInvoice = false;
                this.headerArr = this.nonPoInvHeaderArr.concat();
            }
            else {
                if (this.invoiceDetails.accountAssignmenCategory == '4' &&
                    (this.invoiceDetails.documentType == 'ZFO' || this.invoiceDetails.documentType == 'ZHR')) {

                    this.isFromToMandatory = true;
                    this.headerArr = this.poInvHeaderArr.concat();
                }
                else {
                    this.isFromToMandatory = false;
                    this.headerArr = this.poInvHeaderArrWithoutDates.concat();
                }
            }

            let req: InvoiceDetailsRequestModel = {
                purchaseOrderId: this.invoiceDetails.purchaseOrderId,
                invoiceId: this.invoiceDetails.invoiceId,
                poNumber: this.invoiceDetails.poNumber,
                invoiceNumber: this.invoiceDetails.invoiceNumber,
                vendorId: this.invoiceDetails.vendorId,
                isForPayment: this.isForPayments
            };

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
            this._initDetails = await this._invoiceDetailsService.getInvoiceDetails(req);
            if (this._initDetails) {
                this.invoicePaymentDetails = this._initDetails.paymentDetails;

                if (this._initDetails.paymentStatusList && this._initDetails.paymentStatusList.length > 0) {
                    this.paymentStatusList = this._initDetails.paymentStatusList.concat();
                }

                this.invoicePaymentStatusDetails = this._initDetails.paymentStatusDetails;
                this.itemsList = (this._initDetails.itemsList && this._initDetails.itemsList.length > 0) ? this._initDetails.itemsList.concat() : [];

                if (countryCompanyCodes.usCompanyCodes.indexOf(this.invoiceDetails.companyCode) > -1) {
                    this.usWorkflow = true;

                }
                else {
                    this.indiaWorkflow = true;
                }

                let totalAmt: number = 0;
                for (let i = 0; i < this.itemsList.length; i++) {
                    this.itemsList[i].unitsTotalAmount = (this.itemsList[i].totalAmt) ? +this.itemsList[i].totalAmt : null;
                    if (this.itemsList[i].unitsTotalAmount && this.itemsList[i].unitsTotalAmount > 0) {
                        totalAmt = totalAmt + this.itemsList[i].unitsTotalAmount;
                    }
                }
                this.totalAmount = totalAmt.toFixed(3);

                this.invoiceFilesList = this._initDetails.invoiceFilesList;
                this.supportFilesList = this._initDetails.supportFilesList;
                this.rectifiedFilesList = this._initDetails.rectifiedFilesList;

                if (this._initDetails.approvalsList && this._initDetails.approvalsList.length > 0) {
                    this.approvalLevelList = [];

                    let poApprovalModel: InvoiceApprovalModel = this._initDetails.approvalsList.find(a => a.approvalLevel == this._appService.approvalLevels.po);
                    if (poApprovalModel != null) {
                        this.uploadLevel = {
                            levelName: "Upload",
                            status: "Submitted",
                            date: this._appService.getFormattedDate(poApprovalModel.createdDate),
                            remarks: this.invoiceDetails.remarks,
                            approverName: poApprovalModel.invoiceUploadedBy
                        };
                        this.approvalLevelList.push(this.uploadLevel);

                        if (this.isSesSubContractPO == false) {
                            let poStatusCode = (poApprovalModel.statusCode == 'approved') ? 'received' : poApprovalModel.statusCode;
                            this.poLevel = {
                                levelName: "Receiver",
                                status: this._appService.statusNames[poStatusCode],
                                date: (poApprovalModel.statusCode == this._appService.statusCodes.approved || poApprovalModel.statusCode == this._appService.statusCodes.rejected) ? this._appService.getFormattedDate(poApprovalModel.updatedDate) : "",
                                remarks: poApprovalModel.remarks,
                                approverName: poApprovalModel.approverName
                            };
                            this.approvalLevelList.push(this.poLevel);
                        }
                    }

                    let functionalHeadApprovalModel: InvoiceApprovalModel = this._initDetails.approvalsList.find(a => a.approvalLevel == this._appService.approvalLevels.functionalHead);
                    if (functionalHeadApprovalModel != null) {
                        let delMgrDetails: EmployeeDetailsModel = this._initDetails.delMgrDetails;
                        let apprName: string = (functionalHeadApprovalModel.approverName && functionalHeadApprovalModel.approverName.trim()) ? functionalHeadApprovalModel.approverName : this.getDeliveryManagerName(delMgrDetails);
                        this.fhLevel = {
                            levelName: "Business Head",
                            status: this._appService.statusNames[functionalHeadApprovalModel.statusCode],
                            date: (functionalHeadApprovalModel.statusCode == this._appService.statusCodes.approved || functionalHeadApprovalModel.statusCode == this._appService.statusCodes.rejected) ? this._appService.getFormattedDate(functionalHeadApprovalModel.updatedDate) : "",
                            remarks: functionalHeadApprovalModel.remarks,
                            approverName: apprName
                        };
                        this.approvalLevelList.push(this.fhLevel);
                    }

                    let financeApprovalModel: InvoiceApprovalModel = this._initDetails.approvalsList.find(a => a.approvalLevel == this._appService.approvalLevels.finance);
                    if (financeApprovalModel != null) {
                        this.financeLevel = {
                            levelName: "Finance",
                            status: this._appService.statusNames[financeApprovalModel.statusCode],
                            date: (financeApprovalModel.statusCode == this._appService.statusCodes.approved || financeApprovalModel.statusCode == this._appService.statusCodes.rejected) ? this._appService.getFormattedDate(functionalHeadApprovalModel.updatedDate) : "",
                            remarks: financeApprovalModel.remarks,
                            approverName: financeApprovalModel.approverName
                        };
                        this.approvalLevelList.push(this.financeLevel);
                    }
                }

                if (this.invoicePaymentStatusDetails) {

                    let paymentLevel: ApprovalLevelsModel = {
                        levelName: "Payment",
                        status: this.getPaidStatus(),
                        date: this.getPaidDate(),
                        remarks: this.getRemarks(),
                        approverName: null
                    };

                    this.approvalLevelList.push(paymentLevel);
                }

                this.updateRemarksList();

                this.updateCountryFLow();

            }

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
        }
    }

    // calls on destroy event
    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
    }

    // calls on page loadd event
    ngOnInit() {
        this.isForPayments = this._appService.isInvoiceDetailsForPayments;

        this._appService.isInvoiceDetailsForPayments = false;

        this._homeService.updateSidebarDetails(true);

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        this.invoiceDetails = this._appService.selectedInvoice;
    
        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }

}
