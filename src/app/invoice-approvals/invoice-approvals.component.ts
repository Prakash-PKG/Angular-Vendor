import { globalConstant } from './../common/global-constant';
import { AppService } from './../app.service';
import { BusyDataModel, InvoiceApprovalInitResultModel, InvoiceApprovalInitReqModel, 
    ItemModel, ItemDisplayModel, GrnSesModel, FileDetailsModel, 
    StatusModel, UpdateInvoiceApprovalReqModel } from './../models/data-models';
import { InvoiceApprovalsService } from './invoice-approvals.service';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';

@Component({
    selector: 'app-invoice-approvals',
    templateUrl: './invoice-approvals.component.html',
    styleUrls: ['./invoice-approvals.component.scss']
})
export class InvoiceApprovalsComponent implements OnInit {
    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    headerArr: string[] = [];
    nonPOHeaderArr: string [] = ['Item No.', 'Item Desc', "HSN/SAC", 'Invoice Units', 'Rate', 'Amount'];
    poHeaderArr: string[] = ['Item No.', 'Item Desc', "UOM", "HSN/SAC", 'Order Units', 'Supplied Units', 'Balance Units', 
                            'Invoice Units', 'Currency', 'Rate', 'Amount'];

    initDetails: InvoiceApprovalInitResultModel = null;
    itemsList: ItemDisplayModel[] = [];
    totalAmount: number = 0;

    msg: string = "";

    remarks: string = "";

    isPOInvoice: boolean = false;

    isPOCompleted: boolean = false;
    isFunctionalHeadCompleted: boolean = false;
    //isFinanceCompleted: boolean = false;

    grnSesList: GrnSesModel[] = [];
    selectedGrnSesNumber: string = "";
    isGrnDdlVisible: boolean = true;

    invoiceFilesList: FileDetailsModel[] = [];
    supportFilesList: FileDetailsModel[] = [];

    grnSesAccountCategories: string[] = ["1", "3", "4"];
    isGrnSesRequired: boolean = false;

    remarksErrMsg: string = "";
    grnSesErrMsg: string = "";

    constructor(private _homeService: HomeService,
                private _appService: AppService,
                private _invoiceApprovalsService: InvoiceApprovalsService) { }

    getUnitsAmt(item: ItemDisplayModel) {
        let unitsAmt = (item.unitPrice && item.invoiceUnits) ? +item.unitPrice * +item.invoiceUnits : null;
        return unitsAmt;
    }

    getCurrencyType() {
        return this.initDetails.poDetails.currencyType;
    }

    getFormattedDate(dtStr: string) {
        if(dtStr) {
            return this._appService.getFormattedDate(dtStr);
        }
        
        return "";
    }

    async loadInitData() {
        if(this._appService.selectedPendingApprovalRecord) {

            this.isPOInvoice = false;
            if(this._appService.selectedPendingApprovalRecord.purchaseOrderId && this._appService.selectedPendingApprovalRecord.poNumber) {
                this.isPOInvoice = true;
            }

            this.isGrnSesRequired = false;
            if(this.grnSesAccountCategories.indexOf(this._appService.selectedPendingApprovalRecord.accountAssignmenCategory) > -1) {
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
            
            if(this.initDetails) {
                this.itemsList = this.initDetails.itemsList.concat();
                this.totalAmount = 0;
                for(let i = 0; i < this.itemsList.length; i++) {
                    //this.itemsList[i].unitsTotalAmount = (this.itemsList[i].unitPrice && this.itemsList[i].invoiceUnits) ? +this.itemsList[i].unitPrice * +this.itemsList[i].invoiceUnits : null;
                    this.itemsList[i].unitsTotalAmount = (this.itemsList[i].totalAmt) ? +this.itemsList[i].totalAmt : null;
                    if(this.itemsList[i].unitsTotalAmount && this.itemsList[i].unitsTotalAmount > 0) {
                        this.totalAmount = this.totalAmount + this.itemsList[i].unitsTotalAmount;
                    }
                }

                this.grnSesList = this.initDetails.grnSesList;

                this.updateStatusFlow();

                this.invoiceFilesList = this.initDetails.invoiceFilesList;
                this.supportFilesList = this.initDetails.supportFilesList;
            }

            if(this.isPOInvoice) {
                this.headerArr = this.poHeaderArr.concat();
            }
            else {
                this.headerArr = this.nonPOHeaderArr.concat();
            }

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
        }
    }

    updateStatusFlow() {
        this.isPOCompleted = false;
        this.isFunctionalHeadCompleted = false;
        this.isGrnDdlVisible = true;
        if(this.initDetails.approvalDetails) {
            if(this.initDetails.approvalDetails.approvalLevel == this._appService.approvalLevels.functionalHead) {
                this.isPOCompleted = true;
                this.isGrnDdlVisible = false;
            }
            else if(this.initDetails.approvalDetails.approvalLevel == this._appService.approvalLevels.finance) {
                this.isPOCompleted = true;
                this.isFunctionalHeadCompleted = true;
                this.isGrnDdlVisible = false;
            }
        }
    }

    onApproveClick() {
        this.updateInvoiceApprovals(this._appService.updateOperations.approve);
    }

    onRejectClick() {
        this.updateInvoiceApprovals(this._appService.updateOperations.reject);
    }

    updateInvoiceApprovals(action: string) {
        let isRemarksValid: boolean = true;
        if(!this.remarks || this.remarks.trim().length == 0) {
            this.remarksErrMsg = "Please provide Remarks";
            isRemarksValid = false;
        }

        let isGrnSesValid: boolean = true;
        if(this.isGrnSesRequired && this.isGrnDdlVisible) {
            if(!this.selectedGrnSesNumber) {
                this.grnSesErrMsg = "Please select GRN/SES No.";
                isGrnSesValid = false;
            }
        }
        
        if(isRemarksValid && isGrnSesValid) {
            let req: UpdateInvoiceApprovalReqModel = {
                action: action,
                departmentHeadId: globalConstant.userDetails.departmentHead,
                grnSesNumber: (this.isGrnSesRequired && this.isGrnDdlVisible) ? this.selectedGrnSesNumber : this.initDetails.invoiceDetails.grnSesNumber,
                approvalDetails: {
                    invoiceApprovalId: this.initDetails.approvalDetails.invoiceApprovalId,
                    purchaseOrderId: this.initDetails.approvalDetails.purchaseOrderId,
                    invoiceId: this.initDetails.approvalDetails.invoiceId,
                    departmentId: this.initDetails.approvalDetails.departmentId,
                    statusCode: null,
                    approverId: globalConstant.userDetails.userId,
                    approvalLevel: this.initDetails.approvalDetails.approvalLevel,
                    remarks: this.remarks,
                    createdBy: this.initDetails.approvalDetails.createdBy,
                    createdDate: this.initDetails.approvalDetails.createdDate,
                    updatedBy: null,
                    updatedDate: null
                }
            };

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
            this._invoiceApprovalsService.updateInvoiceApprovalDetails(req)
                .subscribe(response => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                    if (response.body) {
                        let result: StatusModel = response.body as StatusModel;
                        if (result.status == 200 && result.isSuccess) {
                            this.msg = "Invoice approval is success";
                        }
                        else {
                            this.msg = this._appService.messages.vendorApprovalFailure;
                        }
                    }
                },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    this.msg = this._appService.messages.vendorApprovalFailure;
                    console.log(error);
                });
        }
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

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }
}
