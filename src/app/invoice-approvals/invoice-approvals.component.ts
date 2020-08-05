import { GrnSesItemsComponent } from './../grn-ses-items/grn-ses-items.component';
import { MessageDialogModel } from './../models/popup-models';
import { MessageDialogComponent } from './../message-dialog/message-dialog.component';
import { globalConstant } from './../common/global-constant';
import { AppService } from './../app.service';
import { BusyDataModel, InvoiceApprovalInitResultModel, InvoiceApprovalInitReqModel, 
    ItemModel, ItemDisplayModel, GrnSesModel, FileDetailsModel, 
    StatusModel, UpdateInvoiceApprovalReqModel, GrnSesDisplayModel, GrnSesItemModel,
    GrnSesItemsDisplayModel } from './../models/data-models';
import { InvoiceApprovalsService } from './invoice-approvals.service';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { Router } from '@angular/router';
import { MatSort, MatPaginator, MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import * as _ from 'underscore';

@Component({
    selector: 'app-invoice-approvals',
    templateUrl: './invoice-approvals.component.html',
    styleUrls: ['./invoice-approvals.component.scss']
})
export class InvoiceApprovalsComponent implements OnInit {
    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    headerArr: string[] = [];
    nonPOHeaderArr: string [] = ['Item No.', 'Item Desc', "HSN/SAC", 'Invoice Units', 'Rate', 'Amount', 'Remarks'];
    poHeaderArr: string[] = ['Item No.', 'Item Desc', "UOM", "HSN/SAC", "From Date", "To Date", "Personnel Number",  'Order Units', 
                            'Invoice Units', 'Currency', 'Rate', 'Amount', 'Remarks'];
    poHeaderArrWithoutDates: string[] = ['Item No.', 'Item Desc', "UOM", "HSN/SAC", 'Order Units', 'Invoice Units', 
                                'Currency', 'Rate', 'Amount', 'Remarks'];

    initDetails: InvoiceApprovalInitResultModel = null;
    itemsList: ItemDisplayModel[] = [];
    totalAmount: string = "0.000";

    //msg: string = "";

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

    grnSesAccountCategories: string[] = ["1", "3", "5", "2", "4"];
    isGrnSesRequired: boolean = false;

    remarksErrMsg: string = "";
    grnSesErrMsg: string = "";

    grnSesItemsDisplayList: GrnSesDisplayModel[] = [];

    selectedGrnSesModel: GrnSesDisplayModel = null;

    isGrnSesVisible: boolean = false;

    isFromToMandatory: boolean = false;

    constructor(private _homeService: HomeService,
                private _appService: AppService,
                private _router: Router,
                public _dialog: MatDialog,
                private _invoiceApprovalsService: InvoiceApprovalsService) { }
    
    // onGrnSesSelectClick() {
    //     this.displayGrnSesItems();
    // }

    // displayGrnSesItems() {
    //     const dialogRef = this._dialog.open(GrnSesItemsComponent, {
    //         disableClose: true,
    //         panelClass: 'dialog-box',
    //         width: '550px',
    //         data: this.grnSesItemsDisplayList
    //     });

    //     dialogRef.afterClosed().subscribe(result => {
    //         if (result as GrnSesDisplayModel) {
    //             this.selectedGrnSesModel = result;
    //             this.selectedGrnSesNumber = this.selectedGrnSesModel.grnSesNumber;
    //             this.grnSesErrMsg = "";
    //         }
    //     });
    // }

    onRemarksBlur() {
        if(this.remarks) {
            this.remarks = this.remarks.trim();
        }
    }

    onItemRemarksBlur(item: ItemDisplayModel) {
        if(item.remarks) {
            item.remarks = item.remarks.trim();
        }
    }

    onBackBtnClick() {
        this._router.navigate([this._appService.routingConstants.pendingApprovals]);
    }

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
            this.totalAmount = "0.000";

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
                let totalAmt: number = 0;
                for(let i = 0; i < this.itemsList.length; i++) {
                    //this.itemsList[i].unitsTotalAmount = (this.itemsList[i].unitPrice && this.itemsList[i].invoiceUnits) ? +this.itemsList[i].unitPrice * +this.itemsList[i].invoiceUnits : null;
                    this.itemsList[i].unitsTotalAmount = (this.itemsList[i].totalAmt) ? +this.itemsList[i].totalAmt : null;
                    if(this.itemsList[i].unitsTotalAmount && this.itemsList[i].unitsTotalAmount > 0) {
                        totalAmt = totalAmt + this.itemsList[i].unitsTotalAmount;
                    }
                }
                this.totalAmount = totalAmt.toFixed(3);

                this.grnSesList = this.initDetails.grnSesList;

                // if(this.grnSesList && this.grnSesList.length > 0) {
                //     this.selectedGrnSesNumber = this.grnSesList[0].grnSesNumber;
                // }

                if(this.initDetails.invoiceDetails) {
                    this.selectedGrnSesNumber = this.initDetails.invoiceDetails.grnSesNumber;
                }

                this.isGrnSesVisible = false;
                if(globalConstant.userDetails.isFunctionalHead || globalConstant.userDetails.isFinance) {
                    this.isGrnSesVisible = true;
                }

                this.updateStatusFlow();

                this.invoiceFilesList = this.initDetails.invoiceFilesList;
                this.supportFilesList = this.initDetails.supportFilesList;

                this.updateGrnSesItemsDisplayData();
            }

            if(this.isPOInvoice) {
                if(this.initDetails.poDetails.accountAssignmenCategory == '4' && 
                    (this.initDetails.poDetails.documentType == 'ZFO' || this.initDetails.poDetails.documentType == 'ZFO')) {
                    
                    this.isFromToMandatory = true;
                    this.headerArr = this.poHeaderArr.concat();
                }
                else {
                    this.isFromToMandatory = false;
                    this.headerArr = this.poHeaderArrWithoutDates.concat();
                }
            }
            else {
                this.headerArr = this.nonPOHeaderArr.concat();
            }

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
        }
    }

    updateGrnSesItemsDisplayData() {
        this.grnSesItemsDisplayList = [];
        if(this.initDetails.grnSesItemsList && this.initDetails.grnSesItemsList.length > 0) {

            let grnSesList = _.pluck(this.initDetails.grnSesItemsList, 'grnSesNumber');
            let uniqGrnSesList = _.uniq(grnSesList);
            //for(let gs in uniqGrnSesList) {
            for(let i = 0; i < uniqGrnSesList.length; i++) {
                let sslGrsSesItems: GrnSesItemModel[] = this.initDetails.grnSesItemsList.filter(x => x.grnSesNumber == uniqGrnSesList[i]);
                let gsDisplayModel: GrnSesDisplayModel = {
                    grnSesNumber: uniqGrnSesList[i],
                    itemsList: sslGrsSesItems
                };
                this.grnSesItemsDisplayList.push(gsDisplayModel);
            }
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
        this.remarksErrMsg = "";
        this.grnSesErrMsg = "";
        let isRemarksValid: boolean = true;
        if(!this.remarks || this.remarks.trim().length == 0) {
            this.remarksErrMsg = "Please provide Remarks";
            isRemarksValid = false;
        }

        let isGrnSesValid: boolean = true;
        if(this.isGrnSesRequired && (globalConstant.userDetails.isFunctionalHead || globalConstant.userDetails.isFinance)) {
            if(!this.selectedGrnSesNumber) {
                isGrnSesValid = false;
                this.grnSesErrMsg = "GRN/SES No. is not available.";
            }
        }

        // if(action == this._appService.updateOperations.approve && this.isGrnSesRequired && this.isGrnDdlVisible) {
        //     if(!this.selectedGrnSesNumber) {
        //         this.grnSesErrMsg = "Please select GRN/SES No.";
        //         isGrnSesValid = false;
        //     }
        //     else {
        //         if(this.selectedGrnSesModel && this.selectedGrnSesModel.itemsList) {
        //             if(this.selectedGrnSesModel.itemsList.length == this.itemsList.length) {
        //                 for(let i = 0; i < this.selectedGrnSesModel.itemsList.length; i++) {
        //                     let selActualItem: GrnSesItemsDisplayModel = this.selectedGrnSesModel.itemsList[i];
        //                     let existItem = this.itemsList.find(si => si.itemNumber == selActualItem.itemNo && si.invoiceUnits == selActualItem.grnSesUnits);
        //                     if(!existItem) {
        //                         this.grnSesErrMsg = "Items are not matched.";
        //                         isGrnSesValid = false;
        //                         break;
        //                     }
        //                 }
        //             }
        //             else {
        //                 this.grnSesErrMsg = "Items are not matched.";
        //                 isGrnSesValid = false;
        //             }
        //         }
        //     }
        // }
        
        if(isRemarksValid && isGrnSesValid) {
            let req: UpdateInvoiceApprovalReqModel = {
                action: action,
                departmentHeadId: globalConstant.userDetails.departmentHead,
                grnSesNumber: (this.selectedGrnSesNumber) ? this.selectedGrnSesNumber : null,
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
                },
                itemsList: this.itemsList
            };

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
            this._invoiceApprovalsService.updateInvoiceApprovalDetails(req)
                .subscribe(response => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });

                    if (response.body) {
                        let result: StatusModel = response.body as StatusModel;
                        if (result.status == 200 && result.isSuccess) {
                            //this.msg = "Invoice approval is success";
                            this.displayInvoiceApprovalStatus(result.message, true);
                        }
                        else {
                            //this.msg = this._appService.messages.vendorApprovalFailure;
                            this.displayInvoiceApprovalStatus(result.message, false);
                        }
                    }
                },
                (error) => {
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    //this.msg = this._appService.messages.vendorApprovalFailure;
                    this.displayInvoiceApprovalStatus(this._appService.messages.vendorApprovalFailure, false);
                    console.log(error);
                });
        }
    }

    displayInvoiceApprovalStatus(msg: string, status: boolean) {
        const dialogRef = this._dialog.open(MessageDialogComponent, {
            disableClose: true,
            panelClass: 'dialog-box',
            width: '550px',
            data: <MessageDialogModel>{
                title: "Invoice Upload Action",
                message: msg
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && status) {
                this._router.navigate([this._appService.routingConstants.invoiceSearch]);
            }
        });
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
