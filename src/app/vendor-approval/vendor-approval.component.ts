import { VendorApprovalService } from './vendor-approval.service';
import { AppService } from './../app.service';
import { BusyDataModel, VendorApprovalInitResultModel, StatusModel, 
        VendorApprovalInitReqModel, VendorMasterDetailsModel,
        VendorApprovalReqModel } from './../models/data-models';
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
    remarks: string = "";
    msg: string = "";

    constructor(private _homeService: HomeService,
                private _appService: AppService,
                private _vendorApprovalService: VendorApprovalService) { }

    onApproveClick() {
        let req: VendorApprovalReqModel = {
            action: this._appService.updateOperations.reject,
            vendorApprovalID: 4,
            vendorMasterId: 19,
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

    onRejectClick() {

    }

    async loadInitData() {
        let req: VendorApprovalInitReqModel = {
            vendorMasterId: 19
        };
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this.vendorApprovalDetails = await this._vendorApprovalService.getVendorApprovalInitData(req);
        this.vendorDetails = this.vendorApprovalDetails.vendorMasterDetails;
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
}
