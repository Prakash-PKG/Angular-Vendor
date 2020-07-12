import { MessageDialogModel } from './../models/popup-models';
import { MessageDialogComponent } from './../message-dialog/message-dialog.component';
import { globalConstant } from './../common/global-constant';
import { InvoiceModel, BusyDataModel, InvoiceDetailsRequestModel, InvoiceDetailsResultModel, 
    ItemDisplayModel, FileDetailsModel, InvoiceApprovalModel, ApprovalLevelsModel, paymentStatusModel, 
    PaymentStatusDetailsModel, PaymentReqModel, StatusModel, PaymentDetailsModel } from './../models/data-models';
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

    statusHeaderArr: string[] = ['Stages', 'Status', 'Action Date', 'Remarks'];
    headerArr: string[] = [];

    poInvHeaderArr: string[] = ['Item No.', 'Item Desc', "UOM", "HSN/SAC", 'Order Units', 'Supplied Units', 'Balance Units', 
                            'Invoice Units', 'Currency', 'Rate', 'Amount'];

    nonPoInvHeaderArr: string[] = ['Item No.', 'Item Desc', "HSN/SAC", 'Invoice Units', 'Currency', 'Rate', 'Amount'];

    invoiceDetails: InvoiceModel = null;
    currency: string = "";

    _initDetails: InvoiceDetailsResultModel = null;
    itemsList: ItemDisplayModel[] = [];
    totalAmount: string = "0.000";

    invoiceFilesList: FileDetailsModel[] = [];
    supportFilesList: FileDetailsModel[] = [];

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

    constructor(private _homeService: HomeService,
                private _router: Router,
                public _dialog: MatDialog,
                private _invoiceDetailsService: InvoiceDetailsService,
                private _appService: AppService) { }

    onAmountPaidBlur() {
        let amountPaidVal: any = this.amountPaid;
        if(amountPaidVal && !isNaN(amountPaidVal)) {
            let amtPaid = Number(amountPaidVal).toFixed(3);
            this.amountPaid = amtPaid;
        }
        else {
            this.amountPaid = null;
        }
    }

    onUpdatePaymentStatusClick() {
        if(this.invoiceDetails) {
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

    onRemarksBlur() {
        if(this.remarks) {
            this.remarks = this.remarks.trim();
        }
    }

    onBackBtnClick() {
        this._appService.isInvoiceSearchForPayments = this.isForPayments;
        this._router.navigate([this._appService.routingConstants.invoiceSearch]);
    }

    getPaymentStatusDetails() {
        if(this.invoicePaymentDetails && this.invoicePaymentDetails.amountPaid) {
            // if(+this.invoicePaymentDetails.amountPaid > 0 && this.invoicePaymentDetails.paymentDate) {
            //     return this.invoicePaymentDetails.statusDesc + " on " + this._appService.getFormattedDate(this.invoicePaymentDetails.paymentDate);
            // }

            return this.invoicePaymentDetails.statusDesc;
        }

        return "";
    }

    getPaidAmount() {
        if(this.invoicePaymentDetails && this.invoicePaymentDetails.amountPaid) {
            return this.invoicePaymentDetails.amountPaid + " " + this.currency;
        }

        return "";
    }

    getPaidDate() {
        // if(this.invoicePaymentDetails && this.invoicePaymentDetails.paymentDate) {
        //     return this._appService.getFormattedDate(this.invoicePaymentDetails.paymentDate);
        // }

        return "";
    }

    getRemarks() {
        if(this.invoicePaymentDetails && this.invoicePaymentDetails.remarks) {
            return this.invoicePaymentDetails.remarks;
        }

        return "";
    }

    getPaidStatus() {
        if(this.invoicePaymentDetails && this.invoicePaymentDetails.statusDesc) {
            return this.invoicePaymentDetails.statusDesc;
        }

        return "";
    }

    getStatusDetails(level: ApprovalLevelsModel) {
        if(level && ( level.status == this._appService.statusNames.approved || level.status == this._appService.statusNames.rejected)) {
            return level.status + " on " + level.date;
        }

        return "";
    }

    downloadFile(fileDetails: FileDetailsModel) {
        this._appService.downloadInvoiceFile(fileDetails);
    }

    getFormattedDate(dtStr: string) {
        if(dtStr) {
            return this._appService.getFormattedDate(dtStr);
        }
        
        return "";
    }

    async loadInitData() {
        this.paymentStatusList = [];

        this.isPOBasedInvoice = true;
        this.headerArr = [];
        this.totalAmount = "0.000";

        this.uploadLevel = null;
        this.poLevel = null;
        this.fhLevel = null;
        this.financeLevel = null;

        if(this.invoiceDetails && this.invoiceDetails.invoiceId) {
            this.currency = this.invoiceDetails.currencyType;
            
            let req: InvoiceDetailsRequestModel = {
                purchaseOrderId: this.invoiceDetails.purchaseOrderId,
                invoiceId: this.invoiceDetails.invoiceId,
                poNumber: this.invoiceDetails.poNumber,
                invoiceNumber: this.invoiceDetails.invoiceNumber,
                vendorId: this.invoiceDetails.vendorId,
                isForPayment: this.isForPayments
            };

            if(!this.invoiceDetails.purchaseOrderId) {
                this.isPOBasedInvoice = false;
                this.headerArr = this.nonPoInvHeaderArr.concat();
            }
            else {
                this.headerArr = this.poInvHeaderArr.concat();
            }

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
            this._initDetails = await this._invoiceDetailsService.getInvoiceDetails(req);
            if(this._initDetails) {
                this.invoicePaymentDetails = this._initDetails.paymentDetails;
                
                if(this._initDetails.paymentStatusList && this._initDetails.paymentStatusList.length > 0) {
                    this.paymentStatusList = this._initDetails.paymentStatusList.concat();
                }

                this.invoicePaymentStatusDetails = this._initDetails.paymentStatusDetails;
                this.itemsList = (this._initDetails.itemsList && this._initDetails.itemsList.length > 0) ? this._initDetails.itemsList.concat() : [];
                let totalAmt: number = 0;
                for(let i = 0; i < this.itemsList.length; i++) {
                    //this.itemsList[i].unitsTotalAmount = (this.itemsList[i].unitPrice && this.itemsList[i].invoiceUnits) ? +this.itemsList[i].unitPrice * +this.itemsList[i].invoiceUnits : null;
                    this.itemsList[i].unitsTotalAmount = (this.itemsList[i].totalAmt) ? +this.itemsList[i].totalAmt : null;
                    if(this.itemsList[i].unitsTotalAmount && this.itemsList[i].unitsTotalAmount > 0) {
                        totalAmt = totalAmt + this.itemsList[i].unitsTotalAmount;
                    }
                }
                this.totalAmount = totalAmt.toFixed(3);

                this.invoiceFilesList = this._initDetails.invoiceFilesList;
                this.supportFilesList = this._initDetails.supportFilesList;

                if(this._initDetails.approvalsList && this._initDetails.approvalsList.length > 0) {
                    this.approvalLevelList = [];
                    let poApprovalModel: InvoiceApprovalModel = this._initDetails.approvalsList.find(a => a.approvalLevel == this._appService.approvalLevels.po);
                    if(poApprovalModel != null) {
                        this.uploadLevel = {
                            levelName: "Upload",
                            status: "Submitted",
                            date: this._appService.getFormattedDate(poApprovalModel.createdDate),
                            remarks: this.invoiceDetails.remarks
                        };
                        this.approvalLevelList.push(this.uploadLevel);

                        this.poLevel = {
                            levelName: "Buyer",
                            status: this._appService.statusNames[poApprovalModel.statusCode],
                            date: (poApprovalModel.statusCode == this._appService.statusCodes.approved || poApprovalModel.statusCode == this._appService.statusCodes.rejected) ? this._appService.getFormattedDate(poApprovalModel.updatedDate) : "",
                            remarks: poApprovalModel.remarks
                        };
                        this.approvalLevelList.push(this.poLevel);
                    }

                    let functionalHeadApprovalModel: InvoiceApprovalModel = this._initDetails.approvalsList.find(a => a.approvalLevel == this._appService.approvalLevels.functionalHead);
                    if(functionalHeadApprovalModel != null) {
                        this.fhLevel = {
                            levelName: "Business Head",
                            status: this._appService.statusNames[functionalHeadApprovalModel.statusCode],
                            date: (functionalHeadApprovalModel.statusCode == this._appService.statusCodes.approved || functionalHeadApprovalModel.statusCode == this._appService.statusCodes.rejected) ? this._appService.getFormattedDate(functionalHeadApprovalModel.updatedDate) : "",
                            remarks: functionalHeadApprovalModel.remarks
                        };
                        this.approvalLevelList.push(this.fhLevel);
                    }
                    
                    let financeApprovalModel: InvoiceApprovalModel = this._initDetails.approvalsList.find(a => a.approvalLevel == this._appService.approvalLevels.finance);
                    if(financeApprovalModel != null) {
                        this.financeLevel = {
                            levelName: "Finance",
                            status: this._appService.statusNames[financeApprovalModel.statusCode],
                            date: (financeApprovalModel.statusCode == this._appService.statusCodes.approved || financeApprovalModel.statusCode == this._appService.statusCodes.rejected) ? this._appService.getFormattedDate(functionalHeadApprovalModel.updatedDate) : "",
                            remarks: financeApprovalModel.remarks
                        };
                        this.approvalLevelList.push(this.financeLevel);
                    }
                }

                if(this.invoicePaymentDetails) {
                    this.amountPaid = this.invoicePaymentDetails.amountPaid;
                    this.remarks = this.invoicePaymentDetails.remarks;
                    this.selectedPaymentStatus = this.invoicePaymentDetails.statusCode;

                    let paymentLevel: ApprovalLevelsModel = {
                        levelName: "Payment",
                        status: this.getPaidStatus(),
                        date: this.getPaidDate(),
                        remarks: this.getRemarks()
                    };
                    
                    this.approvalLevelList.push(paymentLevel);
                }
            }
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
        }
    }

    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
    }

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
