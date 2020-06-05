import { globalConstant } from './../common/global-constant';
import { VendorApprovalService } from './vendor-approval.service';
import { AppService } from './../app.service';
import {
    BusyDataModel, VendorApprovalInitResultModel, StatusModel,
    VendorApprovalInitReqModel, VendorMasterDetailsModel,
    VendorApprovalReqModel,
    AccGroupMasterList,
    CompanyCodeMasterList,
    currencyMasterList
} from './../models/data-models';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';

@Component({
    selector: 'app-vendor-approval',
    templateUrl: './vendor-approval.component.html',
    styleUrls: ['./vendor-approval.component.scss']
})
export class VendorApprovalComponent implements OnInit {
    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;
    vendorApprovalInitDetails: VendorApprovalInitResultModel = null;
    vendorDetails: VendorMasterDetailsModel = null;
    vendoraccGroupList: AccGroupMasterList[] = [];
    companyCodeList: CompanyCodeMasterList[] = [];
    currencyList: currencyMasterList[] = [];
    remarks: string = "";
    msg: string = "";

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _vendorApprovalService: VendorApprovalService) { }

    onApproveClick() {
        this.updateVendorApprovals(this._appService.updateOperations.approve);
    }

    onRejectClick() {
        this.updateVendorApprovals(this._appService.updateOperations.reject);
    }

    updateVendorApprovals(action: string) {
        let req: VendorApprovalReqModel = {
            action: action,
            vendorApprovalID: this.vendorApprovalInitDetails.vendorApprovalDetails.vendorApprovalID,
            vendorMasterId: this.vendorApprovalInitDetails.vendorApprovalDetails.vendorMasterId,
            departmentCode: this.vendorApprovalInitDetails.vendorApprovalDetails.departmentCode,
            approverId: globalConstant.userDetails.userId,
            remarks: this.remarks,
            createdBy: this.vendorApprovalInitDetails.vendorApprovalDetails.createdBy,
            createDate: this.vendorApprovalInitDetails.vendorApprovalDetails.createDate
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
        this._vendorApprovalService.updateVendorApprovalDetails(req)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                if (response.body) {
                    let result: StatusModel = response.body as StatusModel;
                    if (result.status == 200 && result.isSuccess) {
                        this.msg = "Vendor approval is success";
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

    async loadInitData() {
        if(this._appService.selectedPendingApprovalRecord) {
            let req: VendorApprovalInitReqModel = {
                 vendorMasterId: this._appService.selectedPendingApprovalRecord.vendorMasterId,
                 departmentCode: this._appService.selectedPendingApprovalRecord.approvalLevel
            };

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
            this.vendorApprovalInitDetails = await this._vendorApprovalService.getVendorApprovalInitData(req);
            this.vendorDetails = this.vendorApprovalInitDetails.vendorMasterDetails;
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
            this.loadDropDown();
        }
    }

    loadDropDown(){
        this.vendoraccGroupList = [];
        if(this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.accGroupMasterList &&
            this.vendorApprovalInitDetails.accGroupMasterList.length > 0) {
                this.vendoraccGroupList=this.vendorApprovalInitDetails.accGroupMasterList;               
        }
        this.companyCodeList = [];
        if(this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.companyCodeMasterList &&
            this.vendorApprovalInitDetails.companyCodeMasterList.length > 0) {
                this.companyCodeList=this.vendorApprovalInitDetails.companyCodeMasterList;               
        }
        this.currencyList = [];
        if(this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.currencyMasterList &&
            this.vendorApprovalInitDetails.currencyMasterList.length > 0) {
                this.currencyList=this.vendorApprovalInitDetails.currencyMasterList;               
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

        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }
}
