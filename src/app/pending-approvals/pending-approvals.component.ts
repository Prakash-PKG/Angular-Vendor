import { AppService } from './../app.service';
import { globalConstant } from './../common/global-constant';
import { BusyDataModel, PendingApprovalRequestModel, PendingApprovalResultModel, PendingApprovalsModel } from './../models/data-models';
import { PendingApprovalsService } from './pending-approvals.service';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { Router } from '@angular/router';
import * as _ from 'underscore';

@Component({
    selector: 'app-pending-approvals',
    templateUrl: './pending-approvals.component.html',
    styleUrls: ['./pending-approvals.component.scss']
})
export class PendingApprovalsComponent implements OnInit {

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;
    _pendingApprovalDetails: PendingApprovalResultModel = null;
    _rejectedInvoices:PendingApprovalResultModel = null;
    allPendingApprovals: PendingApprovalsModel[] = [];
    vendorPendingApprovals: PendingApprovalsModel[] = [];
    invoicePendingApprovals: PendingApprovalsModel[] = [];

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _router: Router,
        private _pendingApprovalsService: PendingApprovalsService) { }

    getVendorNameOrInvoiceNo(apprModel: PendingApprovalsModel) {
        let name: string = "";
        if (apprModel.approveType == this._appService.approvalTypes.vendor) {
            name = apprModel.vendorName;
        }
        else {
            name = apprModel.invoiceNumber;
        }

        return name;
    }

    getSubmittedDate(apprModel: PendingApprovalsModel) {
        return this._appService.getFormattedDate(apprModel.submittedDate);
    }

    getApprovalType(apprModel: PendingApprovalsModel) {
        if (apprModel.approveType == this._appService.approvalTypes.vendor) {
            return "Vendor Approval";
        }
        else {
            return "Invoice Approval";
        }
    }

    onApprovalRecClick(apprModel: PendingApprovalsModel) {
        this._appService.selectedPendingApprovalRecord = apprModel;
        if(apprModel.approveType == this._appService.approvalTypes.vendor) {
            this._router.navigate([this._appService.routingConstants.vendorApproval]);
        }
        else {
            this._router.navigate([this._appService.routingConstants.invoiceApproval]);
        }
    }


    // Brings Vendor and Invoice pending approvals according to the roles and departments
    async loadInitData() {
        let req: PendingApprovalRequestModel = {
            employeeId: null,
            approvalLevels: [],
            departments: [],
            projectIds: [],
            isSubContractReceiver: false
        };

        req.employeeId = globalConstant.userDetails.userId;
        if (globalConstant.userDetails.isSubContractReceiver) {
            req.isSubContractReceiver = true;
            req.departments = req.departments.concat(globalConstant.userDetails.poDepts);
        }

        if (globalConstant.userDetails.isPurchaseOwner) {
            req.approvalLevels.push(this._appService.approvalLevels.po);
            req.departments = req.departments.concat(globalConstant.userDetails.poDepts);
        }

        if (globalConstant.userDetails.isFunctionalHead) {
            req.approvalLevels.push(this._appService.approvalLevels.functionalHead);
            req.departments = req.departments.concat(globalConstant.userDetails.functionalHeadDepts);
            req.projectIds = req.projectIds.concat(globalConstant.userDetails.functionalHeadProjects);
        }

        if (globalConstant.userDetails.isProcurement) {
            req.approvalLevels.push(this._appService.approvalLevels.procurement);
        }

        if (globalConstant.userDetails.isFinance) {
            req.approvalLevels.push(this._appService.approvalLevels.finance);
        }

        if (req.departments && req.departments.length > 0) {
            req.departments = _.uniq(req.departments);
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._pendingApprovalDetails = await this._pendingApprovalsService.getPendingApprovals(req);
        if (this._pendingApprovalDetails.pendingApprovals && this._pendingApprovalDetails.pendingApprovals.length > 0) {
            this.allPendingApprovals = this._pendingApprovalDetails.pendingApprovals.concat();
            this.vendorPendingApprovals = this.allPendingApprovals.filter(a => a.approveType == this._appService.approvalTypes.vendor);
            this.invoicePendingApprovals = this.allPendingApprovals.filter(a => a.approveType == this._appService.approvalTypes.invoice);
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
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

    onTabChange(tabChangeEvt) {
        //console.log(tabChangeEvt);
    }

}
