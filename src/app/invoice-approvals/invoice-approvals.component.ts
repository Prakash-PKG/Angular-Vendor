import { globalConstant } from './../common/global-constant';
import { AppService } from './../app.service';
import { BusyDataModel, InvoiceApprovalInitResultModel, InvoiceApprovalInitReqModel, ItemModel, GrnSesModel, 
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
    nonPOHeaderArr: string [] = ['Item No.', 'Item Desc', "HSN/SAC", 'Invoive Qty', 'Rate', 'Amount'];
    poHeaderArr: string[] = ['Item No.', 'Item Desc', "HSN/SAC", 'Order Qty', 'Supplied Qty', 'Balance Qty', 
                            'Invoive Qty', 'Currency', 'Rate', 'Amount'];

    initDetails: InvoiceApprovalInitResultModel = null;

    msg: string = "";

    remarks: string = "";

    isPOInvoice: boolean = false;

    isPOCompleted: boolean = false;
    isFunctionalHeadCompleted: boolean = false;
    //isFinanceCompleted: boolean = false;

    grnSesList: GrnSesModel[] = [];
    selectedGrnSesNumber: string = "";
    isGrnDdlVisible: boolean = true;

    constructor(private _homeService: HomeService,
                private _appService: AppService,
                private _invoiceApprovalsService: InvoiceApprovalsService) { }

    getUnitsAmt(item: ItemModel) {
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
            let req: InvoiceApprovalInitReqModel = {
                approvalId: this._appService.selectedPendingApprovalRecord.approvalId,
                purchaseOrderId: this._appService.selectedPendingApprovalRecord.purchaseOrderId,
                invoiceId: this._appService.selectedPendingApprovalRecord.invoiceId,
                poNumber: this._appService.selectedPendingApprovalRecord.poNumber,
                poDeptId: this._appService.selectedPendingApprovalRecord.departmentId,
                approvalLevel: this._appService.selectedPendingApprovalRecord.approvalLevel
            }
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
            this.initDetails = await this._invoiceApprovalsService.getInvoiceApprovalInitData(req);
            this.isPOInvoice = false;
            if(this.initDetails) {
                if(this.initDetails.poDetails && this.initDetails.poDetails.purchaseOrderId && this.initDetails.poDetails.poNumber) {
                    this.isPOInvoice = true;
                }

                this.grnSesList = this.initDetails.grnSesList;

                this.updateStatusFlow();
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
        let req: UpdateInvoiceApprovalReqModel = {
            action: action,
            departmentHeadId: globalConstant.userDetails.departmentHead,
            grnSesNumber: this.selectedGrnSesNumber,
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
                createdDate: this.initDetails.approvalDetails.createdDate
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
