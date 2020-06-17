import { globalConstant } from './../common/global-constant';
import { VendorApprovalService } from './vendor-approval.service';
import { AppService } from './../app.service';
import {
    BusyDataModel, VendorApprovalInitResultModel, StatusModel,
    VendorApprovalInitReqModel, VendorMasterDetailsModel,
    VendorApprovalReqModel,
    AccGroupMasterList,
    CompanyCodeMasterList,
    currencyMasterList,
    WithholdTypeList,
    WithholdTaxList,
    VendorRegistrationDetailRequestModel, VendorMasterFilesModel, FileDetailsModel
} from './../models/data-models';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { VendorRegistrationService } from '../vendor-registration/vendor-registration.service';

@Component({
    selector: 'app-vendor-approval',
    templateUrl: './vendor-approval.component.html',
    styleUrls: ['./vendor-approval.component.scss']
})
export class VendorApprovalComponent implements OnInit {
    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;
    vendorApprovalInitDetails: VendorApprovalInitResultModel = null;
    vendorDetails: VendorMasterDetailsModel = new VendorMasterDetailsModel();
    vendoraccGroupList: AccGroupMasterList[] = [];
    companyCodeList: CompanyCodeMasterList[] = [];
    currencyList: currencyMasterList[] = [];
    withholdTaxList: WithholdTaxList[] = [];
    withholdTypeList: WithholdTypeList[] = [];
    withholdTax: string = "";
    withholdType: string = "";
    remarks: string = "";
    roleName: string = "";
    selectedVendorGroup: string = null;
    selectedCompanyCode: string = null;
    selectedCurrency: string = null;
    msg: string = "";
    vendorDocList: VendorMasterFilesModel[] = [];
    isEditable = false

    incCertFilesList: VendorMasterFilesModel[] = [];
    gstFilesList: VendorMasterFilesModel[] = [];
    panFilesList: VendorMasterFilesModel[] = [];
    pfFilesList: VendorMasterFilesModel[] = [];
    esiFilesList: VendorMasterFilesModel[] = [];
    canChqFilesList: VendorMasterFilesModel[] = [];
    msmeFilesList: VendorMasterFilesModel[] = [];
    tdsFilesList: VendorMasterFilesModel[] = [];
    sezFilesList: VendorMasterFilesModel[] = [];
    lutFilesList: VendorMasterFilesModel[] = [];
    othersFilesList: VendorMasterFilesModel[] = [];
    msaFilesList: VendorMasterFilesModel[] = [];


    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _vendorApprovalService: VendorApprovalService,
        private _vendorRegistrationService: VendorRegistrationService) { }

    onEditClick() {
        this.isEditable = true;
    }
    onSendForCorrClick() {
        let req: VendorRegistrationDetailRequestModel = {
            vendorMasterId: this.vendorApprovalInitDetails.vendorMasterDetails.vendorMasterId
        }
        this._vendorApprovalService.sendBackForCorrection(req)
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                if (response.body) {
                    console.log(response.body);
                    let result: StatusModel = response.body as StatusModel;
                    if (result.status == 200 && result.isSuccess) {
                        this.msg = "Vendor sent back for correction successfully";
                    }
                    else {
                        this.msg = this._appService.messages.vendorSendBackFailure;
                    }
                }
            },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    this.msg = this._appService.messages.vendorSendBackFailure;
                    console.log(error);
                });
    }

    onApproveClick() {
        this.updateVendorApprovals(this._appService.updateOperations.approve);
    }

    onRejectClick() {
        this.updateVendorApprovals(this._appService.updateOperations.reject);
    }
    getAttachments() {
        console.log(this.vendorDocList);
        if (this.vendorDocList) {
            this.incCertFilesList = this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 1);
            this.gstFilesList = this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 2);
            this.panFilesList = this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 3);
            this.pfFilesList = this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 4);
            this.esiFilesList = this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 5);
            this.canChqFilesList = this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 6);
            this.msmeFilesList = this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 7);
            this.tdsFilesList = this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 8);
            this.sezFilesList = this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 9);
            this.lutFilesList = this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 10);
            this.othersFilesList == this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 13);
            this.msaFilesList == this.vendorDocList.filter(file => file.vendorMasterDocumentsId == 12);
        }
    }

    downloadFile(fileDetails: VendorMasterFilesModel) {
        this._vendorApprovalService.downloadFile(fileDetails);
    }

    onDeleteFileClick(fileDetails: VendorMasterFilesModel, fileIndex: number, documentTypeId: number) {
        if (fileDetails && fileDetails.vendorMasterFilesId) {
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Deleting..." });
            this._vendorApprovalService.deleteVendorFile(fileDetails)
                .subscribe(response => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    let result = response.body as StatusModel;
                    if (result.isSuccess) {
                        this.removefileFromList(fileIndex, documentTypeId);
                    }
                },
                    (error) => {
                        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                        console.log(error);
                    });
        }
        else {
            this.removefileFromList(fileIndex, documentTypeId);
        }
    }

    removefileFromList(fileIndex: number, documentTypeId: number) {
        let filesList = this.vendorDocList.filter(f => f.vendorMasterDocumentsId == documentTypeId);
        if (filesList.length > 0) {
            filesList.splice(fileIndex, 1);
        }

    }
    updateVendorApprovals(action: string) {
        let req: VendorApprovalReqModel = {
            action: action,
            vendorApprovalID: this.vendorApprovalInitDetails.vendorApprovalDetails.vendorApprovalID,
            vendorMasterId: this.vendorApprovalInitDetails.vendorApprovalDetails.vendorMasterId,
            departmentCode: this.vendorApprovalInitDetails.vendorApprovalDetails.departmentCode,
            approverId: globalConstant.userDetails.userId,
            remarks: this.remarks,
            groupCode: this.selectedVendorGroup,
            companyCode: this.selectedCompanyCode,
            currencyCode: this.selectedCurrency,
            withholdTaxCode: this.withholdTax,
            withholdTypeCode: this.withholdType,
            createdBy: this.vendorApprovalInitDetails.vendorApprovalDetails.createdBy,
            createDate: this.vendorApprovalInitDetails.vendorApprovalDetails.createDate,
            vendorMasterDetails: this.vendorDetails
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

        if (this._appService.selectedPendingApprovalRecord) {
            let req: VendorApprovalInitReqModel = {
                vendorMasterId: this._appService.selectedPendingApprovalRecord.vendorMasterId,
                departmentCode: this._appService.selectedPendingApprovalRecord.approvalLevel
            };
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
            this.vendorApprovalInitDetails = await this._vendorApprovalService.getVendorApprovalInitData(req);
            this.vendorDetails = this.vendorApprovalInitDetails.vendorMasterDetails;
            this.vendorDocList = this.vendorApprovalInitDetails.filesList;
            this.loadDropDown();
            this.getAttachments()
            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
        }
    }

    loadDropDown() {
        this.vendoraccGroupList = [];

        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.accGroupMasterList &&
            this.vendorApprovalInitDetails.accGroupMasterList.length > 0) {
            this.vendoraccGroupList = this.vendorApprovalInitDetails.accGroupMasterList;
        }
        this.companyCodeList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.companyCodeMasterList &&
            this.vendorApprovalInitDetails.companyCodeMasterList.length > 0) {
            this.companyCodeList = this.vendorApprovalInitDetails.companyCodeMasterList;
        }
        this.currencyList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.currencyMasterList &&
            this.vendorApprovalInitDetails.currencyMasterList.length > 0) {
            this.currencyList = this.vendorApprovalInitDetails.currencyMasterList;
        }

        this.withholdTypeList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.withholdTypeVOList &&
            this.vendorApprovalInitDetails.withholdTypeVOList.length > 0) {
            this.withholdTypeList = this.vendorApprovalInitDetails.withholdTypeVOList;
        }

        this.selectedCompanyCode = this.vendorApprovalInitDetails.vendorMasterDetails &&
            this.vendorApprovalInitDetails.vendorMasterDetails.companyCode ?
            this.vendorApprovalInitDetails.vendorMasterDetails.companyCode : undefined;

        this.selectedCurrency = this.vendorApprovalInitDetails.vendorMasterDetails &&
            this.vendorApprovalInitDetails.vendorMasterDetails.currencyCode ?
            this.vendorApprovalInitDetails.vendorMasterDetails.currencyCode : undefined;

        this.selectedVendorGroup = this.vendorApprovalInitDetails.vendorMasterDetails &&
            this.vendorApprovalInitDetails.vendorMasterDetails.groupCode ?
            this.vendorApprovalInitDetails.vendorMasterDetails.groupCode : undefined;
    }
    onHoldTypeSelected(holdType) {
        this.withholdTaxList = [];
        if (this.vendorApprovalInitDetails && this.vendorApprovalInitDetails.withholdTaxVOList &&
            this.vendorApprovalInitDetails.withholdTaxVOList.length > 0) {
            this.withholdTaxList = this.vendorApprovalInitDetails.withholdTaxVOList.filter(e => e.withholdTypeCode == holdType.value);
        }
        console.log(this.withholdTaxList);
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
        this.roleName = globalConstant.userDetails.userRoles[0].roleName;

        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }
}
