import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';

@Component({
    selector: 'app-pending-approvals',
    templateUrl: './pending-approvals.component.html',
    styleUrls: ['./pending-approvals.component.scss']
})
export class PendingApprovalsComponent implements OnInit {

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    constructor(private _homeService: HomeService) { }

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
    }

}
