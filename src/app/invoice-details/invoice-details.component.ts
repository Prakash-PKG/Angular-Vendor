import { InvoiceModel, BusyDataModel, InvoiceDetailsRequestModel, InvoiceDetailsResultModel, 
    ItemDisplayModel, FileDetailsModel, InvoiceApprovalModel, ApprovalLevelsModel } from './../models/data-models';
import { AppService } from './../app.service';
import { InvoiceDetailsService } from './invoice-details.service';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';

@Component({
    selector: 'app-invoice-details',
    templateUrl: './invoice-details.component.html',
    styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailsComponent implements OnInit {
    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    statusHeaderArr: string[] = ['Level', 'Status', 'Approved Date', 'Remarks'];
    headerArr: string[] = ['Item No.', 'Item Desc', "HSN/SAC", 'Order Qty', 'Supplied Qty', 'Balance Qty', 
                            'Invoive Qty', 'Currency', 'Rate', 'Amount'];

    invoiceDetails: InvoiceModel = null;
    currency: string = "";

    _initDetails: InvoiceDetailsResultModel = null;
    itemsList: ItemDisplayModel[] = [];
    totalAmount: number = 0;

    invoiceFilesList: FileDetailsModel[] = [];
    supportFilesList: FileDetailsModel[] = [];

    approvalLevelList: ApprovalLevelsModel[] = [];

    uploadLevel: ApprovalLevelsModel = null;
    poLevel: ApprovalLevelsModel = null;
    fhLevel: ApprovalLevelsModel = null;
    financeLevel: ApprovalLevelsModel = null;

    constructor(private _homeService: HomeService,
                private _invoiceDetailsService: InvoiceDetailsService,
                private _appService: AppService) { }

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

        this.uploadLevel = null;
        this.poLevel = null;
        this.fhLevel = null;
        this.financeLevel = null;

        if(this.invoiceDetails && this.invoiceDetails.invoiceId) {
            this.currency = this.invoiceDetails.currencyType;
            
            let req: InvoiceDetailsRequestModel = {
                purchaseOrderId: this.invoiceDetails.purchaseOrderId,
                invoiceId: this.invoiceDetails.invoiceId
            };

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
            this._initDetails = await this._invoiceDetailsService.getInvoiceDetails(req);
            if(this._initDetails) {
                this.itemsList = this._initDetails.itemsList.concat();
                this.totalAmount = 0;
                for(let i = 0; i < this.itemsList.length; i++) {
                    this.itemsList[i].unitsTotalAmount = (this.itemsList[i].unitPrice && this.itemsList[i].invoiceUnits) ? +this.itemsList[i].unitPrice * +this.itemsList[i].invoiceUnits : null;
                    if(this.itemsList[i].unitsTotalAmount && this.itemsList[i].unitsTotalAmount > 0) {
                        this.totalAmount = this.totalAmount + this.itemsList[i].unitsTotalAmount;
                    }
                }

                this.invoiceFilesList = this._initDetails.invoiceFilesList;
                this.supportFilesList = this._initDetails.supportFilesList;

                this.approvalLevelList = [];
                let poApprovalModel: InvoiceApprovalModel = this._initDetails.approvalsList.find(a => a.approvalLevel == this._appService.approvalLevels.po);
                if(poApprovalModel != null) {
                    this.uploadLevel = {
                        levelName: "Vendor/PO",
                        status: "Submitted",
                        date: this._appService.getFormattedDate(poApprovalModel.createdDate),
                        remarks: this.invoiceDetails.remarks
                    };
                    this.approvalLevelList.push(this.uploadLevel);

                    this.poLevel = {
                        levelName: "PO",
                        status: this._appService.statusNames[poApprovalModel.statusCode],
                        date: (poApprovalModel.statusCode == this._appService.statusCodes.approved || poApprovalModel.statusCode == this._appService.statusCodes.rejected) ? this._appService.getFormattedDate(poApprovalModel.updatedDate) : "",
                        remarks: poApprovalModel.remarks
                    };
                    this.approvalLevelList.push(this.poLevel);
                }

                let functionalHeadApprovalModel: InvoiceApprovalModel = this._initDetails.approvalsList.find(a => a.approvalLevel == this._appService.approvalLevels.functionalHead);
                if(functionalHeadApprovalModel != null) {
                    this.fhLevel = {
                        levelName: "Functional Head",
                        status: this._appService.statusNames[functionalHeadApprovalModel.statusCode],
                        date: (functionalHeadApprovalModel.statusCode == this._appService.statusCodes.approved || functionalHeadApprovalModel.statusCode == this._appService.statusCodes.rejected) ? this._appService.getFormattedDate(functionalHeadApprovalModel.updatedDate) : "",
                        remarks: poApprovalModel.remarks
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
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
        }
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

        this.invoiceDetails = this._appService.selectedInvoice;

        setTimeout(() => {
           this.loadInitData();
        }, 100);
    }

}
