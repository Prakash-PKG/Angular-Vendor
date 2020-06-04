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
    vendorApprovalDetails: VendorApprovalInitResultModel = null;
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
            vendorApprovalID: 4,
            vendorMasterId: 18,
            departmentCode: "finance",
            approverId: "107083",
            remarks: this.remarks,
            createdBy: "107209",
            createDate: "2020-06-02"
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
        // if(this._appService.selectedPendingApprovalRecord) {
            let req: VendorApprovalInitReqModel = {
                // vendorMasterId: this._appService.selectedPendingApprovalRecord.vendorMasterId,
                // departmentCode: this._appService.selectedPendingApprovalRecord.approvalLevel
                vendorMasterId:19,
                departmentCode:'finance'
            };

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
            this.vendorApprovalDetails = await this._vendorApprovalService.getVendorApprovalInitData(req);
            this.vendorDetails = this.vendorApprovalDetails.vendorMasterDetails;
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
            this.loadDropDown();
        // }
    }
    loadDropDown(){
        this.vendoraccGroupList = [];
        if(this.vendorApprovalDetails && this.vendorApprovalDetails.accGroupMasterList &&
            this.vendorApprovalDetails.accGroupMasterList.length > 0) {
                this.vendoraccGroupList=this.vendorApprovalDetails.accGroupMasterList;               
        }
        this.companyCodeList = [];
        if(this.vendorApprovalDetails && this.vendorApprovalDetails.companyCodeMasterList &&
            this.vendorApprovalDetails.companyCodeMasterList.length > 0) {
                this.companyCodeList=this.vendorApprovalDetails.companyCodeMasterList;               
        }
        this.currencyList = [];
        if(this.vendorApprovalDetails && this.vendorApprovalDetails.currencyMasterList &&
            this.vendorApprovalDetails.currencyMasterList.length > 0) {
                this.currencyList=this.vendorApprovalDetails.currencyMasterList;               
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

        // setTimeout(() => {
            this.loadInitData();
            
        // }, 100);
    }
}
