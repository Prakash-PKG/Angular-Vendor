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
