import { AppService } from './../app.service';
import { BusyDataModel, POSearchResultModel, PODetailsModel, POSearchReqModel } from './../models/data-models';
import { PoSearchService } from './po-search.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { HomeService } from '../home/home.service';
import { globalConstant } from './../common/global-constant';
import { Router } from '@angular/router';

@Component({
    selector: 'app-po-search',
    templateUrl: './po-search.component.html',
    styleUrls: ['./po-search.component.scss']
})
export class PoSearchComponent implements OnInit {

    headerArr: string[] = [];

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    _initDetails: POSearchResultModel = null;
    poList: PODetailsModel[] = [];

    constructor(private _homeService: HomeService,
                private _appService: AppService,
                private _router: Router,
                private _poSearchService: PoSearchService) { }

    onPOClick(po: PODetailsModel) {
        this._appService.selectedPO = po;
        this._router.navigate([this._appService.routingConstants.poDetails]);
    }

    async loadInitData() {

        let req: POSearchReqModel = {
            vendorId: null,
            employeeId: null,
            approvalLevels: [],
            departments: []
        };

        if(globalConstant.userDetails.isVendor) {
            req.vendorId = globalConstant.userDetails.userId;
        }
        else {
            req.employeeId = globalConstant.userDetails.isFunctionalHead ? globalConstant.userDetails.userId : null;

            if(globalConstant.userDetails.isPurchaseOwner) {
                req.departments = req.departments.concat(globalConstant.userDetails.poDepts);
            }

            if(globalConstant.userDetails.isFinance) {
                req.approvalLevels.push(this._appService.approvalLevels.finance);
            }
        }

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._initDetails = await this._poSearchService.getPOList(req);
        if(this._initDetails) {
            this.poList = this._initDetails.poList.concat();
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
    }

    getFormattedDate(dtStr: string) {
        if(dtStr) {
            return this._appService.getFormattedDate(dtStr);
        }
        
        return "";
    }

    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this._appService.selectedPO = null;

        this.isDashboardCollapsed = true;

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        setTimeout(() => {
           this.loadInitData();
        }, 100);
    }
}
