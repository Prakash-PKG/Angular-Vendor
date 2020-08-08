import { PoDetailsService } from './po-details.service';
import { PODetailsModel, PODetailsRequestModel, BusyDataModel,
        ItemDisplayModel, PODetailsResultsModel } from './../models/data-models';
import { AppService } from './../app.service';
import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';

@Component({
    selector: 'app-po-details',
    templateUrl: './po-details.component.html',
    styleUrls: ['./po-details.component.scss']
})
export class PoDetailsComponent implements OnInit {

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    poDetails: PODetailsModel = null;
    _initDetails: PODetailsResultsModel = null;
    itemsList: ItemDisplayModel[] = [];

    headerArr: string[] = ['Item No.', 'Item Desc', "Invoice Number", "HSN/SAC", 'Order Qty', 'Supplied Qty', 'Balance Qty', 
                            'Invoice Qty', 'Currency', 'Rate', 'Amount'];

    currency: string = "";

    totalAmount: number = 0;

    constructor(private _homeService: HomeService,
                private _poDetailsService: PoDetailsService,
                private _appService: AppService) { }

    getFormattedDate(dtStr: string) {
        if(dtStr) {
            return this._appService.getFormattedDate(dtStr);
        }
        
        return "";
    }

    async loadInitData() {

        if(this.poDetails && this.poDetails.purchaseOrderId) {
            this.currency = this.poDetails.currencyType;
            
            let req: PODetailsRequestModel = {
                purchaseOrderId: this.poDetails.purchaseOrderId
            };

            this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
            this._initDetails = await this._poDetailsService.getPODetails(req);
            if(this._initDetails) {
                this.itemsList = this._initDetails.itemsList.concat();
                this.totalAmount = 0;
                for(let i = 0; i < this.itemsList.length; i++) {
                    this.itemsList[i].unitsTotalAmount = (this.itemsList[i].unitPrice && this.itemsList[i].invoiceUnits) ? +this.itemsList[i].unitPrice * +this.itemsList[i].invoiceUnits : null;
                    if(this.itemsList[i].unitsTotalAmount && this.itemsList[i].unitsTotalAmount > 0) {
                        this.totalAmount = this.totalAmount + this.itemsList[i].unitsTotalAmount;
                    }
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

        this.poDetails = this._appService.selectedPO;

        setTimeout(() => {
           this.loadInitData();
        }, 100);
    }

}
