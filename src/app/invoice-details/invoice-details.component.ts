import { InvoiceModel, BusyDataModel, InvoiceDetailsRequestModel, InvoiceDetailsResultModel, 
    ItemDisplayModel, FileDetailsModel, InvoiceApprovalModel, ApprovalLevelsModel, paymentStatusModel, 
    PaymentStatusDetailsModel } from './../models/data-models';
import { AppService } from './../app.service';
import { InvoiceDetailsService } from './invoice-details.service';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { Router } from '@angular/router';

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

    invoicePaymentDetails: PaymentStatusDetailsModel = null;

    isPOBasedInvoice: boolean = true;

    isForPayments: boolean = false;

    remarks: string = "";
    selectedPaymentStatus: string = "";
    paymentStatusList: paymentStatusModel[] = [];

    constructor(private _homeService: HomeService,
                private _router: Router,
                private _invoiceDetailsService: InvoiceDetailsService,
                private _appService: AppService) { }

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
        if(this.invoicePaymentDetails && this.invoicePaymentDetails.invoiceAmountPaid) {
            if(+this.invoicePaymentDetails.invoiceAmountPaid > 0 && this.invoicePaymentDetails.paymentDate) {
                return "Paid on " + this._appService.getFormattedDate(this.invoicePaymentDetails.paymentDate);
            }
        }

        return "";
    }

    getPaidAmount() {
        if(this.invoicePaymentDetails && this.invoicePaymentDetails.invoiceAmountPaid) {
            return this.invoicePaymentDetails.invoiceAmountPaid + " " + this.invoicePaymentDetails.currencyType;
        }

        return "";
    }

    getPaidDate() {
        if(this.invoicePaymentDetails && this.invoicePaymentDetails.paymentDate) {
            return this._appService.getFormattedDate(this.invoicePaymentDetails.paymentDate);
        }

        return "";
    }

    getPaidStatus() {
        if(this.invoicePaymentDetails && this.invoicePaymentDetails.status) {
            return this.invoicePaymentDetails.status;
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
                this.paymentStatusList = this._initDetails.paymentStatusList.concat();

                this.invoicePaymentDetails = this._initDetails.paymentStatusDetails;
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

                if(this.invoicePaymentDetails) {
                    let paymentLevel: ApprovalLevelsModel = {
                        levelName: "Payment",
                        status: this.getPaidStatus(),
                        date: this.getPaidDate(),
                        remarks: ""
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
